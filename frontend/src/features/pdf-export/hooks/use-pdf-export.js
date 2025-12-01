// =====================================================
// PDF EXPORT HOOKS
// React Query hooks for PDF export operations
// =====================================================

import { useMutation } from '@tanstack/react-query';
import pdfExportService from '../services/pdf-export.service';
import toast from 'react-hot-toast';

/**
 * Hook to export draft as PDF
 * @returns {object} Mutation object
 */
export function useExportDraftPDF() {
  return useMutation({
    mutationFn: async ({ draftId, filename }) => {
      const blob = await pdfExportService.exportDraftPDF(draftId);
      pdfExportService.downloadPDF(blob, filename || `itr-draft-${draftId}.pdf`);
      return { success: true };
    },
    onSuccess: () => {
      toast.success('PDF downloaded successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to export PDF');
    },
  });
}

/**
 * Hook to export tax computation as PDF
 * @returns {object} Mutation object
 */
export function useExportTaxComputationPDF() {
  return useMutation({
    mutationFn: async ({ filingId, filename }) => {
      const blob = await pdfExportService.exportTaxComputationPDF(filingId);
      pdfExportService.downloadPDF(blob, filename || `tax-computation-${filingId}.pdf`);
      return { success: true };
    },
    onSuccess: () => {
      toast.success('PDF downloaded successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to export PDF');
    },
  });
}

/**
 * Hook to export discrepancy report as PDF
 * @returns {object} Mutation object
 */
export function useExportDiscrepancyPDF() {
  return useMutation({
    mutationFn: async ({ filingId, filename }) => {
      const blob = await pdfExportService.exportDiscrepancyPDF(filingId);
      pdfExportService.downloadPDF(blob, filename || `discrepancy-report-${filingId}.pdf`);
      return { success: true };
    },
    onSuccess: () => {
      toast.success('PDF downloaded successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to export PDF');
    },
  });
}

/**
 * Hook to export acknowledgment as PDF
 * @returns {object} Mutation object
 */
export function useExportAcknowledgmentPDF() {
  return useMutation({
    mutationFn: async ({ filingId, filename }) => {
      const blob = await pdfExportService.exportAcknowledgmentPDF(filingId);
      pdfExportService.downloadPDF(blob, filename || `acknowledgment-${filingId}.pdf`);
      return { success: true };
    },
    onSuccess: () => {
      toast.success('PDF downloaded successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to export PDF');
    },
  });
}

