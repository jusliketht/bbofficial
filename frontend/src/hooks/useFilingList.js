import { useState, useEffect, useCallback, useMemo } from 'react';
import itrService from '../services/api/itrService';
import toast from 'react-hot-toast';

const useFilingList = () => {
  const [filings, setFilings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    itrType: '',
    context: '',
    year: '',
    page: 1,
    limit: 10,
  });
  const [selectedFiling, setSelectedFiling] = useState(null);

  // ✅ Stable fetch function with proper dependencies
  const fetchFilings = useCallback(async (currentFilters) => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = {};
      if (currentFilters.status) {
        params.status = currentFilters.status;
      }
      if (currentFilters.itrType) {
        params.itrType = currentFilters.itrType;
      }
      if (currentFilters.year) {
        params.assessmentYear = currentFilters.year;
      }
      if (currentFilters.page) {
        params.page = currentFilters.page;
      }
      if (currentFilters.limit) {
        params.limit = currentFilters.limit;
      }

      // Call real API
      const response = await itrService.getUserITRs(params);

      // Extract filings from response
      let fetchedFilings = [];
      if (response.filings) {
        fetchedFilings = Array.isArray(response.filings) ? response.filings : [response.filings];
      } else if (Array.isArray(response)) {
        fetchedFilings = response;
      } else if (response.data && Array.isArray(response.data)) {
        fetchedFilings = response.data;
      }

      // Transform API response to match expected format
      const transformedFilings = fetchedFilings.map(filing => ({
        id: filing.id,
        taxpayerName: filing.client?.name || filing.user?.name || 'N/A',
        pan: filing.client?.pan || filing.user?.panNumber || 'N/A',
        ticketNumber: filing.ticketNumber || `TKT${String(filing.id).padStart(3, '0')}`,
        type: filing.itrType || filing.itr_type,
        status: filing.status,
        itrType: filing.itrType || filing.itr_type,
        filingContext: filing.filingContext || 'individual',
        assessmentYear: filing.assessmentYear || filing.assessment_year,
        year: filing.assessmentYear || filing.assessment_year,
        submittedAt: filing.submittedAt || filing.submitted_at,
        createdAt: filing.createdAt || filing.created_at,
        updatedAt: filing.updatedAt || filing.updated_at,
        pausedAt: filing.pausedAt || filing.paused_at,
        resumedAt: filing.resumedAt || filing.resumed_at,
        taxComputed: filing.taxComputation?.finalTaxLiability || 0,
        taxSaved: filing.taxComputation?.savings || 0,
        invoice: filing.invoice,
        client: filing.client,
        assignedTo: filing.assignedTo,
        reviewStatus: filing.reviewStatus || filing.review_status,
      }));

      // Apply client-side search filter if provided
      let filteredFilings = transformedFilings;
      if (currentFilters.search) {
        const searchLower = currentFilters.search.toLowerCase();
        filteredFilings = transformedFilings.filter(filing =>
          filing.taxpayerName.toLowerCase().includes(searchLower) ||
          filing.pan.toLowerCase().includes(searchLower) ||
          filing.ticketNumber.toLowerCase().includes(searchLower),
        );
      }

      // Apply client-side context filter if provided
      if (currentFilters.context) {
        filteredFilings = filteredFilings.filter(filing =>
          filing.filingContext === currentFilters.context,
        );
      }

      setFilings(filteredFilings);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load filings';
      setError(errorMessage);
      setFilings([]); // Set empty array on error

      // Show user-friendly error message
      if (err.response?.status !== 401) {
        // Don't show toast for 401 (unauthorized) - handled by auth interceptor
        toast.error(errorMessage);
      }

      // Log error for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch filings:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Stable setFilters function
  const stableSetFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // ✅ Stable setSelectedFiling function
  const stableSetSelectedFiling = useCallback((filing) => {
    setSelectedFiling(filing);
  }, []);

  // ✅ Fetch filings when filters change
  useEffect(() => {
    fetchFilings(filters);
  }, [filters, fetchFilings]);

  // ✅ Memoized computed values
  const totalCount = useMemo(() => filings.length, [filings.length]);
  const currentPage = useMemo(() => filters.page, [filters.page]);
  const totalPages = useMemo(() => Math.ceil(totalCount / filters.limit), [totalCount, filters.limit]);

  return {
    filings,
    totalCount,
    currentPage,
    totalPages,
    filters,
    isLoading: loading,
    error,
    selectedFiling,
    setFilters: stableSetFilters,
    setSelectedFiling: stableSetSelectedFiling,
    refetch: fetchFilings,
  };
};

export default useFilingList;
