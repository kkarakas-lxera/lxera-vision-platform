import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, AlertCircle, Check, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department?: string;
  position?: string;
  position_code?: string;
  manager_email?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'ready' | 'error';
  errorMessage?: string;
}

interface SpreadsheetGridProps {
  employees: Employee[];
  onEmployeesChange: (employees: Employee[]) => void;
  onRowDelete: (id: string) => void;
  onCellSave?: (rowId: string, field: string, value: string) => Promise<void>;
  isLoading?: boolean;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
}

const COLUMNS = [
  { key: 'name', label: 'Name', required: true, width: '200px' },
  { key: 'email', label: 'Email', required: true, width: '250px' },
  { key: 'department', label: 'Department', required: false, width: '150px' },
  { key: 'position', label: 'Position', required: false, width: '200px' },
  { key: 'position_code', label: 'Position Code', required: false, width: '120px' },
  { key: 'manager_email', label: 'Manager Email', required: false, width: '200px' },
];

export default function SpreadsheetGrid({
  employees,
  onEmployeesChange,
  onRowDelete,
  onCellSave,
  isLoading = false,
  saveStatus = 'idle'
}: SpreadsheetGridProps) {
  const [editingCell, setEditingCell] = useState<{ rowId: string; column: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [showEmptyMessage, setShowEmptyMessage] = useState(true);

  // Focus input when editing cell changes
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateRow = (employee: Employee): { isValid: boolean; errorMessage?: string } => {
    if (!employee.name || employee.name.trim() === '') {
      return { isValid: false, errorMessage: 'Name is required' };
    }
    if (!employee.email || employee.email.trim() === '') {
      return { isValid: false, errorMessage: 'Email is required' };
    }
    if (!validateEmail(employee.email)) {
      return { isValid: false, errorMessage: 'Invalid email format' };
    }
    return { isValid: true };
  };

  const handleCellClick = (rowId: string, column: string) => {
    const employee = employees.find(e => e.id === rowId);
    if (!employee) return;
    
    setEditingCell({ rowId, column });
    setEditValue(employee[column as keyof Employee] as string || '');
    setShowEmptyMessage(false);
  };

  const handleCellChange = (value: string) => {
    setEditValue(value);
  };

  const handleCellSave = async () => {
    if (!editingCell) return;

    const updatedEmployees = employees.map(employee => {
      if (employee.id === editingCell.rowId) {
        const updated = { ...employee, [editingCell.column]: editValue };
        const validation = validateRow(updated);
        
        return {
          ...updated,
          status: validation.isValid ? 'ready' : 'error',
          errorMessage: validation.errorMessage
        } as Employee;
      }
      return employee;
    });

    onEmployeesChange(updatedEmployees);
    
    // Trigger immediate save for this cell if ID exists (not a new row)
    if (!editingCell.rowId.startsWith('new-') && !editingCell.rowId.startsWith('temp-') && onCellSave) {
      try {
        await onCellSave(editingCell.rowId, editingCell.column, editValue);
      } catch (error) {
        console.error('Failed to save cell:', error);
        // The auto-save hook will handle retry logic
      }
    }
    
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      handleCellSave();
      
      if (editingCell) {
        const currentColumnIndex = COLUMNS.findIndex(col => col.key === editingCell.column);
        const currentRowIndex = employees.findIndex(emp => emp.id === editingCell.rowId);
        
        if (e.key === 'Enter') {
          // Enter: Move down
          if (currentRowIndex < employees.length - 1) {
            handleCellClick(employees[currentRowIndex + 1].id, editingCell.column);
          }
        } else if (e.key === 'Tab') {
          if (e.shiftKey) {
            // Shift+Tab: Previous cell
            if (currentColumnIndex > 0) {
              handleCellClick(editingCell.rowId, COLUMNS[currentColumnIndex - 1].key);
            } else if (currentRowIndex > 0) {
              handleCellClick(employees[currentRowIndex - 1].id, COLUMNS[COLUMNS.length - 1].key);
            }
          } else {
            // Tab: Next cell
            if (currentColumnIndex < COLUMNS.length - 1) {
              handleCellClick(editingCell.rowId, COLUMNS[currentColumnIndex + 1].key);
            } else if (currentRowIndex < employees.length - 1) {
              handleCellClick(employees[currentRowIndex + 1].id, COLUMNS[0].key);
            }
          }
        }
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      if (editingCell && !e.altKey && !e.metaKey) {
        const currentColumnIndex = COLUMNS.findIndex(col => col.key === editingCell.column);
        const currentRowIndex = employees.findIndex(emp => emp.id === editingCell.rowId);
        
        switch (e.key) {
          case 'ArrowUp':
            if (currentRowIndex > 0) {
              e.preventDefault();
              handleCellSave();
              handleCellClick(employees[currentRowIndex - 1].id, editingCell.column);
            }
            break;
          case 'ArrowDown':
            if (currentRowIndex < employees.length - 1) {
              e.preventDefault();
              handleCellSave();
              handleCellClick(employees[currentRowIndex + 1].id, editingCell.column);
            }
            break;
          case 'ArrowLeft':
            if (e.target.selectionStart === 0 && currentColumnIndex > 0) {
              e.preventDefault();
              handleCellSave();
              handleCellClick(editingCell.rowId, COLUMNS[currentColumnIndex - 1].key);
            }
            break;
          case 'ArrowRight':
            if (e.target.selectionStart === editValue.length && currentColumnIndex < COLUMNS.length - 1) {
              e.preventDefault();
              handleCellSave();
              handleCellClick(editingCell.rowId, COLUMNS[currentColumnIndex + 1].key);
            }
            break;
        }
      }
    }
  };

  const handleAddRow = () => {
    const newEmployee: Employee = {
      id: `temp-${Date.now()}-${Math.random()}`,
      name: '',
      email: '',
      department: '',
      position: '',
      position_code: '',
      manager_email: '',
      status: 'pending'
    };
    
    onEmployeesChange([...employees, newEmployee]);
    
    // Auto-focus the name field of the new row
    setTimeout(() => {
      handleCellClick(newEmployee.id, 'name');
    }, 50);
  };

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    const text = e.clipboardData.getData('text');
    if (!text) return;

    try {
      // Hide empty message when pasting
      setShowEmptyMessage(false);
      
      // Split by newlines and filter empty rows
      const rows = text.split(/\r?\n/).filter(row => row.trim());
      const newEmployees: Employee[] = [];

      for (const row of rows) {
        // Try different delimiters: tab, comma, semicolon
        let columns: string[] = [];
        
        if (row.includes('\t')) {
          columns = row.split('\t');
        } else if (row.includes(',')) {
          // Handle CSV with potential quotes
          columns = row.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(col => 
            col.trim().replace(/^"(.*)"$/, '$1')
          ) || [];
        } else if (row.includes(';')) {
          columns = row.split(';').map(col => col.trim());
        } else {
          // Single column, assume it's a name
          columns = [row.trim()];
        }

        if (columns.length === 0 || (columns.length === 1 && !columns[0])) continue;

        const employee: Employee = {
          id: `new-${Date.now()}-${Math.random()}`,
          name: columns[0] || '',
          email: columns[1] || '',
          department: columns[2] || '',
          position: columns[3] || '',
          position_code: columns[4] || '',
          manager_email: columns[5] || '',
          status: 'pending'
        };

        const validation = validateRow(employee);
        employee.status = validation.isValid ? 'ready' : 'error';
        employee.errorMessage = validation.errorMessage;

        newEmployees.push(employee);
      }

      if (newEmployees.length > 0) {
        // If editing a cell, replace from that position
        if (editingCell) {
          const rowIndex = employees.findIndex(e => e.id === editingCell.rowId);
          if (rowIndex >= 0) {
            const updatedEmployees = [...employees];
            // Replace starting from current row
            for (let i = 0; i < newEmployees.length; i++) {
              if (rowIndex + i < updatedEmployees.length) {
                // Merge with existing row
                updatedEmployees[rowIndex + i] = {
                  ...updatedEmployees[rowIndex + i],
                  ...newEmployees[i],
                  id: updatedEmployees[rowIndex + i].id // Keep original ID
                };
              } else {
                // Add new row
                updatedEmployees.push(newEmployees[i]);
              }
            }
            onEmployeesChange(updatedEmployees);
          }
        } else {
          // Replace empty rows first, then append
          const emptyRows = employees.filter(e => !e.name && !e.email);
          const nonEmptyRows = employees.filter(e => e.name || e.email);
          
          if (emptyRows.length >= newEmployees.length) {
            // Replace empty rows
            const updatedEmployees = employees.map(emp => {
              if (!emp.name && !emp.email && newEmployees.length > 0) {
                return { ...newEmployees.shift()!, id: emp.id };
              }
              return emp;
            });
            onEmployeesChange(updatedEmployees);
          } else {
            // Append to the end
            onEmployeesChange([...nonEmptyRows, ...newEmployees]);
          }
        }
        
        toast.success(`Added ${newEmployees.length} employee${newEmployees.length > 1 ? 's' : ''} from clipboard`);
        setEditingCell(null);
      }
    } catch (error) {
      console.error('Paste error:', error);
      toast.error('Failed to parse clipboard data');
    }
  }, [employees, onEmployeesChange, editingCell]);

  const getStatusIcon = (status: Employee['status']) => {
    switch (status) {
      case 'ready':
        return <Check className="h-3 w-3 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with save status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">Team Members</h3>
          <span className="text-xs text-muted-foreground">
            ({employees.filter(e => e.status === 'ready').length} ready of {employees.length})
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <Check className="h-3 w-3" />
              Saved
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3 w-3" />
              Error saving
            </div>
          )}
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div 
        ref={gridRef}
        className="border rounded-lg overflow-hidden relative"
        onPaste={handlePaste}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="w-10 p-2"></th>
                {COLUMNS.map(column => (
                  <th
                    key={column.key}
                    className="text-left p-2 text-xs font-medium text-gray-700"
                    style={{ width: column.width, minWidth: column.width }}
                  >
                    {column.label}
                    {column.required && <span className="text-red-500 ml-1">*</span>}
                  </th>
                ))}
                <th className="w-10 p-2"></th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 || (showEmptyMessage && employees.every(e => !e.name && !e.email)) ? (
                <tr>
                  <td colSpan={COLUMNS.length + 2} className="text-center py-8 text-muted-foreground">
                    <div className="space-y-2">
                      <p className="text-sm">No team members added yet</p>
                      <p className="text-xs">Click any cell to start typing, paste from Excel, or click "Add Row"</p>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((employee, index) => (
                  <tr
                    key={employee.id}
                    className={cn(
                      "border-b hover:bg-gray-50",
                      employee.status === 'error' && "bg-red-50"
                    )}
                  >
                    <td className="p-2 text-center text-xs text-muted-foreground">
                      {index + 1}
                    </td>
                    {COLUMNS.map(column => (
                      <td
                        key={column.key}
                        className="p-0"
                        style={{ width: column.width, minWidth: column.width }}
                      >
                        {editingCell?.rowId === employee.id && editingCell?.column === column.key ? (
                          <Input
                            ref={inputRef}
                            value={editValue}
                            onChange={(e) => handleCellChange(e.target.value)}
                            onBlur={handleCellSave}
                            onKeyDown={handleKeyDown}
                            className="h-8 rounded-none border-0 focus:ring-2 focus:ring-blue-500"
                            placeholder={column.label}
                          />
                        ) : (
                          <div
                            className={cn(
                              "p-2 h-8 flex items-center cursor-pointer hover:bg-gray-100",
                              column.required && 
                              !employee[column.key as keyof Employee] && 
                              "bg-red-50"
                            )}
                            onClick={() => handleCellClick(employee.id, column.key)}
                          >
                            <span className="text-sm truncate">
                              {employee[column.key as keyof Employee] || 
                                <span className="text-gray-400">Enter {column.label.toLowerCase()}</span>
                              }
                            </span>
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(employee.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => onRowDelete(employee.id)}
                        >
                          <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Row Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleAddRow}
        disabled={isLoading}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Row
      </Button>

      {/* Help Text - User Friendly */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-gray-50 rounded-md px-3 py-2">
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-medium">Click</kbd>
          any cell to start typing
        </span>
        <span className="text-gray-300">|</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-medium">Tab</kbd>
          to next cell
        </span>
        <span className="text-gray-300">|</span>
        <span>📋 Paste from Excel</span>
        <span className="text-gray-300">|</span>
        <span className="text-green-600">✓ Saves automatically</span>
      </div>
    </div>
  );
}