/**
 * Analytics and monitoring utilities
 * Provides hooks for tracking events, errors, and performance
 */

import { CACHE } from '@/lib/constants';

/**
 * Analytics event types
 */
export enum AnalyticsEvent {
  // Wallet events
  WALLET_CONNECTED = 'wallet_connected',
  WALLET_DISCONNECTED = 'wallet_disconnected',
  NETWORK_SWITCHED = 'network_switched',

  // NFT events
  NFT_MINTED = 'nft_minted',
  NFT_VIEWED = 'nft_viewed',
  NFT_LISTED = 'nft_listed',
  NFT_DELISTED = 'nft_delisted',
  NFT_PURCHASED = 'nft_purchased',

  // Page events
  PAGE_VIEW = 'page_view',
  MARKETPLACE_VIEWED = 'marketplace_viewed',
  PROFILE_VIEWED = 'profile_viewed',

  // Search/Filter events
  SEARCH_PERFORMED = 'search_performed',
  FILTER_APPLIED = 'filter_applied',

  // Error events
  ERROR_OCCURRED = 'error_occurred',
  TRANSACTION_FAILED = 'transaction_failed',
}

/**
 * Analytics event properties
 */
export interface AnalyticsEventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Track an analytics event
 * @param event - Event name
 * @param properties - Event properties
 */
export function trackEvent(event: AnalyticsEvent | string, properties?: AnalyticsEventProperties) {
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event, properties);
  }

  // TODO: Integrate with analytics service (e.g., Google Analytics, Mixpanel)
  // Example: gtag('event', event, properties);
  // Example: mixpanel.track(event, properties);
}

/**
 * Track page view
 * @param path - Page path
 * @param title - Page title
 */
export function trackPageView(path: string, title?: string) {
  trackEvent(AnalyticsEvent.PAGE_VIEW, {
    path,
    title: title || document.title,
    referrer: document.referrer,
  });
}

/**
 * Track error
 * @param error - Error object
 * @param context - Additional context
 */
export function trackError(error: Error, context?: Record<string, any>) {
  trackEvent(AnalyticsEvent.ERROR_OCCURRED, {
    error_message: error.message,
    error_stack: error.stack,
    ...context,
  });

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error Tracked]', error, context);
  }

  // TODO: Send to error tracking service (e.g., Sentry)
  // Example: Sentry.captureException(error, { extra: context });
}

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  /**
   * Start timing an operation
   * @param name - Operation name
   */
  start(name: string) {
    this.marks.set(name, performance.now());
  }

  /**
   * End timing an operation and log duration
   * @param name - Operation name
   * @returns Duration in milliseconds
   */
  end(name: string): number {
    const startTime = this.marks.get(name);

    if (!startTime) {
      console.warn(`Performance mark "${name}" not found`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(name);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    }

    // TODO: Send to analytics
    trackEvent('performance_metric', {
      operation: name,
      duration_ms: Math.round(duration),
    });

    return duration;
  }

  /**
   * Measure and track a function execution
   * @param name - Measurement name
   * @param fn - Function to measure
   * @returns Function result
   */
  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Web Vitals reporting
 * Tracks Core Web Vitals (LCP, FID, CLS)
 */
export function reportWebVitals(metric: any) {
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', metric.name, metric.value);
  }

  // Send to analytics
  trackEvent('web_vital', {
    metric_name: metric.name,
    metric_value: Math.round(metric.value),
    metric_id: metric.id,
    metric_rating: metric.rating,
  });

  // TODO: Send to analytics service
  // Example: gtag('event', metric.name, { value: Math.round(metric.value) });
}

/**
 * Track user interaction
 * @param element - Element type (button, link, etc.)
 * @param action - Action performed (click, hover, etc.)
 * @param label - Element label or identifier
 */
export function trackInteraction(element: string, action: string, label?: string) {
  trackEvent('user_interaction', {
    element,
    action,
    label,
  });
}

/**
 * Track transaction
 * @param type - Transaction type (mint, buy, list, etc.)
 * @param value - Transaction value in ETH
 * @param tokenId - Token ID (optional)
 */
export function trackTransaction(type: string, value: string, tokenId?: string) {
  trackEvent('transaction', {
    transaction_type: type,
    value_eth: value,
    token_id: tokenId,
  });
}

/**
 * Session tracking
 */
export class SessionTracker {
  private sessionStart: number;
  private pageViews: number = 0;
  private interactions: number = 0;

  constructor() {
    this.sessionStart = Date.now();
  }

  /**
   * Increment page view count
   */
  incrementPageViews() {
    this.pageViews++;
  }

  /**
   * Increment interaction count
   */
  incrementInteractions() {
    this.interactions++;
  }

  /**
   * Get session duration in seconds
   */
  getSessionDuration(): number {
    return Math.floor((Date.now() - this.sessionStart) / 1000);
  }

  /**
   * Get session stats
   */
  getSessionStats() {
    return {
      duration_seconds: this.getSessionDuration(),
      page_views: this.pageViews,
      interactions: this.interactions,
    };
  }

  /**
   * End session and report stats
   */
  endSession() {
    const stats = this.getSessionStats();
    trackEvent('session_end', stats);
    return stats;
  }
}

/**
 * Global session tracker instance
 */
export const sessionTracker = new SessionTracker();

/**
 * Initialize analytics
 * Call this in your app initialization
 */
export function initializeAnalytics() {
  // Track initial page view
  if (typeof window !== 'undefined') {
    trackPageView(window.location.pathname);

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        trackEvent('page_hidden');
      } else {
        trackEvent('page_visible');
      }
    });

    // Track session end on page unload
    window.addEventListener('beforeunload', () => {
      sessionTracker.endSession();
    });
  }
}
