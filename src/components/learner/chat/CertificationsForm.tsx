import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Certification {
  name: string;
  issuer?: string;
  year?: string;
}

interface CertificationsFormProps {
  initialData?: Certification[] | string[];
  onComplete: (data: Certification[]) => void;
}

export default function CertificationsForm({ initialData = [], onComplete }: CertificationsFormProps) {
  // Convert string array to object array if needed
  const normalizeData = (data: any[]): Certification[] => {
    if (!data || data.length === 0) return [];
    
    // If it's already in the correct format
    if (typeof data[0] === 'object' && 'name' in data[0]) {
      return data;
    }
    
    // If it's a string array (from CV extraction)
    if (typeof data[0] === 'string') {
      return data.map(cert => ({ name: cert }));
    }
    
    return [];
  };

  const [certifications, setCertifications] = useState<Certification[]>(() => 
    normalizeData(initialData as any[])
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (certifications.length > 0 && certifications.some(cert => cert.name)) {
        onComplete(certifications);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [certifications, onComplete]);

  const addCertification = () => {
    setCertifications([...certifications, { name: '' }]);
  };

  const updateCertification = (index: number, field: keyof Certification, value: string) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="h-5 w-5" />
          Certifications
          {initialData.length > 0 && (
            <span className="text-sm font-normal text-blue-600 ml-2">
              AI-filled from CV
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {certifications.length === 0 ? (
          <div className="text-center py-8">
            <Award className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500 mb-3">No certifications added yet</p>
            <Button
              size="sm"
              variant="outline"
              onClick={addCertification}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Certification
            </Button>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {certifications.map((cert, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-3 border rounded-md bg-white space-y-3"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Certification Name</label>
                        <Input
                          placeholder="e.g., AWS Certified Solutions Architect"
                          value={cert.name}
                          onChange={(e) => updateCertification(index, 'name', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Issuing Organization</label>
                        <Input
                          placeholder="e.g., Amazon Web Services"
                          value={cert.issuer || ''}
                          onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Year Obtained</label>
                        <Input
                          placeholder="e.g., 2023"
                          value={cert.year || ''}
                          onChange={(e) => updateCertification(index, 'year', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCertification(index)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {certifications.length < 10 && (
              <Button
                size="sm"
                variant="outline"
                className="w-full h-9 text-xs"
                onClick={addCertification}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Another Certification
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}