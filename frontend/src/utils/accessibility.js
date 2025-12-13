// =====================================================
// ACCESSIBILITY UTILITIES
// Helper functions for ARIA labels, keyboard navigation, and focus management
// =====================================================

/**
 * Generate ARIA label for form fields
 */
export const getAriaLabel = (label, required = false, error = null) => {
  let ariaLabel = label;
  if (required) {
    ariaLabel += ' (required)';
  }
  if (error) {
    ariaLabel += `, error: ${error}`;
  }
  return ariaLabel;
};

/**
 * Generate ARIA described by for form fields with help text
 */
export const getAriaDescribedBy = (fieldId, helpText = null, error = null) => {
  const ids = [];
  if (helpText) {
    ids.push(`${fieldId}-help`);
  }
  if (error) {
    ids.push(`${fieldId}-error`);
  }
  return ids.length > 0 ? ids.join(' ') : undefined;
};

/**
 * Handle keyboard navigation for interactive elements
 */
export const handleKeyboardNavigation = (event, actions) => {
  const { key, target } = event;

  switch (key) {
    case 'Enter':
    case ' ':
      if (actions.onActivate) {
        event.preventDefault();
        actions.onActivate();
      }
      break;
    case 'Escape':
      if (actions.onEscape) {
        event.preventDefault();
        actions.onEscape();
      }
      break;
    case 'ArrowDown':
      if (actions.onArrowDown) {
        event.preventDefault();
        actions.onArrowDown();
      }
      break;
    case 'ArrowUp':
      if (actions.onArrowUp) {
        event.preventDefault();
        actions.onArrowUp();
      }
      break;
    case 'Tab':
      if (actions.onTab) {
        actions.onTab();
      }
      break;
    default:
      break;
  }
};

/**
 * Trap focus within a container (for modals, dropdowns)
 */
export const trapFocus = (containerRef, firstFocusable, lastFocusable) => {
  const handleTabKey = (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  };

  containerRef.current?.addEventListener('keydown', handleTabKey);

  return () => {
    containerRef.current?.removeEventListener('keydown', handleTabKey);
  };
};

/**
 * Get all focusable elements within a container
 */
export const getFocusableElements = (container) => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors));
};

/**
 * Restore focus to previously focused element
 */
export const restoreFocus = (previousElement) => {
  if (previousElement && typeof previousElement.focus === 'function') {
    previousElement.focus();
  }
};

/**
 * Announce to screen readers
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Check if color contrast meets WCAG AA standards
 */
export const checkColorContrast = (foreground, background) => {
  // Simplified contrast check - in production, use a proper library
  // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
  // This is a placeholder - implement proper contrast calculation
  return true;
};

/**
 * Skip link component helper
 */
export const createSkipLink = (targetId, label = 'Skip to main content') => {
  return {
    href: `#${targetId}`,
    label,
    className: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded',
  };
};

/**
 * Generate unique ID for form fields
 */
export const generateFieldId = (name, prefix = 'field') => {
  return `${prefix}-${name}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if element is visible to screen readers
 */
export const isVisibleToScreenReader = (element) => {
  if (!element) return false;

  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();

  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    rect.width > 0 &&
    rect.height > 0
  );
};

export default {
  getAriaLabel,
  getAriaDescribedBy,
  handleKeyboardNavigation,
  trapFocus,
  getFocusableElements,
  restoreFocus,
  announceToScreenReader,
  checkColorContrast,
  createSkipLink,
  generateFieldId,
  isVisibleToScreenReader,
};

