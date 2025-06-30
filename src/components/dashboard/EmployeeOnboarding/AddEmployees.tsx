
import React from 'react';

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
  importSessions, 
  onNextStep,
  isOpen,
  onClose,
  onComplete
}) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-2">Add Employees</h3>
      <p className="text-gray-600">Add employees functionality will be implemented here.</p>
    </div>
  );
};

export default AddEmployees;
