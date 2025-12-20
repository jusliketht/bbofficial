// =====================================================
// FINANCIAL YEAR EVENTS STRIP
// Read-only informational chips showing key events inferred from filing data
// =====================================================

import { CheckCircle, Briefcase, Building2, TrendingUp, Shield, FileText, Clock } from 'lucide-react';

const FinancialYearEvents = ({ blueprint, formData }) => {
  if (!blueprint) {
    return null;
  }

  const { income, savings, filingState } = blueprint;
  const events = [];

  // Event 1: Salary Income
  const salaryAmount = income?.sources?.find(s => s.type === 'salary')?.amount || income?.salary || 0;
  if (salaryAmount > 0) {
    events.push({
      icon: Briefcase,
      label: 'Salary Income',
      color: 'blue',
    });
  }

  // Event 2: Multiple Employers (if multiple Form-16s or salary sources)
  const form16Count = formData?.form16s?.length || formData?.income?.salary?.form16s?.length || 0;
  if (form16Count > 1) {
    events.push({
      icon: Building2,
      label: 'Multiple Employers',
      color: 'purple',
    });
  }

  // Event 3: Business/Professional Income
  const businessIncome = income?.sources?.find(s => s.type === 'business')?.amount || income?.businessIncome || 0;
  const professionalIncome = income?.sources?.find(s => s.type === 'professional')?.amount || income?.professionalIncome || 0;
  if (businessIncome > 0 || professionalIncome > 0) {
    events.push({
      icon: TrendingUp,
      label: businessIncome > 0 ? 'Business Income' : 'Professional Income',
      color: 'green',
    });
  }

  // Event 4: Investments Made (Section 80C) - infer from formData or savings
  const section80C = formData?.deductions?.section80C;
  const total80C = section80C
    ? Object.values(section80C).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
    : 0;
  // Also check if savings.fromDeductions suggests investments were made
  if (total80C > 0 || (savings?.fromDeductions > 0 && savings.fromDeductions >= 50000)) {
    events.push({
      icon: TrendingUp,
      label: 'Investments Made',
      color: 'emerald',
    });
  }

  // Event 5: Insurance Paid (Section 80D) - infer from formData
  const section80D = formData?.deductions?.section80D;
  const total80D = section80D
    ? Object.values(section80D).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
    : 0;
  if (total80D > 0) {
    events.push({
      icon: Shield,
      label: 'Insurance Paid',
      color: 'teal',
    });
  }

  // Event 6: Capital Gains
  const capitalGains = income?.sources?.find(s => s.type === 'capitalGains')?.amount || income?.capitalGains || 0;
  if (capitalGains > 0) {
    events.push({
      icon: TrendingUp,
      label: 'Capital Gains',
      color: 'amber',
    });
  }

  // Event 7: Filing Status
  if (filingState?.canFile) {
    events.push({
      icon: CheckCircle,
      label: 'Ready to File',
      color: 'green',
    });
  } else if (filingState?.canEdit || filingState?.canCompute) {
    events.push({
      icon: Clock,
      label: 'Filing In Progress',
      color: 'blue',
    });
  }

  if (events.length === 0) {
    return null;
  }

  // Color mapping for chips
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-2">
        {events.map((event, idx) => {
          const Icon = event.icon;
          return (
            <div
              key={idx}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-body-small font-medium ${colorClasses[event.color] || colorClasses.blue}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{event.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FinancialYearEvents;

