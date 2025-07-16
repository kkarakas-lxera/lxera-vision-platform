import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Download, AlertCircle, CheckCircle, Users, FileText, Target, Sparkles, ArrowRight, ChevronDown, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { OnboardingStepHeader } from './shared/OnboardingStepHeader';
import { OnboardingStepContainer } from './shared/OnboardingStepContainer';
import { OnboardingProgressBar } from './shared/OnboardingProgressBar';

interface CSVRow {
  name: string;
  email: string;
  department: string;
  position: string;
  position_code: string;
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
  mappedPositionId: string | 'skip';
  employeeCount: number;
}

interface ProgressiveCSVImportProps {
  onImportComplete: () => void;
  existingSessions?: any[];
}

type ImportStep = 'setup' | 'mapping' | 'importing' | 'complete';

export function ProgressiveCSVImport({ onImportComplete, existingSessions = [] }: ProgressiveCSVImportProps) {
  const { userProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState<ImportStep>('setup');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [defaultPositionId, setDefaultPositionId] = useState<string>('');
  const [positionMappings, setPositionMappings] = useState<PositionMapping[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

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

  const downloadTemplate = () => {
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
    link.download = 'employee_template.csv';
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
          
          const requiredHeaders = ['name', 'email', 'department', 'position', 'position_code', 'manager_email'];
          const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
          
          if (missingHeaders.length > 0) {
            reject(new Error(`Missing required columns: ${missingHeaders.join(', ')}`));
            return;
          }

          const data: CSVRow[] = [];
          const errors: string[] = [];

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length >= requiredHeaders.length) {
              const row: CSVRow = {
                name: values[headers.indexOf('name')],
                email: values[headers.indexOf('email')].toLowerCase(),
                department: values[headers.indexOf('department')],
                position: values[headers.indexOf('position')],
                position_code: values[headers.indexOf('position_code')],
                manager_email: values[headers.indexOf('manager_email')]?.toLowerCase() || undefined
              };

              // Validate all required fields are present
              if (!row.name || !row.email || !row.department || !row.position || !row.position_code) {
                errors.push(`Row ${i}: Missing required fields. All fields except manager_email are mandatory.`);
                continue;
              }

              // Validate email format
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(row.email)) {
                errors.push(`Row ${i}: Invalid email format for ${row.email}`);
                continue;
              }

              // Validate manager email format if provided
              if (row.manager_email && !emailRegex.test(row.manager_email)) {
                errors.push(`Row ${i}: Invalid manager email format for ${row.manager_email}`);
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
      
      // Prepare position mappings
      const uniquePositionCodes = [...new Set(data.map(r => r.position_code))];
      const uniquePositions = [...new Set(data.map(r => r.position))];
      const allUniquePositions = [...new Set([...uniquePositionCodes, ...uniquePositions])];
      
      if (allUniquePositions.length > 0) {
        const mappings: PositionMapping[] = allUniquePositions.map(pos => {
          // Try to find matching position
          const match = positions.find(p => 
            p.position_code === pos || 
            p.position_title.toLowerCase() === pos?.toLowerCase()
          );
          
          const employeeCount = data.filter(r => r.position_code === pos || r.position === pos).length;
          
          return {
            csvPosition: pos!,
            mappedPositionId: match ? match.id : 'skip',
            employeeCount
          };
        });
        setPositionMappings(mappings);
        
        // Auto-advance to mapping if we have positions to map
        setCurrentStep('mapping');
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
        if (mapping.mappedPositionId !== 'skip') {
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
          let positionCode = row.position_code;
          
          // Try to match by position_code first, then by position title
          if (positionMap.has(row.position_code)) {
            positionId = positionMap.get(row.position_code)!;
            const pos = positions.find(p => p.id === positionId);
            positionCode = pos?.position_code || row.position_code;
          } else if (positionMap.has(row.position)) {
            positionId = positionMap.get(row.position)!;
            const pos = positions.find(p => p.id === positionId);
            positionCode = pos?.position_code || row.position_code;
          } else if (defaultPositionId) {
            const pos = positions.find(p => p.id === defaultPositionId);
            positionCode = pos?.position_code || row.position_code;
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
              position: positionCode || 'Unassigned',
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

  // Progress calculation
  const getStepProgress = () => {
    switch (currentStep) {
      case 'setup': return csvData.length > 0 ? 33 : 0;
      case 'mapping': return 66;
      case 'importing': return 80 + (importProgress * 0.2);
      case 'complete': return 100;
      default: return 0;
    }
  };

const progressSteps = [
    { label: 'Setup', completed: currentStep !== 'setup' },
    { label: 'Mapping', completed: currentStep === 'importing' || currentStep === 'complete' },
    { label: 'Import', completed: currentStep === 'complete' }
  ];

  return (
    <OnboardingStepContainer>
      {/* Header */}
      <OnboardingStepHeader
        icon={Users}
        title="Welcome Your Team to LXERA"
        description="Import your workforce in minutes, not hours"
        step={currentStep === 'setup' ? '1 of 3' : currentStep === 'mapping' ? '2 of 3' : '3 of 3'}
        status={currentStep === 'complete' ? 'completed' : 'active'}
      />

      {/* Progress */}
      <OnboardingProgressBar
        value={getStepProgress()}
        steps={progressSteps}
      />

      {/* Current Step Content */}
      {currentStep === 'setup' && (
        <div className="space-y-6">
          {/* Default Position Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <Label className="text-sm font-medium">Default Position (Optional)</Label>
            </div>
            <Select value={defaultPositionId} onValueChange={setDefaultPositionId}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select default position for employees without one" />
              </SelectTrigger>
              <SelectContent>
                {positions.map(pos => (
                  <SelectItem key={pos.id} value={pos.id}>
                    {pos.position_title} ({pos.position_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This will be used for employees whose positions can't be matched from the CSV
            </p>
          </div>

          {/* CSV Template and Tips */}
          <div className="space-y-4">
            {/* CSV Import Tips */}
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="space-y-2">
                  <p className="font-medium">Important CSV Requirements:</p>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>All fields are mandatory</strong> except manager_email</li>
                    <li>• Use the exact column names from the template</li>
                    <li>• Ensure all emails are valid and unique</li>
                    <li>• Position codes should match your company positions</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            {/* Collapsible Example Data */}
            <Collapsible>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-black hover:text-white transition-colors">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">View Example CSV Data</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                  <div className="text-xs font-mono text-gray-700 space-y-1">
                    <div className="font-semibold text-gray-800">Example CSV format:</div>
                    <div className="bg-white p-2 rounded border font-mono text-xs">
                      name,email,department,position,position_code,manager_email<br/>
                      John Smith,john.smith@company.com,Engineering,Senior Developer,ENG_SR_DEV,jane.doe@company.com<br/>
                      Jane Doe,jane.doe@company.com,Operations,Project Manager,OPS_PM,<br/>
                      Mike Johnson,mike.johnson@company.com,Engineering,Junior Developer,ENG_JR_DEV,john.smith@company.com
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Download Template Button */}
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="w-full border-green-200 bg-green-50 hover:bg-green-100 text-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>

            {/* File Upload */}
            <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-base font-semibold mb-2">Drop your CSV file here</h3>
              <p className="text-sm text-gray-600 mb-4">or click to browse</p>
              <Button 
                className="bg-gradient-to-r from-blue-500 to-purple-500" 
                type="button"
                onClick={() => document.getElementById('csv-upload')?.click()}
              >
                Choose File
              </Button>
              <input 
                id="csv-upload"
                type="file" 
                className="hidden" 
                accept=".csv"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {/* Data Preview */}
          {csvFile && (
            <Alert className="bg-green-50 border-green-200">
              <FileText className="h-4 w-4" />
              <AlertDescription className="text-green-800">
                <strong>{csvFile.name}</strong> - {csvData.length} employees ready to import
              </AlertDescription>
            </Alert>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Validation Errors</AlertTitle>
              <AlertDescription>
                <ul className="text-sm space-y-1 mt-2">
                  {validationErrors.slice(0, 3).map((error, idx) => (
                    <li key={idx}>• {error}</li>
                  ))}
                  {validationErrors.length > 3 && (
                    <li>• ... and {validationErrors.length - 3} more errors</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {currentStep === 'mapping' && (
        <div className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <Sparkles className="h-4 w-4" />
            <AlertDescription className="text-blue-800">
              We found positions in your CSV. Map them to your existing positions or skip to use the default.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-medium">Position Mapping</h3>
            </div>
            {positionMappings.map((mapping, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{mapping.csvPosition}</p>
                  <p className="text-xs text-muted-foreground">
                    {mapping.employeeCount} employee{mapping.employeeCount > 1 ? 's' : ''}
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
                    <SelectItem value="skip">Use Default Position</SelectItem>
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

          <Button onClick={processImport} className="w-full" size="lg">
            Import {csvData.length} Employees
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {currentStep === 'importing' && (
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 animate-pulse">
            <Upload className="h-10 w-10 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Importing Employees</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Processing {csvData.length} employees...
            </p>
          </div>
          <div className="max-w-xs mx-auto space-y-2">
            <Progress value={importProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">{importProgress}% complete</p>
          </div>
        </div>
      )}

      {currentStep === 'complete' && (
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Import Complete!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Successfully imported your employees
            </p>
          </div>
        </div>
      )}

      {/* Skip Mapping Button */}
      {currentStep === 'mapping' && defaultPositionId && (
        <Button 
          variant="outline" 
          onClick={processImport} 
          className="w-full"
        >
          Skip Mapping - Use Default Position for All
        </Button>
      )}
    </OnboardingStepContainer>
  );
}
