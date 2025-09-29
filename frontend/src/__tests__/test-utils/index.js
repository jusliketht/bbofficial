/**
 * Test Utilities and Mock Data for BurnBlack Platform Tests
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// =====================================================
// MOCK API CLIENT
// =====================================================

export const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn()
};

// =====================================================
// MOCK USER DATA
// =====================================================

export const mockUserData = {
  user: {
    id: 'user-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91-9876543210',
    isVerified: true,
    panNumber: 'ABCDE1234F',
    profileCompletionPercentage: 85,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },

  financial: {
    id: 'financial-123',
    assessmentYear: '2024-25',
    totalIncome: 750000,
    taxableIncome: 600000,
    taxLiability: 75000,
    refundAmount: 15000,
    totalDeductions: 150000,
    tdsDeducted: 60000,
    filingStatus: 'draft',
    itrFormType: 'ITR-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },

  familyMembers: [
    {
      id: 'family-1',
      firstName: 'Jane',
      lastName: 'Doe',
      relationship: 'spouse',
      panNumber: 'FGHIJ5678K',
      dateOfBirth: '1985-06-15',
      isDependent: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'family-2',
      firstName: 'Alice',
      lastName: 'Doe',
      relationship: 'child',
      dateOfBirth: '2010-03-20',
      isDependent: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    }
  ],

  notifications: [
    {
      id: 'notification-1',
      title: 'ITR Filing Deadline Approaching',
      message: 'Your ITR filing deadline is in 15 days. Please complete your filing soon.',
      type: 'deadline',
      priority: 'high',
      isRead: false,
      actionUrl: '/dashboard/filing',
      actionText: 'Start Filing',
      createdAt: '2024-01-10T09:00:00Z'
    },
    {
      id: 'notification-2',
      title: 'Form 16 Uploaded',
      message: 'Your Form 16 has been successfully uploaded and processed.',
      type: 'filing',
      priority: 'normal',
      isRead: true,
      createdAt: '2024-01-08T14:30:00Z'
    },
    {
      id: 'notification-3',
      title: 'Refund Processed',
      message: 'Your tax refund of ₹15,000 has been processed and will be credited within 7-10 business days.',
      type: 'payment',
      priority: 'normal',
      isRead: false,
      createdAt: '2024-01-12T11:15:00Z'
    }
  ],

  deadlines: [
    {
      id: 'deadline-1',
      title: 'ITR Filing Deadline',
      description: 'Last date to file Income Tax Return for AY 2024-25',
      deadlineDate: '2024-07-31',
      deadlineType: 'ITR Filing',
      status: 'pending',
      priority: 'urgent',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'deadline-2',
      title: 'Advance Tax Payment',
      description: 'First installment of advance tax for FY 2024-25',
      deadlineDate: '2024-06-15',
      deadlineType: 'Advance Tax',
      status: 'pending',
      priority: 'high',
      createdAt: '2024-01-01T00:00:00Z'
    }
  ],

  serviceTickets: [
    {
      id: 'ticket-1',
      ticketNumber: 'TK20240115001',
      subject: 'Unable to upload Form 16',
      description: 'I am getting an error when trying to upload my Form 16. The file is in PDF format and under 5MB.',
      category: 'technical',
      priority: 'high',
      status: 'open',
      assignedTo: null,
      rating: null,
      feedback: null,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'ticket-2',
      ticketNumber: 'TK20240114002',
      subject: 'Question about HRA deduction',
      description: 'How much HRA deduction can I claim? I pay rent of ₹25,000 per month.',
      category: 'filing',
      priority: 'normal',
      status: 'resolved',
      assignedTo: 'agent-123',
      rating: 5,
      feedback: 'Very helpful response, thank you!',
      createdAt: '2024-01-14T15:30:00Z',
      updatedAt: '2024-01-15T09:00:00Z',
      resolvedAt: '2024-01-15T09:00:00Z'
    }
  ],

  stats: {
    unreadNotificationsCount: 2,
    pendingDeadlinesCount: 2,
    openTicketsCount: 1,
    familyMembersCount: 2,
    profileCompletionPercentage: 85
  },

  analytics: {
    totalIncome: 750000,
    taxableIncome: 600000,
    taxLiability: 75000,
    refundAmount: 15000,
    totalDeductions: 150000,
    maxPossibleDeductions: 150000,
    effectiveTaxRate: 12.5,
    deductionUtilization: 100.0,
    incomeGrowthPercentage: 15.2,
    refundEfficiencyScore: 92.5
  },

  draft: {
    id: 'draft-1',
    formType: 'ITR-1',
    assessmentYear: '2024-25',
    versionNumber: 3,
    data: {
      personalInfo: {
        name: 'John Doe',
        pan: 'ABCDE1234F',
        dateOfBirth: '1980-01-01',
        gender: 'male'
      },
      income: {
        salary: 750000,
        otherIncome: 0
      },
      deductions: {
        section80C: 150000,
        section80D: 25000,
        standardDeduction: 50000
      }
    },
    isAutoSave: false,
    isCurrent: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  }
};

// =====================================================
// TEST WRAPPER COMPONENT
// =====================================================

export const TestWrapper = ({ children, queryClient }) => {
  const defaultQueryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient || defaultQueryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// =====================================================
// MOCK FUNCTIONS
// =====================================================

export const mockFunctions = {
  // Mock localStorage
  localStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },

  // Mock sessionStorage
  sessionStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },

  // Mock window methods
  window: {
    confirm: vi.fn(() => true),
    alert: vi.fn(),
    open: vi.fn(),
    URL: {
      createObjectURL: vi.fn(() => 'mock-url'),
      revokeObjectURL: vi.fn()
    }
  },

  // Mock document methods
  document: {
    createElement: vi.fn(() => ({
      click: vi.fn(),
      href: '',
      download: ''
    })),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  },

  // Mock fetch
  fetch: vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
      blob: () => Promise.resolve(new Blob(['mock data']))
    })
  ),

  // Mock IntersectionObserver
  IntersectionObserver: vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  })),

  // Mock ResizeObserver
  ResizeObserver: vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }))
};

// =====================================================
// TEST HELPERS
// =====================================================

export const testHelpers = {
  // Wait for element to appear
  waitForElement: async (selector, timeout = 5000) => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(`Element ${selector} not found within ${timeout}ms`);
  },

  // Mock API response
  mockApiResponse: (endpoint, response) => {
    mockApiClient.get.mockImplementation((url) => {
      if (url.includes(endpoint)) {
        return Promise.resolve({ data: response });
      }
      return Promise.reject(new Error('Endpoint not mocked'));
    });
  },

  // Mock API error
  mockApiError: (endpoint, error) => {
    mockApiClient.get.mockImplementation((url) => {
      if (url.includes(endpoint)) {
        return Promise.reject(error);
      }
      return Promise.resolve({ data: { success: true } });
    });
  },

  // Create mock user event
  createMockUserEvent: () => ({
    click: vi.fn(),
    hover: vi.fn(),
    type: vi.fn(),
    select: vi.fn(),
    clear: vi.fn()
  }),

  // Mock file upload
  createMockFile: (name = 'test.pdf', type = 'application/pdf', size = 1024) => {
    const file = new File(['test content'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  },

  // Mock form data
  createMockFormData: (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return formData;
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

  // Mock timer
  mockTimer: () => {
    vi.useFakeTimers();
  },

  // Advance timer
  advanceTimer: (ms) => {
    vi.advanceTimersByTime(ms);
  },

  // Run all timers
  runAllTimers: () => {
    vi.runAllTimers();
  }
};

// =====================================================
// TEST CONSTANTS
// =====================================================

export const testConstants = {
  // API endpoints
  endpoints: {
    USER_PROFILE: '/user-dashboard/profile',
    FAMILY_MEMBERS: '/user-dashboard/family-members',
    NOTIFICATIONS: '/user-dashboard/notifications',
    DEADLINES: '/user-dashboard/deadlines',
    SERVICE_TICKETS: '/user-dashboard/service-tickets',
    ANALYTICS: '/user-dashboard/analytics',
    DRAFTS: '/user-dashboard/drafts'
  },

  // Test timeouts
  timeouts: {
    SHORT: 1000,
    MEDIUM: 5000,
    LONG: 10000
  },

  // Test data sizes
  dataSizes: {
    SMALL: 10,
    MEDIUM: 100,
    LARGE: 1000
  },

  // User roles
  roles: {
    END_USER: 'end_user',
    CA_FIRM_ADMIN: 'ca_firm_admin',
    CA_FIRM_STAFF: 'ca_firm_staff',
    SUPER_ADMIN: 'super_admin',
    SUPER_ADMIN_STAFF: 'super_admin_staff'
  },

  // Priority levels
  priorities: {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent'
  },

  // Status values
  statuses: {
    DRAFT: 'draft',
    IN_PROGRESS: 'in_progress',
    SUBMITTED: 'submitted',
    COMPLETED: 'completed',
    OPEN: 'open',
    RESOLVED: 'resolved',
    CLOSED: 'closed'
  }
};

// =====================================================
// MOCK COMPONENTS
// =====================================================

export const MockComponents = {
  // Mock router
  MockRouter: ({ children }) => (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  ),

  // Mock query client provider
  MockQueryProvider: ({ children, client }) => (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  ),

  // Mock error boundary
  MockErrorBoundary: ({ children, onError }) => {
    try {
      return children;
    } catch (error) {
      onError?.(error);
      return <div>Error: {error.message}</div>;
    }
  }
};

// =====================================================
// PERFORMANCE TESTING UTILITIES
// =====================================================

export const performanceUtils = {
  // Measure render time
  measureRenderTime: (renderFn) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    return end - start;
  },

  // Measure API call time
  measureApiTime: async (apiCall) => {
    const start = performance.now();
    await apiCall();
    const end = performance.now();
    return end - start;
  },

  // Create performance observer
  createPerformanceObserver: (callback) => {
    return new PerformanceObserver((list) => {
      list.getEntries().forEach(callback);
    });
  },

  // Get memory usage
  getMemoryUsage: () => {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }
};

// =====================================================
// ACCESSIBILITY TESTING UTILITIES
// =====================================================

export const a11yUtils = {
  // Check color contrast
  checkColorContrast: (element) => {
    const styles = window.getComputedStyle(element);
    const backgroundColor = styles.backgroundColor;
    const color = styles.color;
    
    // This is a simplified check - in real tests you'd use a proper contrast checker
    return {
      backgroundColor,
      color,
      hasContrast: backgroundColor !== color
    };
  },

  // Check ARIA attributes
  checkAriaAttributes: (element) => {
    const ariaAttributes = {};
    for (const attr of element.attributes) {
      if (attr.name.startsWith('aria-')) {
        ariaAttributes[attr.name] = attr.value;
      }
    }
    return ariaAttributes;
  },

  // Check keyboard navigation
  checkKeyboardNavigation: (element) => {
    const tabIndex = element.getAttribute('tabindex');
    const isFocusable = element.matches('button, input, select, textarea, a[href], [tabindex]');
    
    return {
      tabIndex,
      isFocusable,
      canReceiveFocus: isFocusable || tabIndex !== null
    };
  }
};

// =====================================================
// CLEANUP UTILITIES
// =====================================================

export const cleanupUtils = {
  // Clear all mocks
  clearAllMocks: () => {
    vi.clearAllMocks();
    mockApiClient.get.mockClear();
    mockApiClient.post.mockClear();
    mockApiClient.put.mockClear();
    mockApiClient.delete.mockClear();
    mockApiClient.patch.mockClear();
  },

  // Reset all mocks
  resetAllMocks: () => {
    vi.resetAllMocks();
    mockApiClient.get.mockReset();
    mockApiClient.post.mockReset();
    mockApiClient.put.mockReset();
    mockApiClient.delete.mockReset();
    mockApiClient.patch.mockReset();
  },

  // Restore all mocks
  restoreAllMocks: () => {
    vi.restoreAllMocks();
  },

  // Clean up DOM
  cleanupDOM: () => {
    document.body.innerHTML = '';
  }
};

export default {
  mockApiClient,
  mockUserData,
  TestWrapper,
  mockFunctions,
  testHelpers,
  testConstants,
  MockComponents,
  performanceUtils,
  a11yUtils,
  cleanupUtils
};
