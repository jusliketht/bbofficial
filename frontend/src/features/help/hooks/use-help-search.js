// =====================================================
// HELP SEARCH HOOKS
// React Query hooks for help content search
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { helpService } from '../services/help.service';
import toast from 'react-hot-toast';

/**
 * Query keys factory for help content
 */
export const helpKeys = {
  all: ['help'],
  search: (query, filters) => [...helpKeys.all, 'search', query, filters],
  articles: (category, pagination) => [...helpKeys.all, 'articles', category, pagination],
  article: (articleId) => [...helpKeys.all, 'article', articleId],
};

/**
 * Hook to search help content
 */
export function useHelpSearch(query, filters = {}, enabled = true) {
  return useQuery({
    queryKey: helpKeys.search(query, filters),
    queryFn: () => helpService.searchHelpContent(query, filters),
    enabled: enabled && !!query && query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get articles by category
 */
export function useArticlesByCategory(category, pagination = {}) {
  return useQuery({
    queryKey: helpKeys.articles(category, pagination),
    queryFn: () => helpService.getArticlesByCategory(category, pagination),
    keepPreviousData: true,
  });
}

/**
 * Hook to get article details
 */
export function useArticleDetails(articleId) {
  return useQuery({
    queryKey: helpKeys.article(articleId),
    queryFn: () => helpService.getArticleDetails(articleId),
    enabled: !!articleId,
  });
}

/**
 * Hook to submit article feedback
 */
export function useSubmitArticleFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ articleId, feedback }) => helpService.submitArticleFeedback(articleId, feedback),
    onSuccess: () => {
      toast.success('Thank you for your feedback!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit feedback');
    },
  });
}

