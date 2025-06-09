'use client';

import { useEffect } from 'react';
import { useAnalytics } from '@/components/FirebaseAnalyticsProvider';

export default function PerformanceTracker() {
  const analytics = useAnalytics();

  useEffect(() => {
    // Track page load performance
    const trackPageLoadPerformance = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          // Track various performance metrics
          analytics.trackPerformance('page_load_time', navigation.loadEventEnd - navigation.fetchStart, 'ms');
          analytics.trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart, 'ms');
          analytics.trackPerformance('first_paint', navigation.responseEnd - navigation.requestStart, 'ms');
          
          // Track network timing
          analytics.trackPerformance('dns_lookup_time', navigation.domainLookupEnd - navigation.domainLookupStart, 'ms');
          analytics.trackPerformance('tcp_connection_time', navigation.connectEnd - navigation.connectStart, 'ms');
          analytics.trackPerformance('server_response_time', navigation.responseEnd - navigation.requestStart, 'ms');
        }
      }
    };

    // Track Core Web Vitals
    const trackWebVitals = () => {
      if (typeof window !== 'undefined') {
        // Track Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          analytics.trackPerformance('largest_contentful_paint', lastEntry.startTime, 'ms');
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Track First Input Delay (FID)
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry: any) => {
            analytics.trackPerformance('first_input_delay', entry.processingStart - entry.startTime, 'ms');
          });
        }).observe({ entryTypes: ['first-input'] });

        // Track Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          analytics.trackPerformance('cumulative_layout_shift', clsValue, 'score');
        }).observe({ entryTypes: ['layout-shift'] });
      }
    };

    // Track resource loading performance
    const trackResourcePerformance = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const resources = performance.getEntriesByType('resource');
        
        // Group resources by type
        const resourceTypes: Record<string, number[]> = {};
        
        resources.forEach((resource: any) => {
          const type = resource.initiatorType || 'other';
          if (!resourceTypes[type]) {
            resourceTypes[type] = [];
          }
          resourceTypes[type].push(resource.duration);
        });

        // Track average load times by resource type
        Object.entries(resourceTypes).forEach(([type, durations]) => {
          const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
          analytics.trackPerformance(`${type}_avg_load_time`, avgDuration, 'ms');
          analytics.trackPerformance(`${type}_resource_count`, durations.length, 'count');
        });
      }
    };

    // Track memory usage (if available)
    const trackMemoryUsage = () => {
      if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (performance as any)) {
        const memory = (performance as any).memory;
        analytics.trackPerformance('js_heap_size_used', memory.usedJSHeapSize, 'bytes');
        analytics.trackPerformance('js_heap_size_total', memory.totalJSHeapSize, 'bytes');
        analytics.trackPerformance('js_heap_size_limit', memory.jsHeapSizeLimit, 'bytes');
      }
    };

    // Track connection information
    const trackConnectionInfo = () => {
      if (typeof window !== 'undefined' && 'navigator' in window && 'connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          analytics.trackEvent('connection_info', {
            effective_type: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            save_data: connection.saveData
          });
        }
      }
    };

    // Run performance tracking after page load
    const timeoutId = setTimeout(() => {
      trackPageLoadPerformance();
      trackResourcePerformance();
      trackMemoryUsage();
      trackConnectionInfo();
    }, 1000);

    // Start tracking web vitals immediately
    trackWebVitals();

    // Track performance periodically
    const intervalId = setInterval(() => {
      trackMemoryUsage();
    }, 30000); // Every 30 seconds

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [analytics]);

  // Track API response times
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      
      window.fetch = async (...args) => {
        const startTime = performance.now();
        const url = typeof args[0] === 'string' ? args[0] : args[0] instanceof URL ? args[0].href : args[0].url;
        
        try {
          const response = await originalFetch(...args);
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          // Track API response time
          analytics.trackPerformance('api_response_time', duration, 'ms');
          analytics.trackEvent('api_call', {
            url: url,
            method: args[1]?.method || 'GET',
            status: response.status,
            duration: duration,
            success: response.ok
          });
          
          return response;
        } catch (error) {
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          analytics.trackEvent('api_error', {
            url: url,
            method: args[1]?.method || 'GET',
            duration: duration,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          
          throw error;
        }
      };

      return () => {
        window.fetch = originalFetch;
      };
    }
  }, [analytics]);

  return null; // This component doesn't render anything
} 