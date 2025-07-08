/**
 * Centralized Debug and Logging System
 * 
 * This system provides:
 * - Debug logs that are automatically disabled in production
 * - Essential error logging that works in all environments
 * - Structured logging with context
 * - Performance timing utilities
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  component?: string
  userId?: string
  action?: string
  data?: any
}

class DebugLogger {
  private isDevelopment: boolean
  private isEnabled: boolean

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.isEnabled = this.isDevelopment && process.env.NEXT_PUBLIC_DEBUG_ENABLED !== 'false'
  }

  /**
   * Debug logs - only shown in development
   */
  debug(message: string, context?: LogContext) {
    if (!this.isEnabled) return
    
    const prefix = context?.component ? `[${context.component}]` : '[Debug]'
    console.log(`${prefix} ${message}`, context?.data || '')
  }

  /**
   * Info logs - only shown in development
   */
  info(message: string, context?: LogContext) {
    if (!this.isEnabled) return
    
    const prefix = context?.component ? `[${context.component}]` : '[Info]'
    console.info(`${prefix} ${message}`, context?.data || '')
  }

  /**
   * Warning logs - shown in all environments
   */
  warn(message: string, context?: LogContext) {
    const prefix = context?.component ? `[${context.component}]` : '[Warning]'
    console.warn(`${prefix} ${message}`, context?.data || '')
  }

  /**
   * Error logs - shown in all environments
   */
  error(message: string, error?: any, context?: LogContext) {
    const prefix = context?.component ? `[${context.component}]` : '[Error]'
    console.error(`${prefix} ${message}`, error)
    
    // In production, you might want to send errors to a logging service
    if (!this.isDevelopment) {
      // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    }
  }

  /**
   * Performance timing utilities
   */
  time(label: string) {
    if (!this.isEnabled) return
    console.time(label)
  }

  timeEnd(label: string) {
    if (!this.isEnabled) return
    console.timeEnd(label)
  }

  /**
   * Group logs together
   */
  group(label: string) {
    if (!this.isEnabled) return
    console.group(label)
  }

  groupEnd() {
    if (!this.isEnabled) return
    console.groupEnd()
  }

  /**
   * Table display for object arrays
   */
  table(data: any) {
    if (!this.isEnabled) return
    console.table(data)
  }
}

// Singleton instance
export const logger = new DebugLogger()

// Convenience functions for common use cases
export const debug = {
  // Theme system
  theme: (message: string, data?: any) => 
    logger.debug(message, { component: 'Theme System', data }),
  
  // Database operations
  db: (message: string, data?: any) => 
    logger.debug(message, { component: 'Database', data }),
  
  // API calls
  api: (message: string, data?: any) => 
    logger.debug(message, { component: 'API', data }),
  
  // Realtime subscriptions
  realtime: (message: string, data?: any) => 
    logger.debug(message, { component: 'Realtime', data }),
  
  // Authentication
  auth: (message: string, data?: any) => 
    logger.debug(message, { component: 'Auth', data }),
  
  // Canvas operations
  canvas: (message: string, data?: any) => 
    logger.debug(message, { component: 'Canvas', data }),
  
  // Social links
  socialLinks: (message: string, data?: any) => 
    logger.debug(message, { component: 'SocialLinks', data }),
  
  // Admin operations
  admin: (message: string, data?: any) => 
    logger.debug(message, { component: 'Admin', data }),
  
  // Performance monitoring
  perf: (message: string, data?: any) => 
    logger.debug(message, { component: 'Performance', data }),
  
  // Dashboard
  dashboard: (message: string, data?: any) => 
    logger.debug(message, { component: 'Dashboard', data }),
}

// Essential error logging that works in all environments
export const logError = (message: string, error?: any, context?: LogContext) => {
  logger.error(message, error, context)
}

// Warning logging for important but non-critical issues
export const logWarning = (message: string, context?: LogContext) => {
  logger.warn(message, context)
}

// Performance monitoring helpers
export const perfStart = (label: string) => logger.time(label)
export const perfEnd = (label: string) => logger.timeEnd(label)

export default logger 