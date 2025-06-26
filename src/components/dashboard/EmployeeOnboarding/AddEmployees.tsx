
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
    const csvContent = `name,email,department,current_position
John Doe,john.doe@company.com,Engineering,Senior Developer
Jane Smith,jane.smith@company.com,Design,UX Designer
Bob Johnson,bob.johnson@company.com,Sales,Sales Representative`;
    
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
            Step 1: Select Target Position
          </CardTitle>
          <CardDescription>
            Choose the position you're hiring for. This will be used to analyze skill gaps for all imported employees.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          
          {!selectedPosition && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please select a position first. This ensures accurate skills gap analysis for your team.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* CSV Import - Only show after position is selected */}
      {selectedPosition && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Step 2: Import Employee Data
            </CardTitle>
            <CardDescription>
              Upload a CSV file with employee information to bulk import team members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">CSV Format Requirements:</p>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>• name (required)</div>
                <div>• email (required)</div>
                <div>• department (optional)</div>
                <div>• current_position (optional)</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
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
                Import CSV File
              </Button>
            </div>

            {importSessions.some(s => s.successful > 0) && (
              <Alert className="mt-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    Successfully imported {importSessions[0].successful} employees!
                  </span>
                  {onNextStep && (
                    <Button size="sm" onClick={onNextStep} variant="default">
                      Next: Upload CVs
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* CSV Import Wizard Modal */}
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
