/**
 * Secure logging utility for production applications
 * Prevents sensitive data from being logged while maintaining error visibility
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn', 
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogContext {
  userId?: string;
  companyId?: string;
  component?: string;
  action?: string;
  requestId?: string;
  [key: string]: any;
}

class SecureLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Log error messages - always enabled in production for debugging
   */
  error(message: string, context?: LogContext): void {
    const sanitizedContext = this.sanitizeContext(context);
    console.error(`[ERROR] ${message}`, sanitizedContext);
  }

  /**
   * Log warning messages - enabled in production for monitoring  
   */
  warn(message: string, context?: LogContext): void {
    const sanitizedContext = this.sanitizeContext(context);
    console.warn(`[WARN] ${message}`, sanitizedContext);
  }

  /**
   * Log info messages - only in development to prevent info leakage
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const sanitizedContext = this.sanitizeContext(context);
      console.info(`[INFO] ${message}`, sanitizedContext);
    }
  }

  /**
   * Log debug messages - only in development
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const sanitizedContext = this.sanitizeContext(context);
      console.log(`[DEBUG] ${message}`, sanitizedContext);
    }
  }

  /**
   * Remove sensitive information from log context
   */
  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;

    const sanitized = { ...context };
    
    // Remove sensitive fields
    const sensitiveFields = [
      'password', 'token', 'apiKey', 'secret', 'auth', 'session',
      'email', 'phone', 'ssn', 'creditCard', 'personalData'
    ];

    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });

    // Sanitize nested objects
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeNestedObject(sanitized[key]);
      }
    });

    return sanitized;
  }

  private sanitizeNestedObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeNestedObject(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const sanitized = { ...obj };
      const sensitiveFields = [
        'password', 'token', 'apiKey', 'secret', 'auth', 'session',
        'email', 'phone', 'ssn', 'creditCard', 'personalData'
      ];

      sensitiveFields.forEach(field => {
        if (field in sanitized) {
          sanitized[field] = '[REDACTED]';
        }
      });

      return sanitized;
    }

    return obj;
  }
}

// Export singleton instance
export const logger = new SecureLogger();

// Export convenience functions
export const logError = (message: string, context?: LogContext) => logger.error(message, context);
export const logWarn = (message: string, context?: LogContext) => logger.warn(message, context);
export const logInfo = (message: string, context?: LogContext) => logger.info(message, context);
export const logDebug = (message: string, context?: LogContext) => logger.debug(message, context);