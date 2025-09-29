/**
 * Test Setup File for BurnBlack Platform
 * 
 * This file configures the testing environment and sets up global mocks
 */

import { vi } from 'vitest';
import '@testing-library/jest-dom';

// =====================================================
// GLOBAL MOCKS
// =====================================================

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
});

// Mock URL.createObjectURL and URL.revokeObjectURL
Object.defineProperty(window.URL, 'createObjectURL', {
  value: vi.fn(() => 'mock-url'),
});

Object.defineProperty(window.URL, 'revokeObjectURL', {
  value: vi.fn(),
});

// Mock document.createElement
const originalCreateElement = document.createElement;
document.createElement = vi.fn((tagName) => {
  const element = originalCreateElement.call(document, tagName);
  
  if (tagName === 'a') {
    element.click = vi.fn();
    element.href = '';
    element.download = '';
  }
  
  return element;
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
    blob: () => Promise.resolve(new Blob(['mock data'])),
    text: () => Promise.resolve('mock text'),
  })
);

// Mock window.confirm
window.confirm = vi.fn(() => true);

// Mock window.alert
window.alert = vi.fn();

// Mock window.open
window.open = vi.fn();

// Mock performance.now
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
  },
});

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid-1234-5678-9abc-def012345678'),
  },
});

// =====================================================
// CONSOLE MOCKING
// =====================================================

// Suppress console warnings in tests unless explicitly testing them
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeEach(() => {
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterEach(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

// =====================================================
// CLEANUP
// =====================================================

afterEach(() => {
  // Clear all mocks after each test
  vi.clearAllMocks();
  
  // Clear localStorage and sessionStorage
  localStorageMock.clear();
  sessionStorageMock.clear();
  
  // Reset DOM
  document.body.innerHTML = '';
});

// =====================================================
// CUSTOM MATCHERS
// =====================================================

// Add custom matchers for better test assertions
expect.extend({
  toBeInTheDocument(received) {
    const pass = received && received.ownerDocument && received.ownerDocument.body.contains(received);
    return {
      pass,
      message: () => `Expected element ${pass ? 'not ' : ''}to be in the document`,
    };
  },
  
  toHaveClass(received, className) {
    const pass = received && received.classList && received.classList.contains(className);
    return {
      pass,
      message: () => `Expected element ${pass ? 'not ' : ''}to have class "${className}"`,
    };
  },
  
  toHaveAttribute(received, attribute, value) {
    const hasAttribute = received && received.hasAttribute(attribute);
    const attributeValue = received && received.getAttribute(attribute);
    const pass = hasAttribute && (value === undefined || attributeValue === value);
    
    return {
      pass,
      message: () => {
        if (!hasAttribute) {
          return `Expected element to have attribute "${attribute}"`;
        }
        if (value !== undefined && attributeValue !== value) {
          return `Expected element to have attribute "${attribute}" with value "${value}", but got "${attributeValue}"`;
        }
        return `Expected element not to have attribute "${attribute}"`;
      },
    };
  },
});

// =====================================================
// TEST UTILITIES
// =====================================================

// Global test utilities
global.testUtils = {
  // Wait for async operations
  waitFor: (fn, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const check = () => {
        try {
          const result = fn();
          if (result) {
            resolve(result);
          } else if (Date.now() - startTime > timeout) {
            reject(new Error(`Timeout after ${timeout}ms`));
          } else {
            setTimeout(check, 100);
          }
        } catch (error) {
          if (Date.now() - startTime > timeout) {
            reject(error);
          } else {
            setTimeout(check, 100);
          }
        }
      };
      
      check();
    });
  },
  
  // Mock API responses
  mockApiResponse: (endpoint, response) => {
    global.fetch.mockImplementation((url) => {
      if (url.includes(endpoint)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(response),
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' }),
      });
    });
  },
  
  // Mock API errors
  mockApiError: (endpoint, error) => {
    global.fetch.mockImplementation((url) => {
      if (url.includes(endpoint)) {
        return Promise.reject(error);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });
  },
  
  // Create mock file
  createMockFile: (name = 'test.pdf', type = 'application/pdf', size = 1024) => {
    const file = new File(['test content'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  },
  
  // Mock date
  mockDate: (dateString) => {
    const mockDate = new Date(dateString);
    vi.setSystemTime(mockDate);
    return mockDate;
  },
  
  // Restore date
  restoreDate: () => {
    vi.useRealTimers();
  },
};

// =====================================================
// PERFORMANCE TESTING
// =====================================================

// Mock performance observer for performance tests
global.PerformanceObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(() => []),
}));

// Mock performance marks and measures
global.performance.mark = vi.fn();
global.performance.measure = vi.fn();
global.performance.getEntriesByType = vi.fn(() => []);
global.performance.getEntriesByName = vi.fn(() => []);

// =====================================================
// ACCESSIBILITY TESTING
// =====================================================

// Mock accessibility testing utilities
global.a11yTestUtils = {
  // Check if element is focusable
  isFocusable: (element) => {
    if (!element) return false;
    
    const focusableElements = [
      'button', 'input', 'select', 'textarea', 'a[href]', '[tabindex]'
    ];
    
    return focusableElements.some(selector => element.matches(selector));
  },
  
  // Check ARIA attributes
  getAriaAttributes: (element) => {
    if (!element) return {};
    
    const ariaAttributes = {};
    for (const attr of element.attributes) {
      if (attr.name.startsWith('aria-')) {
        ariaAttributes[attr.name] = attr.value;
      }
    }
    return ariaAttributes;
  },
  
  // Check color contrast (simplified)
  checkColorContrast: (element) => {
    if (!element) return { hasContrast: false };
    
    const styles = window.getComputedStyle(element);
    const backgroundColor = styles.backgroundColor;
    const color = styles.color;
    
    return {
      backgroundColor,
      color,
      hasContrast: backgroundColor !== color
    };
  }
};

// =====================================================
// ERROR BOUNDARY TESTING
// =====================================================

// Mock error boundary for testing error handling
global.MockErrorBoundary = ({ children, onError }) => {
  try {
    return children;
  } catch (error) {
    onError?.(error);
    return null;
  }
};

// =====================================================
// EXPORT FOR USE IN TESTS
// =====================================================

export {
  localStorageMock,
  sessionStorageMock,
};
