import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useCourseModuleProgress } from '@/hooks/useCourseModuleProgress'
import { Clock, CheckCircle, Lock, Play } from 'lucide-react'

interface ModuleProgressExampleProps {
  assignmentId: string
}

export function ModuleProgressExample({ assignmentId }: ModuleProgressExampleProps) {
  const {
    moduleProgress,
    loading,
    error,
    stats,
    updateProgress,
    checkModuleAccess,
    getModule,
    isCompleted,
    getCompletionPercentage
  } = useCourseModuleProgress(assignmentId)

  const handleModuleClick = async (moduleNumber: number) => {
    const canAccess = await checkModuleAccess(moduleNumber)
    if (!canAccess) {
      alert('This module is locked. Complete previous modules first.')
      return
    }

    // Simulate starting the module
    const module = getModule(moduleNumber)
    if (module && module.status === 'unlocked') {
      await updateProgress(moduleNumber, 10, 1) // Start with 10% progress
    }
  }

  const handleCompleteModule = async (moduleNumber: number) => {
    await updateProgress(moduleNumber, 100, 30) // Complete with 30 minutes spent
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Play className="h-4 w-4 text-blue-500" />
      case 'unlocked':
        return <Play className="h-4 w-4 text-gray-500" />
      default:
        return <Lock className="h-4 w-4 text-gray-300" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'unlocked':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  if (loading) {
    return <div className="p-4">Loading module progress...</div>
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Course Progress
            <Badge variant={isCompleted ? "default" : "secondary"}>
              {isCompleted ? "Completed" : "In Progress"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={getCompletionPercentage()} className="w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completed_modules}</div>
                <div className="text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.in_progress_modules}</div>
                <div className="text-gray-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.unlocked_modules}</div>
                <div className="text-gray-600">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">{stats.locked_modules}</div>
                <div className="text-gray-600">Locked</div>
              </div>
            </div>
            <div className="flex items-center justify-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              Total time spent: {Math.round(stats.total_time_spent / 60)}h {stats.total_time_spent % 60}m
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Course Modules</h3>
        {moduleProgress.map((module) => (
          <Card key={module.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(module.status)}
                  <div>
                    <h4 className="font-medium">
                      Module {module.module_number}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {module.status === 'completed' && module.completed_at && (
                        `Completed on ${new Date(module.completed_at).toLocaleDateString()}`
                      )}
                      {module.status === 'in_progress' && module.started_at && (
                        `Started on ${new Date(module.started_at).toLocaleDateString()}`
                      )}
                      {module.status === 'unlocked' && 'Ready to start'}
                      {module.status === 'locked' && 'Complete previous modules to unlock'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(module.status)}>
                    {module.status.replace('_', ' ')}
                  </Badge>
                  
                  {module.status !== 'locked' && (
                    <div className="text-right text-sm">
                      <div className="font-medium">{module.progress_percentage}%</div>
                      {module.time_spent_minutes > 0 && (
                        <div className="text-gray-500">
                          {Math.round(module.time_spent_minutes / 60)}h {module.time_spent_minutes % 60}m
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    {module.status === 'unlocked' && (
                      <Button
                        size="sm"
                        onClick={() => handleModuleClick(module.module_number)}
                      >
                        Start
                      </Button>
                    )}
                    
                    {module.status === 'in_progress' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCompleteModule(module.module_number)}
                      >
                        Complete
                      </Button>
                    )}
                    
                    {module.status === 'completed' && (
                      <Button size="sm" variant="outline" disabled>
                        Completed
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {(module.status === 'in_progress' || module.status === 'completed') && (
                <div className="mt-3">
                  <Progress value={module.progress_percentage} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}