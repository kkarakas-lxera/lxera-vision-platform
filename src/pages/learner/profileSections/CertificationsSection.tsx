import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Plus, Trash2, Award, Calendar, Link } from 'lucide-react';

interface Certification {
  id?: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

interface CertificationsSectionProps {
  data: Certification[] | any;
  onSave: (data: any, isComplete: boolean) => void;
  saving: boolean;
}

export default function CertificationsSection({ data, onSave, saving }: CertificationsSectionProps) {
  const [certifications, setCertifications] = useState<Certification[]>(
    Array.isArray(data) ? data : []
  );
  const [showForm, setShowForm] = useState(certifications.length === 0);
  const [currentCert, setCurrentCert] = useState<Certification>({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: ''
  });

  const handleAddCertification = () => {
    if (currentCert.name && currentCert.issuer && currentCert.issueDate) {
      setCertifications([...certifications, { ...currentCert, id: Date.now().toString() }]);
      setCurrentCert({
        name: '',
        issuer: '',
        issueDate: '',
        expiryDate: '',
        credentialId: '',
        credentialUrl: ''
      });
      setShowForm(false);
    }
  };

  const handleRemoveCertification = (id: string) => {
    setCertifications(certifications.filter(cert => cert.id !== id));
  };

  const handleSave = () => {
    onSave(certifications, true); // Always complete if they save
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Add professional certifications to showcase your expertise
      </p>

      {/* Existing certifications */}
      {certifications.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Your Certifications</h3>
          {certifications.map((cert) => (
            <Card key={cert.id} className="p-4">
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-medium">{cert.name}</h4>
                      <p className="text-sm text-gray-600">{cert.issuer}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Issued: {new Date(cert.issueDate).toLocaleDateString()}
                        </span>
                        {cert.expiryDate && (
                          <span>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                        )}
                      </div>
                      {cert.credentialUrl && (
                        <a 
                          href={cert.credentialUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-1"
                        >
                          <Link className="h-3 w-3" />
                          View Credential
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCertification(cert.id!)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add new certification form */}
      {showForm ? (
        <Card className="p-4">
          <h3 className="font-medium mb-4">Add Certification</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="certName">Certification Name *</Label>
              <Input
                id="certName"
                value={currentCert.name}
                onChange={(e) => setCurrentCert({ ...currentCert, name: e.target.value })}
                placeholder="AWS Certified Solutions Architect"
              />
            </div>

            <div>
              <Label htmlFor="issuer">Issuing Organization *</Label>
              <Input
                id="issuer"
                value={currentCert.issuer}
                onChange={(e) => setCurrentCert({ ...currentCert, issuer: e.target.value })}
                placeholder="Amazon Web Services"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issueDate">Issue Date *</Label>
                <Input
                  id="issueDate"
                  type="month"
                  value={currentCert.issueDate}
                  onChange={(e) => setCurrentCert({ ...currentCert, issueDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="month"
                  value={currentCert.expiryDate}
                  onChange={(e) => setCurrentCert({ ...currentCert, expiryDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="credentialId">Credential ID</Label>
              <Input
                id="credentialId"
                value={currentCert.credentialId}
                onChange={(e) => setCurrentCert({ ...currentCert, credentialId: e.target.value })}
                placeholder="Optional - Certificate number"
              />
            </div>

            <div>
              <Label htmlFor="credentialUrl">Credential URL</Label>
              <Input
                id="credentialUrl"
                type="url"
                value={currentCert.credentialUrl}
                onChange={(e) => setCurrentCert({ ...currentCert, credentialUrl: e.target.value })}
                placeholder="Optional - Link to verify certification"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddCertification}>
                Add Certification
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button
          variant="outline"
          onClick={() => setShowForm(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Certification
        </Button>
      )}

      <div className="flex justify-end gap-2">
        {certifications.length === 0 && (
          <Button 
            variant="outline" 
            onClick={() => onSave([], true)}
          >
            Skip This Section
          </Button>
        )}
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save & Continue
        </Button>
      </div>
    </div>
  );
}