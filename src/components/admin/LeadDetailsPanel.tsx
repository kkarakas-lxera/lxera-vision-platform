import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Calendar, Clock, FileText, MessageSquare, User, Briefcase, Users, Target, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

interface Lead {
  id: string;
  created_at: string;
  name: string;
  email: string;
  company: string;
  company_size: string;
  source: string;
  ip_address: string | null;
  location_data: any;
  page_visits: any;
  submitted_at: string;
  utm_params: any;
  user_agent: string | null;
  engagement_score: number;
  status: string;
  notes: string | null;
  assigned_to: string | null;
  last_contact: string | null;
  deal_value: number | null;
  conversion_probability: number | null;
  industry: string | null;
  job_title: string | null;
  phone: string | null;
  linkedin_url: string | null;
  referrer_url: string | null;
  first_seen_at: string | null;
  session_count: number;
  total_time_spent: number;
  device_type: string | null;
  browser: string | null;
  lead_source_details: any;
}

interface LeadDetailsPanelProps {
  selectedLead: Lead | null;
  onClose: () => void;
}

export function LeadDetailsPanel({ selectedLead, onClose }: LeadDetailsPanelProps) {
  if (!selectedLead) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeSpent = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Sheet open={!!selectedLead} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold">Lead Details</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <SheetDescription>
            View and manage lead information
          </SheetDescription>
        </SheetHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedLead.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedLead.name}</h3>
                  <p className="text-gray-600">{selectedLead.email}</p>
                </div>
                <Badge className={getStatusColor(selectedLead.status)}>
                  {selectedLead.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{selectedLead.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{selectedLead.company_size} employees</span>
                </div>
                {selectedLead.job_title && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{selectedLead.job_title}</span>
                  </div>
                )}
                {selectedLead.industry && (
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{selectedLead.industry}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="bg-white border rounded-lg p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Engagement Metrics
              </h4>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Engagement Score</p>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedLead.engagement_score}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${selectedLead.engagement_score}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Session Count</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedLead.session_count}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Time Spent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatTimeSpent(selectedLead.total_time_spent || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Page Views</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedLead.page_visits?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white border rounded-lg p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-600" />
                Timeline
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">First Seen</span>
                  <span className="font-medium">
                    {selectedLead.first_seen_at 
                      ? format(new Date(selectedLead.first_seen_at), 'MMM d, yyyy h:mm a')
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Form Submitted</span>
                  <span className="font-medium">
                    {format(new Date(selectedLead.submitted_at), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                {selectedLead.last_contact && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Contact</span>
                    <span className="font-medium">
                      {format(new Date(selectedLead.last_contact), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Source Information */}
            <div className="bg-white border rounded-lg p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                Source Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Lead Source</span>
                  <Badge variant="outline">{selectedLead.source}</Badge>
                </div>
                {selectedLead.referrer_url && (
                  <div className="text-sm">
                    <span className="text-gray-600 block mb-1">Referrer</span>
                    <a 
                      href={selectedLead.referrer_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {selectedLead.referrer_url}
                    </a>
                  </div>
                )}
                {selectedLead.utm_params && Object.keys(selectedLead.utm_params).length > 0 && (
                  <div className="text-sm">
                    <span className="text-gray-600 block mb-2">UTM Parameters</span>
                    <div className="bg-gray-50 rounded p-3 space-y-1">
                      {Object.entries(selectedLead.utm_params).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600">{key}:</span>
                          <span className="font-medium">{value as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Technical Details */}
            <div className="bg-white border rounded-lg p-6">
              <h4 className="font-semibold mb-4">Technical Details</h4>
              <div className="space-y-2 text-sm">
                {selectedLead.device_type && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Device</span>
                    <span>{selectedLead.device_type}</span>
                  </div>
                )}
                {selectedLead.browser && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Browser</span>
                    <span>{selectedLead.browser}</span>
                  </div>
                )}
                {selectedLead.ip_address && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">IP Address</span>
                    <span className="font-mono">{selectedLead.ip_address}</span>
                  </div>
                )}
                {selectedLead.location_data && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location</span>
                    <span>
                      {selectedLead.location_data.city}, {selectedLead.location_data.country}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Page Visits */}
            {selectedLead.page_visits && selectedLead.page_visits.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <h4 className="font-semibold mb-4">Page Visits</h4>
                <div className="space-y-2">
                  {selectedLead.page_visits.map((visit: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{visit.page_title || visit.url}</p>
                        <p className="text-gray-500 text-xs">{visit.url}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600">{visit.visits} visits</p>
                        <p className="text-gray-500 text-xs">
                          {formatTimeSpent(visit.time_spent || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedLead.notes && (
              <div className="bg-white border rounded-lg p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-gray-600" />
                  Notes
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedLead.notes}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}