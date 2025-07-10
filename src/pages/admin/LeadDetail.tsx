import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mail, Building2, Calendar, MapPin, Users, Globe, Tag, Clock, User, Phone, ExternalLink, Target, Shield, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

interface LeadDetail {
  id: string;
  type: 'demo' | 'early_access';
  email: string;
  name: string | null;
  company: string | null;
  role: string | null;
  use_case: string | null;
  waitlist_position: number | null;
  company_size: string | null;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
  progress_step: number;
  calendly_scheduled: boolean;
  scheduled_at: string | null;
  completed_at: string | null;
}

const LeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchLeadDetail(id);
    }
  }, [id]);

  const fetchLeadDetail = async (leadId: string) => {
    try {
      const { data, error } = await supabase
        .from('unified_leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (error) throw error;
      setLead(data);
    } catch (error) {
      console.error('Error fetching lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch lead details',
        variant: 'destructive'
      });
      navigate('/admin/leads');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'captured':
      case 'email_captured':
        return 'secondary';
      case 'scheduled':
      case 'waitlisted':
        return 'default';
      case 'completed':
      case 'profile_completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getProgressDisplay = (lead: LeadDetail) => {
    if (lead.type === 'demo') {
      return `Step ${lead.progress_step}/2`;
    } else {
      const steps = ['Email', 'Verified', 'Profile', 'Waitlisted'];
      return steps[lead.progress_step - 1] || 'Email';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-business-black mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Lead not found</p>
        <Button onClick={() => navigate('/admin/leads')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leads
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-gray-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/admin/leads')}
              className="p-2 hover:bg-white/80"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            {/* Profile Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-future-green to-business-black rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {(lead.name || lead.email).charAt(0).toUpperCase()}
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-business-black">
                  {lead.name || 'Unnamed Lead'}
                </h1>
                <Badge variant={getStatusBadgeVariant(lead.status)} className="text-sm">
                  {lead.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{lead.email}</span>
                </div>
                {lead.company && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>{lead.company}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-6">
                <Badge variant="outline" className="px-3 py-1">
                  <Activity className="w-3 h-3 mr-1" />
                  {lead.type === 'demo' ? 'Demo Request' : 'Early Access'}
                </Badge>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Joined {new Date(lead.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Target className="w-4 h-4" />
                  <span>{getProgressDisplay(lead)}</span>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`mailto:${lead.email}`, '_blank')}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              
              {lead.type === 'demo' && (
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-future-green text-business-black hover:bg-future-green/90"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Demo
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{lead.email}</p>
                    </div>
                  </div>
                  
                  {lead.name && (
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="font-medium">{lead.name}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {lead.company && (
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Company</p>
                        <p className="font-medium">{lead.company}</p>
                      </div>
                    </div>
                  )}

                  {lead.role && (
                    <div className="flex items-center gap-3">
                      <Tag className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Role</p>
                        <p className="font-medium">{lead.role}</p>
                      </div>
                    </div>
                  )}

                  {lead.company_size && (
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Company Size</p>
                        <p className="font-medium">{lead.company_size} employees</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lead Details */}
          {(lead.use_case || lead.waitlist_position) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Lead Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lead.use_case && (
                  <div>
                    <p className="text-sm text-gray-600">Use Case</p>
                    <p className="font-medium">{lead.use_case}</p>
                  </div>
                )}

                {lead.waitlist_position && (
                  <div>
                    <p className="text-sm text-gray-600">Waitlist Position</p>
                    <p className="font-medium">#{lead.waitlist_position}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Lead Created</p>
                    <p className="text-sm text-gray-600">
                      {new Date(lead.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {lead.updated_at && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Last Updated</p>
                      <p className="text-sm text-gray-600">
                        {new Date(lead.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {lead.scheduled_at && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Demo Scheduled</p>
                      <p className="text-sm text-gray-600">
                        {new Date(lead.scheduled_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {lead.completed_at && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <div>
                      <p className="font-medium">Completed</p>
                      <p className="text-sm text-gray-600">
                        {new Date(lead.completed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Current Status</p>
                <Badge variant={getStatusBadgeVariant(lead.status)} className="mt-1">
                  {lead.status}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="font-medium">{getProgressDisplay(lead)}</p>
              </div>

              {lead.calendly_scheduled && (
                <div>
                  <p className="text-sm text-gray-600">Demo Status</p>
                  <Badge variant="default" className="mt-1">
                    Scheduled
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Source Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Source Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lead.source && (
                <div>
                  <p className="text-sm text-gray-600">Source</p>
                  <p className="font-medium">{lead.source}</p>
                </div>
              )}

              {lead.utm_source && (
                <div>
                  <p className="text-sm text-gray-600">UTM Source</p>
                  <p className="font-medium">{lead.utm_source}</p>
                </div>
              )}

              {lead.utm_medium && (
                <div>
                  <p className="text-sm text-gray-600">UTM Medium</p>
                  <p className="font-medium">{lead.utm_medium}</p>
                </div>
              )}

              {lead.utm_campaign && (
                <div>
                  <p className="text-sm text-gray-600">UTM Campaign</p>
                  <p className="font-medium">{lead.utm_campaign}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.open(`mailto:${lead.email}`, '_blank')}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>

              {lead.type === 'demo' && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    toast({
                      title: 'Demo Link',
                      description: 'Demo scheduling functionality coming soon',
                    });
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Demo
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;