// =====================================================
// COMPLETE PROFILE GATE (END USER)
// Hybrid gating: require PAN verified + DOB before /itr/computation
// =====================================================

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

function decodeReturnTo(value) {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default function CompleteProfileGate() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, isLoading, updateProfile, refreshProfile } = useAuth();

  const returnToRaw = searchParams.get('returnTo');
  const returnTo = decodeReturnTo(returnToRaw) || '/dashboard';
  const returnState = location.state?.returnState || null;

  const [dob, setDob] = useState('');
  const [savingDob, setSavingDob] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const panOk = !!user?.panVerified;
  const dobOk = !!user?.dateOfBirth;

  const gatePasses = panOk && dobOk;

  useEffect(() => {
    // Keep DOB input in sync with profile
    const existing = user?.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : '';
    setDob(existing);
  }, [user?.dateOfBirth]);

  useEffect(() => {
    // Best-effort refresh on mount so we don't rely on stale AuthContext state
    const run = async () => {
      if (isLoading) return;
      if (!user) return;
      if (!refreshProfile) return;
      setRefreshing(true);
      try {
        await refreshProfile();
      } finally {
        setRefreshing(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && user && gatePasses) {
      navigate(returnTo, { replace: true, state: returnState || undefined });
    }
  }, [gatePasses, isLoading, navigate, returnState, returnTo, user]);

  const missing = useMemo(() => {
    return {
      pan: !panOk,
      dob: !dobOk,
    };
  }, [dobOk, panOk]);

  const handleSaveDob = async () => {
    if (!dob) {
      toast.error('Please select your date of birth.');
      return;
    }
    setSavingDob(true);
    try {
      const resp = await updateProfile({ dateOfBirth: dob });
      if (!resp?.success) {
        throw new Error(resp?.message || 'Failed to save date of birth');
      }
      if (refreshProfile) await refreshProfile();
      toast.success('Date of birth saved.');
    } catch (e) {
      toast.error(e?.message || 'Failed to save date of birth');
    } finally {
      setSavingDob(false);
    }
  };

  const handleVerifyPan = () => {
    // Use query param so PANVerification can return directly to the blocked step.
    navigate(`/itr/pan-verification?returnTo=${encodeURIComponent(returnTo)}`, {
      state: {
        // Gate can be entered from many places; keep original state if present.
        ...(location.state || {}),
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-elevation-2 p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-warning-700" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-heading-3 font-semibold text-slate-900">
                Complete your profile to continue
              </h1>
              <p className="text-body-regular text-slate-600 mt-1">
                We need a couple of basics before we start your filing.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {/* PAN */}
            <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {panOk ? (
                    <CheckCircle className="w-4 h-4 text-success-600" aria-hidden="true" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-error-600" aria-hidden="true" />
                  )}
                  <div className="text-body-regular font-medium text-slate-900">PAN verification</div>
                </div>
                <div className="text-body-small text-slate-600 mt-1">
                  {panOk ? 'Verified' : 'Verify your PAN to proceed to computation.'}
                </div>
              </div>
              {!panOk && (
                <button
                  onClick={handleVerifyPan}
                  className="px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-body-regular font-medium"
                >
                  Verify PAN
                </button>
              )}
            </div>

            {/* DOB */}
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                {dobOk ? (
                  <CheckCircle className="w-4 h-4 text-success-600" aria-hidden="true" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-error-600" aria-hidden="true" />
                )}
                <div className="text-body-regular font-medium text-slate-900">Date of birth</div>
              </div>
              <div className="text-body-small text-slate-600 mt-1">
                {dobOk ? 'Saved' : 'Add your DOB (used for age-based tax rules).'}
              </div>

              <div className="mt-3 flex flex-col sm:flex-row gap-3">
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
                />
                {!dobOk && (
                  <button
                    onClick={handleSaveDob}
                    disabled={savingDob}
                    className="px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-60 transition-colors text-body-regular font-medium"
                  >
                    {savingDob ? 'Saving…' : 'Save DOB'}
                  </button>
                )}
              </div>
            </div>

            {/* Refresh + Status */}
            {(missing.pan || missing.dob) && (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-body-small text-slate-600">
                    After completing the missing items, we’ll automatically continue to your filing.
                  </div>
                  <button
                    onClick={async () => {
                      if (!refreshProfile) return;
                      setRefreshing(true);
                      try {
                        await refreshProfile();
                      } finally {
                        setRefreshing(false);
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-body-small font-medium text-slate-700"
                    disabled={refreshing}
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
                    Refresh status
                  </button>
                </div>
              </div>
            )}

            {gatePasses && (
              <button
                onClick={() => navigate(returnTo, { replace: true, state: returnState || undefined })}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-body-regular font-semibold"
              >
                Continue to filing
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <p className="text-body-small text-slate-500 mt-4">
          Return target: <span className="font-mono">{returnTo}</span>
        </p>
      </div>
    </div>
  );
}
