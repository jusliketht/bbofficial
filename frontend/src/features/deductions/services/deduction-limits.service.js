// =====================================================
// DEDUCTION LIMITS SERVICE
// Calculate utilization, remaining limits, and aggregate totals
// =====================================================

import { DEDUCTION_LIMITS, AGE_THRESHOLDS } from '../constants/deduction-limits';

class DeductionLimitsService {
  /**
   * Calculate utilization for a specific section
   */
  calculateSectionUtilization(section, claimedAmount, userAge = 30, totalIncome = 0) {
    const sectionKey = `section${section}`;
    const limitConfig = DEDUCTION_LIMITS[sectionKey];

    if (!limitConfig) {
      return {
        section,
        limit: 0,
        claimed: claimedAmount || 0,
        remaining: 0,
        percentage: 0,
      };
    }

    let limit = 0;

    // Handle age-based limits
    if (section === '80D') {
      const isSeniorCitizen = userAge >= AGE_THRESHOLDS.seniorCitizen;
      limit = isSeniorCitizen ? limitConfig.seniorCitizenSelf : limitConfig.selfFamily;
    } else if (section === '80TTA' || section === '80TTB') {
      const isSeniorCitizen = userAge >= AGE_THRESHOLDS.seniorCitizen;
      limit = isSeniorCitizen ? DEDUCTION_LIMITS.section80TTB.limit : DEDUCTION_LIMITS.section80TTA.limit;
    } else if (section === '80DD' || section === '80U') {
      // These have fixed amounts based on disability percentage, not a limit
      limit = claimedAmount || 0;
    } else if (section === '80GG') {
      // Complex calculation: Lower of (Rent - 10% income), ₹60,000, or 25% income
      const rentMinus10Percent = claimedAmount - (totalIncome * 0.1);
      const twentyFivePercent = totalIncome * 0.25;
      limit = Math.min(rentMinus10Percent, 60000, twentyFivePercent);
    } else if (typeof limitConfig.limit === 'number') {
      limit = limitConfig.limit;
    } else if (limitConfig.employee) {
      limit = limitConfig.employee; // For 80CCD
    } else {
      limit = Infinity; // No limit (80G, 80GGA, 80GGC, 80E)
    }

    const claimed = claimedAmount || 0;
    const remaining = limit === Infinity ? Infinity : Math.max(0, limit - claimed);
    const percentage = limit === Infinity ? (claimed > 0 ? 100 : 0) : Math.min((claimed / limit) * 100, 100);

    return {
      section,
      limit,
      claimed,
      remaining,
      percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal
    };
  }

  /**
   * Calculate utilization for all sections
   */
  calculateAllUtilizations(deductions, userAge = 30, totalIncome = 0) {
    const sections = [
      '80C',
      '80CCC',
      '80CCD',
      '80D',
      '80DD',
      '80DDB',
      '80E',
      '80EE',
      '80G',
      '80GG',
      '80GGA',
      '80GGC',
      '80TTA',
      '80U',
    ];

    const utilizations = sections.map((section) => {
      const claimedAmount = deductions[`section${section}`] || 0;
      return this.calculateSectionUtilization(section, claimedAmount, userAge, totalIncome);
    });

    const totalClaimed = utilizations.reduce((sum, u) => sum + u.claimed, 0);
    const totalAvailable = utilizations.reduce((sum, u) => {
      return sum + (u.limit === Infinity ? 0 : u.limit);
    }, 0);
    const overallPercentage = totalAvailable > 0 ? (totalClaimed / totalAvailable) * 100 : 0;

    return {
      sections: utilizations,
      totalClaimed,
      totalAvailable,
      overallPercentage: Math.round(overallPercentage * 10) / 10,
    };
  }

  /**
   * Get remaining deduction opportunities
   */
  getRemainingOpportunities(utilizations) {
    return utilizations.sections
      .filter((u) => u.remaining > 0 && u.limit !== Infinity)
      .sort((a, b) => b.remaining - a.remaining)
      .slice(0, 5); // Top 5 opportunities
  }
}

export const deductionLimitsService = new DeductionLimitsService();

