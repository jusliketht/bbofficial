// =====================================================
// PAN VERIFICATION CONSTANTS
// =====================================================

export const PAN_STATUS = {
  VERIFIED: 'verified',
  NOT_VERIFIED: 'not_verified',
  NO_PAN: 'no_pan',
};

export const PAN_STATUS_MESSAGES = {
  VERIFIED: 'PAN Verified',
  NOT_VERIFIED: 'PAN Not Verified',
  NO_PAN: 'No PAN Added',
};

export const PAN_FORMAT_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const PAN_LENGTH = 10;

