
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CompanySelector } from '@/components/admin/shared/CompanySelector';
import { EmployeeCourseAssignments } from '@/components/admin/CourseManagement/EmployeeCourseAssignments';
import { 
  AlertCircle
} from 'lucide-react';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';

const CoursesManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const companyIdFromUrl = searchParams.get('company');
  
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(companyIdFromUrl);

  useEffect(() => {
    if (selectedCompanyId) {
      // Update URL
      setSearchParams({ company: selectedCompanyId });
    }
  }, [selectedCompanyId]);

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Course Management</h1>
        <p className="text-gray-600">View employee course assignments and module progress</p>
      </div>

      {/* Company Selector */}
      <CompanySelector
        selectedCompanyId={selectedCompanyId}
        onCompanyChange={handleCompanyChange}
        showStats={true}
      />

      {!selectedCompanyId ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a company to view employee course assignments
          </AlertDescription>
        </Alert>
      ) : (
        <EmployeeCourseAssignments companyId={selectedCompanyId} />
      )}
    </div>
  );
};

export default CoursesManagement;
