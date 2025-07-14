import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Calendar, Clock, FileText, User, Briefcase, Users, Target, AlertCircle, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

interface UnifiedLead {
  id: string;
  lead_type: 'demo' | 'early_access' | 'contact_sales';
  email: string;
  name: string | null;
  company: string | null;
  company_size: string | null;
  source: string | null;
  step_completed: number;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
  updated_at: string | null;
  role?: string;
}

interface LeadDetailsPanelProps {
  selectedLead: UnifiedLead | null;
  onClose: () => void;
}

export function LeadDetailsPanel({ selectedLead, onClose }: LeadDetailsPanelProps) {
  if (!selectedLead) return null;

  const getLeadStatus = (lead: UnifiedLead): string => {
    if (lead.lead_type === 'demo') {
      return lead.step_completed === 2 ? 'completed' : 'in_progress';
    } else if (lead.lead_type === 'early_access') {
      switch (lead.step_completed) {
        case 1: return 'email_captured';
        case 2: return 'profile_completed';
        case 3: return 'verified';
        default: return 'pending';
      }
    } else if (lead.lead_type === 'contact_sales') {
      switch (lead.step_completed) {
        case 1: return 'new';
        case 2: return 'contacted';
        case 3: return 'qualified';
        case 4: return 'closed';
        default: return 'new';
      }
    }
    return 'unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
      case 'closed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
      case 'profile_completed':
      case 'qualified':
        return 'bg-blue-100 text-blue-800';
      case 'email_captured':
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
      case 'new':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressDisplay = (lead: UnifiedLead): string => {
    if (lead.lead_type === 'demo') {
      return `Step ${lead.step_completed} of 2`;
    } else if (lead.lead_type === 'early_access') {
      return `Step ${lead.step_completed} of 3`;
    } else if (lead.lead_type === 'contact_sales') {
      return `Step ${lead.step_completed} of 4`;
    }
    return 'Unknown';
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
                <Badge className={getStatusColor(getLeadStatus(selectedLead))}>
                  {getLeadStatus(selectedLead)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedLead.company && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{selectedLead.company}</span>
                  </div>
                )}
                {selectedLead.company_size && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{selectedLead.company_size} employees</span>
                  </div>
                )}
                {selectedLead.role && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{selectedLead.role}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">
                    {selectedLead.lead_type === 'demo' ? 'Demo Request' : 
                     selectedLead.lead_type === 'early_access' ? 'Early Access' : 
                     'Contact Sales'}
                  </span>
                </div>
              </div>
            </div>

            {/* Lead Progress */}
            <div className="bg-white border rounded-lg p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Lead Progress
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-600">Progress Status</p>
                    <span className="font-medium">{getProgressDisplay(selectedLead)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${(selectedLead.step_completed / 
                          (selectedLead.lead_type === 'demo' ? 2 : 
                           selectedLead.lead_type === 'early_access' ? 3 : 4)) * 100}%` 
                      }}
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-gray-600 mb-1">Lead Type</p>
                  <Badge variant="outline">
                    {selectedLead.lead_type === 'demo' ? 'Demo Request' : 
                     selectedLead.lead_type === 'early_access' ? 'Early Access' : 
                     'Contact Sales Inquiry'}
                  </Badge>
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
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">
                    {format(new Date(selectedLead.created_at), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                {selectedLead.updated_at && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium">
                      {format(new Date(selectedLead.updated_at), 'MMM d, yyyy h:mm a')}
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
                {selectedLead.source && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Lead Source</span>
                    <Badge variant="outline">{selectedLead.source}</Badge>
                  </div>
                )}
                {(selectedLead.utm_source || selectedLead.utm_medium || selectedLead.utm_campaign) && (
                  <div className="text-sm">
                    <span className="text-gray-600 block mb-2">UTM Parameters</span>
                    <div className="bg-gray-50 rounded p-3 space-y-1">
                      {selectedLead.utm_source && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Source:</span>
                          <span className="font-medium">{selectedLead.utm_source}</span>
                        </div>
                      )}
                      {selectedLead.utm_medium && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Medium:</span>
                          <span className="font-medium">{selectedLead.utm_medium}</span>
                        </div>
                      )}
                      {selectedLead.utm_campaign && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Campaign:</span>
                          <span className="font-medium">{selectedLead.utm_campaign}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white border rounded-lg p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-gray-600" />
                Contact Information
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedLead.email}</p>
                </div>
                {selectedLead.name && (
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium">{selectedLead.name}</p>
                  </div>
                )}
                {selectedLead.company && (
                  <div>
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="font-medium">{selectedLead.company}</p>
                  </div>
                )}
                {selectedLead.company_size && (
                  <div>
                    <p className="text-sm text-gray-600">Company Size</p>
                    <p className="font-medium">{selectedLead.company_size} employees</p>
                  </div>
                )}
                {selectedLead.role && (
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="font-medium">{selectedLead.role}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white border rounded-lg p-6">
              <h4 className="font-semibold mb-4">Quick Actions</h4>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(`mailto:${selectedLead.email}`, '_blank')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                {(selectedLead.lead_type === 'demo' || selectedLead.lead_type === 'contact_sales') && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      // TODO: Implement demo scheduling
                      console.log('Schedule demo for:', selectedLead.email);
                    }}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Demo
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}