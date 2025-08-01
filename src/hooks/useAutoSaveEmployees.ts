import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/components/TeamSetup/SpreadsheetGrid';
import { toast } from 'sonner';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutoSaveEmployees(
  sessionId: string | null,
  employees: Employee[],
  setEmployees: (employees: Employee[]) => void
) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');

  // Auto-save effect
  useEffect(() => {
    if (!sessionId || employees.length === 0) return;

    const currentData = JSON.stringify(employees);
    if (currentData === lastSavedDataRef.current) {
      return; // No changes to save
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set status to saving after a brief delay to avoid flickering
    const statusTimeout = setTimeout(() => {
      setSaveStatus('saving');
    }, 300);

    // Debounce the save operation
    saveTimeoutRef.current = setTimeout(async () => {
      clearTimeout(statusTimeout);
      await saveAllEmployees();
    }, 2000); // 2 second debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      clearTimeout(statusTimeout);
    };
  }, [sessionId, employees]);

  const saveAllEmployees = async () => {
    if (!sessionId) return;

    setSaveStatus('saving');
    
    try {
      // Prepare batch upsert data
      const itemsToUpsert = employees.map(emp => ({
        id: emp.id.startsWith('temp-') || emp.id.startsWith('new-') ? undefined : emp.id,
        session_id: sessionId,
        employee_name: emp.name,
        employee_email: emp.email,
        department: emp.department || null,
        position: emp.position || null,
        position_code: emp.position_code || null,
        manager_email: emp.manager_email || null,
        status: emp.status,
        error_message: emp.errorMessage || null
      }));

      // Filter out items without required fields
      const validItems = itemsToUpsert.filter(item => 
        item.employee_name && item.employee_email
      );

      if (validItems.length > 0) {
        // Delete existing items for this session first
        await supabase
          .from('st_import_session_items')
          .delete()
          .eq('session_id', sessionId);

        // Insert all items
        const { data, error } = await supabase
          .from('st_import_session_items')
          .insert(validItems)
          .select();

        if (error) throw error;

        // Update local state with new IDs
        if (data) {
          const updatedEmployees = employees.map((emp, index) => {
            if (emp.id.startsWith('temp-') || emp.id.startsWith('new-')) {
              const newItem = data[index];
              if (newItem) {
                return { ...emp, id: newItem.id };
              }
            }
            return emp;
          });
          setEmployees(updatedEmployees);
        }

        // Update session stats
        const readyCount = validItems.filter(item => item.status === 'ready').length;
        const errorCount = validItems.filter(item => item.status === 'error').length;
        
        await supabase
          .from('st_import_sessions')
          .update({
            total_employees: validItems.length,
            successful: readyCount,
            failed: errorCount
          })
          .eq('id', sessionId);
      }

      setSaveStatus('saved');
      setLastSaved(new Date());
      lastSavedDataRef.current = JSON.stringify(employees);
      
      // Reset status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Auto-save error:', error);
      setSaveStatus('error');
      toast.error('Failed to auto-save changes');
      
      // Reset status after 5 seconds
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  };

  const handleCellSave = useCallback(async (
    rowId: string,
    field: string,
    value: string
  ) => {
    if (!sessionId || rowId.startsWith('temp-') || rowId.startsWith('new-')) {
      return; // Don't save temporary rows individually
    }

    try {
      const updateData: any = {};
      switch (field) {
        case 'name':
          updateData.employee_name = value;
          break;
        case 'email':
          updateData.employee_email = value;
          break;
        case 'department':
          updateData.department = value || null;
          break;
        case 'position':
          updateData.position = value || null;
          break;
        case 'position_code':
          updateData.position_code = value || null;
          break;
        case 'manager_email':
          updateData.manager_email = value || null;
          break;
      }

      await supabase
        .from('st_import_session_items')
        .update(updateData)
        .eq('id', rowId);

    } catch (error) {
      console.error('Failed to save cell:', error);
      // Don't show error toast for individual cell saves
      // The auto-save will handle it
    }
  }, [sessionId]);

  return {
    saveStatus,
    lastSaved,
    handleCellSave
  };
}