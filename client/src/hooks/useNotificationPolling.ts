import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  NotificationPollingOptions,
  NotificationPollingResult,
  NotificationItem,
  NotificationResponse,
} from '../types/dashboard-ux';

/**
 * Hook that polls GET /api/notifications at a configurable interval.
 *
 * Features:
 * - Pauses polling when the browser tab is hidden (Page Visibility API)
 * - Immediately polls and resumes on tab becoming visible
 * - Exponential backoff on failure: min(baseInterval * 2^retryCount, maxInterval)
 * - Stops polling after maxRetries consecutive failures
 * - Resets interval and retry counter on success
 * - Stops polling and calls onAuthError on 401
 */
export function useNotificationPolling(
  options: NotificationPollingOptions
): NotificationPollingResult {
  const {
    baseInterval = 60000,
    maxInterval = 300000,
    maxRetries = 5,
    onAuthError,
  } = options;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [count, setCount] = useState<number>(0);
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const retryCountRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stoppedRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  // Keep latest options in refs so callbacks never go stale
  const onAuthErrorRef = useRef(onAuthError);
  onAuthErrorRef.current = onAuthError;
  const baseIntervalRef = useRef(baseInterval);
  baseIntervalRef.current = baseInterval;
  const maxIntervalRef = useRef(maxInterval);
  maxIntervalRef.current = maxInterval;
  const maxRetriesRef = useRef(maxRetries);
  maxRetriesRef.current = maxRetries;

  // Ref to hold the poll function so scheduleNext can call it without circular deps
  const pollRef = useRef<() => void>(() => {});

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const getNextInterval = useCallback((): number => {
    const retries = retryCountRef.current;
    if (retries === 0) return baseIntervalRef.current;
    const backoff = baseIntervalRef.current * Math.pow(2, retries);
    return Math.min(backoff, maxIntervalRef.current);
  }, []);

  const scheduleNext = useCallback(() => {
    clearTimer();
    if (stoppedRef.current || !mountedRef.current) return;
    const interval = getNextInterval();
    timerRef.current = setTimeout(() => {
      pollRef.current();
    }, interval);
  }, [clearTimer, getNextInterval]);

  const poll = useCallback(async () => {
    if (stoppedRef.current || !mountedRef.current) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/notifications', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!mountedRef.current) return;

      if (res.status === 401) {
        // Auth error — stop polling and notify
        stoppedRef.current = true;
        setIsPolling(false);
        setError('Unauthorized');
        onAuthErrorRef.current();
        return;
      }

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);
      }

      const data: NotificationResponse = await res.json();

      if (!mountedRef.current) return;

      // Success — update state and reset retry counter
      setNotifications(data.notifications);
      setCount(data.count);
      setError(null);
      retryCountRef.current = 0;
      setIsPolling(true);

      // Schedule next poll at base interval
      scheduleNext();
    } catch (err) {
      if (!mountedRef.current) return;

      retryCountRef.current += 1;
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);

      if (retryCountRef.current >= maxRetriesRef.current) {
        // Max retries reached — stop polling
        stoppedRef.current = true;
        setIsPolling(false);
        return;
      }

      // Schedule next poll with backoff
      setIsPolling(true);
      scheduleNext();
    }
  }, [scheduleNext]);

  // Keep pollRef in sync
  pollRef.current = poll;

  // Visibility change handler
  const handleVisibilityChange = useCallback(() => {
    if (stoppedRef.current || !mountedRef.current) return;

    if (document.hidden) {
      // Tab hidden — pause polling
      clearTimer();
      setIsPolling(false);
    } else {
      // Tab visible — immediate poll + resume
      setIsPolling(true);
      pollRef.current();
    }
  }, [clearTimer]);

  useEffect(() => {
    mountedRef.current = true;
    stoppedRef.current = false;
    retryCountRef.current = 0;

    // Initial poll
    pollRef.current();

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mountedRef.current = false;
      clearTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange, clearTimer]);

  return { notifications, count, isPolling, error };
}
