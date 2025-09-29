'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface CountdownTimerProps {
  endTime: Date;
  onExpired?: () => void;
  onWarning?: (minutesRemaining: number) => void;
  showIcon?: boolean;
  className?: string;
  warningThreshold?: number; // Minutes before expiry to trigger warning
  size?: 'sm' | 'md' | 'lg';
}

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function CountdownTimer({
  endTime,
  onExpired,
  onWarning,
  showIcon = true,
  className = '',
  warningThreshold = 15,
  size = 'md'
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  });
  const [hasTriggeredWarning, setHasTriggeredWarning] = useState(false);

  const calculateTimeRemaining = (endTime: Date): TimeRemaining => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const difference = end - now;

    if (difference > 0) {
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return {
        hours,
        minutes,
        seconds,
        total: difference
      };
    }

    return { hours: 0, minutes: 0, seconds: 0, total: 0 };
  };

  useEffect(() => {
    // Initial calculation
    setTimeRemaining(calculateTimeRemaining(endTime));

    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining(endTime);
      setTimeRemaining(remaining);

      // Call onExpired only once when reaching zero
      if (remaining.total <= 0 && timeRemaining.total > 0 && onExpired) {
        onExpired();
      }

      // Trigger warning when threshold is reached
      const warningMs = warningThreshold * 60 * 1000;
      if (remaining.total <= warningMs && remaining.total > 0 && !hasTriggeredWarning && onWarning) {
        setHasTriggeredWarning(true);
        onWarning(Math.ceil(remaining.total / (1000 * 60)));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpired, timeRemaining.total]);

  const formatTime = (time: TimeRemaining) => {
    if (time.total <= 0) {
      return 'Expired';
    }

    if (time.hours > 0) {
      return `${time.hours}h ${time.minutes.toString().padStart(2, '0')}m`;
    } else if (time.minutes > 0) {
      return `${time.minutes}m ${time.seconds.toString().padStart(2, '0')}s`;
    } else {
      return `${time.seconds}s`;
    }
  };

  const getTimeColor = () => {
    if (timeRemaining.total <= 0) {
      return 'text-red-600';
    } else if (timeRemaining.total <= 15 * 60 * 1000) { // 15 minutes
      return 'text-orange-600';
    } else if (timeRemaining.total <= 30 * 60 * 1000) { // 30 minutes
      return 'text-yellow-600';
    } else {
      return 'text-green-600';
    }
  };

  const isExpiring = timeRemaining.total > 0 && timeRemaining.total <= warningThreshold * 60 * 1000;
  const isExpired = timeRemaining.total <= 0;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          icon: 'h-3 w-3',
          text: 'text-xs',
          spacing: 'space-x-1'
        };
      case 'lg':
        return {
          icon: 'h-6 w-6',
          text: 'text-lg',
          spacing: 'space-x-2'
        };
      default:
        return {
          icon: 'h-4 w-4',
          text: 'text-sm',
          spacing: 'space-x-1'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`flex items-center ${sizeClasses.spacing} ${className}`}>
      {showIcon && (
        <div className="flex-shrink-0">
          {isExpired || isExpiring ? (
            <AlertTriangle className={`${sizeClasses.icon} ${getTimeColor()}`} />
          ) : (
            <Clock className={`${sizeClasses.icon} ${getTimeColor()}`} />
          )}
        </div>
      )}
      <span className={`font-mono ${sizeClasses.text} font-medium ${getTimeColor()}`}>
        {formatTime(timeRemaining)}
      </span>
    </div>
  );
}

export function useTimeRemaining(endTime: Date) {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;
      setTimeRemaining(Math.max(0, difference));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return timeRemaining;
}