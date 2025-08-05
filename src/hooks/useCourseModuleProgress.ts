import { useState, useEffect, useCallback } from 'react'
import { 
  getModuleProgress, 
  updateModuleProgress, 
  canAccessModule,
  getModuleProgressStats,
  getCurrentAccessibleModule,
  ModuleProgress,
  ProgressUpdateResult 
} from '@/lib/courseModuleHelpers'
import { useToast } from '@/components/ui/use-toast'

export function useCourseModuleProgress(assignmentId: string | null) {
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([])
  const [currentModule, setCurrentModule] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total_modules: 0,
    completed_modules: 0,
    in_progress_modules: 0,
    unlocked_modules: 0,
    locked_modules: 0,
    total_time_spent: 0,
    overall_progress: 0
  })
  
  const { toast } = useToast()

  // Load module progress
  const loadModuleProgress = useCallback(async () => {
    if (!assignmentId) return

    setLoading(true)
    setError(null)

    try {
      const [progress, currentAccessible, progressStats] = await Promise.all([
        getModuleProgress(assignmentId),
        getCurrentAccessibleModule(assignmentId),
        getModuleProgressStats(assignmentId)
      ])

      setModuleProgress(progress)
      setCurrentModule(currentAccessible)
      setStats(progressStats)
    } catch (err: any) {
      setError(err.message)
      console.error('Error loading module progress:', err)
    } finally {
      setLoading(false)
    }
  }, [assignmentId])

  // Update progress for a specific module
  const updateProgress = useCallback(async (
    moduleNumber: number,
    progressPercentage: number,
    timeSpentMinutes: number = 0
  ): Promise<ProgressUpdateResult | null> => {
    if (!assignmentId) return null

    try {
      const result = await updateModuleProgress(
        assignmentId,
        moduleNumber,
        progressPercentage,
        timeSpentMinutes
      )

      // Reload progress to get updated state
      await loadModuleProgress()

      // Show completion toast if module was completed
      if (result.module_status === 'completed') {
        toast({
          title: "Module Completed!",
          description: result.unlocked_next_module 
            ? "Great job! The next module has been unlocked."
            : "Excellent work completing this module!",
        })
      }

      // Show course completion toast
      if (result.assignment_completed) {
        toast({
          title: "Course Completed!",
          description: "Congratulations! You've completed the entire course.",
        })
      }

      return result
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error",
        description: "Failed to update module progress. Please try again.",
        variant: "destructive"
      })
      return null
    }
  }, [assignmentId, loadModuleProgress, toast])

  // Check if user can access a specific module
  const checkModuleAccess = useCallback(async (moduleNumber: number): Promise<boolean> => {
    if (!assignmentId) return false

    try {
      return await canAccessModule(assignmentId, moduleNumber)
    } catch (err: any) {
      console.error('Error checking module access:', err)
      return false
    }
  }, [assignmentId])

  // Get module by number
  const getModule = useCallback((moduleNumber: number): ModuleProgress | null => {
    return moduleProgress.find(m => m.module_number === moduleNumber) || null
  }, [moduleProgress])

  // Get next unlocked module
  const getNextUnlockedModule = useCallback((): ModuleProgress | null => {
    return moduleProgress.find(m => m.status === 'unlocked') || null
  }, [moduleProgress])

  // Get all completed modules
  const getCompletedModules = useCallback((): ModuleProgress[] => {
    return moduleProgress.filter(m => m.status === 'completed')
  }, [moduleProgress])

  // Check if assignment is fully completed
  const isAssignmentCompleted = useCallback((): boolean => {
    if (moduleProgress.length === 0) return false
    return moduleProgress.every(m => m.status === 'completed')
  }, [moduleProgress])

  // Get completion percentage
  const getCompletionPercentage = useCallback((): number => {
    if (moduleProgress.length === 0) return 0
    const completedCount = moduleProgress.filter(m => m.status === 'completed').length
    return Math.round((completedCount / moduleProgress.length) * 100)
  }, [moduleProgress])

  // Load progress on mount or when assignmentId changes
  useEffect(() => {
    if (assignmentId) {
      loadModuleProgress()
    }
  }, [assignmentId, loadModuleProgress])

  return {
    // State
    moduleProgress,
    currentModule,
    loading,
    error,
    stats,
    
    // Actions
    updateProgress,
    checkModuleAccess,
    refreshProgress: loadModuleProgress,
    
    // Computed values
    getModule,
    getNextUnlockedModule,
    getCompletedModules,
    isAssignmentCompleted,
    getCompletionPercentage,
    
    // Convenience booleans
    hasModules: moduleProgress.length > 0,
    hasError: error !== null,
    isCompleted: isAssignmentCompleted()
  }
}