// =====================================================
// NAVIGATION ROUTES CONSTANTS
// =====================================================

export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',

  // Dashboard
  DASHBOARD: '/dashboard',
  HOME: '/home',

  // ITR Filing Flow
  ITR_START: '/itr/select-person', // Legacy route, redirects to select-person
  ITR_SELECT_PERSON: '/itr/select-person',
  ITR_COMPUTATION: '/itr/computation',
  ITR_FILING_HISTORY: '/filing-history',

  // Members
  ADD_MEMBERS: '/add-members',

  // User
  PROFILE: '/profile',
  DOCUMENTS: '/documents',
  SETTINGS: '/settings',
};

export const FILING_CONTEXT = {
  SELF: 'self',
  FAMILY: 'family',
};

export const MEMBER_TYPE = {
  SELF: 'self',
  FAMILY: 'family',
};

