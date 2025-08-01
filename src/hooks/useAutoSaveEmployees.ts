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
      // Separate items with existing IDs from new items
      const existingItems = employees.filter(emp => 
        !emp.id.startsWith('temp-') && !emp.id.startsWith('new-')
      );
      
      const newItems = employees.filter(emp => 
        emp.id.startsWith('temp-') || emp.id.startsWith('new-')
      );

      // For existing items, prepare update data
      const itemsToUpdate = existingItems.map(emp => ({
        id: emp.id,
        import_session_id: sessionId,
        employee_name: emp.name || null,
        employee_email: emp.email || '',
        current_position_code: emp.position_code || null,
        status: emp.status === 'ready' ? 'completed' : 
                emp.status === 'error' ? 'failed' : 
                emp.status || 'pending',
        error_message: emp.errorMessage || null,
        field_values: {
          department: emp.department || null,
          position: emp.position || null,
          manager_email: emp.manager_email || null
        }
      }));

      // For new items, only insert if they have at least an email
      const itemsToInsert = newItems
        .filter(emp => emp.email && emp.email.trim() !== '')
        .map(emp => ({
          import_session_id: sessionId,
          employee_name: emp.name || null,
          employee_email: emp.email,
          current_position_code: emp.position_code || null,
          status: emp.status === 'ready' ? 'completed' : 
                  emp.status === 'error' ? 'failed' : 
                  emp.status || 'pending',
          error_message: emp.errorMessage || null,
          field_values: {
            department: emp.department || null,
            position: emp.position || null,
            manager_email: emp.manager_email || null
          }
        }));

      // Handle updates and inserts separately
      let updatedData: any[] = [];
      let insertedData: any[] = [];

      // Update existing items
      if (itemsToUpdate.length > 0) {
        const { data, error } = await supabase
          .from('st_import_session_items')
          .upsert(itemsToUpdate, {
            onConflict: 'id',
            ignoreDuplicates: false
          })
          .select();

        if (error) throw error;
        updatedData = data || [];
      }

      // Insert new items (without ID field)
      if (itemsToInsert.length > 0) {
        const { data, error } = await supabase
          .from('st_import_session_items')
          .insert(itemsToInsert)
          .select();

        if (error) throw error;
        insertedData = data || [];
      }

      const allData = [...updatedData, ...insertedData];

      // Update local state with new IDs
      if (insertedData.length > 0) {
        const updatedEmployees = employees.map((emp) => {
          if (emp.id.startsWith('temp-') || emp.id.startsWith('new-')) {
            // Find the inserted item by email
            const newItem = insertedData.find(item => item.employee_email === emp.email);
            if (newItem) {
              return { ...emp, id: newItem.id };
            }
          }
          return emp;
        });
        setEmployees(updatedEmployees);
      }

      // Update session stats
      const allItems = [...itemsToUpdate, ...itemsToInsert];
      const readyCount = allItems.filter(item => item.status === 'completed').length;
      const errorCount = allItems.filter(item => item.status === 'failed').length;
        
      await supabase
        .from('st_import_sessions')
        .update({
          total_employees: allItems.length,
          successful: readyCount,
          failed: errorCount
        })
        .eq('id', sessionId);

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