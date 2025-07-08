import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Download, 
  Share2, 
  Calendar, 
  User, 
  CheckCircle,
  Trophy,
  Star,
  Filter,
  Search,
  X,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_type: 'completion' | 'achievement' | 'mastery';
  title: string;
  description?: string;
  issued_date: string;
  expires_at?: string;
  certificate_url?: string;
  score?: number;
  skills_earned?: string[];
  verification_code: string;
  course?: {
    title: string;
    description?: string;
    thumbnail_url?: string;
    instructor?: string;
    duration?: number;
  };
}

interface Achievement {
  id: string;
  user_id: string;
  type: 'streak' | 'completion' | 'skill' | 'special';
  title: string;
  description: string;
  icon: string;
  earned_date: string;
  points_value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export default function MobileCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [filteredAchievements, setFilteredAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'certificates' | 'achievements'>('certificates');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { supabase } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCertificatesAndAchievements();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'certificates') {
      filterCertificates();
    } else {
      filterAchievements();
    }
  }, [certificates, achievements, searchQuery, filterType, activeTab]);

  const fetchCertificatesAndAchievements = async () => {
    try {
      setLoading(true);
      
      // Fetch certificates
      const { data: certificateData, error: certError } = await supabase
        .from('certificates')
        .select(`
          *,
          course:courses(title, description, thumbnail_url, instructor, duration)
        `)
        .eq('user_id', user?.id)
        .order('issued_date', { ascending: false });

      if (certError) throw certError;
      setCertificates(certificateData || []);

      // Fetch achievements
      const { data: achievementData, error: achError } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user?.id)
        .order('earned_date', { ascending: false });

      if (achError) throw achError;
      setAchievements(achievementData || []);

    } catch (error) {
      console.error('Error fetching certificates and achievements:', error);
      toast.error('Failed to load certificates and achievements');
    } finally {
      setLoading(false);
    }
  };

  const filterCertificates = () => {
    let filtered = [...certificates];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(cert => 
        cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.course?.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(cert => cert.certificate_type === filterType);
    }

    setFilteredCertificates(filtered);
  };

  const filterAchievements = () => {
    let filtered = [...achievements];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(achievement => 
        achievement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        achievement.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(achievement => achievement.type === filterType);
    }

    setFilteredAchievements(filtered);
  };

  const downloadCertificate = async (certificateId: string) => {
    try {
      const certificate = certificates.find(c => c.id === certificateId);
      if (!certificate?.certificate_url) {
        toast.error('Certificate file not available');
        return;
      }

      // Download the certificate
      const response = await fetch(certificate.certificate_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${certificate.title.replace(/\s+/g, '_')}_Certificate.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Certificate downloaded');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    }
  };

  const shareCertificate = async (certificate: Certificate) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: certificate.title,
          text: `I've earned a certificate in ${certificate.title}!`,
          url: certificate.certificate_url || window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        const shareText = `I've earned a certificate in ${certificate.title}! Verification code: ${certificate.verification_code}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Certificate details copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing certificate:', error);
      toast.error('Failed to share certificate');
    }
  };

  const getCertificateTypeColor = (type: string) => {
    switch (type) {
      case 'completion': return 'bg-blue-100 text-blue-800';
      case 'achievement': return 'bg-green-100 text-green-800';
      case 'mastery': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mobile-certificates w-full max-w-md mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Achievements</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Trophy className="h-4 w-4" />
          <span>{certificates.length + achievements.length} earned</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted rounded-lg p-1">
        <button
          onClick={() => setActiveTab('certificates')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'certificates' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Certificates ({certificates.length})
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'achievements' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Achievements ({achievements.length})
        </button>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {activeTab === 'certificates' ? (
              <>
                <SelectItem value="completion">Completion</SelectItem>
                <SelectItem value="achievement">Achievement</SelectItem>
                <SelectItem value="mastery">Mastery</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="streak">Streak</SelectItem>
                <SelectItem value="completion">Completion</SelectItem>
                <SelectItem value="skill">Skill</SelectItem>
                <SelectItem value="special">Special</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {activeTab === 'certificates' ? (
          filteredCertificates.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery || filterType !== 'all' 
                  ? 'No certificates found matching your criteria'
                  : 'No certificates yet. Complete courses to earn certificates!'}
              </p>
            </div>
          ) : (
            filteredCertificates.map((certificate) => (
              <Card key={certificate.id} className="shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{certificate.title}</CardTitle>
                      {certificate.course && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {certificate.course.title}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getCertificateTypeColor(certificate.certificate_type)}>
                          {certificate.certificate_type}
                        </Badge>
                        {certificate.score && (
                          <Badge variant="outline">
                            <Star className="h-3 w-3 mr-1" />
                            {certificate.score}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Award className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Issued: {format(new Date(certificate.issued_date), 'MMM d, yyyy')}</span>
                    </div>
                    
                    {certificate.expires_at && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Expires: {format(new Date(certificate.expires_at), 'MMM d, yyyy')}</span>
                      </div>
                    )}

                    {certificate.skills_earned && certificate.skills_earned.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Skills Earned:</p>
                        <div className="flex flex-wrap gap-1">
                          {certificate.skills_earned.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Verification: {certificate.verification_code}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => downloadCertificate(certificate.id)}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => shareCertificate(certificate)}
                        className="flex-1"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )
        ) : (
          filteredAchievements.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery || filterType !== 'all' 
                  ? 'No achievements found matching your criteria'
                  : 'No achievements yet. Keep learning to unlock achievements!'}
              </p>
            </div>
          ) : (
            filteredAchievements.map((achievement) => (
              <Card key={achievement.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getRarityColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                        <Badge variant="outline">
                          <Trophy className="h-3 w-3 mr-1" />
                          {achievement.points_value} pts
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Earned: {format(new Date(achievement.earned_date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )
        )}
      </div>
    </div>
  );
}