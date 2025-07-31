import { useEffect, useRef, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/components/TeamSetup/SpreadsheetGrid';

interface SpreadsheetAutoSaveOptions {
  sessionId: string | null;
  delay?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onIdUpdate?: (tempId: string, newId: string) => void;
}

interface SaveOperation {
  type: 'cell' | 'batch';
  data: any;
  timestamp: number;
}

export function useSpreadsheetAutoSave(
  employees: Employee[],
  options: SpreadsheetAutoSaveOptions
) {
  const { sessionId, delay = 1000, onSuccess, onError, onIdUpdate } = options;
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<Error | null>(null);
  
  const previousEmployeesRef = useRef<Employee[]>([]);
  const pendingChangesRef = useRef<Map<string, Partial<Employee>>>(new Map());
  const offlineQueueRef = useRef<SaveOperation[]>([]);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  // Detect changes and queue them
  const detectChanges = useCallback(() => {
    if (!sessionId) {
      console.log('[AutoSave] No sessionId, skipping detection');
      return;
    }

    const changes = new Map<string, Partial<Employee>>();
    
    employees.forEach((employee, index) => {
      const prevEmployee = previousEmployeesRef.current[index];
      
      if (!prevEmployee || JSON.stringify(employee) !== JSON.stringify(prevEmployee)) {
        changes.set(employee.id, employee);
      }
    });

    if (changes.size > 0) {
      console.log('[AutoSave] Detected changes:', changes.size, 'items');
      pendingChangesRef.current = changes;
      debouncedSave();
    }
    
    previousEmployeesRef.current = [...employees];
  }, [employees, sessionId]);

  // Save individual cell using RPC
  const saveCellRPC = async (itemId: string, field: string, value: string) => {
    const { data, error } = await supabase.rpc('save_spreadsheet_cell', {
      p_item_id: itemId,
      p_field: field,
      p_value: value
    });
    
    if (error) throw error;
    return data;
  };

  // Batch update using RPC
  const batchUpdateRPC = async (updates: Array<{ row_id: string; field_updates: any }>) => {
    const { data, error } = await supabase.rpc('batch_update_rows', {
      p_session_id: sessionId,
      p_updates: updates
    });
    
    if (error) throw error;
    return data;
  };

  // Process pending changes
  const processPendingChanges = async () => {
    if (!sessionId || pendingChangesRef.current.size === 0) {
      console.log('[AutoSave] Process skipped - sessionId:', !!sessionId, 'pending:', pendingChangesRef.current.size);
      return;
    }

    console.log('[AutoSave] Processing', pendingChangesRef.current.size, 'pending changes');
    setSaveStatus('saving');
    setError(null);

    try {
      // Check if online
      if (!navigator.onLine) {
        throw new Error('No internet connection');
      }

      const changes = Array.from(pendingChangesRef.current.entries());
      
      // Separate new items from updates
      const newItems = changes.filter(([id]) => id.startsWith('new-') || id.startsWith('temp-'));
      const updates = changes.filter(([id]) => !id.startsWith('new-') && !id.startsWith('temp-'));

      // Handle new items
      if (newItems.length > 0) {
        for (const [tempId, employee] of newItems) {
          const { data, error } = await supabase
            .from('st_import_session_items')
            .insert({
              import_session_id: sessionId,
              employee_name: employee.name,
              employee_email: employee.email,
              current_position_code: employee.position_code || employee.position,
              field_values: {
                name: employee.name,
                email: employee.email,
                department: employee.department,
                position: employee.position,
                position_code: employee.position_code,
                manager_email: employee.manager_email
              },
              status: employee.status || 'pending'
            })
            .select()
            .single();

          if (error) throw error;

          // Update the employee ID in the parent component
          if (onIdUpdate && data) {
            onIdUpdate(tempId, data.id);
          }
        }
      }

      // Handle updates using batch RPC
      if (updates.length > 0) {
        const batchUpdates = updates.map(([id, employee]) => ({
          row_id: id,
          field_updates: {
            employee_name: employee.name,
            employee_email: employee.email,
            current_position_code: employee.position_code || employee.position,
            department: employee.department,
            position: employee.position,
            position_code: employee.position_code,
            manager_email: employee.manager_email,
            status: employee.status
          }
        }));

        await batchUpdateRPC(batchUpdates);
      }

      // Update session last active
      await supabase
        .from('st_import_sessions')
        .update({ 
          last_active: new Date().toISOString(),
          total_employees: employees.filter(e => e.email && e.name).length
        })
        .eq('id', sessionId);

      // Clear pending changes
      pendingChangesRef.current.clear();
      
      setSaveStatus('saved');
      onSuccess?.();

      // Reset status after 2 seconds
      setTimeout(() => {
        setSaveStatus(prev => prev === 'saved' ? 'idle' : prev);
      }, 2000);

    } catch (error) {
      const err = error instanceof Error ? error : new Error('Save failed');
      setError(err);
      setSaveStatus('error');
      onError?.(err);

      // Add to offline queue if network error
      if (!navigator.onLine || err.message.includes('network')) {
        offlineQueueRef.current.push({
          type: 'batch',
          data: Array.from(pendingChangesRef.current.entries()),
          timestamp: Date.now()
        });
      }

      // Retry after 5 seconds
      retryTimeoutRef.current = setTimeout(() => {
        processPendingChanges();
      }, 5000);
    }
  };

  // Debounced save function
  const debouncedSave = useRef(
    debounce(() => {
      console.log('[AutoSave] Debounced save triggered');
      processPendingChanges();
    }, delay)
  ).current;

  // Process offline queue when back online
  const processOfflineQueue = useCallback(async () => {
    if (offlineQueueRef.current.length === 0) return;

    const queue = [...offlineQueueRef.current];
    offlineQueueRef.current = [];

    for (const operation of queue) {
      try {
        if (operation.type === 'batch') {
          // Reprocess the batch
          pendingChangesRef.current = new Map(operation.data);
          await processPendingChanges();
        }
      } catch (error) {
        // Re-add to queue if still failing
        offlineQueueRef.current.push(operation);
      }
    }
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      processOfflineQueue();
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [processOfflineQueue]);

  // Detect changes when employees array changes
  useEffect(() => {
    detectChanges();
  }, [employees, detectChanges]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [debouncedSave]);

  return {
    saveStatus,
    error,
    pendingChanges: pendingChangesRef.current.size,
    offlineQueue: offlineQueueRef.current.length,
    // Expose manual save for immediate saves (e.g., on blur)
    saveNow: processPendingChanges,
    // Expose single cell save for immediate feedback
    saveCellNow: saveCellRPC
  };
}