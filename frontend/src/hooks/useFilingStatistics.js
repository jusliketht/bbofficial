import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/core/APIClient';
import { enterpriseLogger } from '../utils/logger';

const useFilingStatistics = () => {
  const [statistics, setStatistics] = useState({
    totalFilings: 0,
    completedFilings: 0,
    pendingFilings: 0,
    rejectedFilings: 0,
    totalTaxComputed: 0,
    totalTaxSaved: 0,
    averageProcessingTime: 0,
    monthlyTrends: [],
    yearlyComparison: {},
    loading: false,
    error: null,
  });

  const fetchStatistics = useCallback(async (period = 'current_year') => {
    setStatistics(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch user dashboard data which includes filing statistics
      const dashboardResponse = await apiClient.get('/users/dashboard');
      
      if (!dashboardResponse.success || !dashboardResponse.data) {
        throw new Error(dashboardResponse.error?.message || 'Failed to fetch dashboard data');
      }

      const dashboardData = dashboardResponse.data;
      const filingStats = dashboardData.filingStats || {};
      
      // Fetch user filings for detailed statistics
      const filingsResponse = await apiClient.get('/itr/filings', { params: {} });
      const filings = filingsResponse.success && filingsResponse.data?.filings 
        ? filingsResponse.data.filings 
        : (Array.isArray(filingsResponse.data) ? filingsResponse.data : []);

      // Calculate statistics from real data
      const completedFilings = filings.filter(f => 
        f.status === 'submitted' || f.status === 'acknowledged'
      ).length;
      
      const pendingFilings = filings.filter(f => 
        f.status === 'draft' || f.status === 'in_progress'
      ).length;
      
      const rejectedFilings = filings.filter(f => f.status === 'rejected').length;
      
      // Calculate monthly trends from filings
      const monthlyTrends = calculateMonthlyTrends(filings);
      
      // Calculate yearly comparison
      const currentYear = new Date().getFullYear();
      const previousYear = currentYear - 1;
      const currentYearFilings = filings.filter(f => {
        const filingYear = f.createdAt ? new Date(f.createdAt).getFullYear() : currentYear;
        return filingYear === currentYear;
      }).length;
      const previousYearFilings = filings.filter(f => {
        const filingYear = f.createdAt ? new Date(f.createdAt).getFullYear() : previousYear;
        return filingYear === previousYear;
      }).length;
      
      const growth = previousYearFilings > 0 
        ? ((currentYearFilings - previousYearFilings) / previousYearFilings * 100).toFixed(1)
        : 0;

      // Calculate average processing time (days between created and submitted)
      const completedWithDates = filings.filter(f => 
        f.status === 'submitted' && f.createdAt && f.submittedAt
      );
      const averageProcessingTime = completedWithDates.length > 0
        ? completedWithDates.reduce((sum, f) => {
            const created = new Date(f.createdAt);
            const submitted = new Date(f.submittedAt);
            const days = (submitted - created) / (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / completedWithDates.length
        : 0;

      // Calculate total tax computed (sum of tax liability from completed filings)
      const totalTaxComputed = filings
        .filter(f => f.status === 'submitted' || f.status === 'acknowledged')
        .reduce((sum, f) => sum + (f.taxComputation?.finalTax || 0), 0);

      const statisticsData = {
        totalFilings: filingStats.totalFilings || filings.length,
        completedFilings: completedFilings,
        pendingFilings: pendingFilings,
        rejectedFilings: rejectedFilings,
        totalTaxComputed: totalTaxComputed,
        totalTaxSaved: 0, // Would need to calculate from regime comparison data
        averageProcessingTime: averageProcessingTime,
        monthlyTrends: monthlyTrends,
        yearlyComparison: {
          currentYear: currentYearFilings,
          previousYear: previousYearFilings,
          growth: parseFloat(growth),
        },
      };

      setStatistics(prev => ({
        ...prev,
        ...statisticsData,
        loading: false,
      }));
    } catch (error) {
      enterpriseLogger.error('Failed to fetch filing statistics', { error });
      setStatistics(prev => ({
        ...prev,
        error: error.message || 'Failed to load statistics',
        loading: false,
      }));
    }
  }, []);

  // Helper function to calculate monthly trends
  const calculateMonthlyTrends = (filings) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const trends = [];

    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(currentYear, month, 1);
      const monthEnd = new Date(currentYear, month + 1, 0);
      
      const monthFilings = filings.filter(f => {
        if (!f.createdAt) return false;
        const filingDate = new Date(f.createdAt);
        return filingDate >= monthStart && filingDate <= monthEnd;
      });
      
      const completed = monthFilings.filter(f => 
        f.status === 'submitted' || f.status === 'acknowledged'
      ).length;

      trends.push({
        month: monthNames[month],
        filings: monthFilings.length,
        completed: completed,
      });
    }

    return trends;
  };

  useEffect(() => {
    fetchStatistics();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data: {
      status_distribution: [
        { status: 'draft', count: statistics.pendingFilings },
        { status: 'in_progress', count: statistics.pendingFilings },
        { status: 'submitted', count: statistics.completedFilings },
        { status: 'acknowledged', count: statistics.completedFilings },
        { status: 'rejected', count: statistics.rejectedFilings },
      ],
      monthlyTrends: statistics.monthlyTrends,
      yearlyComparison: statistics.yearlyComparison,
    },
    loading: statistics.loading,
    error: statistics.error,
    refetch: fetchStatistics,
  };
};

export default useFilingStatistics;
