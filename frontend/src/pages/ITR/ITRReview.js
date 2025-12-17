// =====================================================
// ITR REVIEW (CANONICAL)
// Review & Validate → Submit → Acknowledgment/E-Verify
// =====================================================

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../services/core/APIClient';
import itrService from '../../services/api/itrService';
import ValidationRunner from '../../features/submission/components/validation-runner';
import EVerificationModal from '../../components/ITR/EVerificationModal';
import { ensureJourneyStart, trackEvent } from '../../utils/analyticsEvents';

function normalizeSectionId(section) {
  if (!section) return null;
  const s = String(section).toLowerCase();
  if (s.includes('personal')) return 'personalInfo';
  if (s.includes('income')) return 'income';
  if (s.includes('deduction')) return 'deductions';
  if (s.includes('tax') && s.includes('paid')) return 'taxesPaid';
  if (s.includes('bank')) return 'bankDetails';
  if (s.includes('business')) return 'businessIncome';
  if (s.includes('profession')) return 'professionalIncome';
  if (s.includes('balance')) return 'balanceSheet';
  if (s.includes('audit')) return 'auditInfo';
  if (s.includes('schedule') && s.includes('fa')) return 'scheduleFA';
  if (s.includes('presumptive')) return 'presumptiveIncome';
  return null;
}

export default function ITRReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const draftId =
    location.state?.draftId ||
    searchParams.get('draftId') ||
    null;
  const filingId =
    location.state?.filingId ||
    searchParams.get('filingId') ||
    null;
  const selectedITR =
    location.state?.selectedITR ||
    searchParams.get('itrType') ||
    null;
  const assessmentYear =
    location.state?.assessmentYear ||
    searchParams.get('ay') ||
    null;

  const [validationResults, setValidationResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEVerificationModal, setShowEVerificationModal] = useState(false);
  const [preSubmitBlockers, setPreSubmitBlockers] = useState([]);

  useEffect(() => {
    ensureJourneyStart();
    trackEvent('itr_review_view', { draftId, filingId, itrType: selectedITR || null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (draftId) return;
    toast.error('Draft not found. Please return to computation.');
    navigate('/itr/computation', { replace: true });
  }, [draftId, navigate]);

  const { data: draftResponse, isLoading: isDraftLoading } = useQuery({
    queryKey: ['itr-draft', draftId],
    queryFn: () => itrService.getDraftById(draftId),
    enabled: !!draftId,
  });

  const formData = useMemo(() => {
    return draftResponse?.draft?.formData || draftResponse?.draft?.data || {};
  }, [draftResponse]);

  const issues = useMemo(() => {
    const errors = Array.isArray(validationResults?.errors) ? validationResults.errors : [];
    const warnings = Array.isArray(validationResults?.warnings) ? validationResults.warnings : [];
    return { errors, warnings };
  }, [validationResults]);

  const canSubmit = (issues.errors || []).length === 0 && !!draftId;

  const handleFixSection = (sectionId) => {
    if (!sectionId) return;
    trackEvent('itr_section_fix_clicked', { sectionId, draftId });
    // Build returnTo URL with all query params for refresh safety
    const reviewUrl = new URLSearchParams();
    if (draftId) reviewUrl.set('draftId', draftId);
    if (filingId) reviewUrl.set('filingId', filingId);
    if (selectedITR) reviewUrl.set('itrType', selectedITR);
    if (assessmentYear) reviewUrl.set('ay', assessmentYear);
    const returnTo = `/itr/review?${reviewUrl.toString()}`;
    // Build computation URL with query params for refresh safety
    const computationUrl = new URLSearchParams();
    if (draftId) computationUrl.set('draftId', draftId);
    if (filingId) computationUrl.set('filingId', filingId);
    if (selectedITR) computationUrl.set('itrType', selectedITR);
    if (assessmentYear) computationUrl.set('ay', assessmentYear);
    if (sectionId) computationUrl.set('section', sectionId);
    computationUrl.set('returnTo', returnTo);
    navigate(`/itr/computation?${computationUrl.toString()}`, {
      state: {
        draftId,
        filingId,
        selectedITR,
        assessmentYear,
        initialSectionId: sectionId,
        entryPoint: 'review',
        returnTo,
      },
    });
  };

  const handleSubmit = async () => {
    if (!draftId) return;
    if (!canSubmit) {
      toast.error('Please fix errors before submitting.');
      return;
    }

    setPreSubmitBlockers([]);

    // Gate B (submit-time): address + bank details required to submit
    try {
      const bankOk = !!(formData?.bankDetails?.accountNumber && formData?.bankDetails?.ifsc);

      const profileResp = await apiClient.get('/auth/profile');
      const address = profileResp?.data?.user?.address || null;
      const addressOk = !!(
        address?.addressLine1 &&
        address?.city &&
        address?.state &&
        address?.pincode
      );

      const blockers = [];
      if (!addressOk) {
        blockers.push({
          id: 'address',
          title: 'Add your address',
          description: 'Address is required to submit your return.',
          action: 'profile',
        });
      }
      if (!bankOk) {
        blockers.push({
          id: 'bank',
          title: 'Add bank details',
          description: 'Account number and IFSC are required to submit.',
          action: 'bankDetails',
        });
      }

      if (blockers.length > 0) {
        setPreSubmitBlockers(blockers);
        toast.error('Please complete the required details before submitting.');
        return;
      }
    } catch (e) {
      // Best-effort: if profile check fails, don't hard-block the user unexpectedly.
      // Submit path still has server-side validation.
    }

    trackEvent('itr_everify_view', { draftId, filingId, itrType: selectedITR || null });
    setShowEVerificationModal(true);
  };

  const handleVerificationComplete = async (verificationData) => {
    setShowEVerificationModal(false);
    setIsSubmitting(true);

    try {
      trackEvent('itr_everify_success', {
        draftId,
        filingId,
        itrType: selectedITR || null,
        method: verificationData?.method || null,
      });
      trackEvent('itr_submit_clicked', { draftId, filingId, itrType: selectedITR || null });

      // Server-side validate right before submit
      const validationResponse = await apiClient.post(`/itr/drafts/${draftId}/validate`, { formData });
      const isServerValid = validationResponse?.data?.data?.isValid;
      if (isServerValid === false) {
        toast.error('Please fix validation errors before submitting.');
        setIsSubmitting(false);
        return;
      }

      const submitResponse = await apiClient.post(`/itr/drafts/${draftId}/submit`, {
        verificationMethod: verificationData?.method,
        verificationToken: verificationData?.verificationToken,
      });
      const filing = submitResponse?.data?.data?.filing || submitResponse?.data?.filing;
      if (!filing?.id) {
        throw new Error('Submission succeeded but filingId is missing');
      }

      trackEvent('itr_submit_success', {
        draftId,
        filingId: filing.id,
        itrType: selectedITR || null,
      });

      navigate(`/acknowledgment/${filing.id}`, {
        state: {
          ackNumber: filing.acknowledgmentNumber || submitResponse?.data?.acknowledgmentNumber || null,
          filing,
        },
      });
    } catch (error) {
      toast.error(error?.response?.data?.error?.message || error?.response?.data?.error || error?.message || 'Failed to submit ITR');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/itr/computation', { state: { draftId, filingId, selectedITR, assessmentYear } })}
            className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
            aria-label="Back to computation"
          >
            <ArrowLeft className="h-5 w-5 text-neutral-700" />
          </button>
          <div>
            <h1 className="text-heading-3 font-semibold text-neutral-900">Review &amp; Submit</h1>
            <p className="text-body-small text-neutral-600">
              Fix must‑fix issues. Recommended items are optional.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 py-6 space-y-6">
        {isDraftLoading ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-6">Loading draft…</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-neutral-200 p-4">
                <div className="text-body-small text-neutral-600">Must fix</div>
                <div className="text-heading-3 font-bold text-error-600">{issues.errors.length}</div>
              </div>
              <div className="bg-white rounded-xl border border-neutral-200 p-4">
                <div className="text-body-small text-neutral-600">Recommended</div>
                <div className="text-heading-3 font-bold text-warning-600">{issues.warnings.length}</div>
              </div>
              <div className="bg-white rounded-xl border border-neutral-200 p-4">
                <div className="text-body-small text-neutral-600">Draft</div>
                <div className="text-body-regular font-semibold text-neutral-900">
                  {draftId ? `…${String(draftId).slice(-6)}` : '—'}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <ValidationRunner
                filingId={draftId}
                formData={formData}
                onValidationComplete={(results) => setValidationResults(results)}
              />
            </div>

            {preSubmitBlockers.length > 0 && (
              <div className="bg-white rounded-xl border border-warning-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-warning-600" />
                  <h2 className="text-heading-4 font-semibold text-warning-900">Required before submit</h2>
                </div>
                <div className="space-y-2">
                  {preSubmitBlockers.map((b) => (
                    <div key={b.id} className="flex items-start justify-between gap-3 bg-warning-50 border border-warning-200 rounded-xl p-4">
                      <div className="text-body-regular text-warning-900">
                        <div className="font-medium">{b.title}</div>
                        <div className="text-body-small text-warning-800 mt-1">{b.description}</div>
                      </div>
                      {b.action === 'bankDetails' ? (
                        <button
                          onClick={() => handleFixSection('bankDetails')}
                          className="px-3 py-2 rounded-xl bg-white border border-warning-200 text-warning-800 hover:bg-warning-100 transition-colors text-body-small font-medium"
                        >
                          Fix now
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/profile?returnTo=${encodeURIComponent(`/itr/review?draftId=${draftId}${filingId ? `&filingId=${filingId}` : ''}${selectedITR ? `&itrType=${encodeURIComponent(selectedITR)}` : ''}${assessmentYear ? `&ay=${encodeURIComponent(assessmentYear)}` : ''}`)}`)}
                          className="px-3 py-2 rounded-xl bg-white border border-warning-200 text-warning-800 hover:bg-warning-100 transition-colors text-body-small font-medium"
                        >
                          Go to profile
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {issues.errors.length > 0 && (
              <div className="bg-white rounded-xl border border-error-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="h-5 w-5 text-error-600" />
                  <h2 className="text-heading-4 font-semibold text-error-900">Must fix</h2>
                </div>
                <div className="space-y-2">
                  {issues.errors.map((e) => {
                    const sectionId = normalizeSectionId(e.section || e.field || e.id);
                    return (
                      <div key={e.id || e.message} className="flex items-start justify-between gap-3 bg-error-50 border border-error-200 rounded-xl p-4">
                        <div className="text-body-regular text-error-800">
                          {e.message || String(e)}
                        </div>
                        {sectionId && (
                          <button
                            onClick={() => handleFixSection(sectionId)}
                            className="px-3 py-2 rounded-xl bg-white border border-error-200 text-error-700 hover:bg-error-100 transition-colors text-body-small font-medium"
                          >
                            Fix now
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {issues.warnings.length > 0 && (
              <div className="bg-white rounded-xl border border-warning-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-warning-600" />
                  <h2 className="text-heading-4 font-semibold text-warning-900">Recommended</h2>
                </div>
                <div className="space-y-2">
                  {issues.warnings.map((w) => (
                    <div key={w.id || w.message} className="bg-warning-50 border border-warning-200 rounded-xl p-4 text-body-regular text-warning-800">
                      {w.message || String(w)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-neutral-200 p-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-body-small text-neutral-600">
                <CheckCircle className="h-4 w-4 text-success-600" />
                Submit is enabled once must‑fix issues are resolved.
              </div>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className="px-5 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting…' : 'E‑Verify & Submit'}
              </button>
            </div>
          </>
        )}
      </main>

      <EVerificationModal
        isOpen={showEVerificationModal}
        onClose={() => setShowEVerificationModal(false)}
        draftId={draftId}
        filingId={filingId}
        formData={formData}
        onVerificationComplete={handleVerificationComplete}
      />
    </div>
  );
}
