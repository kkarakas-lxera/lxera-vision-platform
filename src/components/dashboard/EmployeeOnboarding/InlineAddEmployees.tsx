import React, { useState } from 'react';
import { Upload, FileText, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ProgressiveCSVImport } from './ProgressiveCSVImport';
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

  // Calculate session stats
  const totalEmployees = existingSessions.reduce((sum, session) => sum + (session.total_employees || 0), 0);
  const successfulImports = existingSessions.filter(s => s.status === 'completed').length;
  const latestSession = existingSessions[0];

  // If no sessions yet or showing import, show the progressive import
  if (showImportWizard || existingSessions.length === 0) {
    return (
      <ProgressiveCSVImport 
        onImportComplete={() => {
          setShowImportWizard(false);
          onSessionCreated();
        }}
        existingSessions={existingSessions}
      />
    );
  }

  // Otherwise show the stats and recent imports
  return (
    <div className="space-y-4">
      {/* Quick Stats */}
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
              <Badge variant="secondary">
                {latestSession?.session_metadata?.import_mode || 'manual'} mode
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Import Sessions */}
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
                      {new Date(session.created_at).toLocaleDateString()} • {session.session_metadata?.import_mode || 'manual'} mode
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

      {/* Import More Button */}
      <Button 
        onClick={() => setShowImportWizard(true)}
        className="w-full"
        size="lg"
      >
        <Upload className="h-4 w-4 mr-2" />
        Import More Employees
      </Button>
    </div>
  );
}