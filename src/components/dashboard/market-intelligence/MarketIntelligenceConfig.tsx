import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Brain, Globe, Calendar, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MarketIntelligenceConfigProps {
  config: {
    positionId: string;
    positionTitle: string;
    positionDescription: string;
    regions: string[];
    countries: string[];
    dateWindow: '24h' | '7d' | '30d' | '90d' | 'custom';
    sinceDate: string;
    source: 'linkedin';
    focusArea: 'technical' | 'all_skills';
  };
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  validationErrors: Record<string, string>;
  onSubmit: () => void;
  isLoading: boolean;
}

const REGIONS = {
  'US': ['United States'],
  'Europe': ['United Kingdom', 'Germany', 'France', 'Netherlands', 'Sweden', 'Switzerland', 'Spain', 'Italy'],
  'Turkey': ['Turkey', 'Istanbul', 'Ankara', 'Izmir'],
  'MENA': ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Jordan', 'Lebanon', 'Egypt'],
  'Asia/Pacific': ['Singapore', 'Australia', 'Japan', 'South Korea', 'Hong Kong', 'Malaysia', 'India', 'Thailand']
};

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

  useEffect(() => {
    fetchPositions();
    fetchCompanyIndustry();
  }, [userProfile?.company_id, userProfile?.role]);

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
      setConfig((prev: any) => ({ 
        ...prev, 
        regions: [region], 
        countries: []
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

  const isValid = config.positionId && 
    (config.regions.length > 0 || config.countries.length > 0) &&
    (config.dateWindow !== 'custom' || config.sinceDate);

  return (
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
      <CardContent className="space-y-6">
        {/* Role/Title Selection */}
        <div className="space-y-2">
          <Label htmlFor="position">
            Role/Title <span className="text-red-500">*</span>
          </Label>
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
            <SelectTrigger id="position" className={validationErrors.position ? 'border-red-500' : ''}>
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

        {/* Region Selection */}
        <div className="space-y-2">
          <Label htmlFor="region">
            Region <span className="text-red-500">*</span>
          </Label>
          <Select
            value={config.regions[0] || (showCustomCountries ? 'custom' : '')}
            onValueChange={handleRegionChange}
          >
            <SelectTrigger id="region" className={validationErrors.location ? 'border-red-500' : ''}>
              <SelectValue placeholder="Choose a region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="US">United States</SelectItem>
              <SelectItem value="Europe">Europe</SelectItem>
              <SelectItem value="Turkey">Turkey (kariyer.net)</SelectItem>
              <SelectItem value="MENA">Middle East & Africa</SelectItem>
              <SelectItem value="Asia/Pacific">Asia Pacific</SelectItem>
              <SelectItem value="custom">Custom Countries...</SelectItem>
            </SelectContent>
          </Select>
          {validationErrors.location && (
            <p className="text-sm text-red-500">{validationErrors.location}</p>
          )}
        </div>

        {/* Custom Countries */}
        {showCustomCountries && (
          <div className="space-y-2">
            <Label>Select Countries</Label>
            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {ALL_COUNTRIES.map(country => (
                  <label key={country} className="flex items-center space-x-2 text-sm">
                    <Checkbox
                      checked={config.countries.includes(country)}
                      onCheckedChange={() => handleCountryToggle(country)}
                    />
                    <span>{country}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfig((prev: any) => ({ ...prev, countries: ALL_COUNTRIES }))}
                >
                  Select all
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfig((prev: any) => ({ ...prev, countries: [] }))}
                >
                  Clear all
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Date Window */}
        <div className="space-y-2">
          <Label htmlFor="dateWindow">
            Date Window <span className="text-red-500">*</span>
          </Label>
          <Select
            value={config.dateWindow}
            onValueChange={(value: any) => setConfig((prev: any) => ({ ...prev, dateWindow: value }))}
          >
            <SelectTrigger id="dateWindow">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="custom">Since specific date...</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Date */}
        {config.dateWindow === 'custom' && (
          <div className="space-y-2">
            <Label htmlFor="sinceDate">
              Since Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sinceDate"
              type="date"
              value={config.sinceDate}
              onChange={(e) => setConfig((prev: any) => ({ ...prev, sinceDate: e.target.value }))}
              className={validationErrors.sinceDate ? 'border-red-500' : ''}
              max={new Date().toISOString().split('T')[0]}
            />
            {validationErrors.sinceDate && (
              <p className="text-sm text-red-500">{validationErrors.sinceDate}</p>
            )}
          </div>
        )}

        {/* Data Source */}
        <div className="space-y-2">
          <Label htmlFor="source">
            Data Source <span className="text-red-500">*</span>
          </Label>
          <Select
            value={config.source}
            onValueChange={(value: any) => setConfig((prev: any) => ({ ...prev, source: value }))}
            disabled
          >
            <SelectTrigger id="source" className="opacity-60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linkedin">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-600" />
                  LinkedIn Jobs
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Additional sources coming soon
          </p>
        </div>

        {/* Focus Area */}
        <div className="space-y-2">
          <Label>Focus Area</Label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="all_skills"
                checked={config.focusArea === 'all_skills'}
                onChange={(e) => setConfig((prev: any) => ({ ...prev, focusArea: e.target.value }))}
                className="text-blue-600"
              />
              <span className="text-sm">All Skills</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="technical"
                checked={config.focusArea === 'technical'}
                onChange={(e) => setConfig((prev: any) => ({ ...prev, focusArea: e.target.value }))}
                className="text-blue-600"
              />
              <span className="text-sm">Technical Only</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t">
          <Button
            onClick={onSubmit}
            disabled={!isValid || isLoading}
            className="w-full"
            size="lg"
          >
            <Brain className="h-4 w-4 mr-2" />
            Analyze Market
          </Button>
          <p className="text-xs text-gray-500 text-center mt-2">
            We analyze recent job postings and compare them against your position requirements{companyIndustry && ` in the ${companyIndustry} industry`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}