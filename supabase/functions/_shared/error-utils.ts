// Sanitized error logging utility for edge functions
// Prevents stack trace exposure while maintaining useful debugging information

export interface ErrorLogContext {
  requestId: string;
  functionName: string;
  userId?: string;
  employeeId?: string;
  metadata?: Record<string, any>;
}

export interface SanitizedError {
  type: string;
  message: string;
  code?: string;
  requestId: string;
  timestamp: string;
}

/**
 * Sanitizes error for logging - removes stack traces and internal details
 */
export function sanitizeErrorForLogging(error: any, context: ErrorLogContext): SanitizedError {
  const sanitized: SanitizedError = {
    type: error.constructor?.name || 'Error',
    message: getSafeErrorMessage(error),
    requestId: context.requestId,
    timestamp: new Date().toISOString()
  };

  // Add error code if available
  if (error.code) {
    sanitized.code = error.code;
  }

  return sanitized;
}

/**
 * Gets a safe error message - removes sensitive information
 */
function getSafeErrorMessage(error: any): string {
  if (!error) return 'Unknown error occurred';
  
  const message = error.message || String(error);
  
  // Remove potentially sensitive information
  return message
    .replace(/\/[^\/\s]+\/[^\/\s]+\/[^\/\s]+/g, '/***/***/***') // Remove file paths
    .replace(/key_[a-zA-Z0-9]+/g, 'key_***') // Remove API keys
    .replace(/token_[a-zA-Z0-9]+/g, 'token_***') // Remove tokens
    .replace(/password[:\s]*[^\s]+/gi, 'password: ***') // Remove passwords
    .replace(/secret[:\s]*[^\s]+/gi, 'secret: ***') // Remove secrets
    .substring(0, 200); // Limit message length
}

/**
 * Logs error with sanitized information
 */
export function logSanitizedError(error: any, context: ErrorLogContext): void {
  const sanitized = sanitizeErrorForLogging(error, context);
  
  console.error(`[${context.functionName}] [${context.requestId}] Error:`, {
    type: sanitized.type,
    message: sanitized.message,
    code: sanitized.code,
    timestamp: sanitized.timestamp,
    metadata: context.metadata
  });
}

/**
 * Gets user-friendly error message for API responses
 */
export function getUserFriendlyErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred';
  
  const message = error.message || String(error);
  
  // Return user-friendly messages for common errors
  if (message.includes('OPENAI_API_KEY') || message.includes('API key')) {
    return 'Service is temporarily unavailable. Please contact support.';
  }
  
  if (message.includes('rate limit') || message.includes('429')) {
    return 'Too many requests. Please try again in a few moments.';
  }
  
  if (message.includes('timeout') || message.includes('TIMEOUT')) {
    return 'Request timed out. Please try again.';
  }
  
  if (message.includes('validation') || message.includes('invalid')) {
    return 'Invalid input provided. Please check your data.';
  }
  
  if (message.includes('unauthorized') || message.includes('401')) {
    return 'Authentication required. Please log in.';
  }
  
  if (message.includes('forbidden') || message.includes('403')) {
    return 'Access denied. You do not have permission to perform this action.';
  }
  
  if (message.includes('not found') || message.includes('404')) {
    return 'Requested resource not found.';
  }
  
  // For file upload errors, preserve some specific messages
  if (message.includes('Unsupported file type') || 
      message.includes('File too large') || 
      message.includes('CV text too short')) {
    return message;
  }
  
  // Default generic message
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Creates a sanitized error response for API endpoints
 */
export function createErrorResponse(
  error: any, 
  context: ErrorLogContext, 
  statusCode: number = 500
): Response {
  // Log the error with sanitized information
  logSanitizedError(error, context);
  
  // Create user-friendly response
  const userMessage = getUserFriendlyErrorMessage(error);
  
  const responseBody = {
    error: userMessage,
    request_id: context.requestId,
    timestamp: new Date().toISOString()
  };
  
  // Only include error details in development mode
  if (Deno.env.get('DEVELOPMENT') === 'true') {
    responseBody.details = getSafeErrorMessage(error);
  }
  
  return new Response(
    JSON.stringify(responseBody),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    }
  );
}

/**
 * Determines appropriate HTTP status code based on error type
 */
export function getErrorStatusCode(error: any): number {
  if (!error) return 500;
  
  const message = error.message || String(error);
  
  if (message.includes('OPENAI_API_KEY') || message.includes('API key')) {
    return 503; // Service Unavailable
  }
  
  if (message.includes('rate limit') || message.includes('429')) {
    return 429; // Too Many Requests
  }
  
  if (message.includes('timeout')) {
    return 504; // Gateway Timeout
  }
  
  if (message.includes('validation') || message.includes('invalid') || 
      message.includes('CV text too short') || message.includes('Unsupported file type')) {
    return 400; // Bad Request
  }
  
  if (message.includes('unauthorized') || message.includes('401')) {
    return 401; // Unauthorized
  }
  
  if (message.includes('forbidden') || message.includes('403')) {
    return 403; // Forbidden
  }
  
  if (message.includes('not found') || message.includes('404')) {
    return 404; // Not Found
  }
  
  return 500; // Internal Server Error
}