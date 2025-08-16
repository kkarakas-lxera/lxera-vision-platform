import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Brain, Globe, Calendar, HelpCircle, Users, Plus, ChevronDown, ChevronUp, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MarketIntelligenceConfigProps {
  config: {
    positionId: string;
    positionTitle: string;
    positionDescription: string;
    regions: string[];
    countries: string[];
    dateWindow: '24h' | '7d' | '30d' | '90d' | 'custom';
    sinceDate: string;
    focusArea: 'technical' | 'all_skills';
    skillTypes: string[];
  };
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  validationErrors: Record<string, string>;
  onSubmit: () => void;
  isLoading: boolean;
}

const REGIONS = {
  'North America': ['United States', 'Canada', 'Mexico'],
  'South America': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Uruguay'],
  'Europe': ['United Kingdom', 'Germany', 'France', 'Netherlands', 'Sweden', 'Switzerland', 'Spain', 'Italy', 'Poland', 'Czech Republic', 'Turkey'],
  'MENA': ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Jordan', 'Lebanon', 'Egypt'],
  'Asia Pacific': ['Singapore', 'Australia', 'Japan', 'South Korea', 'Hong Kong', 'Malaysia', 'India', 'Thailand', 'Philippines']
};

const INDUSTRIES = [
  'Technology & Software',
  'Financial Services',
  'Healthcare & Biotechnology', 
  'Manufacturing & Automotive',
  'Retail & E-commerce',
  'Media & Entertainment',
  'Education & Training',
  'Government & Public Sector',
  'Consulting & Professional Services',
  'Energy & Utilities',
  'Real Estate & Construction',
  'Transportation & Logistics'
];

const ALL_COUNTRIES = Object.values(REGIONS).flat().sort();

export default function MarketIntelligenceConfig({
  config,
  setConfig,
  validationErrors,
  onSubmit,
  isLoading
}: MarketIntelligenceConfigProps) {
  const { userProfile } = useAuth();
  const [positions, setPositions] = useState<Array<{ 
    id: string; 
    position_title: string; 
    description?: string; 
    required_skills?: any[]; 
    nice_to_have_skills?: any[];
    company_id?: string;
    company_name?: string;
  }>>([]);
  const [showCustomCountries, setShowCustomCountries] = useState(false);
  const [companyIndustry, setCompanyIndustry] = useState<string>('');
  const [showCountriesPreview, setShowCountriesPreview] = useState(false);
  const [selectedSkillTypes, setSelectedSkillTypes] = useState<string[]>([]);

  const SKILL_TYPES = [
    { id: 'leadership', label: 'Leadership', description: 'Management and team leadership skills' },
    { id: 'soft_skills', label: 'Soft Skills', description: 'Communication, collaboration, problem-solving' },
    { id: 'technical', label: 'Technical Skills', description: 'Programming, frameworks, technical expertise' },
    { id: 'tools', label: 'Tools/Proficiency', description: 'Software tools, platforms, applications' },
    { id: 'all_skills', label: 'All Skills', description: 'Comprehensive analysis of all skill categories' }
  ];

  useEffect(() => {
    fetchPositions();
    fetchCompanyIndustry();
  }, [userProfile?.company_id, userProfile?.role]);

  // Initialize skill types based on config
  useEffect(() => {
    if (config.skillTypes && config.skillTypes.length > 0) {
      setSelectedSkillTypes(config.skillTypes);
    } else if (config.focusArea === 'all_skills') {
      setSelectedSkillTypes(['all_skills']);
      setConfig((prev: any) => ({ ...prev, skillTypes: ['all_skills'] }));
    } else if (config.focusArea === 'technical') {
      setSelectedSkillTypes(['technical']);
      setConfig((prev: any) => ({ ...prev, skillTypes: ['technical'] }));
    }
  }, [config.focusArea]);

  const fetchPositions = async () => {
    console.log('[Market Intelligence] Fetching positions for user:', userProfile);
    
    try {
      // Super admins can see all positions with company names
      if (userProfile?.role === 'super_admin') {
        console.log('[Market Intelligence] Super admin - fetching all positions with company names');
        
        const { data, error } = await supabase
          .from('st_company_positions')
          .select(`
            id, 
            position_title, 
            description, 
            required_skills, 
            nice_to_have_skills, 
            company_id,
            companies(name)
          `)
          .order('position_title');

        if (error) throw error;
        
        // Transform data to include company_name
        const transformedData = data?.map((pos: any) => ({
          ...pos,
          company_name: pos.companies?.name || 'Unknown Company'
        })) || [];
        
        console.log('[Market Intelligence] Fetched positions:', transformedData);
        setPositions(transformedData);
      } else if (userProfile?.company_id) {
        console.log('[Market Intelligence] Fetching positions for company_id:', userProfile.company_id);
        
        const { data, error } = await supabase
          .from('st_company_positions')
          .select('id, position_title, description, required_skills, nice_to_have_skills, company_id')
          .eq('company_id', userProfile.company_id)
          .order('position_title');

        if (error) throw error;
        
        console.log('[Market Intelligence] Fetched positions:', data);
        setPositions(data || []);
      } else {
        console.warn('[Market Intelligence] No company_id found in userProfile:', userProfile);
        return;
      }
    } catch (error) {
      console.error('[Market Intelligence] Error fetching positions:', error);
    }
  };

  const fetchCompanyIndustry = async () => {
    if (!userProfile?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('industry')
        .eq('id', userProfile.company_id)
        .single();

      if (error) throw error;
      setCompanyIndustry(data?.industry || 'Technology');
    } catch (error) {
      console.error('Error fetching company industry:', error);
      setCompanyIndustry('Technology'); // Default fallback
    }
  };

  const handleRegionChange = (region: string) => {
    if (region === 'custom') {
      setShowCustomCountries(true);
      setConfig((prev: any) => ({ ...prev, regions: [], countries: [] }));
    } else {
      setShowCustomCountries(false);
      // Set the region and automatically include all countries in that region
      const regionCountries = REGIONS[region as keyof typeof REGIONS] || [];
      setConfig((prev: any) => ({ 
        ...prev, 
        regions: [region], 
        countries: regionCountries
      }));
    }
  };

  const handleCountryToggle = (country: string) => {
    setConfig((prev: any) => ({
      ...prev,
      countries: prev.countries.includes(country)
        ? prev.countries.filter((c: string) => c !== country)
        : [...prev.countries, country]
    }));
  };

  const handleSkillTypeChange = (skillType: string) => {
    if (skillType === 'all_skills') {
      // Toggle "All Skills" - if already selected, unselect it
      if (selectedSkillTypes.includes('all_skills')) {
        setSelectedSkillTypes([]);
        setConfig((prev: any) => ({ ...prev, focusArea: 'technical', skillTypes: [] }));
      } else {
        // If selecting "All Skills", clear others and set it
        setSelectedSkillTypes(['all_skills']);
        setConfig((prev: any) => ({ ...prev, focusArea: 'all_skills', skillTypes: ['all_skills'] }));
      }
    } else {
      // Handle specific skill type selection
      let newTypes;
      if (selectedSkillTypes.includes(skillType)) {
        // Unselecting a specific type
        newTypes = selectedSkillTypes.filter(t => t !== skillType && t !== 'all_skills');
      } else {
        // Selecting a specific type - remove "All Skills" if present
        newTypes = [...selectedSkillTypes.filter(t => t !== 'all_skills'), skillType];
      }
      
      setSelectedSkillTypes(newTypes);
      
      // Set focus area based on selection
      const focusArea = newTypes.includes('technical') && newTypes.length === 1 ? 'technical' : 'all_skills';
      setConfig((prev: any) => ({ ...prev, focusArea, skillTypes: newTypes }));
    }
  };

  const SectionHeader = ({ title, description, icon: Icon }: { title: string; description: string; icon: any }) => (
    <div className="flex items-center gap-2 mb-2">
      <Icon className="h-3 w-3 text-blue-600" />
      <Label className="text-sm font-medium">{title}</Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-xs">{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  const getDateWindowLabel = (window: string) => {
    switch (window) {
      case '24h': return 'Last 24 hours';
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      case 'custom': return 'Since specific date...';
      default: return window;
    }
  };

  const isValid = (config.positionId && config.positionTitle) && 
    (config.regions.length > 0 || config.countries.length > 0) &&
    (config.dateWindow !== 'custom' || config.sinceDate) &&
    selectedSkillTypes.length > 0;

  return (
    <div className="space-y-6">
      {/* Main Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Market Intelligence Configuration
          </CardTitle>
          <CardDescription>
            Analyze current job market demand vs. your position requirements{companyIndustry && ` in ${companyIndustry}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
        {/* Position Selection */}
        <div className="space-y-3">
          <SectionHeader 
            title="Position"
            description="Select an existing role from your organization"
            icon={Users}
          />
          
          {/* Position Selection */}
          <div className="space-y-2">
            <Select
              value={config.positionId}
              onValueChange={(value) => {
                const position = positions.find(p => p.id === value);
                setConfig((prev: any) => ({
                  ...prev,
                  positionId: value,
                  positionTitle: position?.position_title || '',
                  positionDescription: position?.description || ''
                }));
              }}
            >
              <SelectTrigger className={validationErrors.position ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a role from your positions" />
              </SelectTrigger>
              <SelectContent>
                {positions.map(position => (
                  <SelectItem key={position.id} value={position.id}>
                    {position.position_title}
                    {userProfile?.role === 'super_admin' && position.company_name && (
                      <span className="text-gray-500 ml-2">({position.company_name})</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.position && (
              <p className="text-sm text-red-500">{validationErrors.position}</p>
            )}
          </div>
        </div>


        {/* Region Selection */}
        <div className="space-y-4">
          <SectionHeader 
            title="Geographic Market"
            description="Choose geographic markets to analyze. We'll scan job boards in these locations for demand trends"
            icon={Globe}
          />
          
          <div className="space-y-3">
            <Select
              value={config.regions[0] || (showCustomCountries ? 'custom' : '')}
              onValueChange={handleRegionChange}
            >
              <SelectTrigger className={validationErrors.location ? 'border-red-500' : ''}>
                <SelectValue placeholder="Choose a region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="North America">North America</SelectItem>
                <SelectItem value="South America">South America</SelectItem>
                <SelectItem value="Europe">Europe</SelectItem>
                <SelectItem value="MENA">Middle East & Africa</SelectItem>
                <SelectItem value="Asia Pacific">Asia Pacific</SelectItem>
                <SelectItem value="custom">Custom Countries...</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Interactive Country Selection */}
            {config.regions.length > 0 && config.regions[0] !== 'custom' && (
              <div className="border rounded bg-gray-50">
                <div 
                  className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setShowCountriesPreview(!showCountriesPreview)}
                >
                  <span className="text-xs text-gray-700">
                    {config.countries.length} countries • {config.regions[0]}
                  </span>
                  {showCountriesPreview ? (
                    <ChevronUp className="h-3 w-3 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-3 w-3 text-gray-500" />
                  )}
                </div>
                
                {showCountriesPreview && (
                  <div className="border-t p-2">
                    <div className="flex flex-wrap gap-1">
                      {REGIONS[config.regions[0] as keyof typeof REGIONS]?.map(country => {
                        const isSelected = config.countries.includes(country);
                        return (
                          <button
                            key={country}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCountryToggle(country);
                            }}
                            className={`px-2 py-1 rounded text-xs transition-colors ${
                              isSelected 
                                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {country}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Click countries to include/exclude from analysis
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {validationErrors.location && (
              <p className="text-sm text-red-500">{validationErrors.location}</p>
            )}
          </div>
        </div>

        {/* Custom Countries - Global Selection */}
        {showCustomCountries && (
          <div className="border border-blue-200 bg-blue-50 rounded p-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Global Country Selection</Label>
                <span className="text-xs text-gray-600">{config.countries.length} selected</span>
              </div>
              <div className="border rounded p-2 max-h-40 overflow-y-auto bg-white">
                <div className="flex flex-wrap gap-1">
                  {ALL_COUNTRIES.map(country => {
                    const isSelected = config.countries.includes(country);
                    return (
                      <button
                        key={country}
                        type="button"
                        onClick={() => handleCountryToggle(country)}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          isSelected 
                            ? 'bg-blue-500 text-white hover:bg-blue-600' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {country}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 pt-2 border-t flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfig((prev: any) => ({ ...prev, countries: ALL_COUNTRIES }))}
                    className="h-6 text-xs"
                  >
                    Select all
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfig((prev: any) => ({ ...prev, countries: [] }))}
                    className="h-6 text-xs"
                  >
                    Clear all
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Date Window */}
        <div className="space-y-4">
          <SectionHeader 
            title="Analysis Time Range"
            description="Time range for job posting analysis. Shorter windows show recent trends, longer windows provide more data"
            icon={Calendar}
          />
          
          <Select
            value={config.dateWindow}
            onValueChange={(value: any) => setConfig((prev: any) => ({ ...prev, dateWindow: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days (Recommended)</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="custom">Since specific date...</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Date */}
        {config.dateWindow === 'custom' && (
          <div className="border border-blue-200 bg-blue-50 rounded p-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Since Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={config.sinceDate}
                onChange={(e) => setConfig((prev: any) => ({ ...prev, sinceDate: e.target.value }))}
                className={validationErrors.sinceDate ? 'border-red-500' : ''}
                max={new Date().toISOString().split('T')[0]}
              />
              {validationErrors.sinceDate && (
                <p className="text-xs text-red-500">{validationErrors.sinceDate}</p>
              )}
            </div>
          </div>
        )}


        {/* Skill Categories Focus */}
        <div className="space-y-4">
          <SectionHeader 
            title="Skill Categories"
            description="Filter analysis by skill categories. Select specific types or analyze all skills comprehensively"
            icon={Brain}
          />
          
          <div className="space-y-3">
            {SKILL_TYPES.map(skillType => {
              const isSelected = selectedSkillTypes.includes(skillType.id);
              const isAllSkills = skillType.id === 'all_skills';
              const hasOthersSelected = selectedSkillTypes.length > 0 && !selectedSkillTypes.includes('all_skills');
              const isDisabled = false; // Remove blocking logic - allow all interactions
              
              return (
                <div 
                  key={skillType.id}
                  className={`cursor-pointer transition-all border rounded p-2 ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handleSkillTypeChange(skillType.id)}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isSelected}
                      className="pointer-events-none"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          isSelected ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {skillType.label}
                        </span>
                        {isAllSkills && (
                          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                            All
                          </span>
                        )}
                      </div>
                      <p className={`text-xs ${
                        isSelected ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        {skillType.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Helper Text */}
          {selectedSkillTypes.length > 0 && (
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              Analyzing: {selectedSkillTypes.includes('all_skills') 
                ? 'All categories' 
                : selectedSkillTypes.map(id => SKILL_TYPES.find(t => t.id === id)?.label).join(', ')}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-200">
          {!isValid && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-3">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-3 w-3" />
                <span className="text-xs">Complete required fields</span>
              </div>
            </div>
          )}
          
          <Button
            onClick={onSubmit}
            disabled={!isValid || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Start Analysis
              </>
            )}
          </Button>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            Analyzing job postings{companyIndustry && ` in ${companyIndustry}`}
            {selectedSkillTypes.length > 0 && !selectedSkillTypes.includes('all_skills') && (
              <span className="text-blue-600"> • {selectedSkillTypes.map(id => SKILL_TYPES.find(t => t.id === id)?.label).join(', ')}</span>
            )}
          </p>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}