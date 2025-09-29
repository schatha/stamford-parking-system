export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  // Create a live region for screen readers
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);

  // Focus first element
  firstElement?.focus();

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}

export function generateAriaLabel(
  baseText: string,
  context?: {
    status?: string;
    timeRemaining?: string;
    cost?: string;
    zone?: string;
  }
): string {
  let ariaLabel = baseText;

  if (context?.status) {
    ariaLabel += `, status: ${context.status}`;
  }

  if (context?.timeRemaining) {
    ariaLabel += `, ${context.timeRemaining} remaining`;
  }

  if (context?.cost) {
    ariaLabel += `, cost: ${context.cost}`;
  }

  if (context?.zone) {
    ariaLabel += `, in ${context.zone}`;
  }

  return ariaLabel;
}

export function getColorContrastRatio(color1: string, color2: string): number {
  // Simplified contrast ratio calculation
  // For production, use a more comprehensive color contrast library
  const getLuminance = (color: string): number => {
    // Simple luminance calculation for hex colors
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;

      const sRGB = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    }
    return 0.5; // Default luminance
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

export function isHighContrast(): boolean {
  // Check if user prefers high contrast
  return window.matchMedia('(prefers-contrast: high)').matches;
}

export function isReducedMotion(): boolean {
  // Check if user prefers reduced motion
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function formatForScreenReader(text: string): string {
  // Format text for better screen reader pronunciation
  return text
    .replace(/\$/g, 'dollars')
    .replace(/&/g, 'and')
    .replace(/\//g, 'slash')
    .replace(/\d{3}-\d{3}-\d{4}/g, (phone) => {
      // Format phone numbers
      return phone.replace(/(\d{3})-(\d{3})-(\d{4})/, '$1 $2 $3');
    })
    .replace(/([A-Z]{2,3})\s?(\d{2,4})/g, (license) => {
      // Format license plates
      return license.split('').join(' ');
    });
}

export const keyboardNavigation = {
  // Common keyboard event handlers
  handleEnterSpace: (callback: () => void) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  },

  handleEscape: (callback: () => void) => (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      callback();
    }
  },

  handleArrowKeys: (callbacks: {
    up?: () => void;
    down?: () => void;
    left?: () => void;
    right?: () => void;
  }) => (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        callbacks.up?.();
        break;
      case 'ArrowDown':
        e.preventDefault();
        callbacks.down?.();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        callbacks.left?.();
        break;
      case 'ArrowRight':
        e.preventDefault();
        callbacks.right?.();
        break;
    }
  }
};