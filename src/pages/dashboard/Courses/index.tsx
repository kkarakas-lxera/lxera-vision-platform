
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Users, Play, CheckCircle, Star, RefreshCw, AlertCircle } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CoursesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { courses, loading, error, refetch } = useCourses();
  
  // Debug logging
  console.log('CoursesPage render:', { coursesLength: courses?.length, loading, error });

  // Extract unique categories from courses
  const categories = ["all", ...Array.from(new Set(courses.map(course => course.category)))];

  const filteredCourses = selectedCategory === "all" 
    ? courses 
    : courses.filter(course => course.category === selectedCategory);

  const getProgressColor = (progress: number) => {
    if (progress === 0) return "bg-gray-200";
    if (progress < 50) return "bg-yellow-400";
    if (progress < 100) return "bg-blue-400";
    return "bg-green-400";
  };

  const getStatusBadge = (progress: number, status?: string) => {
    if (status === 'draft') return { text: "Draft", variant: "outline" as const };
    if (status === 'approved') return { text: "Available", variant: "default" as const };
    if (status === 'completed' || progress === 100) return { text: "Completed", variant: "default" as const };
    if (status === 'in_progress' || progress > 0) return { text: "In Progress", variant: "default" as const };
    return { text: "Not Started", variant: "secondary" as const };
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600 mt-1">Loading your learning content...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-[400px]">
              <CardHeader>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-600 mt-1">Failed to load courses</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            {error}
            <Button 
              variant="link" 
              className="ml-4 p-0 h-auto" 
              onClick={refetch}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-1">Continue your learning journey</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={refetch}
            title="Refresh courses"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Browse All Courses
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const status = getStatusBadge(course.progress, course.status);
          
          return (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="text-xs">
                    {course.category}
                  </Badge>
                  <Badge variant={status.variant} className="text-xs">
                    {status.text}
                  </Badge>
                </div>
                <CardTitle className="text-lg line-clamp-2" title={course.title}>
                  {course.title}
                </CardTitle>
                <CardDescription className="text-sm line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.students}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {parseFloat(course.rating.toString()).toFixed(1)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>

                {course.modules && course.modules.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Course Modules:</div>
                    <div className="space-y-1">
                      {course.modules.map((module, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          {course.progress > (index * (100 / course.modules.length)) ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-300" />
                          )}
                          <span className="line-clamp-1">{module.module_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Button 
                    className="w-full" 
                    variant={course.progress === 0 ? "default" : "outline"}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {course.progress === 0 ? "Start Course" : 
                     course.progress === 100 ? "Review Course" : "Continue"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No courses available
          </h3>
          <p className="text-gray-600 mb-4">
            No courses have been created for your organization yet.
          </p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}

      {courses.length > 0 && filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No courses found
          </h3>
          <p className="text-gray-600">
            Try selecting a different category or browse all available courses.
          </p>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
