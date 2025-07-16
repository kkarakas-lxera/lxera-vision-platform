import React, { useState } from 'react';
import { Upload, FileText, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CSVImportWizard } from './CSVImportWizard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InlineAddEmployeesProps {
  onSessionCreated: () => void;
  existingSessions?: any[];
}

export function InlineAddEmployees({ onSessionCreated, existingSessions = [] }: InlineAddEmployeesProps) {
  const { userProfile } = useAuth();
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [positions, setPositions] = useState<any[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(true);

  React.useEffect(() => {
    fetchPositions();
  }, [userProfile?.company_id]);

  const fetchPositions = async () => {
    if (!userProfile?.company_id) return;
    
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
      toast.error('Failed to load positions');
    } finally {
      setLoadingPositions(false);
    }
  };

  // Calculate session stats
  const totalEmployees = existingSessions.reduce((sum, session) => sum + (session.total_employees || 0), 0);
  const successfulImports = existingSessions.filter(s => s.status === 'completed').length;

  if (showImportWizard) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Import Employee Data</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowImportWizard(false)}
          >
            Cancel
          </Button>
        </div>
        <CSVImportWizard 
          onImportComplete={() => {
            setShowImportWizard(false);
            onSessionCreated();
            toast.success('Employees imported successfully!');
          }}
          importSessions={existingSessions}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      {existingSessions.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{totalEmployees}</p>
                  <p className="text-xs text-muted-foreground">Total Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{existingSessions.length}</p>
                  <p className="text-xs text-muted-foreground">Import Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{successfulImports}</p>
                  <p className="text-xs text-muted-foreground">Successful</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{positions.length} Positions</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Import Instructions */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="space-y-2">
          <p className="font-medium">Import your team members via CSV file</p>
          <ul className="text-sm space-y-1 ml-4">
            <li>• CSV must include: Full Name, Email, Position (optional)</li>
            <li>• Select a default position for employees without one</li>
            <li>• Duplicate emails will be skipped automatically</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Recent Import Sessions */}
      {existingSessions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent Imports</h4>
          {existingSessions.slice(0, 3).map((session) => (
            <Card key={session.id}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {session.total_employees} employees
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                    {session.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Import Button */}
      <Button 
        onClick={() => setShowImportWizard(true)}
        className="w-full"
        size="lg"
      >
        <Upload className="h-4 w-4 mr-2" />
        Import Employees from CSV
      </Button>
    </div>
  );
}