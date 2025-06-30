
import React from 'react';

interface BulkCVUploadProps {
  onUploadComplete?: () => Promise<void>;
}

export const BulkCVUpload: React.FC<BulkCVUploadProps> = ({ onUploadComplete }) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-2">Bulk CV Upload</h3>
      <p className="text-gray-600">Bulk CV upload functionality will be implemented here.</p>
    </div>
  );
};

export default BulkCVUpload;
