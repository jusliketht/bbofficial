// =====================================================
// KNOWLEDGE BASE FEATURE - BARREL EXPORTS
// =====================================================

// Services
export { knowledgeBaseService } from './services/knowledge-base.service';

// Hooks
export {
  useSearchKnowledgeBase,
  useTopic,
  useSectionExplanation,
} from './hooks/use-knowledge-base';

// Components
export { default as KnowledgeBase } from './components/knowledge-base';
export { default as SearchBar } from './components/search-bar';
export { default as TopicGuide } from './components/topic-guide';
export { default as SectionExplainer } from './components/section-explainer';
export { default as ITRFormGuide } from './components/itr-form-guide';
export { default as TaxTips } from './components/tax-tips';

