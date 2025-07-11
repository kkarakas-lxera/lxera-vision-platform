// This file now acts as a compatibility layer for components still using the old toast API
// It redirects all toast calls to Sonner which is the active toast system

import { toast as sonnerToast } from 'sonner';
import type { ToastActionElement } from "@/components/ui/toast"

interface ToastOptions {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: 'default' | 'destructive';
}

// Convert old toast API to Sonner
function toast(options: ToastOptions) {
  const { title, description, variant } = options;
  const message = title ? String(title) : '';
  const descriptionText = description ? String(description) : '';
  
  if (variant === 'destructive') {
    sonnerToast.error(message, {
      description: descriptionText,
    });
  } else {
    sonnerToast.success(message, {
      description: descriptionText,
    });
  }
  
  return {
    id: Math.random().toString(36),
    dismiss: () => sonnerToast.dismiss(),
    update: () => {} // Sonner handles updates differently
  };
}

// Hook for backward compatibility
function useToast() {
  return {
    toast,
    toasts: [], // Not used with Sonner
    dismiss: () => sonnerToast.dismiss(),
  };
}

// Helper functions for common patterns
const toastError = (message: string, description?: string) => {
  sonnerToast.error(message, { description });
};

const toastSuccess = (message: string, description?: string) => {
  sonnerToast.success(message, { description });
};

const toastInfo = (message: string, description?: string) => {
  sonnerToast.info(message, { description });
};

const toastLoading = (message: string) => {
  return sonnerToast.loading(message);
};

export { useToast, toast, toastError, toastSuccess, toastInfo, toastLoading }