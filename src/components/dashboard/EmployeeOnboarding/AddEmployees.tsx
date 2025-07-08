
import React from 'react';
import { ResponsiveModal } from '@/components/mobile/modals/ResponsiveModal';
import { CSVImportWizard } from './CSVImportWizard';
import { EmployeeImportSession } from '@/types/database';

interface AddEmployeesProps {
  onImportComplete?: () => void;
  importSessions?: EmployeeImportSession[];
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
    <ResponsiveModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose?.()}
      title="Add Employees"
      mobileMode="fullscreen"
      className="max-w-4xl"
    >
      <CSVImportWizard 
        onImportComplete={handleImportComplete}
        importSessions={importSessions}
      />
    </ResponsiveModal>
  );
};

export default AddEmployees;
