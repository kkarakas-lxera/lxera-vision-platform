import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Users, FileText, CheckCircle, Upload, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Papa from 'papaparse';

type ImportState = 'initial' | 'processing' | 'selecting' | 'positioning' | 'importing' | 'success' | 'trial-full';

export default function OnboardingImport() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { importSessions, stats, loading, refreshData } = useOnboarding();
  const [importState, setImportState] = useState<ImportState>(stats.total >= 10 ? 'trial-full' : 'initial');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<any[]>([]);
  const [selectionMethod, setSelectionMethod] = useState<'first' | 'last' | 'manual'>('first');
  const [defaultPosition, setDefaultPosition] = useState<string>('');
  const [positions, setPositions] = useState<any[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [needsPositionAssignment, setNeedsPositionAssignment] = useState<any[]>([]);

  // Load positions on mount
  React.useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    if (!userProfile?.company_id) return;
    
    try {
      const { data, error } = await supabase
        .from('st_company_positions')
        .select('id, title')
        .eq('company_id', userProfile.company_id);
      
      if (error) throw error;
      setPositions(data || []);
    } catch (error) {
      console.error('Error loading positions:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportState('processing');
      parseCSV(file);
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const validEmployees = results.data.filter((row: any) => 
          row.email && row.first_name && row.last_name
        );
        
        setParsedData(validEmployees);
        
        if (validEmployees.length > 10) {
          setImportState('selecting');
        } else {
          setSelectedEmployees(validEmployees);
          checkPositionAssignment(validEmployees);
        }
      },
      error: (error) => {
        toast.error('Failed to parse CSV file');
        setImportState('initial');
      }
    });
  };

  const checkPositionAssignment = (employees: any[]) => {
    const needsPosition = employees.filter(emp => !emp.position || emp.position.trim() === '');
    
    if (needsPosition.length > 0) {
      setNeedsPositionAssignment(needsPosition);
      setImportState('positioning');
    } else {
      startImport(employees);
    }
  };

  const handleSelectionMethodChange = (method: 'first' | 'last' | 'manual') => {
    setSelectionMethod(method);
    
    if (method === 'first') {
      setSelectedEmployees(parsedData.slice(0, 10));
    } else if (method === 'last') {
      setSelectedEmployees(parsedData.slice(-10));
    }
  };

  const downloadTemplate = () => {
    const csvContent = `first_name,last_name,email,position,manager_email
John,Smith,john.smith@company.com,Software Engineer,manager@company.com
Sarah,Johnson,sarah.johnson@company.com,Product Manager,
Mike,Williams,mike.williams@company.com,Designer,sarah.johnson@company.com`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_import_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const startImport = async (employeesToImport: any[]) => {
    setImportState('importing');
    setImportProgress(0);
    
    try {
      // Create import session
      const { data: session, error: sessionError } = await supabase
        .from('employee_import_sessions')
        .insert({
          company_id: userProfile?.company_id,
          file_name: selectedFile?.name || 'manual_import',
          total_employees: employeesToImport.length,
          status: 'processing'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Import employees with progress tracking
      for (let i = 0; i < employeesToImport.length; i++) {
        const employee = employeesToImport[i];
        
        const { error: empError } = await supabase
          .from('employees')
          .insert({
            company_id: userProfile?.company_id,
            email: employee.email,
            first_name: employee.first_name,
            last_name: employee.last_name,
            position: employee.position || defaultPosition,
            import_session_id: session.id
          });

        if (empError) {
          console.error('Error importing employee:', empError);
        }

        setImportProgress(((i + 1) / employeesToImport.length) * 100);
      }

      // Update session status
      await supabase
        .from('employee_import_sessions')
        .update({ status: 'completed' })
        .eq('id', session.id);

      await refreshData();
      setImportState('success');
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import employees');
      setImportState('initial');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/onboarding')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Overview
          </Button>
          <div className="h-5 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold">Import Team Members</h1>
            <p className="text-sm text-muted-foreground">
              Step 1 of 3 • Upload employee data to get started
            </p>
          </div>
        </div>
        
        <Badge variant="default">Step 1</Badge>
      </div>

      {/* Progress Steps */}
      <Card className="overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="font-medium text-sm">Import</span>
            </div>
            <div className="h-0.5 flex-1 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                stats.total > 0 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                2
              </div>
              <span className={`text-sm ${stats.total > 0 ? 'text-blue-700' : 'text-gray-500'}`}>
                Invite
              </span>
            </div>
            <div className="h-0.5 flex-1 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                stats.analyzed > 0
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                3
              </div>
              <span className={`text-sm ${stats.analyzed > 0 ? 'text-blue-700' : 'text-gray-500'}`}>
                Analysis
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area - Single Focus */}
      <div className="min-h-[500px] flex items-center justify-center">
        {renderImportState()}
      </div>
    </div>
  );

  function renderImportState() {
    switch (importState) {
    case 'initial':
      return (
        <div className="text-center space-y-6">
          <h2 className="text-xl font-medium">Import your team</h2>
          
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-gray-400 transition-colors">
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <p className="text-base font-medium">Drop your CSV here</p>
                <p className="text-sm text-muted-foreground">or</p>
                <Button variant="outline" size="sm">Browse files</Button>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Need help? <Button variant="link" className="p-0 h-auto" onClick={downloadTemplate}>Get our template</Button>
          </p>
          
          <div className="pt-8">
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < stats.total ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm font-medium">{stats.total}/10</span>
            </div>
            <p className="text-xs text-muted-foreground">Trial: 10 employees</p>
          </div>
        </div>
      );

    case 'processing':
      return (
        <div className="text-center space-y-6">
          <h2 className="text-xl font-medium">Checking your file...</h2>
          
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 border-2 border-gray-200 rounded flex items-center justify-center">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
            <span className="text-sm text-muted-foreground">{selectedFile?.name}</span>
          </div>
          
          <div className="animate-pulse">
            <p className="text-base">Found {parsedData.length} employees</p>
          </div>
          
          <div className="pt-8">
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < stats.total ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm font-medium">{stats.total}/10</span>
            </div>
          </div>
        </div>
      );

    case 'selecting':
      return (
        <div className="text-center space-y-6 max-w-md">
          <div>
            <h2 className="text-xl font-medium">Your file has {parsedData.length} employees</h2>
            <p className="text-sm text-muted-foreground mt-2">Select 10 for your trial import</p>
          </div>
          
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <RadioGroup value={selectionMethod} onValueChange={(value: any) => handleSelectionMethodChange(value)}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="first" id="first" />
                    <Label htmlFor="first" className="font-normal cursor-pointer">First 10 employees</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="last" id="last" />
                    <Label htmlFor="last" className="font-normal cursor-pointer">Last 10 employees</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="manual" id="manual" />
                    <Label htmlFor="manual" className="font-normal cursor-pointer">Let me choose</Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
          
          <Button 
            onClick={() => {
              if (selectionMethod === 'manual') {
                // TODO: Implement manual selection
                toast.info('Manual selection coming soon');
              } else {
                checkPositionAssignment(selectedEmployees);
              }
            }}
            disabled={selectionMethod === 'manual' || selectedEmployees.length === 0}
          >
            Continue <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          
          {selectedEmployees.length > 0 && (
            <div className="text-sm text-muted-foreground">
              <p>Selected: {selectedEmployees[0]?.first_name} {selectedEmployees[0]?.last_name}...</p>
              <Button variant="link" className="p-0 h-auto text-xs">View selected 10</Button>
            </div>
          )}
          
          <div className="pt-4">
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < selectedEmployees.length ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm font-medium">10/10</span>
            </div>
          </div>
        </div>
      );

    case 'positioning':
      return (
        <div className="text-center space-y-6 max-w-md">
          <div>
            <h2 className="text-xl font-medium">Almost ready!</h2>
            <p className="text-sm text-muted-foreground mt-2">
              {needsPositionAssignment.length} employees need positions
            </p>
          </div>
          
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="position" className="text-sm font-medium">Default position:</Label>
                  <Select value={defaultPosition} onValueChange={setDefaultPosition}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem key={position.id} value={position.id}>
                          {position.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  Apply to {needsPositionAssignment.length === 1 ? 'this employee' : `all ${needsPositionAssignment.length} employees`}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Button 
            onClick={() => startImport(selectedEmployees)}
            disabled={!defaultPosition}
          >
            Start import <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          
          <div className="text-left space-y-1 text-sm text-muted-foreground">
            {needsPositionAssignment.slice(0, 2).map((emp, idx) => (
              <p key={idx}>{emp.first_name} {emp.last_name} • {emp.email}</p>
            ))}
            {needsPositionAssignment.length > 2 && (
              <p>and {needsPositionAssignment.length - 2} more...</p>
            )}
          </div>
          
          <div className="pt-4">
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full bg-blue-600`}
                />
              ))}
              <span className="ml-2 text-sm font-medium">10/10</span>
            </div>
            <p className="text-xs text-muted-foreground">Ready to import</p>
          </div>
        </div>
      );

    case 'importing':
      return (
        <div className="text-center space-y-6 max-w-md">
          <h2 className="text-xl font-medium">Importing your team</h2>
          
          <div className="space-y-3">
            <p className="text-2xl font-bold">
              {Math.floor((importProgress / 100) * selectedEmployees.length)} of {selectedEmployees.length}
            </p>
            <Progress value={importProgress} className="h-2" />
          </div>
          
          <p className="text-sm text-muted-foreground">Creating employee profiles...</p>
          
          <div className="pt-8">
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < Math.floor((importProgress / 100) * 10) ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm font-medium">
                {Math.floor((importProgress / 100) * selectedEmployees.length)}/10
              </span>
            </div>
          </div>
        </div>
      );

    case 'success':
      return (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          
          <div>
            <h2 className="text-xl font-medium mb-2">Perfect start!</h2>
            <p className="text-2xl font-bold">{selectedEmployees.length} employees imported</p>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Your trial team is complete.<br />
            Let's invite them to LXERA.
          </p>
          
          <div className="space-y-3">
            <Button onClick={() => navigate('/dashboard/onboarding/invite')}>
              Send invitations <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard/employees')}>
              View my team
            </Button>
          </div>
          
          <div className="pt-4">
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-blue-600" />
              ))}
              <span className="ml-2 text-sm font-medium">10/10</span>
            </div>
            <p className="text-xs text-muted-foreground">Trial limit reached</p>
          </div>
        </div>
      );

    case 'trial-full':
      return (
        <div className="text-center space-y-6">
          <h2 className="text-xl font-medium">Trial limit reached</h2>
          <p className="text-base text-muted-foreground">You've imported 10 employees</p>
          
          <Card className="overflow-hidden max-w-sm mx-auto">
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="font-medium">Ready to scale your team?</p>
                <Button className="w-full">
                  Upgrade to Pro <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Button variant="outline" onClick={() => navigate('/dashboard/onboarding/invite')}>
            Continue to invitations <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          
          <div className="pt-4">
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-blue-600" />
              ))}
              <span className="ml-2 text-sm font-medium">10/10</span>
            </div>
            <p className="text-xs text-muted-foreground">Trial full</p>
          </div>
        </div>
      );

    default:
      return null;
    }
  }
}