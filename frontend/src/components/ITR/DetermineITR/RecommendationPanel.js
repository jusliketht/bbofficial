import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

const ConfidencePill = ({ confidence }) => {
  const label = confidence || null;
  if (!label) return null;

  const normalized = String(label).toLowerCase();
  const tone =
    normalized === 'high'
      ? { bg: 'bg-success-100', text: 'text-success-800', border: 'border-success-200' }
      : normalized === 'medium'
        ? { bg: 'bg-primary-100', text: 'text-primary-900', border: 'border-primary-200' }
        : { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-body-small font-semibold border ${tone.bg} ${tone.text} ${tone.border}`}
    >
      Confidence: {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
    </span>
  );
};

export default function RecommendationPanel({
  mode = 'recommended', // 'recommended' | 'selected'
  itrType,
  reason,
  incomeSourcesPreview = [],
  confidence = null, // 'High' | 'Medium' | 'Low' | null
  onContinue,
  onChangeITR,
}) {
  const heading = mode === 'selected' ? 'Selected ITR' : 'Recommended ITR';
  const subtext =
    mode === 'selected'
      ? 'You selected this ITR. We’ll set up your return for it.'
      : 'We’ll set up your return for this ITR. You can edit if anything changes.';

  const whyText =
    (typeof reason === 'string' && reason.trim()) ||
    'Based on your income sources and eligibility.';

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-elevation-2 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-primary-700" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-body-small text-slate-600">{heading}</div>
              <div className="text-heading-2 font-bold text-slate-900 truncate">{itrType || '—'}</div>
            </div>
          </div>
          <p className="text-body-regular text-slate-600 mt-2">{subtext}</p>
        </div>
        <div className="flex-shrink-0">
          <ConfidencePill confidence={confidence} />
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-4">
        <div className="text-body-regular font-semibold text-slate-900 mb-1">Why this ITR?</div>
        <div className="text-body-regular text-slate-700">{whyText}</div>
        {Array.isArray(incomeSourcesPreview) && incomeSourcesPreview.length > 0 && (
          <ul className="mt-3 space-y-1">
            {incomeSourcesPreview.slice(0, 3).map((line) => (
              <li key={line} className="flex items-start gap-2 text-body-small text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          type="button"
          onClick={onContinue}
          disabled={!itrType}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </button>

        {onChangeITR && (
          <button
            type="button"
            onClick={onChangeITR}
            className="px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors font-semibold"
          >
            Change ITR
          </button>
        )}
      </div>
    </section>
  );
}
