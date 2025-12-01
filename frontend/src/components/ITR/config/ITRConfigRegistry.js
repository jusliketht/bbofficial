// =====================================================
// ITR CONFIG REGISTRY
// Central registry for all ITR form configurations
// =====================================================

import ITR1_CONFIG from './ITR1Config';
import ITR2_CONFIG from './ITR2Config';
import ITR3_CONFIG from './ITR3Config';
import ITR4_CONFIG from './ITR4Config';

const ITR_CONFIG_REGISTRY = {
  'ITR-1': ITR1_CONFIG,
  'ITR-2': ITR2_CONFIG,
  'ITR-3': ITR3_CONFIG,
  'ITR-4': ITR4_CONFIG,
};

/**
 * Get ITR configuration by type
 * @param {string} itrType - ITR type (ITR-1, ITR-2, ITR-3, ITR-4)
 * @returns {object} ITR configuration object
 */
export const getITRConfig = (itrType) => {
  const config = ITR_CONFIG_REGISTRY[itrType];
  if (!config) {
    throw new Error(`Invalid ITR type: ${itrType}`);
  }
  return config;
};

/**
 * Get all available ITR types
 * @returns {string[]} Array of ITR types
 */
export const getAvailableITRTypes = () => {
  return Object.keys(ITR_CONFIG_REGISTRY);
};

/**
 * Get section configuration for a specific ITR type
 * @param {string} itrType - ITR type
 * @param {string} sectionId - Section ID
 * @returns {object|null} Section configuration or null if not found
 */
export const getSectionConfig = (itrType, sectionId) => {
  const config = getITRConfig(itrType);
  return config.sections.find(section => section.id === sectionId) || null;
};

/**
 * Get field configuration for a specific ITR type and section
 * @param {string} itrType - ITR type
 * @param {string} sectionId - Section ID
 * @param {string} fieldId - Field ID
 * @returns {object|null} Field configuration or null if not found
 */
export const getFieldConfig = (itrType, sectionId, fieldId) => {
  const section = getSectionConfig(itrType, sectionId);
  if (!section) return null;

  return section.fields.find(field => field.id === fieldId) || null;
};

/**
 * Get all sections for an ITR type
 * @param {string} itrType - ITR type
 * @returns {array} Array of section configurations
 */
export const getSections = (itrType) => {
  const config = getITRConfig(itrType);
  return config.sections || [];
};

/**
 * Check if a field should be displayed based on conditions
 * @param {object} field - Field configuration
 * @param {object} formData - Current form data
 * @returns {boolean} Whether field should be displayed
 */
export const shouldDisplayField = (field, formData) => {
  if (!field.conditional) return true;

  const { field: conditionalField, value: conditionalValue } = field.conditional;
  const fieldPath = conditionalField.split('.');
  let fieldValue = formData;

  for (const path of fieldPath) {
    if (fieldValue && typeof fieldValue === 'object') {
      fieldValue = fieldValue[path];
    } else {
      return false;
    }
  }

  return fieldValue === conditionalValue;
};

/**
 * Get required fields for an ITR type
 * @param {string} itrType - ITR type
 * @returns {array} Array of required field paths
 */
export const getRequiredFields = (itrType) => {
  const config = getITRConfig(itrType);
  const requiredFields = [];

  config.sections.forEach(section => {
    section.fields.forEach(field => {
      if (field.required) {
        requiredFields.push(`${section.id}.${field.id}`);
      }
    });
  });

  return requiredFields;
};

export default ITR_CONFIG_REGISTRY;

