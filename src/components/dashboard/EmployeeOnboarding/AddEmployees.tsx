
import React, { useState, useEffect } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Users, Download, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CSVImportWizard } from './CSVImportWizard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Define the interface to match what's used in the parent component
interface ImportSession {
  id: string;
  import_type: string;
  total_employees: number;
  processed: number;
  successful: number;
  failed: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

interface AddEmployeesProps {
  onImportComplete?: () => void;
  importSessions: ImportSession[];
  onNextStep?: () => void;
}

export function AddEmployees({ 
  onImportComplete, 
  importSessions, 
  onNextStep 
}: AddEmployeesProps) {
  const { userProfile } = useAuth();
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [positions, setPositions] = useState<Array<{ id: string; position_title: string; position_code: string }>>([]);
  const [loadingPositions, setLoadingPositions] = useState(false);

  // Fetch available positions
  useEffect(() => {
    const fetchPositions = async () => {
      if (!userProfile?.company_id) return;
      
      setLoadingPositions(true);
      try {
        const { data, error } = await supabase
          .from('st_company_positions')
          .select('id, position_title, position_code')
          .eq('company_id', userProfile.company_id)
          .order('position_title');
        
        if (error) throw error;
        setPositions(data || []);
      } catch (error) {
        console.error('Error fetching positions:', error);
      } finally {
        setLoadingPositions(false);
      }
    };

    fetchPositions();
  }, [userProfile?.company_id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const handleImportComplete = () => {
    setShowImportWizard(false);
    if (onImportComplete) onImportComplete();
  };

  const downloadTemplate = () => {
    const csvContent = `name,email,position_code,department,target_position_code
John Doe,john.doe@company.com,DEV-SR,Engineering,DEV-LEAD
Jane Smith,jane.smith@company.com,DESIGN-JR,Design,DESIGN-SR
Bob Johnson,bob.johnson@company.com,SALES-REP,Sales,SALES-MGR`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'employee_import_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Position Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Select Default Position
          </CardTitle>
          <CardDescription>
            Choose a position to assign to all imported employees. You can update individual positions later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedPosition} 
            onValueChange={setSelectedPosition}
            disabled={loadingPositions}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={loadingPositions ? "Loading positions..." : "Select a position"} />
            </SelectTrigger>
            <SelectContent>
              {positions.map((position) => (
                <SelectItem key={position.id} value={position.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span>{position.position_title}</span>
                    <Badge variant="outline" className="text-xs">
                      {position.position_code}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedPosition && (
            <p className="text-sm text-muted-foreground mt-2">
              All imported employees will be assigned to this position for skills analysis.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Import Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* CSV Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              CSV Import
            </CardTitle>
            <CardDescription>
              Upload a CSV file with employee information to bulk import team members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Required columns:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>name (required)</li>
                <li>email (required)</li>
                <li>position_code (required) - e.g., DEV-SR, DESIGN-JR</li>
                <li>department (optional)</li>
                <li>target_position_code (optional) - for career planning</li>
              </ul>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
              <Button
                onClick={() => setShowImportWizard(true)}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manual Entry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Individual Entry
            </CardTitle>
            <CardDescription>
              Add team members one by one with detailed information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                Manual employee entry form coming soon...
              </p>
              <p className="text-sm text-muted-foreground">
                Use CSV import for now to add multiple employees quickly
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Import Sessions */}
      {importSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Import Sessions</CardTitle>
            <CardDescription>
              Track the status of your recent employee imports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {importSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {session.import_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <Badge className={getStatusColor(session.status)}>
                          {getStatusIcon(session.status)}
                          <span className="ml-1 capitalize">{session.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {session.total_employees} employees • {session.successful} successful • {session.failed} failed
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {session.status === 'processing' && (
                    <div className="w-32">
                      <Progress 
                        value={(session.processed / session.total_employees) * 100} 
                        className="h-2" 
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {session.processed} / {session.total_employees}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Step CTA */}
      {importSessions.some(s => s.successful > 0) && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Great! You've successfully imported team members. 
              Ready to move to the next step and upload their CVs?
            </span>
            {onNextStep && (
              <Button size="sm" onClick={onNextStep}>
                Next: Upload CVs
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* CSV Import Wizard */}
      {showImportWizard && (
        <CSVImportWizard
          onImportComplete={handleImportComplete}
          importSessions={importSessions}
          defaultPositionId={selectedPosition}
        />
      )}
    </div>
  );
}
