// =====================================================
// MAIN DESIGN SYSTEM EXPORT
// Clean exports for the modular design system
// =====================================================

// Design tokens
export { DESIGN_TOKENS, COLORS, TYPOGRAPHY, SPACING, ANIMATIONS } from './tokens';

// Base components
export {
  Button,
  Input,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Modal,
  Badge,
} from './components';

// Enhanced components
export { default as StatusBadge, StatusDot } from './StatusBadge';
export { default as EmptyState, NoDataEmptyState, UploadEmptyState, ErrorEmptyState, NoResultsEmptyState } from './EmptyState';
export { default as DataProvenanceIndicator } from './DataProvenanceIndicator';
export { default as LoadingState, SkeletonLoader, InlineLoader } from './LoadingState';
export { default as ErrorBoundary } from './ErrorBoundary';

// Legacy exports for backward compatibility
import DESIGN_TOKENS from './tokens';
import Components from './components';

export default {
  DESIGN_TOKENS,
  ...Components,
};
