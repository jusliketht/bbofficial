// =====================================================
// INVESTMENT PLANNING FEATURE - BARREL EXPORTS
// =====================================================

// Services
export { investmentPlanningService } from './services/investment-planning.service';

// Hooks
export {
  useInvestmentRecommendations,
  useNPSCalculator,
} from './hooks/use-investment-planning';

// Components
export { default as InvestmentPlanner } from './components/investment-planner';
export { default as Section80CPlanner } from './components/section80c-planner';
export { default as NPSCalculator } from './components/nps-calculator';
export { default as HealthInsurancePlanner } from './components/health-insurance-planner';
export { default as TaxSavingSuggestions } from './components/tax-saving-suggestions';

