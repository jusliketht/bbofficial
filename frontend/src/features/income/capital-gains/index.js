// Barrel exports for capital gains feature
// Note: Components are exported directly from income/index.js to avoid circular dependencies
// Only export hooks, services, and utilities here

// Export hooks
export * from './hooks/use-capital-gains';
export * from './hooks/use-ais-integration';

// Export services (named exports to avoid circular dependency)
export { capitalGainsService } from './services/capital-gains.service';
export { capitalGainsAISService } from './services/ais-integration.service';

// Export schema
export * from './schema/capital-gains.schema';

// Export individual components (for direct imports when needed)
export { default as CapitalGainsBreakdown } from './components/capital-gains-breakdown';
export { default as CapitalGainsCalculator } from './components/capital-gains-calculator';
export { default as TaxHarvestingHelper } from './components/tax-harvesting-helper';
export { default as AISCapitalGainsPopup } from './components/ais-capital-gains-popup';

