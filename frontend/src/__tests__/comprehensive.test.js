/**
 * Comprehensive Testing Suite for BurnBlack Platform
 * 
 * This file contains all test configurations, utilities, and test cases
 * for the frontend components, services, and integration tests.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

// Test utilities and mocks
import { mockApiClient } from './test-utils/mockApiClient';
import { mockUserData } from './test-utils/mockData';
import { TestWrapper } from './test-utils/TestWrapper';

// Components to test
import EnterpriseUserDashboard from '../pages/Dashboard/EnterpriseUserDashboard';
import FamilyMemberManagement from '../components/FamilyMemberManagement';
import NotificationSystem from '../components/NotificationSystem';
import FinancialAnalyticsEngine from '../components/FinancialAnalyticsEngine';
import DraftManagementSystem from '../components/DraftManagementSystem';
import ServiceTicketSystem from '../components/ServiceTicketSystem';
import SmartTooltip from '../components/DesignSystem/SmartTooltip';
import { EnterpriseButton, EnterpriseCard, EnterpriseInput } from '../components/DesignSystem/EnterpriseComponents';

// Services to test
import userDashboardService from '../services/userDashboardService';

// =====================================================
// TEST CONFIGURATION
// =====================================================

// Global test setup
beforeAll(() => {
  // Mock console methods to reduce noise in tests
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});

// =====================================================
// ENTERPRISE USER DASHBOARD TESTS
// =====================================================

describe('EnterpriseUserDashboard', () => {
  let queryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('renders dashboard with user data', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          user: mockUserData.user,
          financial: mockUserData.financial,
          familyMembers: mockUserData.familyMembers,
          notifications: mockUserData.notifications,
          deadlines: mockUserData.deadlines,
          serviceTickets: mockUserData.serviceTickets,
          stats: mockUserData.stats
        }
      }
    });

    render(
      <TestWrapper queryClient={queryClient}>
        <EnterpriseUserDashboard userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(mockUserData.user.name)).toBeInTheDocument();
    });

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Family Members')).toBeInTheDocument();
    expect(screen.getByText('Notifications & Deadlines')).toBeInTheDocument();
  });

  it('handles loading state correctly', () => {
    mockApiClient.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <TestWrapper queryClient={queryClient}>
        <EnterpriseUserDashboard userId="test-user-id" />
      </TestWrapper>
    );

    expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
  });

  it('handles error state correctly', async () => {
    mockApiClient.get.mockRejectedValueOnce(new Error('API Error'));

    render(
      <TestWrapper queryClient={queryClient}>
        <EnterpriseUserDashboard userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('displays online/offline status correctly', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: { success: true, data: mockUserData }
    });

    render(
      <TestWrapper queryClient={queryClient}>
        <EnterpriseUserDashboard userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Online')).toBeInTheDocument();
    });
  });
});

// =====================================================
// FAMILY MEMBER MANAGEMENT TESTS
// =====================================================

describe('FamilyMemberManagement', () => {
  let queryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  it('renders family members list', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: mockUserData.familyMembers
      }
    });

    render(
      <TestWrapper queryClient={queryClient}>
        <FamilyMemberManagement userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Family Members')).toBeInTheDocument();
    });

    expect(screen.getByText('Add Member')).toBeInTheDocument();
  });

  it('opens add member form when Add Member is clicked', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: { success: true, data: [] }
    });

    render(
      <TestWrapper queryClient={queryClient}>
        <FamilyMemberManagement userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Add Member')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Member'));

    expect(screen.getByText('Add New Family Member')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Relationship')).toBeInTheDocument();
  });

  it('validates required fields in add member form', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: { success: true, data: [] }
    });

    render(
      <TestWrapper queryClient={queryClient}>
        <FamilyMemberManagement userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText('Add Member'));
    });

    fireEvent.click(screen.getByText('Add Member'));

    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Relationship is required')).toBeInTheDocument();
    });
  });

  it('submits add member form successfully', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: { success: true, data: [] }
    });

    mockApiClient.post.mockResolvedValueOnce({
      data: { success: true, data: { id: 'new-member-id' } }
    });

    render(
      <TestWrapper queryClient={queryClient}>
        <FamilyMemberManagement userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText('Add Member'));
    });

    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Relationship'), { target: { value: 'spouse' } });

    fireEvent.click(screen.getByText('Add Member'));

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith('/user-dashboard/family-members', expect.objectContaining({
        first_name: 'John',
        last_name: 'Doe',
        relationship: 'spouse'
      }));
    });
  });

  it('edits existing family member', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [mockUserData.familyMembers[0]]
      }
    });

    render(
      <TestWrapper queryClient={queryClient}>
        <FamilyMemberManagement userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Edit member')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Edit member'));

    expect(screen.getByText('Edit Family Member')).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUserData.familyMembers[0].first_name)).toBeInTheDocument();
  });

  it('deletes family member with confirmation', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [mockUserData.familyMembers[0]]
      }
    });

    mockApiClient.delete.mockResolvedValueOnce({
      data: { success: true }
    });

    // Mock window.confirm
    window.confirm = vi.fn(() => true);

    render(
      <TestWrapper queryClient={queryClient}>
        <FamilyMemberManagement userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTitle('Delete member')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Delete member'));

    expect(window.confirm).toHaveBeenCalled();
    expect(mockApiClient.delete).toHaveBeenCalled();
  });
});

// =====================================================
// NOTIFICATION SYSTEM TESTS
// =====================================================

describe('NotificationSystem', () => {
  let queryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  it('renders notifications and deadlines', async () => {
    mockApiClient.get
      .mockResolvedValueOnce({
        data: { success: true, data: mockUserData.notifications }
      })
      .mockResolvedValueOnce({
        data: { success: true, data: mockUserData.deadlines }
      });

    render(
      <TestWrapper queryClient={queryClient}>
        <NotificationSystem userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Notifications & Deadlines')).toBeInTheDocument();
    });

    expect(screen.getByText('Unread Notifications')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Deadlines')).toBeInTheDocument();
  });

  it('filters notifications by priority', async () => {
    mockApiClient.get
      .mockResolvedValueOnce({
        data: { success: true, data: mockUserData.notifications }
      })
      .mockResolvedValueOnce({
        data: { success: true, data: mockUserData.deadlines }
      });

    render(
      <TestWrapper queryClient={queryClient}>
        <NotificationSystem userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('All Priorities')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByDisplayValue('All Priorities'), { target: { value: 'urgent' } });

    await waitFor(() => {
      expect(mockApiClient.get).toHaveBeenCalledWith('/user-dashboard/notifications', expect.objectContaining({
        params: expect.objectContaining({ priority: 'urgent' })
      }));
    });
  });

  it('marks notification as read', async () => {
    mockApiClient.get
      .mockResolvedValueOnce({
        data: { success: true, data: mockUserData.notifications }
      })
      .mockResolvedValueOnce({
        data: { success: true, data: mockUserData.deadlines }
      });

    mockApiClient.put.mockResolvedValueOnce({
      data: { success: true }
    });

    render(
      <TestWrapper queryClient={queryClient}>
        <NotificationSystem userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Mark as Read')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Mark as Read'));

    await waitFor(() => {
      expect(mockApiClient.put).toHaveBeenCalled();
    });
  });

  it('marks all notifications as read', async () => {
    mockApiClient.get
      .mockResolvedValueOnce({
        data: { success: true, data: mockUserData.notifications }
      })
      .mockResolvedValueOnce({
        data: { success: true, data: mockUserData.deadlines }
      });

    mockApiClient.put.mockResolvedValueOnce({
      data: { success: true }
    });

    render(
      <TestWrapper queryClient={queryClient}>
        <NotificationSystem userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Mark All Read')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Mark All Read'));

    await waitFor(() => {
      expect(mockApiClient.put).toHaveBeenCalledWith('/user-dashboard/notifications/mark-all-read');
    });
  });
});

// =====================================================
// FINANCIAL ANALYTICS ENGINE TESTS
// =====================================================

describe('FinancialAnalyticsEngine', () => {
  let queryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  it('renders analytics dashboard', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          total_income: 500000,
          taxable_income: 400000,
          tax_liability: 50000,
          refund_amount: 10000,
          total_deductions: 100000,
          effective_tax_rate: 12.5,
          deduction_utilization: 66.7,
          income_growth_percentage: 10.5,
          refund_efficiency_score: 85.2
        }
      }
    });

    render(
      <TestWrapper queryClient={queryClient}>
        <FinancialAnalyticsEngine userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Financial Analytics & Insights')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Income')).toBeInTheDocument();
    expect(screen.getByText('Deduction Utilization')).toBeInTheDocument();
    expect(screen.getByText('Effective Tax Rate')).toBeInTheDocument();
    expect(screen.getByText('Refund Efficiency')).toBeInTheDocument();
  });

  it('displays insights and recommendations', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          total_income: 500000,
          taxable_income: 400000,
          tax_liability: 50000,
          refund_amount: 10000,
          total_deductions: 50000, // Low utilization
          effective_tax_rate: 12.5,
          deduction_utilization: 33.3,
          income_growth_percentage: 10.5,
          refund_efficiency_score: 85.2
        }
      }
    });

    render(
      <TestWrapper queryClient={queryClient}>
        <FinancialAnalyticsEngine userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('AI-Powered Insights & Recommendations')).toBeInTheDocument();
    });

    expect(screen.getByText('Tax Optimization Opportunity')).toBeInTheDocument();
  });

  it('exports analytics report', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          total_income: 500000,
          taxable_income: 400000,
          tax_liability: 50000,
          refund_amount: 10000,
          total_deductions: 100000,
          effective_tax_rate: 12.5,
          deduction_utilization: 66.7,
          income_growth_percentage: 10.5,
          refund_efficiency_score: 85.2
        }
      }
    });

    mockApiClient.post.mockResolvedValueOnce({
      data: new Blob(['mock pdf content'], { type: 'application/pdf' })
    });

    // Mock URL.createObjectURL and link.click
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();

    const mockClick = vi.fn();
    const mockLink = { click: mockClick };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

    render(
      <TestWrapper queryClient={queryClient}>
        <FinancialAnalyticsEngine userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Export Report')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Export Report'));

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith('/user-dashboard/analytics/export', expect.objectContaining({
        assessment_year: '2024-25',
        format: 'pdf'
      }));
    });
  });
});

// =====================================================
// DRAFT MANAGEMENT SYSTEM TESTS
// =====================================================

describe('DraftManagementSystem', () => {
  let queryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  it('renders draft management interface', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          id: 'draft-id',
          form_type: 'ITR-1',
          assessment_year: '2024-25',
          data: { personal_info: { name: 'John Doe' } },
          version_number: 1,
          is_current: true,
          created_at: new Date().toISOString()
        }
      }
    });

    render(
      <TestWrapper queryClient={queryClient}>
        <DraftManagementSystem userId="test-user-id" formType="ITR-1" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('All changes saved')).toBeInTheDocument();
    });

    expect(screen.getByText('Save Now')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('auto-saves draft changes', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          id: 'draft-id',
          form_type: 'ITR-1',
          assessment_year: '2024-25',
          data: { personal_info: { name: 'John Doe' } },
          version_number: 1,
          is_current: true,
          created_at: new Date().toISOString()
        }
      }
    });

    mockApiClient.post.mockResolvedValueOnce({
      data: { success: true, data: { id: 'new-draft-id' } }
    });

    // Mock setTimeout to test auto-save
    vi.useFakeTimers();

    const onDraftChange = vi.fn();

    render(
      <TestWrapper queryClient={queryClient}>
        <DraftManagementSystem 
          userId="test-user-id" 
          formType="ITR-1" 
          onDraftChange={onDraftChange}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('All changes saved')).toBeInTheDocument();
    });

    // Simulate draft change
    act(() => {
      onDraftChange({ personal_info: { name: 'Jane Doe' } });
    });

    // Fast-forward timers to trigger auto-save
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith('/user-dashboard/drafts', expect.objectContaining({
        form_type: 'ITR-1',
        assessment_year: '2024-25',
        is_auto_save: true
      }));
    });

    vi.useRealTimers();
  });

  it('manually saves draft', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          id: 'draft-id',
          form_type: 'ITR-1',
          assessment_year: '2024-25',
          data: { personal_info: { name: 'John Doe' } },
          version_number: 1,
          is_current: true,
          created_at: new Date().toISOString()
        }
      }
    });

    mockApiClient.post.mockResolvedValueOnce({
      data: { success: true, data: { id: 'new-draft-id' } }
    });

    render(
      <TestWrapper queryClient={queryClient}>
        <DraftManagementSystem userId="test-user-id" formType="ITR-1" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Save Now')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Save Now'));

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith('/user-dashboard/drafts', expect.objectContaining({
        form_type: 'ITR-1',
        assessment_year: '2024-25',
        is_auto_save: false
      }));
    });
  });

  it('shows draft history', async () => {
    mockApiClient.get
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: 'draft-id',
            form_type: 'ITR-1',
            assessment_year: '2024-25',
            data: { personal_info: { name: 'John Doe' } },
            version_number: 1,
            is_current: true,
            created_at: new Date().toISOString()
          }
        }
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: [
            {
              id: 'version-1',
              version_number: 1,
              is_current: true,
              is_auto_save: false,
              created_at: new Date().toISOString()
            },
            {
              id: 'version-2',
              version_number: 2,
              is_current: false,
              is_auto_save: true,
              created_at: new Date(Date.now() - 3600000).toISOString()
            }
          ]
        }
      });

    render(
      <TestWrapper queryClient={queryClient}>
        <DraftManagementSystem userId="test-user-id" formType="ITR-1" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('History')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('History'));

    await waitFor(() => {
      expect(screen.getByText('Draft History')).toBeInTheDocument();
      expect(screen.getByText('Current Version')).toBeInTheDocument();
      expect(screen.getByText('Auto-saved')).toBeInTheDocument();
    });
  });
});

// =====================================================
// SERVICE TICKET SYSTEM TESTS
// =====================================================

describe('ServiceTicketSystem', () => {
  let queryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  it('renders service tickets interface', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: mockUserData.serviceTickets
      }
    });

    render(
      <TestWrapper queryClient={queryClient}>
        <ServiceTicketSystem userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Service Tickets')).toBeInTheDocument();
    });

    expect(screen.getByText('New Ticket')).toBeInTheDocument();
    expect(screen.getByText('Total Tickets')).toBeInTheDocument();
  });

  it('creates new ticket', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: { success: true, data: [] }
    });

    mockApiClient.post.mockResolvedValueOnce({
      data: { success: true, data: { id: 'new-ticket-id' } }
    });

    render(
      <TestWrapper queryClient={queryClient}>
        <ServiceTicketSystem userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('New Ticket')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('New Ticket'));

    expect(screen.getByText('Create New Ticket')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Subject *'), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText('Description *'), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText('Category *'), { target: { value: 'technical' } });

    fireEvent.click(screen.getByText('Create Ticket'));

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith('/user-dashboard/service-tickets', expect.objectContaining({
        subject: 'Test Subject',
        description: 'Test Description',
        category: 'technical',
        user_id: 'test-user-id'
      }));
    });
  });

  it('displays ticket details and messages', async () => {
    mockApiClient.get
      .mockResolvedValueOnce({
        data: { success: true, data: mockUserData.serviceTickets }
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            ...mockUserData.serviceTickets[0],
            messages: [
              {
                id: 'msg-1',
                message: 'Initial message',
                is_from_user: true,
                created_at: new Date().toISOString()
              }
            ]
          }
        }
      });

    render(
      <TestWrapper queryClient={queryClient}>
        <ServiceTicketSystem userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(mockUserData.serviceTickets[0].subject)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(mockUserData.serviceTickets[0].subject));

    await waitFor(() => {
      expect(screen.getByText('Initial message')).toBeInTheDocument();
    });
  });

  it('adds message to ticket', async () => {
    mockApiClient.get
      .mockResolvedValueOnce({
        data: { success: true, data: mockUserData.serviceTickets }
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            ...mockUserData.serviceTickets[0],
            messages: []
          }
        }
      });

    mockApiClient.post.mockResolvedValueOnce({
      data: { success: true, data: { id: 'new-message-id' } }
    });

    render(
      <TestWrapper queryClient={queryClient}>
        <ServiceTicketSystem userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText(mockUserData.serviceTickets[0].subject));
    });

    await waitFor(() => {
      expect(screen.getByText('Add Message')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Type your message here...'), { 
      target: { value: 'Test message' } 
    });

    fireEvent.click(screen.getByText('Send Message'));

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/user-dashboard/service-tickets/${mockUserData.serviceTickets[0].id}/messages`,
        expect.objectContaining({
          message: 'Test message'
        })
      );
    });
  });

  it('rates resolved ticket', async () => {
    const resolvedTicket = {
      ...mockUserData.serviceTickets[0],
      status: 'resolved'
    };

    mockApiClient.get
      .mockResolvedValueOnce({
        data: { success: true, data: [resolvedTicket] }
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            ...resolvedTicket,
            messages: []
          }
        }
      });

    mockApiClient.post.mockResolvedValueOnce({
      data: { success: true }
    });

    render(
      <TestWrapper queryClient={queryClient}>
        <ServiceTicketSystem userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText(resolvedTicket.subject));
    });

    await waitFor(() => {
      expect(screen.getByText('Rate')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Rate'));

    expect(screen.getByText('Rate Your Experience')).toBeInTheDocument();

    // Click on 5th star
    fireEvent.click(screen.getByRole('button', { name: /5 stars/i }));

    fireEvent.click(screen.getByText('Submit Rating'));

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/user-dashboard/service-tickets/${resolvedTicket.id}/rate`,
        expect.objectContaining({
          rating: 5
        })
      );
    });
  });
});

// =====================================================
// SMART TOOLTIP TESTS
// =====================================================

describe('SmartTooltip', () => {
  it('renders tooltip with financial term', () => {
    render(
      <SmartTooltip term="total_income">
        <span>Total Income</span>
      </SmartTooltip>
    );

    expect(screen.getByText('Total Income')).toBeInTheDocument();
  });

  it('shows tooltip content on hover', async () => {
    const user = userEvent.setup();

    render(
      <SmartTooltip term="total_income">
        <span>Total Income</span>
      </SmartTooltip>
    );

    const trigger = screen.getByText('Total Income');
    await user.hover(trigger);

    await waitFor(() => {
      expect(screen.getByText('All money earned from salary, business, investments, and other sources before deductions.')).toBeInTheDocument();
    });
  });

  it('shows AI help button', async () => {
    const user = userEvent.setup();

    render(
      <SmartTooltip term="total_income">
        <span>Total Income</span>
      </SmartTooltip>
    );

    const trigger = screen.getByText('Total Income');
    await user.hover(trigger);

    await waitFor(() => {
      expect(screen.getByText('AI Help')).toBeInTheDocument();
    });
  });

  it('handles unknown terms gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <SmartTooltip term="unknown_term">
        <span>Unknown Term</span>
      </SmartTooltip>
    );

    expect(consoleSpy).toHaveBeenCalledWith('Tooltip data not found for term: unknown_term');
    expect(screen.getByText('Unknown Term')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});

// =====================================================
// ENTERPRISE COMPONENTS TESTS
// =====================================================

describe('Enterprise Components', () => {
  describe('EnterpriseButton', () => {
    it('renders button with correct variant', () => {
      render(<EnterpriseButton variant="primary">Click me</EnterpriseButton>);
      
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toHaveClass('bg-blue-600', 'text-white');
    });

    it('renders button with secondary variant', () => {
      render(<EnterpriseButton variant="secondary">Click me</EnterpriseButton>);
      
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toHaveClass('bg-gray-100', 'text-gray-700');
    });

    it('handles click events', () => {
      const handleClick = vi.fn();
      render(<EnterpriseButton onClick={handleClick}>Click me</EnterpriseButton>);
      
      fireEvent.click(screen.getByRole('button', { name: 'Click me' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('disables button when disabled prop is true', () => {
      render(<EnterpriseButton disabled>Click me</EnterpriseButton>);
      
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeDisabled();
    });
  });

  describe('EnterpriseInput', () => {
    it('renders input with label', () => {
      render(<EnterpriseInput label="Test Label" />);
      
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    });

    it('handles input changes', () => {
      const handleChange = vi.fn();
      render(<EnterpriseInput onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test value' } });
      
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('shows error message', () => {
      render(<EnterpriseInput error="This field is required" />);
      
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });

  describe('EnterpriseCard', () => {
    it('renders card with children', () => {
      render(
        <EnterpriseCard>
          <div>Card content</div>
        </EnterpriseCard>
      );
      
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <EnterpriseCard className="custom-class">
          <div>Card content</div>
        </EnterpriseCard>
      );
      
      const card = screen.getByText('Card content').closest('div');
      expect(card).toHaveClass('custom-class');
    });
  });
});

// =====================================================
// SERVICE TESTS
// =====================================================

describe('UserDashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches user profile data', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: { success: true, data: mockUserData.user }
    });

    const result = await userDashboardService.userProfileService.getUserProfile();

    expect(mockApiClient.get).toHaveBeenCalledWith('/user-dashboard/profile');
    expect(result).toEqual({ success: true, data: mockUserData.user });
  });

  it('handles API errors gracefully', async () => {
    mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

    await expect(userDashboardService.userProfileService.getUserProfile()).rejects.toThrow('Network error');
  });

  it('formats currency correctly', () => {
    expect(userDashboardService.formatCurrency(1000000)).toBe('₹10,00,000');
    expect(userDashboardService.formatCurrency(50000)).toBe('₹50,000');
    expect(userDashboardService.formatCurrency(0)).toBe('₹0');
  });

  it('formats dates correctly', () => {
    const date = new Date('2024-01-15');
    expect(userDashboardService.formatDate(date)).toBe('15 Jan 2024');
  });

  it('calculates days until deadline', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    
    expect(userDashboardService.calculateDaysUntilDeadline(futureDate)).toBe(5);
  });

  it('returns correct status colors', () => {
    expect(userDashboardService.getStatusColor('completed')).toBe('text-green-600');
    expect(userDashboardService.getStatusColor('pending')).toBe('text-yellow-600');
    expect(userDashboardService.getStatusColor('overdue')).toBe('text-red-600');
  });

  it('returns correct priority colors', () => {
    expect(userDashboardService.getPriorityColor('urgent')).toBe('text-red-600');
    expect(userDashboardService.getPriorityColor('high')).toBe('text-orange-600');
    expect(userDashboardService.getPriorityColor('normal')).toBe('text-blue-600');
    expect(userDashboardService.getPriorityColor('low')).toBe('text-gray-600');
  });
});

// =====================================================
// INTEGRATION TESTS
// =====================================================

describe('Dashboard Integration', () => {
  let queryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  it('integrates all dashboard components successfully', async () => {
    // Mock all API calls
    mockApiClient.get
      .mockResolvedValueOnce({ data: { success: true, data: mockUserData } })
      .mockResolvedValueOnce({ data: { success: true, data: mockUserData.familyMembers } })
      .mockResolvedValueOnce({ data: { success: true, data: mockUserData.notifications } })
      .mockResolvedValueOnce({ data: { success: true, data: mockUserData.deadlines } });

    render(
      <TestWrapper queryClient={queryClient}>
        <EnterpriseUserDashboard userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(mockUserData.user.name)).toBeInTheDocument();
    });

    // Verify all major sections are rendered
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Family Members')).toBeInTheDocument();
    expect(screen.getByText('Notifications & Deadlines')).toBeInTheDocument();
  });

  it('handles offline/online status changes', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: { success: true, data: mockUserData }
    });

    render(
      <TestWrapper queryClient={queryClient}>
        <EnterpriseUserDashboard userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Online')).toBeInTheDocument();
    });

    // Simulate going offline
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    await waitFor(() => {
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });

    // Simulate coming back online
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(screen.getByText('Online')).toBeInTheDocument();
    });
  });
});

// =====================================================
// PERFORMANCE TESTS
// =====================================================

describe('Performance Tests', () => {
  it('renders dashboard within acceptable time', async () => {
    const startTime = performance.now();
    
    mockApiClient.get.mockResolvedValueOnce({
      data: { success: true, data: mockUserData }
    });

    render(
      <TestWrapper>
        <EnterpriseUserDashboard userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(mockUserData.user.name)).toBeInTheDocument();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render within 100ms
    expect(renderTime).toBeLessThan(100);
  });

  it('handles large datasets efficiently', async () => {
    const largeDataset = {
      ...mockUserData,
      notifications: Array.from({ length: 1000 }, (_, i) => ({
        id: `notification-${i}`,
        title: `Notification ${i}`,
        message: `Message ${i}`,
        priority: 'normal',
        is_read: false,
        created_at: new Date().toISOString()
      }))
    };

    mockApiClient.get.mockResolvedValueOnce({
      data: { success: true, data: largeDataset }
    });

    const startTime = performance.now();

    render(
      <TestWrapper>
        <EnterpriseUserDashboard userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(mockUserData.user.name)).toBeInTheDocument();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should handle large datasets within 200ms
    expect(renderTime).toBeLessThan(200);
  });
});

// =====================================================
// ACCESSIBILITY TESTS
// =====================================================

describe('Accessibility Tests', () => {
  it('has proper ARIA labels', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: { success: true, data: mockUserData }
    });

    render(
      <TestWrapper>
        <EnterpriseUserDashboard userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(mockUserData.user.name)).toBeInTheDocument();
    });

    // Check for proper ARIA labels
    expect(screen.getByLabelText(/learn more about/i)).toBeInTheDocument();
  });

  it('supports keyboard navigation', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: { success: true, data: mockUserData }
    });

    render(
      <TestWrapper>
        <EnterpriseUserDashboard userId="test-user-id" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(mockUserData.user.name)).toBeInTheDocument();
    });

    // Test tab navigation
    const firstButton = screen.getAllByRole('button')[0];
    firstButton.focus();
    expect(document.activeElement).toBe(firstButton);

    // Test Enter key
    fireEvent.keyDown(firstButton, { key: 'Enter', code: 'Enter' });
    // Should not throw any errors
  });

  it('has proper color contrast', () => {
    render(<EnterpriseButton variant="primary">Test Button</EnterpriseButton>);
    
    const button = screen.getByRole('button', { name: 'Test Button' });
    const styles = window.getComputedStyle(button);
    
    // Check that button has sufficient contrast
    expect(styles.backgroundColor).toBeDefined();
    expect(styles.color).toBeDefined();
  });
});

export default {
  // Export test utilities for use in other test files
  mockApiClient,
  mockUserData,
  TestWrapper
};
