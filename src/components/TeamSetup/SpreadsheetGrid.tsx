import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, AlertCircle, Check, Loader2, Trash2, MoreVertical, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  onCellSave?: (rowId: string, field: string, value: string) => void;
  isLoading?: boolean;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date | null;
  departments?: string[];
  positions?: { id: string; position_code: string; position_title: string; department?: string }[];
}

// No generic placeholders - only use actual data from database

const COLUMNS = [
  { key: 'name', label: 'Full Name', required: true, width: '250px', type: 'text' },
  { key: 'email', label: 'Email', required: true, width: '300px', type: 'email' },
  { key: 'department', label: 'Department', required: true, width: '200px', type: 'select' },
  { key: 'position', label: 'Position', required: true, width: '250px', type: 'select' },
  { key: 'position_code', label: 'Code', required: true, width: '120px', type: 'text' },
];

export default function SpreadsheetGrid({
  employees,
  onEmployeesChange,
  onRowDelete,
  onCellSave,
  isLoading = false,
  saveStatus = 'idle',
  lastSaved,
  departments: companyDepartments,
  positions: companyPositions
}: SpreadsheetGridProps) {
  const navigate = useNavigate();
  const [editingCell, setEditingCell] = useState<{ rowId: string; column: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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
    if (!employee.department || employee.department.trim() === '') {
      return { isValid: false, errorMessage: 'Department is required' };
    }
    if (!employee.position || employee.position.trim() === '') {
      return { isValid: false, errorMessage: 'Position is required' };
    }
    return { isValid: true };
  };

  const handleCellClick = (rowId: string, column: string) => {
    const employee = employees.find(e => e.id === rowId);
    if (!employee) return;
    
    setEditingCell({ rowId, column });
    setEditValue(employee[column as keyof Employee] as string || '');
  };

  const handleCellChange = (value: string) => {
    setEditValue(value);
  };

  const generatePositionCode = (position: string): string => {
    if (!position) return '';
    const words = position.split(' ');
    if (words.length === 1) {
      return position.substring(0, 3).toUpperCase();
    }
    return words.map(w => w[0]).join('').toUpperCase();
  };

  const handleCellSave = async () => {
    if (!editingCell) return;

    const updatedEmployees = employees.map(employee => {
      if (employee.id === editingCell.rowId) {
        const updated = { ...employee, [editingCell.column]: editValue };
        
        // Auto-generate position code when position changes
        if (editingCell.column === 'position' && editValue) {
          // First try to find the position code from company positions
          const selectedPosition = companyPositions?.find(p => p.position_title === editValue);
          if (selectedPosition && selectedPosition.position_code) {
            updated.position_code = selectedPosition.position_code;
          } else if (!updated.position_code || updated.position_code === generatePositionCode(employee.position || '')) {
            // Fall back to auto-generation
            updated.position_code = generatePositionCode(editValue);
          }
        }
        
        // Clear position when department changes
        if (editingCell.column === 'department' && editValue !== employee.department) {
          updated.position = '';
          updated.position_code = '';
        }
        
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
    
    // Trigger cell save callback for change tracking
    if (onCellSave) {
      onCellSave(editingCell.rowId, editingCell.column, editValue);
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
          // Enter: Save and create new row if on last row
          if (currentRowIndex === employees.length - 1) {
            handleAddRow();
          } else {
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
            if ((e.target as HTMLInputElement).selectionStart === 0 && currentColumnIndex > 0) {
              e.preventDefault();
              handleCellSave();
              handleCellClick(editingCell.rowId, COLUMNS[currentColumnIndex - 1].key);
            }
            break;
          case 'ArrowRight':
            if ((e.target as HTMLInputElement).selectionStart === editValue.length && currentColumnIndex < COLUMNS.length - 1) {
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
    // Don't intercept paste if we're editing a cell - let the input handle it normally
    if (editingCell) {
      return;
    }
    
    e.preventDefault();
    
    const text = e.clipboardData.getData('text');
    if (!text) return;

    try {
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
        
        toast.success(`Added ${newEmployees.length} employee${newEmployees.length > 1 ? 's' : ''} from clipboard`);
      }
    } catch (error) {
      console.error('Paste error:', error);
      toast.error('Failed to parse clipboard data');
    }
  }, [employees, onEmployeesChange, editingCell]);

  const getStatusIcon = (status: Employee['status']) => {
    switch (status) {
      case 'ready':
        return (
          <div className="w-2 h-2 rounded-full bg-green-500" title="Ready" />
        );
      case 'error':
        return (
          <div className="w-2 h-2 rounded-full bg-orange-500" title="Missing required fields" />
        );
      default:
        return (
          <div className="w-2 h-2 rounded-full bg-gray-300" title="Pending" />
        );
    }
  };

  const getStatusBadge = (employee: Employee) => {
    if (employee.status === 'ready') {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs px-2 py-0">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ready
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            All required fields are complete
          </TooltipContent>
        </Tooltip>
      );
    } else if (employee.status === 'error') {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 text-xs px-2 py-0">
              <AlertCircle className="h-3 w-3 mr-1" />
              Incomplete
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            {employee.errorMessage || 'Missing required fields'}
          </TooltipContent>
        </Tooltip>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300 text-xs px-2 py-0">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header with save status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">Team Members</h3>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Auto-save status */}
          <div className="flex items-center gap-2 text-sm">
            {saveStatus === 'saving' && (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin" />
                <span className="text-gray-600">Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Saved</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-600">Error</span>
              </>
            )}
            {lastSaved && saveStatus === 'idle' && (
              <span className="text-gray-500 text-xs">
                Last saved {new Date(lastSaved).toLocaleTimeString()}
              </span>
            )}
          </div>
          
          {/* Compact Add Row button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddRow}
            disabled={isLoading}
            className="h-8 px-3 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Row
          </Button>
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
              <tr className="bg-gray-50/50 border-b">
                <th className="w-12 p-3 text-xs font-medium text-gray-500">#</th>
                {COLUMNS.map(column => (
                  <th
                    key={column.key}
                    className="text-left p-3 text-xs font-medium text-gray-600"
                    style={{ width: column.width, minWidth: column.width }}
                  >
                    {column.label}
                    {column.required && <span className="text-red-400 ml-0.5">*</span>}
                  </th>
                ))}
                <th className="w-16 p-3 text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length + 2} className="text-center py-8 text-muted-foreground">
                    <div className="space-y-2">
                      <p className="text-sm">No team members added yet</p>
                      <p className="text-xs">Click "Add Row" to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((employee, index) => (
                  <tr
                    key={employee.id}
                    className={cn(
                      "border-b transition-all duration-200",
                      "hover:bg-gray-50 hover:shadow-sm",
                      employee.status === 'error' && "bg-orange-50"
                    )}
                  >
                    <td className="p-3 text-center text-xs text-muted-foreground">
                      {index + 1}
                    </td>
                    {COLUMNS.map(column => (
                      <td
                        key={column.key}
                        className="p-0 relative"
                        style={{ width: column.width, minWidth: column.width }}
                      >
                        {editingCell?.rowId === employee.id && editingCell?.column === column.key ? (
                          column.type === 'select' ? (
                            <Select
                              value={editValue || ''}
                              onValueChange={(value) => {
                                if (value === 'add-new-position') {
                                  // Navigate to position creation page
                                  navigate('/dashboard/positions/new');
                                  setEditingCell(null);
                                  setEditValue('');
                                } else {
                                  setEditValue(value);
                                  // Don't save immediately, wait for dropdown to close
                                }
                              }}
                              onOpenChange={(open) => {
                                if (!open && editValue !== employee[column.key as keyof Employee] && editValue !== 'add-new-position') {
                                  // Save when dropdown closes if value changed
                                  handleCellSave();
                                }
                              }}
                            >
                              <SelectTrigger 
                                className="h-10 rounded-none border-0 focus:ring-2 focus:ring-blue-500"
                              >
                                <SelectValue placeholder={`Select ${column.label}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {column.key === 'department' && (
                                  companyDepartments && companyDepartments.length > 0 ? (
                                    companyDepartments
                                      .filter(dept => dept && dept.trim() !== '')
                                      .map(dept => (
                                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                      ))
                                  ) : (
                                    <SelectItem value="no-departments" disabled>No departments available</SelectItem>
                                  )
                                )}
                                {column.key === 'position' && (
                                  employee.department ? (
                                    (() => {
                                      const filteredPositions = companyPositions
                                        ?.filter(p => !p.department || p.department === employee.department)
                                        .filter(p => p.position_title && p.position_title.trim() !== '') || [];
                                      
                                      return (
                                        <>
                                          {filteredPositions.length > 0 ? (
                                            filteredPositions.map(pos => (
                                              <SelectItem key={pos.id} value={pos.position_title}>
                                                {pos.position_title}
                                              </SelectItem>
                                            ))
                                          ) : (
                                            <SelectItem value="no-positions" disabled>No positions for this department</SelectItem>
                                          )}
                                          <SelectItem 
                                            value="add-new-position"
                                            className="text-blue-600 font-medium"
                                          >
                                            + Add New Position
                                          </SelectItem>
                                        </>
                                      );
                                    })()
                                  ) : (
                                    <SelectItem value="select-dept" disabled>Select department first</SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              ref={inputRef}
                              type={column.type}
                              value={editValue}
                              onChange={(e) => handleCellChange(e.target.value)}
                              onBlur={(e) => {
                                // Only save on blur if we're not clicking another cell
                                const relatedTarget = e.relatedTarget as HTMLElement;
                                if (!relatedTarget || !relatedTarget.closest('td')) {
                                  handleCellSave();
                                }
                              }}
                              onKeyDown={handleKeyDown}
                              className="h-10 rounded-none border-0 focus:ring-2 focus:ring-blue-500"
                              placeholder={`Enter ${column.label.toLowerCase()}`}
                            />
                          )
                        ) : (
                          <div
                            className={cn(
                              "px-3 h-12 flex items-center cursor-pointer hover:bg-gray-50 transition-colors",
                              column.required && !employee[column.key as keyof Employee] && 
                              "border-b-2 border-gray-200"
                            )}
                            onClick={() => {
                              // Don't switch cells if we're already editing this cell
                              if (editingCell?.rowId === employee.id && editingCell?.column === column.key) {
                                return;
                              }
                              
                              // Save any pending changes before switching cells
                              if (editingCell) {
                                handleCellSave();
                              }
                              
                              // Directly open the new cell without delay
                              handleCellClick(employee.id, column.key);
                            }}
                          >
                            <span className={cn(
                              "text-sm truncate",
                              !employee[column.key as keyof Employee] && "text-gray-400"
                            )}>
                              {employee[column.key as keyof Employee] || 
                                `Enter ${column.label.toLowerCase()}`
                              }
                            </span>
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="p-2">
                      <div className="flex items-center justify-center">
                        {getStatusBadge(employee)}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-gray-100"
                            >
                              <MoreVertical className="h-4 w-4 text-gray-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                const newEmployee = { ...employee, id: `temp-${Date.now()}-${Math.random()}` };
                                const index = employees.findIndex(e => e.id === employee.id);
                                const updatedEmployees = [...employees];
                                updatedEmployees.splice(index + 1, 0, newEmployee);
                                onEmployeesChange(updatedEmployees);
                              }}
                            >
                              Duplicate row
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onRowDelete(employee.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              Delete row
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Help Text - Modern & Clean */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground bg-gray-50/50 rounded-lg px-4 py-2.5">
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-medium shadow-sm">Click</kbd>
          to edit
        </span>
        <span className="text-gray-300">•</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-medium shadow-sm">Tab</kbd>
          /
          <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-medium shadow-sm">Enter</kbd>
          to navigate
        </span>
        <span className="text-gray-300">•</span>
        <span>Paste from Excel supported</span>
        <span className="text-gray-300">•</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-medium shadow-sm">⌘/Ctrl</kbd>
          +
          <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-medium shadow-sm">V</kbd>
          to paste
        </span>
      </div>
    </div>
    </TooltipProvider>
  );
}