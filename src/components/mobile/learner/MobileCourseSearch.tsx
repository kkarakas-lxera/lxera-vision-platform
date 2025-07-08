import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Clock, 
  Star, 
  Users, 
  Play,
  BookOpen,
  TrendingUp,
  Award,
  ChevronDown,
  Zap,
  Target
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  instructor: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  rating: number;
  total_ratings: number;
  enrollment_count: number;
  price: number;
  tags: string[];
  created_at: string;
  is_featured: boolean;
  skills: string[];
}

interface SearchFilters {
  category: string;
  level: string;
  duration: string;
  price: string;
  rating: string;
}

export default function MobileCourseSearch() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    level: 'all',
    duration: 'all',
    price: 'all',
    rating: 'all'
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [categories, setCategories] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestedCourses, setSuggestedCourses] = useState<Course[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchSuggestedCourses();
    loadRecentSearches();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      searchCourses();
    } else {
      setFilteredCourses(suggestedCourses);
    }
  }, [searchQuery, filters, sortBy]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('category')
        .not('category', 'is', null);

      if (error) throw error;
      
      const uniqueCategories = [...new Set(data.map(c => c.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSuggestedCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_featured', true)
        .order('rating', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSuggestedCourses(data || []);
      setFilteredCourses(data || []);
    } catch (error) {
      console.error('Error fetching suggested courses:', error);
    }
  };

  const searchCourses = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('courses')
        .select('*');

      // Apply search query
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`);
      }

      // Apply filters
      if (filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      
      if (filters.level !== 'all') {
        query = query.eq('level', filters.level);
      }
      
      if (filters.duration !== 'all') {
        const [min, max] = filters.duration.split('-').map(Number);
        if (max) {
          query = query.gte('duration', min).lte('duration', max);
        } else {
          query = query.gte('duration', min);
        }
      }
      
      if (filters.price !== 'all') {
        if (filters.price === 'free') {
          query = query.eq('price', 0);
        } else if (filters.price === 'paid') {
          query = query.gt('price', 0);
        }
      }
      
      if (filters.rating !== 'all') {
        query = query.gte('rating', parseFloat(filters.rating));
      }

      // Apply sorting
      switch (sortBy) {
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'popular':
          query = query.order('enrollment_count', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'duration':
          query = query.order('duration', { ascending: true });
          break;
        default:
          query = query.order('rating', { ascending: false });
      }

      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      
      setCourses(data || []);
      setFilteredCourses(data || []);
      
      // Save search query
      if (searchQuery) {
        saveRecentSearch(searchQuery);
      }
    } catch (error) {
      console.error('Error searching courses:', error);
      toast.error('Failed to search courses');
    } finally {
      setLoading(false);
    }
  };

  const saveRecentSearch = (query: string) => {
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      level: 'all',
      duration: 'all',
      price: 'all',
      rating: 'all'
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value !== 'all').length;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  return (
    <div className="mobile-course-search w-full max-w-md mx-auto p-4 space-y-4">
      {/* Search Header */}
      <div className="sticky top-0 bg-background z-10 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search courses..."
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
          
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Filter className="h-4 w-4" />
                {getActiveFilterCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Filter Courses</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Level Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Level</label>
                  <Select value={filters.level} onValueChange={(value) => handleFilterChange('level', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Duration</label>
                  <Select value={filters.duration} onValueChange={(value) => handleFilterChange('duration', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Duration</SelectItem>
                      <SelectItem value="0-30">0-30 minutes</SelectItem>
                      <SelectItem value="30-60">30-60 minutes</SelectItem>
                      <SelectItem value="60-120">1-2 hours</SelectItem>
                      <SelectItem value="120">2+ hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Price</label>
                  <Select value={filters.price} onValueChange={(value) => handleFilterChange('price', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Price</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Rating</label>
                  <Select value={filters.rating} onValueChange={(value) => handleFilterChange('rating', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Rating</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                      <SelectItem value="2">2+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={clearFilters} variant="outline" className="flex-1">
                    Clear All
                  </Button>
                  <Button onClick={() => setIsFilterOpen(false)} className="flex-1">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Sort and Results */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Recent Searches */}
      {searchQuery.length === 0 && recentSearches.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Recent Searches</h3>
            <Button variant="ghost" size="sm" onClick={clearRecentSearches}>
              Clear
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => setSearchQuery(search)}
              >
                {search}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Course Results */}
      <div className="space-y-4">
        {filteredCourses.length === 0 && !loading ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No courses found matching your search' : 'No courses available'}
            </p>
          </div>
        ) : (
          filteredCourses.map((course) => (
            <Card 
              key={course.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCourseClick(course.id)}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {course.thumbnail_url && (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getLevelColor(course.level)} variant="secondary">
                        {course.level}
                      </Badge>
                      {course.is_featured && (
                        <Badge variant="outline" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(course.duration)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {course.rating.toFixed(1)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {course.enrollment_count}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-medium">
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                      </span>
                      <Button size="sm" variant="outline">
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}