// =====================================================
// USE KNOWLEDGE BASE HOOK
// React Query hooks for knowledge base
// =====================================================

import { useQuery, useMutation } from '@tanstack/react-query';
import { knowledgeBaseService } from '../services/knowledge-base.service';

export const knowledgeBaseKeys = {
  all: ['knowledgeBase'],
  search: (query, options) => [...knowledgeBaseKeys.all, 'search', query, options],
  topic: (topicId) => [...knowledgeBaseKeys.all, 'topic', topicId],
  section: (sectionId) => [...knowledgeBaseKeys.all, 'section', sectionId],
};

/**
 * Hook for searching knowledge base
 */
export function useSearchKnowledgeBase(query, options = {}) {
  return useQuery({
    queryKey: knowledgeBaseKeys.search(query, options),
    queryFn: () => knowledgeBaseService.search(query, options),
    enabled: !!query && query.length >= 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for fetching topic
 */
export function useTopic(topicId) {
  return useQuery({
    queryKey: knowledgeBaseKeys.topic(topicId),
    queryFn: () => knowledgeBaseService.getTopic(topicId),
    enabled: !!topicId,
    staleTime: 30 * 60 * 1000, // 30 minutes (content doesn't change often)
  });
}

/**
 * Hook for fetching section explanation
 */
export function useSectionExplanation(sectionId) {
  return useQuery({
    queryKey: knowledgeBaseKeys.section(sectionId),
    queryFn: () => knowledgeBaseService.getSectionExplanation(sectionId),
    enabled: !!sectionId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

