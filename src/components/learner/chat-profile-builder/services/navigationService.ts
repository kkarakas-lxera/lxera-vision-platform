import type { NavigationState, NavigationContext, StepVisitHistory } from '../types';
import type React from 'react';
import { STEPS } from '../constants';

export class NavigationService {
  // Instance state references for mutating navigation inside components
  private state: NavigationState;
  private setState: (updater: (prev: NavigationState) => NavigationState) => void;
  private currentStepRef: React.MutableRefObject<number>;
  private maxStepReachedRef: React.MutableRefObject<number>;

  constructor(
    state: NavigationState,
    setState: React.Dispatch<React.SetStateAction<NavigationState>>,
    currentStepRef: React.MutableRefObject<number>,
    maxStepReachedRef: React.MutableRefObject<number>
  ) {
    this.state = state;
    this.setState = (updater) => setState(updater);
    this.currentStepRef = currentStepRef;
    this.maxStepReachedRef = maxStepReachedRef;
  }

  /**
   * Navigate to a specific step, updating refs along the way.
   */
  navigateToStep(targetStep: number) {
    if (!NavigationService.canNavigateToStep(targetStep, this.maxStepReachedRef.current)) return;

    this.setState(prev => ({
      ...prev,
      navigatingTo: targetStep,
      currentStep: targetStep
    }));

    this.currentStepRef.current = targetStep;
  }

  /**
   * Move forward exactly one step when possible.
   */
  moveToNextStep() {
    const next = NavigationService.getNextStep(this.state.currentStep);
    if (next) {
      this.navigateToStep(next);
    }
  }

  static createNavigationContext(
    source: NavigationContext['source'],
    intent: NavigationContext['intent']
  ): NavigationContext {
    return { source, intent };
  }

  static canNavigateToStep(targetStep: number, maxStepReached: number): boolean {
    return targetStep > 0 && targetStep <= STEPS.length && targetStep <= maxStepReached;
  }

  static getNextStep(currentStep: number): number | null {
    if (currentStep < STEPS.length) {
      return currentStep + 1;
    }
    return null;
  }

  static getPreviousStep(currentStep: number): number | null {
    if (currentStep > 1) {
      return currentStep - 1;
    }
    return null;
  }

  static getStepInfo(stepNumber: number) {
    return STEPS.find(step => step.id === stepNumber) || null;
  }

  static getStepsForMenu(maxStepReached: number) {
    return STEPS.filter(step => step.id <= maxStepReached).map(step => ({
      ...step,
      accessible: step.id <= maxStepReached,
      completed: step.id < maxStepReached
    }));
  }

  static updateNavigationState(
    currentState: NavigationState,
    updates: Partial<NavigationState>
  ): NavigationState {
    return {
      ...currentState,
      ...updates
    };
  }

  static createStepVisitHistory(stepId: number): StepVisitHistory {
    const now = new Date();
    return {
      stepId,
      firstVisitedAt: now,
      lastVisitedAt: now,
      visitCount: 1,
      status: 'in_progress',
      milestoneAwarded: false
    };
  }

  static updateStepVisitHistory(
    history: StepVisitHistory,
    status?: StepVisitHistory['status']
  ): StepVisitHistory {
    const now = new Date();
    return {
      ...history,
      lastVisitedAt: now,
      visitCount: history.visitCount + 1,
      status: status || history.status,
      completedAt: status === 'completed' ? now : history.completedAt
    };
  }

  static isStepCompleted(stepNumber: number, maxStepReached: number): boolean {
    return stepNumber < maxStepReached;
  }

  static isStepAccessible(stepNumber: number, maxStepReached: number): boolean {
    return stepNumber <= maxStepReached;
  }

  static getStepProgress(currentStep: number): number {
    return Math.round((currentStep / STEPS.length) * 100);
  }

  static getStepTitle(stepNumber: number): string {
    const step = this.getStepInfo(stepNumber);
    return step ? step.title : 'Unknown Step';
  }

  static getStepName(stepNumber: number): string {
    const step = this.getStepInfo(stepNumber);
    return step ? step.name : 'unknown';
  }

  static getAllSteps() {
    return STEPS;
  }

  static getTotalSteps(): number {
    return STEPS.length;
  }

  static isLastStep(stepNumber: number): boolean {
    return stepNumber === STEPS.length;
  }

  static isFirstStep(stepNumber: number): boolean {
    return stepNumber === 1;
  }
}