
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Users, Play, CheckCircle, Star } from "lucide-react";

const CoursesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Mock course data
  const courses = [
    {
      id: 1,
      title: "Advanced JavaScript Concepts",
      description: "Deep dive into closures, prototypes, and async programming",
      category: "Development",
      duration: "4 hours",
      students: 234,
      rating: 4.8,
      progress: 0,
      instructor: "Sarah Chen",
      level: "Advanced",
      modules: [
        { module_name: "Introduction to Advanced JS" },
        { module_name: "Closures and Scope" },
        { module_name: "Prototypes and Inheritance" },
        { module_name: "Async Programming" }
      ]
    },
    {
      id: 2,
      title: "Data Science Fundamentals",
      description: "Learn the basics of data analysis and visualization",
      category: "Data Science",
      duration: "6 hours",
      students: 189,
      rating: 4.6,
      progress: 45,
      instructor: "Michael Rodriguez",
      level: "Beginner",
      modules: [
        { module_name: "Introduction to Data Science" },
        { module_name: "Statistics Basics" },
        { module_name: "Data Visualization" },
        { module_name: "Python for Data Science" }
      ]
    },
    {
      id: 3,
      title: "UX Design Principles",
      description: "Master the fundamentals of user experience design",
      category: "Design",
      duration: "5 hours",
      students: 156,
      rating: 4.9,
      progress: 100,
      instructor: "Emma Thompson",
      level: "Intermediate",
      modules: [
        { module_name: "UX Research Methods" },
        { module_name: "User Personas" },
        { module_name: "Wireframing and Prototyping" },
        { module_name: "Usability Testing" }
      ]
    }
  ];

  const categories = ["all", "Development", "Data Science", "Design", "Business"];

  const filteredCourses = selectedCategory === "all" 
    ? courses 
    : courses.filter(course => course.category === selectedCategory);

  const getProgressColor = (progress: number) => {
    if (progress === 0) return "bg-gray-200";
    if (progress < 50) return "bg-yellow-400";
    if (progress < 100) return "bg-blue-400";
    return "bg-green-400";
  };

  const getStatusBadge = (progress: number) => {
    if (progress === 0) return { text: "Not Started", variant: "secondary" as const };
    if (progress < 100) return { text: "In Progress", variant: "default" as const };
    return { text: "Completed", variant: "default" as const };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-1">Continue your learning journey</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Browse All Courses
        </Button>
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
          const status = getStatusBadge(course.progress);
          
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
                <CardTitle className="text-lg line-clamp-2">
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
                    {course.rating}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Course Modules:</div>
                  <div className="space-y-1">
                    {course.modules.map((module, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        {course.progress > (index * 25) ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-gray-300" />
                        )}
                        {module.module_name}
                      </div>
                    ))}
                  </div>
                </div>

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

      {filteredCourses.length === 0 && (
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
