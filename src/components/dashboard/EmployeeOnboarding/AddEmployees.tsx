
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CSVImportWizard } from './CSVImportWizard';

interface AddEmployeesProps {
  onImportComplete?: () => void;
  importSessions?: any[];
  onNextStep?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  onComplete?: () => void;
}

export const AddEmployees: React.FC<AddEmployeesProps> = ({ 
  onImportComplete, 
  importSessions = [], 
  onNextStep,
  isOpen = false,
  onClose,
  onComplete
}) => {
  const handleImportComplete = () => {
    onImportComplete?.();
    onComplete?.();
    onClose?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Employees</DialogTitle>
        </DialogHeader>
        <CSVImportWizard 
          onImportComplete={handleImportComplete}
          importSessions={importSessions}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployees;
