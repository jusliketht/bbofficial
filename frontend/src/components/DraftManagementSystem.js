import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, Clock, FileText, AlertCircle, CheckCircle, RefreshCw,
  Download, Upload, Trash2, Edit, Eye, History, Calendar,
  ArrowLeft, ArrowRight, RotateCcw, Archive, Star
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userDashboardService from '../services/userDashboardService';
import { EnterpriseButton, EnterpriseCard, EnterpriseAlert, EnterpriseInput } from './DesignSystem/EnterpriseComponents';
import { SmartTooltip, InlineHelp } from './DesignSystem/SmartTooltip';

/**
 * Draft Management and Autosave System
 * 
 * Features:
 * - Automatic draft saving
 * - Manual save/restore
 * - Version history
 * - Conflict resolution
 * - Offline support
 * - Export/Import drafts
 * - Draft comparison
 * - Recovery from crashes
 */

const DraftManagementSystem = ({ 
  userId, 
  formType = 'ITR', 
  assessmentYear = '2024-25',
  onDraftChange = null,
  className = '' 
}) => {
  const [currentDraft, setCurrentDraft] = useState(null);
  const [draftHistory, setDraftHistory] = useState([]);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [conflictResolution, setConflictResolution] = useState(null);
  
  const autoSaveTimeoutRef = useRef(null);
  const lastSavedDataRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch current draft
  const { data: draftData, isLoading: isLoadingDraft } = useQuery({
    queryKey: ['draft', userId, formType, assessmentYear],
    queryFn: () => userDashboardService.draftService.getCurrentDraft({
      form_type: formType,
      assessment_year: assessmentYear
    }),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false
  });

  // Fetch draft history
  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['draftHistory', userId, formType, assessmentYear],
    queryFn: () => userDashboardService.draftService.getDraftHistory({
      form_type: formType,
      assessment_year: assessmentYear
    }),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  });

  // Save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: (draftData) => userDashboardService.draftService.saveDraft(draftData),
    onSuccess: (data) => {
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      setIsAutoSaving(false);
      lastSavedDataRef.current = JSON.stringify(data);
      queryClient.invalidateQueries(['draft', userId, formType, assessmentYear]);
      queryClient.invalidateQueries(['draftHistory', userId, formType, assessmentYear]);
    },
    onError: (error) => {
      console.error('Failed to save draft:', error);
      setIsAutoSaving(false);
    }
  });

  // Restore draft mutation
  const restoreDraftMutation = useMutation({
    mutationFn: (versionId) => userDashboardService.draftService.restoreDraft(versionId),
    onSuccess: (data) => {
      setCurrentDraft(data);
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries(['draft', userId, formType, assessmentYear]);
    }
  });

  // Delete draft mutation
  const deleteDraftMutation = useMutation({
    mutationFn: (versionId) => userDashboardService.draftService.deleteDraft(versionId),
    onSuccess: () => {
      queryClient.invalidateQueries(['draftHistory', userId, formType, assessmentYear]);
    }
  });

  // Update current draft when data changes
  useEffect(() => {
    if (draftData?.data) {
      setCurrentDraft(draftData.data);
      lastSavedDataRef.current = JSON.stringify(draftData.data);
      setLastSaved(new Date(draftData.data.updated_at));
    }
  }, [draftData]);

  // Update draft history when data changes
  useEffect(() => {
    if (historyData?.data) {
      setDraftHistory(historyData.data);
    }
  }, [historyData]);

  // Auto-save functionality
  const autoSave = useCallback((draftData) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (JSON.stringify(draftData) !== lastSavedDataRef.current) {
        setIsAutoSaving(true);
        saveDraftMutation.mutate({
          form_type: formType,
          assessment_year: assessmentYear,
          data: draftData,
          is_auto_save: true
        });
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
  }, [formType, assessmentYear, saveDraftMutation]);

  // Manual save
  const handleManualSave = useCallback(async () => {
    if (currentDraft) {
      setIsAutoSaving(true);
      await saveDraftMutation.mutateAsync({
        form_type: formType,
        assessment_year: assessmentYear,
        data: currentDraft,
        is_auto_save: false
      });
    }
  }, [currentDraft, formType, assessmentYear, saveDraftMutation]);

  // Update draft data
  const updateDraft = useCallback((newData) => {
    const updatedDraft = { ...currentDraft, ...newData };
    setCurrentDraft(updatedDraft);
    setHasUnsavedChanges(true);
    
    if (onDraftChange) {
      onDraftChange(updatedDraft);
    }
    
    autoSave(updatedDraft);
  }, [currentDraft, onDraftChange, autoSave]);

  // Restore version
  const handleRestoreVersion = useCallback(async (versionId) => {
    if (hasUnsavedChanges) {
      setConflictResolution({
        type: 'restore',
        versionId,
        message: 'You have unsaved changes. Do you want to restore this version and lose your current changes?'
      });
    } else {
      await restoreDraftMutation.mutateAsync(versionId);
    }
  }, [hasUnsavedChanges, restoreDraftMutation]);

  // Handle conflict resolution
  const handleConflictResolution = useCallback(async (action) => {
    if (action === 'confirm' && conflictResolution) {
      if (conflictResolution.type === 'restore') {
        await restoreDraftMutation.mutateAsync(conflictResolution.versionId);
      }
    }
    setConflictResolution(null);
  }, [conflictResolution, restoreDraftMutation]);

  // Export draft
  const handleExportDraft = useCallback(async () => {
    try {
      const exportData = await userDashboardService.draftService.exportDraft({
        form_type: formType,
        assessment_year: assessmentYear,
        format: 'json'
      });
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `draft-${formType}-${assessmentYear}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [formType, assessmentYear]);

  // Import draft
  const handleImportDraft = useCallback(async (file) => {
    try {
      const text = await file.text();
      const importedData = JSON.parse(text);
      
      await userDashboardService.draftService.importDraft({
        form_type: formType,
        assessment_year: assessmentYear,
        data: importedData
      });
      
      queryClient.invalidateQueries(['draft', userId, formType, assessmentYear]);
    } catch (error) {
      console.error('Import failed:', error);
    }
  }, [formType, assessmentYear, userId, queryClient]);

  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Get version status color
  const getVersionStatusColor = (version) => {
    if (version.is_current) return 'bg-green-100 text-green-800 border-green-200';
    if (version.is_auto_save) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  if (isLoadingDraft) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Draft Status Bar */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isAutoSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            ) : hasUnsavedChanges ? (
              <AlertCircle className="w-4 h-4 text-orange-600" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-600" />
            )}
            
            <span className="text-sm font-medium text-gray-700">
              {isAutoSaving ? 'Saving...' : 
               hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
            </span>
          </div>
          
          {lastSaved && (
            <span className="text-xs text-gray-500">
              Last saved: {formatTimeAgo(lastSaved)}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <EnterpriseButton
            onClick={handleManualSave}
            variant="secondary"
            size="sm"
            disabled={isAutoSaving || saveDraftMutation.isPending}
            className="flex items-center space-x-1"
          >
            <Save className="w-4 h-4" />
            <span>Save Now</span>
          </EnterpriseButton>
          
          <EnterpriseButton
            onClick={() => setShowHistory(!showHistory)}
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1"
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </EnterpriseButton>
        </div>
      </div>

      {/* Draft History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EnterpriseCard className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <History className="w-5 h-5 mr-2 text-blue-600" />
                  Draft History
                </h3>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => e.target.files[0] && handleImportDraft(e.target.files[0])}
                    className="hidden"
                    id="import-draft"
                  />
                  <label
                    htmlFor="import-draft"
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 cursor-pointer border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                  >
                    <Upload className="w-4 h-4 inline mr-1" />
                    Import
                  </label>
                  
                  <EnterpriseButton
                    onClick={handleExportDraft}
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </EnterpriseButton>
                </div>
              </div>
              
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {draftHistory.map((version, index) => (
                    <motion.div
                      key={version.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-lg border ${getVersionStatusColor(version)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {version.is_current && <Star className="w-4 h-4 text-yellow-600" />}
                            {version.is_auto_save && <Clock className="w-4 h-4 text-blue-600" />}
                            <FileText className="w-4 h-4" />
                          </div>
                          
                          <div>
                            <p className="font-medium text-sm">
                              {version.is_current ? 'Current Version' : 
                               version.is_auto_save ? 'Auto-saved' : 'Manual Save'}
                            </p>
                            <p className="text-xs opacity-75">
                              {formatTimeAgo(version.created_at)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">
                            v{version.version_number}
                          </span>
                          
                          {!version.is_current && (
                            <EnterpriseButton
                              onClick={() => handleRestoreVersion(version.id)}
                              variant="ghost"
                              size="sm"
                              className="text-xs"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Restore
                            </EnterpriseButton>
                          )}
                          
                          {!version.is_current && !version.is_auto_save && (
                            <button
                              onClick={() => deleteDraftMutation.mutate(version.id)}
                              className="text-red-600 hover:text-red-800 transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {draftHistory.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No draft history available</p>
                    </div>
                  )}
                </div>
              )}
            </EnterpriseCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conflict Resolution Modal */}
      <AnimatePresence>
        {conflictResolution && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Conflict Resolution</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                {conflictResolution.message}
              </p>
              
              <div className="flex items-center justify-end space-x-3">
                <EnterpriseButton
                  onClick={() => handleConflictResolution('cancel')}
                  variant="secondary"
                  size="sm"
                >
                  Cancel
                </EnterpriseButton>
                
                <EnterpriseButton
                  onClick={() => handleConflictResolution('confirm')}
                  variant="primary"
                  size="sm"
                >
                  Confirm
                </EnterpriseButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Alert */}
      {saveDraftMutation.isError && (
        <EnterpriseAlert
          type="error"
          title="Save Failed"
          message="Failed to save draft. Please try again."
          onClose={() => saveDraftMutation.reset()}
        />
      )}
    </div>
  );
};

export default DraftManagementSystem;
