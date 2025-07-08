import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Download, 
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  Share2,
  Trophy,
  GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';

interface Certificate {
  id: string;
  course_id: string;
  employee_id: string;
  issued_at: string;
  certificate_url?: string;
  course_name: string;
  completion_percentage: number;
  time_spent: number;
}

interface CertificateStats {
  totalCertificates: number;
  thisMonth: number;
  totalHours: number;
}

export default function Certificates() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<CertificateStats>({
    totalCertificates: 0,
    thisMonth: 0,
    totalHours: 0,
  });

  useEffect(() => {
    if (userProfile) {
      fetchCertificates();
    }
  }, [userProfile]);

  const fetchCertificates = async () => {
    try {
      // Get employee record linked to this user
      const { data: employees } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', userProfile?.id);
      
      const employee = employees?.[0];
      if (!employee) {
        toast.error('Employee profile not found');
        return;
      }

      // Fetch completed course assignments (certificates)
      const { data: completedAssignments, error } = await supabase
        .from('course_assignments')
        .select(`
          id,
          course_id,
          employee_id,
          progress_percentage,
          completed_at,
          time_spent
        `)
        .eq('employee_id', employee.id)
        .eq('status', 'completed')
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      let certificateData: Certificate[] = [];
      
      if (completedAssignments && completedAssignments.length > 0) {
        const certificatesWithContent = await Promise.all(
          completedAssignments.map(async (assignment) => {
            const { data: content } = await supabase
              .from('cm_module_content')
              .select('module_name')
              .eq('content_id', assignment.course_id)
              .single();
            
            return {
              id: assignment.id,
              course_id: assignment.course_id,
              employee_id: assignment.employee_id,
              issued_at: assignment.completed_at,
              course_name: content?.module_name || 'Unknown Course',
              completion_percentage: assignment.progress_percentage || 100,
              time_spent: assignment.time_spent || 0,
            };
          })
        );
        
        certificateData = certificatesWithContent;
      }

      setCertificates(certificateData);

      // Calculate statistics
      const totalCertificates = certificateData.length;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonth = certificateData.filter(cert => {
        const certDate = new Date(cert.issued_at);
        return certDate.getMonth() === currentMonth && certDate.getFullYear() === currentYear;
      }).length;
      const totalHours = certificateData.reduce((sum, cert) => sum + cert.time_spent, 0);

      setStats({
        totalCertificates,
        thisMonth,
        totalHours,
      });

    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${Math.round(remainingMinutes)}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDownloadCertificate = (certificate: Certificate) => {
    // This is a placeholder - in a real implementation, this would generate or download the certificate
    toast.info('Certificate download functionality will be implemented soon');
  };

  const handleShareCertificate = (certificate: Certificate) => {
    // This is a placeholder - in a real implementation, this would share the certificate
    toast.info('Certificate sharing functionality will be implemented soon');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Certificates</h1>
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Your achievements</span>
        </div>
      </div>

      {/* Certificate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCertificates}</div>
            <p className="text-xs text-muted-foreground">Courses completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">New certificates earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.totalHours)}</div>
            <p className="text-xs text-muted-foreground">Total time invested</p>
          </CardContent>
        </Card>
      </div>

      {/* Certificates List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Earned Certificates</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((certificate) => (
            <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        <h3 className="font-semibold text-foreground">{certificate.course_name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Completed
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Earned on {formatDate(certificate.issued_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Study time: {formatTime(certificate.time_spent)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Completion: {certificate.completion_percentage}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleDownloadCertificate(certificate)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleShareCertificate(certificate)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {certificates.length === 0 && (
          <Card className="p-8 text-center">
            <div className="space-y-4">
              <Award className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-semibold text-foreground">No certificates yet</h3>
                <p className="text-sm text-muted-foreground">
                  Complete your courses to earn certificates and showcase your achievements.
                </p>
              </div>
              <Button variant="outline" onClick={() => window.location.href = '/learner/courses'}>
                View Available Courses
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}