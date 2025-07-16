import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Download, AlertCircle, CheckCircle, Users, FileText, ChevronRight, ChevronDown, Target, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CSVRow {
  name: string;
  email: string;
  department?: string;
  position?: string;
  position_code?: string;
  manager_email?: string;
}

interface Position {
  id: string;
  position_code: string;
  position_title: string;
  department?: string;
}

interface PositionMapping {
  csvPosition: string;
  mappedPositionId: string | 'create' | 'skip';
  createNew?: {
    title: string;
    code: string;
    department?: string;
  };
}

interface ProgressiveCSVImportProps {
  onImportComplete: () => void;
  existingSessions?: any[];
}

type ImportStep = 'mode' | 'upload' | 'preview' | 'mapping' | 'importing' | 'complete';
type ImportMode = 'strict' | 'flexible' | 'smart';

export function ProgressiveCSVImport({ onImportComplete, existingSessions = [] }: ProgressiveCSVImportProps) {
  const { userProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState<ImportStep>('mode');
  const [importMode, setImportMode] = useState<ImportMode>('smart');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [defaultPositionId, setDefaultPositionId] = useState<string>('');
  const [positionMappings, setPositionMappings] = useState<PositionMapping[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({ mode: true });

  // Fetch positions on mount
  useEffect(() => {
    fetchPositions();
  }, [userProfile?.company_id]);

  const fetchPositions = async () => {
    if (!userProfile?.company_id) return;
    
    try {
      const { data, error } = await supabase
        .from('st_company_positions')
        .select('id, position_code, position_title, department')
        .eq('company_id', userProfile.company_id)
        .order('position_title');
      
      if (error) throw error;
      setPositions(data || []);
    } catch (error) {
      console.error('Error fetching positions:', error);
      toast.error('Failed to load positions');
    }
  };

  const steps = [
    {
      id: 'mode',
      title: 'Choose Import Mode',
      description: 'Select how to handle positions',
      icon: Target,
      completed: currentStep !== 'mode'
    },
    {
      id: 'upload',
      title: 'Upload CSV File',
      description: 'Select your employee data file',
      icon: Upload,
      completed: ['preview', 'mapping', 'importing', 'complete'].includes(currentStep)
    },
    {
      id: 'preview',
      title: 'Preview & Validate',
      description: 'Review employee data',
      icon: FileText,
      completed: ['mapping', 'importing', 'complete'].includes(currentStep)
    },
    {
      id: 'mapping',
      title: 'Map Positions',
      description: 'Match positions to your system',
      icon: Sparkles,
      completed: ['importing', 'complete'].includes(currentStep),
      show: importMode !== 'strict'
    },
    {
      id: 'complete',
      title: 'Import Complete',
      description: 'View results',
      icon: CheckCircle,
      completed: currentStep === 'complete'
    }
  ];

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps({ [stepId]: true });
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ['name', 'email', 'department', 'position', 'position_code', 'manager_email'],
      ['John Smith', 'john.smith@company.com', 'Engineering', 'Senior Developer', 'ENG_SR_DEV', 'jane.doe@company.com'],
      ['Jane Doe', 'jane.doe@company.com', 'Operations', 'Project Manager', 'OPS_PM', ''],
      ['Mike Johnson', 'mike.johnson@company.com', 'Engineering', 'Junior Developer', 'ENG_JR_DEV', 'john.smith@company.com']
    ];

    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employee_import_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = useCallback((file: File): Promise<CSVRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.trim().split('\n');
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          const requiredHeaders = ['name', 'email'];
          const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
          
          if (missingHeaders.length > 0) {
            reject(new Error(`Missing required columns: ${missingHeaders.join(', ')}`));
            return;
          }

          const data: CSVRow[] = [];
          const errors: string[] = [];

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length >= 2 && values[0] && values[1]) {
              const row: CSVRow = {
                name: values[headers.indexOf('name')],
                email: values[headers.indexOf('email')].toLowerCase(),
                department: headers.includes('department') ? values[headers.indexOf('department')] : undefined,
                position: headers.includes('position') ? values[headers.indexOf('position')] : undefined,
                position_code: headers.includes('position_code') ? values[headers.indexOf('position_code')] : undefined,
                manager_email: headers.includes('manager_email') ? values[headers.indexOf('manager_email')]?.toLowerCase() : undefined
              };

              // Validate email format
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(row.email)) {
                errors.push(`Row ${i}: Invalid email format for ${row.email}`);
                continue;
              }

              data.push(row);
            }
          }

          if (errors.length > 0) {
            setValidationErrors(errors);
          }

          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setCsvFile(file);
    setValidationErrors([]);

    try {
      const data = await parseCSV(file);
      setCsvData(data);
      
      // Auto-advance to preview
      setCurrentStep('preview');
      setExpandedSteps({ preview: true });
      
      // Prepare position mappings for smart mode
      if (importMode === 'smart') {
        const uniquePositions = [...new Set(data.map(r => r.position || r.position_code).filter(Boolean))];
        const mappings: PositionMapping[] = uniquePositions.map(pos => {
          // Try to find matching position
          const match = positions.find(p => 
            p.position_code === pos || 
            p.position_title.toLowerCase() === pos?.toLowerCase()
          );
          
          return {
            csvPosition: pos!,
            mappedPositionId: match ? match.id : 'skip'
          };
        });
        setPositionMappings(mappings);
      }
      
      toast.success(`Loaded ${data.length} employees from CSV`);
    } catch (error: any) {
      toast.error(`Failed to parse CSV: ${error.message}`);
      setCsvFile(null);
      setCsvData([]);
    }
  };

  const processImport = async () => {
    if (!userProfile?.company_id || csvData.length === 0) return;

    setImporting(true);
    setImportProgress(0);
    setCurrentStep('importing');

    try {
      // Create import session
      const { data: importSession, error: sessionError } = await supabase
        .from('st_import_sessions')
        .insert({
          company_id: userProfile.company_id,
          import_type: 'employee_onboarding',
          total_employees: csvData.length,
          processed: 0,
          successful: 0,
          failed: 0,
          status: 'processing',
          created_by: userProfile.id,
          active_position_id: defaultPositionId || null,
          session_metadata: {
            import_mode: importMode,
            has_position_mappings: positionMappings.length > 0
          }
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      let successful = 0;
      let failed = 0;

      // Create position mapping lookup
      const positionMap = new Map<string, string>();
      positionMappings.forEach(mapping => {
        if (mapping.mappedPositionId !== 'skip' && mapping.mappedPositionId !== 'create') {
          positionMap.set(mapping.csvPosition, mapping.mappedPositionId);
        }
      });

      // Process each employee
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        setImportProgress(Math.round(((i + 1) / csvData.length) * 100));

        try {
          // Determine position ID
          let positionId = defaultPositionId;
          let positionCode = '';
          
          if (importMode !== 'strict') {
            const csvPos = row.position || row.position_code;
            if (csvPos && positionMap.has(csvPos)) {
              positionId = positionMap.get(csvPos)!;
              const pos = positions.find(p => p.id === positionId);
              positionCode = pos?.position_code || '';
            }
          }

          // Check if user exists
          const { data: checkResult } = await supabase
            .rpc('check_user_exists_by_email', { p_email: row.email });

          let userId = checkResult?.[0]?.user_exists ? checkResult[0].user_id : null;

          if (!userId) {
            // Create new user
            const { data: newUserId, error: userError } = await supabase
              .rpc('create_company_user', {
                p_email: row.email,
                p_password_hash: '$2b$12$LQv3c1yqBwWFcZPMtS.4K.6P8vU6OxZdHJ5QKG8vY.7JZu9Z1QY6m',
                p_full_name: row.name,
                p_role: 'learner'
              });

            if (userError) throw userError;
            userId = newUserId;
          }

          // Create or update employee record
          const { error: employeeError } = await supabase
            .from('employees')
            .upsert({
              user_id: userId,
              company_id: userProfile.company_id,
              department: row.department,
              position: positionCode || row.position || 'Unassigned',
              current_position_id: positionId || null,
              target_position_id: positionId || null,
              is_active: true
            });

          if (employeeError) throw employeeError;

          // Create import session item
          await supabase
            .from('st_import_session_items')
            .insert({
              import_session_id: importSession.id,
              employee_email: row.email,
              employee_name: row.name,
              current_position_code: positionCode,
              target_position_code: positionCode,
              status: 'completed',
              employee_id: userId
            });

          successful++;
        } catch (error) {
          console.error(`Failed to process ${row.email}:`, error);
          failed++;
          
          await supabase
            .from('st_import_session_items')
            .insert({
              import_session_id: importSession.id,
              employee_email: row.email,
              employee_name: row.name,
              status: 'failed',
              error_message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
      }

      // Update import session
      await supabase
        .from('st_import_sessions')
        .update({
          processed: successful + failed,
          successful,
          failed,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', importSession.id);

      setCurrentStep('complete');
      setExpandedSteps({ complete: true });
      toast.success(`Import completed! ${successful} successful, ${failed} failed`);
      
      setTimeout(() => {
        onImportComplete();
      }, 2000);
      
    } catch (error: any) {
      console.error('Import failed:', error);
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  // Render step content
  const renderStepContent = (stepId: string) => {
    switch (stepId) {
      case 'mode':
        return (
          <div className="space-y-4">
            <RadioGroup value={importMode} onValueChange={(value) => setImportMode(value as ImportMode)}>
              <div className="space-y-3">
                <label className={cn(
                  "flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors",
                  importMode === 'strict' && "border-primary bg-primary/5"
                )}>
                  <RadioGroupItem value="strict" id="strict" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="strict" className="text-base font-medium cursor-pointer">
                      Strict Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      All employees must be assigned to a single position you select. Best for bulk imports of similar roles.
                    </p>
                  </div>
                </label>

                <label className={cn(
                  "flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors",
                  importMode === 'flexible' && "border-primary bg-primary/5"
                )}>
                  <RadioGroupItem value="flexible" id="flexible" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="flexible" className="text-base font-medium cursor-pointer">
                      Flexible Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Employees without matching positions will be marked as "Unassigned". You can update them later.
                    </p>
                  </div>
                </label>

                <label className={cn(
                  "flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors",
                  importMode === 'smart' && "border-primary bg-primary/5"
                )}>
                  <RadioGroupItem value="smart" id="smart" className="mt-1" />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="smart" className="text-base font-medium cursor-pointer">
                        Smart Mode
                      </Label>
                      <Badge variant="outline" className="text-xs">Recommended</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      AI-assisted position matching. Map CSV positions to existing ones or create new positions as needed.
                    </p>
                  </div>
                </label>
              </div>
            </RadioGroup>

            {importMode === 'strict' && (
              <div className="space-y-2 pt-4 border-t">
                <Label>Select Default Position</Label>
                <Select value={defaultPositionId} onValueChange={setDefaultPositionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a position for all employees" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map(pos => (
                      <SelectItem key={pos.id} value={pos.id}>
                        {pos.position_title} ({pos.position_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button 
              onClick={() => {
                if (importMode === 'strict' && !defaultPositionId) {
                  toast.error('Please select a default position');
                  return;
                }
                setCurrentStep('upload');
                setExpandedSteps({ upload: true });
              }}
              className="w-full"
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        );

      case 'upload':
        return (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>CSV Format</AlertTitle>
              <AlertDescription className="space-y-2 mt-2">
                <p>Your CSV should include these columns:</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li><strong>Required:</strong> name, email</li>
                  <li><strong>Optional:</strong> department, position, position_code, manager_email</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">CSV files only</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".csv"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            <Button
              variant="outline"
              onClick={downloadSampleCSV}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Sample CSV
            </Button>

            {csvFile && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">{csvFile.name}</span>
                </div>
                <Badge variant="outline">{csvData.length} employees</Badge>
              </div>
            )}
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-4">
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Validation Errors</AlertTitle>
                <AlertDescription>
                  <ul className="text-sm space-y-1 mt-2">
                    {validationErrors.slice(0, 5).map((error, idx) => (
                      <li key={idx}>• {error}</li>
                    ))}
                    {validationErrors.length > 5 && (
                      <li>• ... and {validationErrors.length - 5} more errors</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Data Preview</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">Email</th>
                      <th className="px-3 py-2 text-left">Department</th>
                      <th className="px-3 py-2 text-left">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2">{row.name}</td>
                        <td className="px-3 py-2 text-xs">{row.email}</td>
                        <td className="px-3 py-2">{row.department || '-'}</td>
                        <td className="px-3 py-2">{row.position || row.position_code || '-'}</td>
                      </tr>
                    ))}
                    {csvData.length > 5 && (
                      <tr className="border-t bg-gray-50">
                        <td colSpan={4} className="px-3 py-2 text-center text-sm text-muted-foreground">
                          ... and {csvData.length - 5} more employees
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentStep('upload');
                  setExpandedSteps({ upload: true });
                }}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  if (importMode === 'smart') {
                    setCurrentStep('mapping');
                    setExpandedSteps({ mapping: true });
                  } else {
                    processImport();
                  }
                }}
                className="flex-1"
                disabled={validationErrors.length > 0}
              >
                {importMode === 'smart' ? 'Continue to Mapping' : 'Start Import'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'mapping':
        return (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                Map positions from your CSV to existing positions or skip unmapped ones.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {positionMappings.map((mapping, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{mapping.csvPosition}</p>
                    <p className="text-xs text-muted-foreground">
                      {csvData.filter(r => (r.position || r.position_code) === mapping.csvPosition).length} employees
                    </p>
                  </div>
                  <Select
                    value={mapping.mappedPositionId}
                    onValueChange={(value) => {
                      const updated = [...positionMappings];
                      updated[idx].mappedPositionId = value;
                      setPositionMappings(updated);
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skip">Skip (Unassigned)</SelectItem>
                      {positions.map(pos => (
                        <SelectItem key={pos.id} value={pos.id}>
                          {pos.position_title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentStep('preview');
                  setExpandedSteps({ preview: true });
                }}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={processImport}
                className="flex-1"
              >
                Start Import
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'importing':
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">Importing employees...</p>
              <Progress value={importProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">{importProgress}% complete</p>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Import Successful!</AlertTitle>
              <AlertDescription>
                Your employees have been imported and are ready for the next step.
              </AlertDescription>
            </Alert>
            <Button onClick={onImportComplete} className="w-full">
              Continue to Invite Employees
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Step Progress */}
      <div className="space-y-3">
        {steps.filter(step => step.show !== false).map((step, index) => {
          const isActive = currentStep === step.id;
          const isExpanded = expandedSteps[step.id];
          const Icon = step.icon;

          return (
            <div key={step.id} className="border rounded-lg overflow-hidden">
              <div
                className={cn(
                  "flex items-center justify-between p-3 cursor-pointer transition-colors",
                  isActive && "bg-blue-50",
                  !isActive && "hover:bg-gray-50"
                )}
                onClick={() => toggleStepExpansion(step.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex items-center justify-center h-8 w-8 rounded-full transition-colors",
                    step.completed ? "bg-green-100 text-green-700" : 
                    isActive ? "bg-blue-600 text-white" : 
                    "bg-gray-100 text-gray-500"
                  )}>
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className={cn(
                      "font-medium text-sm",
                      isActive ? "text-blue-900" : "text-gray-900"
                    )}>
                      {step.title}
                    </h3>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </div>

              {isExpanded && (
                <div className="border-t p-4 bg-gray-50">
                  {renderStepContent(step.id)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}