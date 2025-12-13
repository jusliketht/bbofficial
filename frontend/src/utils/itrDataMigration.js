// =====================================================
// ITR DATA MIGRATION UTILITY
// Migrates old formData structure to new consolidated structure
// Ensures backward compatibility with existing drafts
// =====================================================

/**
 * Migrate formData from old structure to new consolidated structure
 * Old: formData.businessIncome, formData.professionalIncome
 * New: formData.income.businessIncome, formData.income.professionalIncome
 *
 * @param {object} formData - Form data in old or new structure
 * @returns {object} - Form data in new consolidated structure
 */
export const migrateFormDataStructure = (formData) => {
  if (!formData) return formData;

  const migrated = { ...formData };

  // Ensure income object exists
  if (!migrated.income) {
    migrated.income = {};
  }

  // Migrate businessIncome from top-level to income.businessIncome
  if (migrated.businessIncome !== undefined && migrated.income.businessIncome === undefined) {
    migrated.income.businessIncome = migrated.businessIncome;
    // Don't delete top-level yet for backward compatibility during transition
    // Will be cleaned up after all components are updated
  }

  // Migrate professionalIncome from top-level to income.professionalIncome
  if (migrated.professionalIncome !== undefined && migrated.income.professionalIncome === undefined) {
    migrated.income.professionalIncome = migrated.professionalIncome;
    // Don't delete top-level yet for backward compatibility during transition
  }

  // Ensure income.businessIncome has correct structure for ITR-3
  if (migrated.income.businessIncome && typeof migrated.income.businessIncome === 'number') {
    // If it's a number, it might be from ITR-1/2, keep it as is
    // But if we're in ITR-3 context, we might need to convert
    // This will be handled by the component that uses it
  }

  // Ensure income.professionalIncome has correct structure for ITR-3
  if (migrated.income.professionalIncome && typeof migrated.income.professionalIncome === 'number') {
    // If it's a number, it might be from ITR-1/2, keep it as is
    // But if we're in ITR-3 context, we might need to convert
    // This will be handled by the component that uses it
  }

  return migrated;
};

/**
 * Get business income with fallback to old structure
 * @param {object} formData - Form data
 * @returns {any} - Business income data
 */
export const getBusinessIncome = (formData) => {
  if (!formData) return undefined;
  return formData.income?.businessIncome ?? formData.businessIncome;
};

/**
 * Get professional income with fallback to old structure
 * @param {object} formData - Form data
 * @returns {any} - Professional income data
 */
export const getProfessionalIncome = (formData) => {
  if (!formData) return undefined;
  return formData.income?.professionalIncome ?? formData.professionalIncome;
};

/**
 * Update formData with business income (writes to new structure)
 * @param {object} formData - Form data
 * @param {any} businessIncome - Business income data
 * @returns {object} - Updated form data
 */
export const setBusinessIncome = (formData, businessIncome) => {
  if (!formData) return formData;
  const updated = { ...formData };
  if (!updated.income) {
    updated.income = {};
  }
  updated.income.businessIncome = businessIncome;
  // Also update top-level for backward compatibility during transition
  updated.businessIncome = businessIncome;
  return updated;
};

/**
 * Update formData with professional income (writes to new structure)
 * @param {object} formData - Form data
 * @param {any} professionalIncome - Professional income data
 * @returns {object} - Updated form data
 */
export const setProfessionalIncome = (formData, professionalIncome) => {
  if (!formData) return formData;
  const updated = { ...formData };
  if (!updated.income) {
    updated.income = {};
  }
  updated.income.professionalIncome = professionalIncome;
  // Also update top-level for backward compatibility during transition
  updated.professionalIncome = professionalIncome;
  return updated;
};

