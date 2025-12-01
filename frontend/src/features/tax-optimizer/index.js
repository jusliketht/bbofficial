// =====================================================
// TAX OPTIMIZER FEATURE - BARREL EXPORTS
// =====================================================

export { default as TaxOptimizer } from './components/tax-optimizer';
export { default as ScenarioBuilder } from './components/scenario-builder';
export { default as SimulationResults } from './components/simulation-results';
export { default as AISuggestions } from './components/ai-suggestions';

export {
  useOptimizationOpportunities,
  useSimulateScenario,
  useCompareScenarios,
  useApplySimulation,
  taxOptimizerKeys,
} from './hooks/use-tax-optimizer';

export { default as taxSimulationService } from './services/tax-simulation.service';

