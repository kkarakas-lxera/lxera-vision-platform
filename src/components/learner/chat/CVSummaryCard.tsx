import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Award, User, CheckCircle, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CVSummaryCardProps {
  extractedData: {
    personal?: {
      name?: string;
      email?: string;
      phone?: string;
    };
    experience?: Array<{
      title: string;
      company: string;
      duration?: string;
      description?: string;
    }>;
    education?: Array<{
      degree: string;
      institution: string;
      year?: string;
    }>;
    skills?: string[];
  };
  onConfirm: () => void;
  onEdit: (section: string) => void;
}

export default function CVSummaryCard({ extractedData, onConfirm, onEdit }: CVSummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-green-600" />
        Here's what I found in your CV:
      </h3>

      <div className="space-y-4">
        {/* Personal Info */}
        {extractedData.personal && (
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-600" />
                <h4 className="font-medium text-gray-900">Personal Information</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit('personal')}
                className="text-xs"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              {extractedData.personal.name && <p>Name: {extractedData.personal.name}</p>}
              {extractedData.personal.email && <p>Email: {extractedData.personal.email}</p>}
              {extractedData.personal.phone && <p>Phone: {extractedData.personal.phone}</p>}
            </div>
          </div>
        )}

        {/* Experience */}
        {extractedData.experience && extractedData.experience.length > 0 && (
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-gray-600" />
                <h4 className="font-medium text-gray-900">Work Experience</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit('experience')}
                className="text-xs"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              {extractedData.experience.slice(0, 2).map((exp, idx) => (
                <div key={idx}>
                  <p className="font-medium">{exp.title} at {exp.company}</p>
                  {exp.duration && <p className="text-xs text-gray-500">{exp.duration}</p>}
                </div>
              ))}
              {extractedData.experience.length > 2 && (
                <p className="text-xs text-gray-500">+{extractedData.experience.length - 2} more positions</p>
              )}
            </div>
          </div>
        )}

        {/* Education */}
        {extractedData.education && extractedData.education.length > 0 && (
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-gray-600" />
                <h4 className="font-medium text-gray-900">Education</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit('education')}
                className="text-xs"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              {extractedData.education.map((edu, idx) => (
                <div key={idx}>
                  <p className="font-medium">{edu.degree}</p>
                  <p className="text-xs">{edu.institution}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {extractedData.skills && extractedData.skills.length > 0 && (
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-gray-600" />
                <h4 className="font-medium text-gray-900">Skills</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit('skills')}
                className="text-xs"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {extractedData.skills.slice(0, 6).map((skill, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {skill}
                </span>
              ))}
              {extractedData.skills.length > 6 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  +{extractedData.skills.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <Button onClick={onConfirm} className="flex-1">
          Looks good, continue
        </Button>
      </div>
    </motion.div>
  );
}