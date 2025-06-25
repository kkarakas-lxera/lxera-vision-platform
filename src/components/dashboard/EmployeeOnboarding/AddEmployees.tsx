import React, { useState } from 'react';
import { Upload, Download, Users, Plus, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CSVImportWizard } from './CSVImportWizard';

interface ImportSession {
  id: string;
  import_type: string;
  total_employees: number;
  processed: number;
  successful: number;
  failed: number;
  status: string;
  created_at: string;
}

interface AddEmployeesProps {
  onImportComplete: () => void;
  importSessions: ImportSession[];
  onNextStep?: () => void;
}

export function AddEmployees({ onImportComplete, importSessions, onNextStep }: AddEmployeesProps) {
  const [selectedMethod, setSelectedMethod] = useState<'bulk' | 'individual'>('bulk');

  const downloadSampleCSV = () => {
    const sampleData = [
      ['name', 'email', 'position_code', 'department', 'target_position_code'],
      ['John Smith', 'john.smith@company.com', 'DEV-001', 'Engineering', 'DEV-002'],
      ['Jane Doe', 'jane.doe@company.com', 'PM-001', 'Operations', ''],
      ['Mike Johnson', 'mike.johnson@company.com', 'DEV-001', 'Engineering', 'DEV-003']
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

  return (
    <div className="space-y-6">
      {/* Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Add New Team Members
          </CardTitle>
          <CardDescription>
            Choose how you'd like to add your team members to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant={selectedMethod === 'bulk' ? 'default' : 'outline'}
              size="lg"
              onClick={() => setSelectedMethod('bulk')}
              className="h-auto p-6 flex flex-col items-center gap-3"
            >
              <div className="bg-primary/10 p-3 rounded-lg">
                <Upload className="h-6 w-6" />
              </div>
              <div className="text-center">
                <div className="font-semibold">Bulk Import (Recommended)</div>
                <div className="text-sm opacity-70">Upload CSV file with multiple employees</div>
              </div>
            </Button>

            <Button
              variant={selectedMethod === 'individual' ? 'default' : 'outline'}
              size="lg"
              onClick={() => setSelectedMethod('individual')}
              className="h-auto p-6 flex flex-col items-center gap-3"
            >
              <div className="bg-primary/10 p-3 rounded-lg">
                <Plus className="h-6 w-6" />
              </div>
              <div className="text-center">
                <div className="font-semibold">Add Individually</div>
                <div className="text-sm opacity-70">Enter employee details one by one</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content based on selection */}
      {selectedMethod === 'bulk' && (
        <div className="space-y-4">
          {/* Quick Start Guide */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-800">Quick Start Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <FileText className="h-4 w-4" />
                  Download our template to get started quickly
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadSampleCSV}
                  className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>

          <CSVImportWizard
            onImportComplete={() => {
              onImportComplete();
              // Auto-advance to next step after successful import
              if (onNextStep) {
                setTimeout(() => {
                  onNextStep();
                }, 2000);
              }
            }}
            importSessions={importSessions}
          />
        </div>
      )}

      {selectedMethod === 'individual' && (
        <Card>
          <CardHeader>
            <CardTitle>Add Individual Employee</CardTitle>
            <CardDescription>
              Enter employee details manually
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                Individual employee entry form coming soon...
              </div>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                For now, please use the bulk import option with CSV files.
                You can create a CSV with just one employee if needed.
              </p>
              <Button
                variant="outline"
                onClick={() => setSelectedMethod('bulk')}
                className="mt-4"
              >
                Switch to Bulk Import
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}