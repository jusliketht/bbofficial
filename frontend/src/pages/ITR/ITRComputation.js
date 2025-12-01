// =====================================================
// ITR COMPUTATION PAGE
// Single page with expandable sections for ITR filing
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Download,
  FileText,
  User,
  IndianRupee,
  Calculator,
  CreditCard,
  Building2,
  CheckCircle,
  Globe,
} from 'lucide-react';
import ComputationSection from '../../components/ITR/ComputationSection';
import ComputationSheet from '../../components/ITR/ComputationSheet';
import TaxRegimeToggle from '../../components/ITR/TaxRegimeToggle';
import YearSelector from '../../components/ITR/YearSelector';
import { itrJsonExportService } from '../../services/itrJsonExportService';
import { DataVerificationPanel } from '../../features/discrepancy';
import itrAutoFillService from '../../services/ITRAutoFillService';
import aiRecommendationEngine from '../../services/AIRecommendationEngine';
import apiClient from '../../services/core/APIClient';
import toast from 'react-hot-toast';
import { Loader, Lightbulb, AlertTriangle, Info } from 'lucide-react';
import BreathingGrid from '../../components/DesignSystem/BreathingGrid';
import SectionCard from '../../components/DesignSystem/SectionCard';
import TaxComputationBar from '../../components/ITR/TaxComputationBar';
import PauseResumeButton from '../../components/ITR/PauseResumeButton';
import InvoiceBadge from '../../components/ITR/InvoiceBadge';
import ResumeFilingModal from '../../components/ITR/ResumeFilingModal';
import itrService from '../../services/api/itrService';
import { useAuth } from '../../contexts/AuthContext';
import { isCA } from '../../constants/roles';
import DocumentChecklist from '../../components/CA/DocumentChecklist';
import CANotes from '../../components/CA/CANotes';
import ClientCommunication from '../../components/CA/ClientCommunication';
import ITRFormSelector from '../../components/ITR/ITRFormSelector';
import EVerificationModal from '../../components/ITR/EVerificationModal';
import { ScheduleFA } from '../../features/foreign-assets';
import { TaxOptimizer } from '../../features/tax-optimizer';
import { useExportDraftPDF } from '../../features/pdf-export/hooks/use-pdf-export';
import PDFExportButton from '../../features/pdf-export/components/pdf-export-button';

const ITRComputation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const { user } = useAuth();
  const isCAUser = user && isCA(user.role);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const exportDraftPDF = useExportDraftPDF();
  const [expandedSections, setExpandedSections] = useState({
    personalInfo: true,
    income: false,
    deductions: false,
    taxesPaid: false,
    taxComputation: false,
    bankDetails: false,
  });
  const [expandedSectionId, setExpandedSectionId] = useState(null); // For BreathingGrid

  const selectedPerson = location.state?.selectedPerson;
  const initialVerificationResult = location.state?.verificationResult;
  const autoDetectITR = location.state?.autoDetectITR || false;
  const initialITR = location.state?.selectedITR;
  const _recommendation = location.state?.recommendation;
  const dataSource = location.state?.dataSource; // 'form16', 'it-portal', 'manual', 'previous-year'
  const showDocumentUpload = location.state?.showDocumentUpload || false;
  const showITPortalConnect = location.state?.showITPortalConnect || false;
  const copiedFromPreviousYear = location.state?.copiedFromPreviousYear || false;
  const draftId = searchParams.get('draftId') || location.state?.draftId;
  const filingId = params.filingId || searchParams.get('filingId') || location.state?.filingId;
  const viewMode = location.state?.viewMode || searchParams.get('viewMode') || null; // 'readonly' for completed filings
  const [selectedITR, setSelectedITR] = useState(initialITR || 'ITR-1');
  const [assessmentYear, setAssessmentYear] = useState('2024-25');
  const [currentFiling, setCurrentFiling] = useState(location.state?.filing || null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showITRSelector, setShowITRSelector] = useState(!initialITR || autoDetectITR);
  const [showEVerificationModal, setShowEVerificationModal] = useState(false);
  const [verificationResult, setVerificationResult] = useState(initialVerificationResult || null);

  // Determine if filing is readonly (completed/submitted)
  const isReadOnly = viewMode === 'readonly' ||
                     (currentFiling && ['submitted', 'acknowledged', 'processed'].includes(currentFiling.status));

  // CA Workflow State
  const [documents, setDocuments] = useState([]);
  const [caNotes, setCANotes] = useState([]);
  const [clientMessages, setClientMessages] = useState([]);

  // Convert assessment year to financial year for YearSelector
  const getFinancialYearFromAY = (ay) => {
    // AY 2024-25 corresponds to FY 2023-24
    const [start, end] = ay.split('-');
    const fyStart = parseInt(start) - 1;
    const fyEnd = parseInt(end) - 1;
    return `${fyStart}-${fyEnd.toString().slice(-2)}`;
  };

  // Convert financial year to assessment year
  const getAYFromFinancialYear = (fy) => {
    // FY 2023-24 corresponds to AY 2024-25
    const [start, end] = fy.split('-');
    const ayStart = parseInt(start) + 1;
    const ayEnd = parseInt(end) + 1;
    return `${ayStart}-${ayEnd.toString().slice(-2)}`;
  };

  // Form data state
  const [formData, setFormData] = useState({
    personalInfo: {
      pan: selectedPerson?.panNumber || '',
      name: selectedPerson?.name || '',
      dateOfBirth: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      email: '',
    },
    income: {
      salary: 0,
      businessIncome: (selectedITR === 'ITR-3' || selectedITR === 'ITR3') ? {
        businesses: [],
      } : 0,
      professionalIncome: (selectedITR === 'ITR-3' || selectedITR === 'ITR3') ? {
        professions: [],
      } : 0,
      presumptiveBusiness: (selectedITR === 'ITR-4' || selectedITR === 'ITR4') ? {
        hasPresumptiveBusiness: false,
        grossReceipts: 0,
        presumptiveRate: 8,
        presumptiveIncome: 0,
        optedOut: false,
      } : undefined,
      presumptiveProfessional: (selectedITR === 'ITR-4' || selectedITR === 'ITR4') ? {
        hasPresumptiveProfessional: false,
        grossReceipts: 0,
        presumptiveRate: 50,
        presumptiveIncome: 0,
        optedOut: false,
      } : undefined,
      capitalGains: (selectedITR === 'ITR-2' || selectedITR === 'ITR2' || selectedITR === 'ITR-3' || selectedITR === 'ITR3') ? {
        hasCapitalGains: false,
        stcgDetails: [],
        ltcgDetails: [],
      } : 0,
      houseProperty: (selectedITR === 'ITR-2' || selectedITR === 'ITR2' || selectedITR === 'ITR-3' || selectedITR === 'ITR3' || selectedITR === 'ITR-4' || selectedITR === 'ITR4') ? {
        properties: [],
      } : [],
      foreignIncome: (selectedITR === 'ITR-2' || selectedITR === 'ITR2' || selectedITR === 'ITR-3' || selectedITR === 'ITR3') ? {
        hasForeignIncome: false,
        foreignIncomeDetails: [],
      } : undefined,
      directorPartner: (selectedITR === 'ITR-2' || selectedITR === 'ITR2' || selectedITR === 'ITR-3' || selectedITR === 'ITR3') ? {
        isDirector: false,
        directorIncome: 0,
        isPartner: false,
        partnerIncome: 0,
      } : undefined,
      otherIncome: 0,
    },
    businessIncome: (selectedITR === 'ITR-3' || selectedITR === 'ITR3') ? {
      businesses: [],
    } : undefined,
    professionalIncome: (selectedITR === 'ITR-3' || selectedITR === 'ITR3') ? {
      professions: [],
    } : undefined,
    balanceSheet: (selectedITR === 'ITR-3' || selectedITR === 'ITR3') ? {
      hasBalanceSheet: false,
      assets: {
        currentAssets: { total: 0 },
        fixedAssets: { total: 0 },
        investments: 0,
        loansAdvances: 0,
        total: 0,
      },
      liabilities: {
        currentLiabilities: { total: 0 },
        longTermLiabilities: { total: 0 },
        capital: 0,
        total: 0,
      },
    } : undefined,
    auditInfo: (selectedITR === 'ITR-3' || selectedITR === 'ITR3') ? {
      isAuditApplicable: false,
      auditReportNumber: '',
      auditReportDate: '',
      caDetails: {},
    } : undefined,
    deductions: {
      section80C: 0,
      section80D: 0,
      section80G: 0,
      section80TTA: 0,
      section80TTB: 0,
      otherDeductions: {},
    },
    taxesPaid: {
      tds: 0,
      advanceTax: 0,
      selfAssessmentTax: 0,
    },
    bankDetails: {
      accountNumber: '',
      ifsc: '',
      accountType: 'savings',
      bankName: '',
    },
  });

  // Tax computation result
  const [taxComputation, setTaxComputation] = useState(null);

  // Tax regime state
  const [taxRegime, setTaxRegime] = useState('old'); // 'old' or 'new'
  const [regimeComparison, setRegimeComparison] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [uploadedData, setUploadedData] = useState(null); // Track uploaded/scanned data

  // Auto-fill state
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [prefetchSources, setPrefetchSources] = useState({});
  const [autoFilledFields, setAutoFilledFields] = useState({});

  // AI Recommendations state
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  // Auto-fill on page load
  useEffect(() => {
    const prefetchData = async () => {
      const pan = selectedPerson?.panNumber || formData.personalInfo.pan;
      if (!pan) return;

      setIsPrefetching(true);
      try {
        const prefetchResult = await itrAutoFillService.prefetchData(pan, assessmentYear);
        const { formData: mergedData, autoFilledFields: filledFields, sources } =
          itrAutoFillService.autoPopulateFormData(prefetchResult, formData);

        setFormData(mergedData);
        setAutoFilledFields(filledFields);
        setPrefetchSources(sources);

        toast.success('Data auto-filled from AIS/Form26AS');
      } catch (error) {
        toast.error('Auto-fill failed: ' + error.message);
      } finally {
        setIsPrefetching(false);
      }
    };

    prefetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPerson?.panNumber, assessmentYear]);

  // Load prefill data if available
  useEffect(() => {
    if (verificationResult) {
      setFormData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          pan: verificationResult.pan || prev.personalInfo.pan,
          name: verificationResult.name || prev.personalInfo.name,
        },
      }));
    }
  }, [verificationResult]);

  // Load draft on component mount
  useEffect(() => {
    const loadDraft = async () => {
      if (!draftId) return;

      try {
        const draftResponse = await itrService.getDraftById(draftId);
        // Handle both response structures: { draft: { data: ... } } or { draft: { formData: ... } }
        const draftData = draftResponse?.draft?.data || draftResponse?.draft?.formData || draftResponse?.draft;
        if (draftData) {
          const parsedData = typeof draftData === 'string' ? JSON.parse(draftData) : draftData;
          setFormData(prev => ({
            ...prev,
            ...parsedData,
          }));
          // Set assessment year if available
          if (draftResponse.draft?.assessmentYear) {
            setAssessmentYear(draftResponse.draft.assessmentYear);
          }
          toast.success('Draft loaded successfully');
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
        // Don't show error toast - draft loading is optional
      }
    };

    loadDraft();
  }, [draftId]);

  // Compute tax function
  const handleComputeTax = async () => {
    if (!formData.personalInfo.pan || !formData.income) return;

    try {
      const taxResult = await itrService.computeTax(
        formData,
        taxRegime,
        assessmentYear,
      );

      if (taxResult.success && taxResult.data) {
        setTaxComputation(taxResult.data);

        // Also get regime comparison if available
        if (taxResult.data.comparison) {
          setRegimeComparison(taxResult.data.comparison);
        }
      }
    } catch (error) {
      console.error('Tax computation failed:', error);
      // Don't show error toast - computation happens frequently
    }
  };

  // Compute tax when form data changes
  useEffect(() => {
    // Debounce computation
    const timeoutId = setTimeout(handleComputeTax, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData, taxRegime, assessmentYear]);

  // Generate recommendations when form data changes
  useEffect(() => {
    const generateRecommendations = async () => {
      if (!formData.personalInfo.pan) return;

      setIsLoadingRecommendations(true);
      try {
        const recs = await aiRecommendationEngine.getRecommendations(
          formData,
          selectedITR,
          assessmentYear,
        );
        setRecommendations(recs);
      } catch (error) {
        // Silently fail - recommendations are optional
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    // Debounce recommendation generation
    const timeoutId = setTimeout(generateRecommendations, 1000);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, selectedITR, assessmentYear]);

  const handleRegimeChange = useCallback((newRegime) => {
    setTaxRegime(newRegime);
    // Tax will be recalculated automatically via useEffect in TaxCalculator
    if (regimeComparison) {
      setShowComparison(true);
    }
  }, [regimeComparison]);

  const handleBack = useCallback(() => {
    if (location.state?.fromRecommendForm) {
      // ITR selection is now inline, no need to navigate
      // Just show the selector if not already visible
      setShowITRSelector(true);
    } else {
      navigate('/itr/select-person', { state: { selectedPerson } });
    }
  }, [location.state, navigate, selectedPerson, verificationResult]);

  const handleResolveDiscrepancy = useCallback((fieldPath, action) => {
    // Handle resolution - update formData based on action
    if (action === 'useUploaded') {
      // Update formData with uploaded value
      // Implementation would update formData based on fieldPath
      toast.success(`Updated ${fieldPath} with uploaded data`);
    } else if (action === 'useManual') {
      toast.info(`Keeping manual entry for ${fieldPath}`);
    }
  }, []);

  const handleDataUploaded = useCallback((uploadedData) => {
    // Merge uploaded data for discrepancy checking
    setUploadedData(prev => ({
      ...prev,
      income: {
        ...prev?.income,
        ...uploadedData,
      },
    }));
  }, []);

  const handleRefreshPrefetch = async () => {
    const pan = selectedPerson?.panNumber || formData.personalInfo.pan;
    if (!pan) return;

    setIsPrefetching(true);
    try {
      itrAutoFillService.clearCacheFor(pan, assessmentYear);
      const prefetchResult = await itrAutoFillService.prefetchData(pan, assessmentYear);
      const { formData: mergedData, autoFilledFields: filledFields, sources } =
        itrAutoFillService.autoPopulateFormData(prefetchResult, formData);

      setFormData(mergedData);
      setAutoFilledFields(filledFields);
      setPrefetchSources(sources);

      toast.success('Data refreshed from AIS/Form26AS');
    } catch (error) {
      toast.error('Refresh failed: ' + error.message);
    } finally {
      setIsPrefetching(false);
    }
  };

  const handleApplyRecommendation = (recommendation) => {
    if (!recommendation.action) return;

    const updatedFormData = aiRecommendationEngine.applyRecommendation(recommendation, formData);
    setFormData(updatedFormData);
    toast.success('Recommendation applied');
  };

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const handleSectionExpand = useCallback((sectionId) => {
    setExpandedSectionId(sectionId);
    if (sectionId) {
      setExpandedSections((prev) => ({
        ...prev,
        [sectionId]: true,
      }));
    } else {
      // Collapse all when sectionId is null
      setExpandedSections({});
    }
  }, []);

  // Calculate section summary values for BreathingGrid
  const getSectionSummary = useCallback((sectionId) => {
    const sectionData = formData[sectionId];
    if (!sectionData && sectionId !== 'scheduleFA' && sectionId !== 'taxOptimizer') return { primaryValue: null, secondaryValue: null, status: 'pending' };

    switch (sectionId) {
      case 'scheduleFA':
        // Schedule FA summary - foreign assets are fetched separately via API
        return {
          primaryValue: 'Schedule FA',
          secondaryValue: 'Foreign Assets',
          status: 'info',
        };
      case 'taxOptimizer':
        // Tax Optimizer summary
        return {
          primaryValue: taxComputation?.totalTaxLiability ? `₹${parseFloat(taxComputation.totalTaxLiability).toLocaleString('en-IN')}` : null,
          secondaryValue: 'Optimize Tax',
          status: taxComputation ? 'complete' : 'pending',
        };
      case 'personalInfo':
        return {
          primaryValue: sectionData.name || sectionData.pan || null,
          secondaryValue: sectionData.pan ? `PAN: ${sectionData.pan}` : null,
          status: sectionData.pan && sectionData.name ? 'complete' : 'pending',
        };
      case 'income': {
        const income = sectionData;
        let businessTotal = 0;
        let professionalTotal = 0;
        let presumptiveBusinessTotal = 0;
        let presumptiveProfessionalTotal = 0;

        // Handle ITR-3 business income structure
        if (selectedITR === 'ITR-3' || selectedITR === 'ITR3') {
          if (income.businessIncome?.businesses) {
            businessTotal = income.businessIncome.businesses.reduce((sum, biz) =>
              sum + (biz.pnl?.netProfit || 0), 0);
          } else {
            businessTotal = parseFloat(income.businessIncome) || 0;
          }

          if (income.professionalIncome?.professions) {
            professionalTotal = income.professionalIncome.professions.reduce((sum, prof) =>
              sum + (prof.pnl?.netIncome || 0), 0);
          } else {
            professionalTotal = parseFloat(income.professionalIncome) || 0;
          }
        } else if (selectedITR === 'ITR-4' || selectedITR === 'ITR4') {
          // Handle ITR-4 presumptive income
          presumptiveBusinessTotal = income.presumptiveBusiness?.presumptiveIncome || 0;
          presumptiveProfessionalTotal = income.presumptiveProfessional?.presumptiveIncome || 0;
        } else {
          businessTotal = parseFloat(income.businessIncome) || 0;
          professionalTotal = parseFloat(income.professionalIncome) || 0;
        }

        const totalIncome =
          (parseFloat(income.salary) || 0) +
          businessTotal +
          professionalTotal +
          presumptiveBusinessTotal +
          presumptiveProfessionalTotal +
          (parseFloat(income.otherIncome) || 0) +
          (typeof income.capitalGains === 'object' && income.capitalGains?.stcgDetails
            ? (income.capitalGains.stcgDetails || []).reduce((sum, e) => sum + (parseFloat(e.gainAmount) || 0), 0) +
              (income.capitalGains.ltcgDetails || []).reduce((sum, e) => sum + (parseFloat(e.gainAmount) || 0), 0)
            : parseFloat(income.capitalGains) || 0) +
          (typeof income.houseProperty === 'object' && income.houseProperty?.properties
            ? income.houseProperty.properties.reduce((sum, p) => {
                const rental = parseFloat(p.annualRentalIncome) || 0;
                const taxes = parseFloat(p.municipalTaxes) || 0;
                const interest = parseFloat(p.interestOnLoan) || 0;
                return sum + Math.max(0, rental - taxes - interest);
              }, 0)
            : parseFloat(income.houseProperty) || 0);
        const sourceCount = [
          income.salary > 0,
          businessTotal > 0,
          professionalTotal > 0,
          income.capitalGains && (typeof income.capitalGains === 'object' ? (income.capitalGains.stcgDetails?.length > 0 || income.capitalGains.ltcgDetails?.length > 0) : income.capitalGains > 0),
          income.houseProperty && (typeof income.houseProperty === 'object' ? income.houseProperty.properties?.length > 0 : income.houseProperty > 0),
          income.otherIncome > 0,
        ].filter(Boolean).length;
        return {
          primaryValue: totalIncome,
          secondaryValue: `${sourceCount} source${sourceCount !== 1 ? 's' : ''}`,
          status: totalIncome > 0 ? 'complete' : 'pending',
        };
      }
      case 'deductions': {
        const deductions = sectionData;
        const totalDeductions =
          (parseFloat(deductions.section80C) || 0) +
          (parseFloat(deductions.section80D) || 0) +
          (parseFloat(deductions.section80G) || 0) +
          (parseFloat(deductions.section80TTA) || 0) +
          (parseFloat(deductions.section80TTB) || 0) +
          Object.values(deductions.otherDeductions || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        const claimCount = [
          deductions.section80C > 0,
          deductions.section80D > 0,
          deductions.section80G > 0,
          deductions.section80TTA > 0,
          deductions.section80TTB > 0,
          Object.values(deductions.otherDeductions || {}).some((val) => parseFloat(val) > 0),
        ].filter(Boolean).length;
        return {
          primaryValue: totalDeductions,
          secondaryValue: `${claimCount} claim${claimCount !== 1 ? 's' : ''}`,
          status: totalDeductions > 0 ? 'complete' : 'pending',
        };
      }
      case 'businessIncome': {
        const businesses = sectionData?.businesses || [];
        const totalNetProfit = businesses.reduce((sum, biz) => sum + (biz.pnl?.netProfit || 0), 0);
        return {
          primaryValue: totalNetProfit,
          secondaryValue: `${businesses.length} business${businesses.length !== 1 ? 'es' : ''}`,
          status: businesses.length > 0 && totalNetProfit !== 0 ? 'complete' : 'pending',
        };
      }
      case 'professionalIncome': {
        const professions = sectionData?.professions || [];
        const totalNetIncome = professions.reduce((sum, prof) => sum + (prof.pnl?.netIncome || 0), 0);
        return {
          primaryValue: totalNetIncome,
          secondaryValue: `${professions.length} profession${professions.length !== 1 ? 's' : ''}`,
          status: professions.length > 0 && totalNetIncome !== 0 ? 'complete' : 'pending',
        };
      }
      case 'presumptiveIncome': {
        const presumptiveBusiness = formData.income?.presumptiveBusiness || {};
        const presumptiveProfessional = formData.income?.presumptiveProfessional || {};
        const businessIncome = presumptiveBusiness.presumptiveIncome || 0;
        const professionalIncome = presumptiveProfessional.presumptiveIncome || 0;
        const total = businessIncome + professionalIncome;
        return {
          primaryValue: total,
          secondaryValue: businessIncome > 0 && professionalIncome > 0
            ? 'Business + Professional'
            : businessIncome > 0
            ? 'Business'
            : professionalIncome > 0
            ? 'Professional'
            : null,
          status: total > 0 ? 'complete' : 'pending',
        };
      }
      case 'balanceSheet': {
        const assets = sectionData?.assets?.total || 0;
        const liabilities = sectionData?.liabilities?.total || 0;
        const isBalanced = assets === liabilities && assets > 0;
        return {
          primaryValue: assets,
          secondaryValue: isBalanced ? 'Balanced' : assets > 0 ? 'Not Balanced' : null,
          status: isBalanced ? 'complete' : (assets > 0 ? 'warning' : 'pending'),
        };
      }
      case 'auditInfo': {
        const isApplicable = sectionData?.isAuditApplicable || false;
        const hasReport = !!(sectionData?.auditReportNumber && sectionData?.auditReportDate);
        return {
          primaryValue: isApplicable ? 'Required' : 'Not Required',
          secondaryValue: isApplicable && hasReport ? 'Report Filed' : isApplicable ? 'Report Pending' : null,
          status: isApplicable ? (hasReport ? 'complete' : 'warning') : 'complete',
        };
      }
      case 'taxesPaid': {
        const taxesPaid = sectionData;
        const totalPaid =
          (parseFloat(taxesPaid.tds) || 0) +
          (parseFloat(taxesPaid.advanceTax) || 0) +
          (parseFloat(taxesPaid.selfAssessmentTax) || 0);
        return {
          primaryValue: totalPaid,
          secondaryValue: null,
          status: totalPaid > 0 ? 'complete' : 'pending',
        };
      }
      case 'taxComputation':
        return {
          primaryValue: taxComputation?.totalTax || 0,
          secondaryValue: taxComputation ? `Refund: ₹${Math.max(0, (formData.taxesPaid?.tds || 0) + (formData.taxesPaid?.advanceTax || 0) + (formData.taxesPaid?.selfAssessmentTax || 0) - (taxComputation.totalTax || 0)).toLocaleString('en-IN')}` : null,
          status: taxComputation ? 'complete' : 'pending',
        };
      case 'bankDetails':
        return {
          primaryValue: sectionData.accountNumber ? `****${sectionData.accountNumber.slice(-4)}` : null,
          secondaryValue: sectionData.bankName || null,
          status: sectionData.accountNumber && sectionData.ifsc ? 'complete' : 'pending',
        };
      default:
        return { primaryValue: null, secondaryValue: null, status: 'pending' };
    }
  }, [formData, taxComputation]);

  const updateFormData = useCallback((section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data,
      },
    }));
  }, []);

  // Auto-save draft when formData changes with retry logic
  useEffect(() => {
    if (!draftId || !formData.personalInfo.pan) return; // Don't auto-save if no draft or no PAN

    let retryCount = 0;
    const maxRetries = 3;
    const retryDelays = [1000, 2000, 4000]; // Exponential backoff

    const autoSaveTimer = setTimeout(async () => {
      const attemptSave = async (attempt = 0) => {
        try {
          // Backend expects { formData } structure
          await itrService.updateDraft(draftId, { formData });
          retryCount = 0; // Reset on success
          // Silently save - don't show toast for auto-save
        } catch (error) {
          // Only retry on network errors or 5xx errors, not validation errors
          const isRetryable = !error.response || (error.response.status >= 500 && error.response.status < 600);

          if (isRetryable && attempt < maxRetries) {
            retryCount++;
            const delay = retryDelays[attempt] || 4000;
            setTimeout(() => attemptSave(attempt + 1), delay);
          } else {
            // Log error for debugging but don't interrupt user
            console.warn('Auto-save failed after retries:', {
              error: error.message,
              attempts: attempt + 1,
              draftId,
            });
          }
        }
      };

      attemptSave();
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [formData, draftId]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const draftData = {
        formData,
        selectedITR,
        assessmentYear,
        selectedPerson,
      };

      if (draftId) {
        // Update existing draft - pass only formData structure
        await itrService.updateDraft(draftId, { formData: draftData.formData });
      } else {
        // Create new draft
        const response = await itrService.createITR({
          itrType: selectedITR,
          formData: draftData.formData,
        });
        if (response?.filing?.id) {
          // Create draft for the filing
          const draftResponse = await apiClient.post('/itr/drafts', {
            filingId: response.filing.id,
            formData: draftData.formData,
            itrType: selectedITR,
            assessmentYear,
          });
          if (draftResponse.data?.draft?.id) {
            // Update URL with draft ID
            navigate(`/itr/computation?draftId=${draftResponse.data.draft.id}`, {
              replace: true,
              state: location.state,
            });
          }
        }
      }
      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePaused = async (updatedFiling) => {
    setCurrentFiling(updatedFiling);
    toast.success('Filing paused successfully');
    // Optionally navigate back to dashboard
    // navigate('/dashboard');
  };

  const handleResumed = async (updatedFiling) => {
    setCurrentFiling(updatedFiling);
    setShowResumeModal(false);
    // Load form data from filing if available
    if (updatedFiling.formData) {
      setFormData(updatedFiling.formData);
    }
    toast.success('Filing resumed successfully');
  };

  const handleResumeFromModal = async () => {
    if (!currentFiling) return;
    await handleResumed(currentFiling);
  };

  const handleStartFresh = () => {
    setCurrentFiling(null);
    setShowResumeModal(false);
    // Reset form data
    setFormData({
      personalInfo: {
        pan: selectedPerson?.panNumber || '',
        name: selectedPerson?.name || '',
        dateOfBirth: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        email: '',
      },
      income: {
        salary: 0,
        businessIncome: 0,
        professionalIncome: 0,
        capitalGains: (selectedITR === 'ITR-2' || selectedITR === 'ITR2') ? {
          hasCapitalGains: false,
          stcgDetails: [],
          ltcgDetails: [],
        } : 0,
        houseProperty: (selectedITR === 'ITR-2' || selectedITR === 'ITR2') ? {
          properties: [],
        } : [],
        otherIncome: 0,
      },
      deductions: {
        section80C: 0,
        section80D: 0,
        section80G: 0,
        section80TTA: 0,
        section80TTB: 0,
        otherDeductions: {},
      },
      taxesPaid: {
        tds: 0,
        advanceTax: 0,
        selfAssessmentTax: 0,
      },
      bankDetails: {
        accountNumber: '',
        ifsc: '',
        accountType: 'savings',
        bankName: '',
      },
    });
  };

  // Load filing if filingId is present
  useEffect(() => {
    const loadFiling = async () => {
      if (filingId && !currentFiling) {
        try {
          const response = await itrService.getUserITRs();
          const filing = response.filings?.find(f => f.id === filingId);
          if (filing) {
            setCurrentFiling(filing);
            if (filing.status === 'paused') {
              setShowResumeModal(true);
            }
            // Load form data if available
            if (filing.formData) {
              setFormData(filing.formData);
            }
          }
        } catch (error) {
          console.error('Failed to load filing:', error);
        }
      }
    };
    loadFiling();
  }, [filingId, currentFiling]);

  const handleDownloadJSON = useCallback(async () => {
    setIsDownloading(true);
    try {
      const result = await itrJsonExportService.exportToJson(
        formData,
        selectedITR,
        assessmentYear,
      );

      // Trigger download
      itrJsonExportService.downloadJsonFile(
        result.jsonPayload,
        result.fileName,
      );

      toast.success('JSON file downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download JSON file');
    } finally {
      setIsDownloading(false);
    }
  }, [formData, selectedITR, assessmentYear]);

  const handleFileReturns = useCallback(() => {
    // Show E-verification modal before submission
    setShowEVerificationModal(true);
  }, []);

  const handleVerificationComplete = useCallback(async (verificationData) => {
    setVerificationResult(verificationData);
    setShowEVerificationModal(false);

    try {
      if (!draftId) {
        toast.error('Draft ID not found');
        return;
      }

      // Validate form data before submission
      const validationResponse = await apiClient.post(`/itr/drafts/${draftId}/validate`, {
        formData,
      });

      if (!validationResponse.data.isValid) {
        toast.error('Please fix validation errors before submitting');
        return;
      }

      // Submit ITR with verification
      const submitResponse = await apiClient.post(`/itr/drafts/${draftId}/submit`, {
        verificationMethod: verificationData.method,
        verificationToken: verificationData.verificationToken,
      });

      if (submitResponse.data.filing) {
        toast.success('ITR submitted successfully!');
        navigate(`/itr/acknowledgment?filingId=${submitResponse.data.filing.id}`);
      }
    } catch (error) {
      console.error('ITR submission error:', error);
      toast.error(error.response?.data?.error || 'Failed to submit ITR');
    }
  }, [draftId, formData, navigate]);

  // Base sections for all ITR types
  const baseSections = [
    {
      id: 'personalInfo',
      title: 'Personal Information',
      icon: User,
      description: 'PAN, Name, Address, Contact details',
    },
    {
      id: 'income',
      title: 'Income Details',
      icon: IndianRupee,
      description: selectedITR === 'ITR-3' || selectedITR === 'ITR3'
        ? 'Salary, Business, Professional, Capital Gains, House Property, Other Sources'
        : 'Salary, Business, Capital Gains, House Property, Other Sources',
    },
  ];

  // ITR-3 specific sections
  const itr3Sections = (selectedITR === 'ITR-3' || selectedITR === 'ITR3') ? [
    {
      id: 'businessIncome',
      title: 'Business Income',
      icon: Building2,
      description: 'P&L statement, business details',
    },
    {
      id: 'professionalIncome',
      title: 'Professional Income',
      icon: FileText,
      description: 'Professional fees and expenses',
    },
    {
      id: 'balanceSheet',
      title: 'Balance Sheet',
      icon: FileText,
      description: 'Assets, Liabilities, Capital (optional)',
    },
    {
      id: 'auditInfo',
      title: 'Audit Information',
      icon: FileText,
      description: 'Tax audit details (if applicable)',
    },
  ] : [];

  // ITR-4 specific sections
  const itr4Sections = (selectedITR === 'ITR-4' || selectedITR === 'ITR4') ? [
    {
      id: 'presumptiveIncome',
      title: 'Presumptive Income',
      icon: Calculator,
      description: 'Presumptive business and professional income (Section 44AD/44ADA)',
    },
  ] : [];

  // Schedule FA section for ITR-2 and ITR-3
  const scheduleFASection = (selectedITR === 'ITR-2' || selectedITR === 'ITR2' || selectedITR === 'ITR-3' || selectedITR === 'ITR3') ? [
    {
      id: 'scheduleFA',
      title: 'Schedule FA - Foreign Assets',
      icon: Globe,
      description: 'Foreign bank accounts, equity holdings, immovable property',
    },
  ] : [];

  // Common sections for all ITR types
  const commonSections = [
    {
      id: 'deductions',
      title: 'Deductions',
      icon: Calculator,
      description: 'Section 80C, 80D, 80G, and other deductions',
    },
    {
      id: 'taxesPaid',
      title: 'Taxes Paid',
      icon: CreditCard,
      description: 'TDS, Advance Tax, Self Assessment Tax',
    },
    {
      id: 'taxComputation',
      title: 'Tax Computation',
      icon: Building2,
      description: 'Auto-calculated tax liability',
    },
    {
      id: 'bankDetails',
      title: 'Bank Details',
      icon: FileText,
      description: 'Refund/Payment bank account information',
    },
  ];

  const sections = [...baseSections, ...itr3Sections, ...itr4Sections, ...scheduleFASection, ...commonSections];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50" style={{ height: '64px' }}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBack}
                className="p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-transform"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">ITR Filing</h1>
                <p className="text-xs text-gray-500">
                  {selectedITR} - Assessment Year {assessmentYear}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Invoice Badge */}
              {currentFiling?.invoice && (
                <InvoiceBadge invoice={currentFiling.invoice} />
              )}

              {/* Pause/Resume Button */}
              {currentFiling && (currentFiling.status === 'draft' || currentFiling.status === 'paused') && (
                <PauseResumeButton
                  filing={currentFiling}
                  onPaused={handlePaused}
                  onResumed={handleResumed}
                />
              )}

              {!isReadOnly && (
                <button
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="flex items-center px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-1" />
                  {isSaving ? 'Saving...' : 'Save Draft'}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tax Computation Bar */}
      <TaxComputationBar
        // New props format (preferred)
        grossIncome={
          (parseFloat(formData.income?.salary) || 0) +
          (parseFloat(formData.income?.businessIncome) || 0) +
          (parseFloat(formData.income?.professionalIncome) || 0) +
          (parseFloat(formData.income?.otherIncome) || 0) +
          (typeof formData.income?.capitalGains === 'object' && formData.income.capitalGains?.stcgDetails
            ? (formData.income.capitalGains.stcgDetails || []).reduce((sum, e) => sum + (parseFloat(e.gainAmount) || 0), 0) +
              (formData.income.capitalGains.ltcgDetails || []).reduce((sum, e) => sum + (parseFloat(e.gainAmount) || 0), 0)
            : parseFloat(formData.income?.capitalGains) || 0) +
          (typeof formData.income?.houseProperty === 'object' && formData.income.houseProperty?.properties
            ? formData.income.houseProperty.properties.reduce((sum, p) => {
                const rental = parseFloat(p.annualRentalIncome) || 0;
                const taxes = parseFloat(p.municipalTaxes) || 0;
                const interest = parseFloat(p.interestOnLoan) || 0;
                return sum + Math.max(0, rental - taxes - interest);
              }, 0)
            : parseFloat(formData.income?.houseProperty) || 0) +
          (formData.income?.foreignIncome?.foreignIncomeDetails || []).reduce((sum, e) => sum + (parseFloat(e.amountInr) || 0), 0) +
          (parseFloat(formData.income?.directorPartner?.directorIncome) || 0) +
          (parseFloat(formData.income?.directorPartner?.partnerIncome) || 0)
        }
        deductions={{
          old:
            (parseFloat(formData.deductions?.section80C) || 0) +
            (parseFloat(formData.deductions?.section80D) || 0) +
            (parseFloat(formData.deductions?.section80G) || 0) +
            (parseFloat(formData.deductions?.section80TTA) || 0) +
            (parseFloat(formData.deductions?.section80TTB) || 0) +
            Object.values(formData.deductions?.otherDeductions || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0),
          new: 50000, // Standard deduction for new regime
        }}
        taxableIncome={{
          old: Math.max(0,
            ((parseFloat(formData.income?.salary) || 0) +
            (parseFloat(formData.income?.businessIncome) || 0) +
            (parseFloat(formData.income?.professionalIncome) || 0) +
            (parseFloat(formData.income?.otherIncome) || 0) +
            (typeof formData.income?.capitalGains === 'object' && formData.income.capitalGains?.stcgDetails
              ? (formData.income.capitalGains.stcgDetails || []).reduce((sum, e) => sum + (parseFloat(e.gainAmount) || 0), 0) +
                (formData.income.capitalGains.ltcgDetails || []).reduce((sum, e) => sum + (parseFloat(e.gainAmount) || 0), 0)
              : parseFloat(formData.income?.capitalGains) || 0) +
            (typeof formData.income?.houseProperty === 'object' && formData.income.houseProperty?.properties
              ? formData.income.houseProperty.properties.reduce((sum, p) => {
                  const rental = parseFloat(p.annualRentalIncome) || 0;
                  const taxes = parseFloat(p.municipalTaxes) || 0;
                  const interest = parseFloat(p.interestOnLoan) || 0;
                  return sum + Math.max(0, rental - taxes - interest);
                }, 0)
              : parseFloat(formData.income?.houseProperty) || 0) +
            (formData.income?.foreignIncome?.foreignIncomeDetails || []).reduce((sum, e) => sum + (parseFloat(e.amountInr) || 0), 0) +
            (parseFloat(formData.income?.directorPartner?.directorIncome) || 0) +
            (parseFloat(formData.income?.directorPartner?.partnerIncome) || 0)) -
            ((parseFloat(formData.deductions?.section80C) || 0) +
            (parseFloat(formData.deductions?.section80D) || 0) +
            (parseFloat(formData.deductions?.section80G) || 0) +
            (parseFloat(formData.deductions?.section80TTA) || 0) +
            (parseFloat(formData.deductions?.section80TTB) || 0) +
            Object.values(formData.deductions?.otherDeductions || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)),
          ),
          new: Math.max(0,
            ((parseFloat(formData.income?.salary) || 0) +
            (parseFloat(formData.income?.businessIncome) || 0) +
            (parseFloat(formData.income?.professionalIncome) || 0) +
            (parseFloat(formData.income?.otherIncome) || 0) +
            (typeof formData.income?.capitalGains === 'object' && formData.income.capitalGains?.stcgDetails
              ? (formData.income.capitalGains.stcgDetails || []).reduce((sum, e) => sum + (parseFloat(e.gainAmount) || 0), 0) +
                (formData.income.capitalGains.ltcgDetails || []).reduce((sum, e) => sum + (parseFloat(e.gainAmount) || 0), 0)
              : parseFloat(formData.income?.capitalGains) || 0) +
            (typeof formData.income?.houseProperty === 'object' && formData.income.houseProperty?.properties
              ? formData.income.houseProperty.properties.reduce((sum, p) => {
                  const rental = parseFloat(p.annualRentalIncome) || 0;
                  const taxes = parseFloat(p.municipalTaxes) || 0;
                  const interest = parseFloat(p.interestOnLoan) || 0;
                  return sum + Math.max(0, rental - taxes - interest);
                }, 0)
              : parseFloat(formData.income?.houseProperty) || 0) +
            (formData.income?.foreignIncome?.foreignIncomeDetails || []).reduce((sum, e) => sum + (parseFloat(e.amountInr) || 0), 0) +
            (parseFloat(formData.income?.directorPartner?.directorIncome) || 0) +
            (parseFloat(formData.income?.directorPartner?.partnerIncome) || 0)) - 50000,
          ),
        }}
        taxPayable={{
          old: regimeComparison?.oldRegime?.totalTax || taxComputation?.totalTax || 0,
          new: regimeComparison?.newRegime?.totalTax || 0,
        }}
        tdsPaid={
          (parseFloat(formData.taxesPaid?.tds) || 0) +
          (parseFloat(formData.taxesPaid?.advanceTax) || 0) +
          (parseFloat(formData.taxesPaid?.selfAssessmentTax) || 0)
        }
        aiTip={recommendations?.[0]?.description || recommendations?.[0]?.title || null}
        onDismissTip={() => {
          // Remove the first recommendation from the list
          setRecommendations(prev => prev.slice(1));
        }}
        onFileClick={() => {
          // Navigate to review/filing page
          navigate('/itr/review', {
            state: {
              formData,
              taxComputation,
              regimeComparison,
              selectedITR,
              assessmentYear,
              filingId,
              draftId,
            },
          });
        }}
        // Legacy props for backward compatibility
        formData={formData}
        taxComputation={taxComputation}
        regimeComparison={regimeComparison}
        selectedRegime={taxRegime}
        onRegimeChange={handleRegimeChange}
      />

      {/* Resume Modal */}
      {showResumeModal && currentFiling && (
        <ResumeFilingModal
          filing={currentFiling}
          onResume={handleResumeFromModal}
          onStartFresh={handleStartFresh}
          onClose={() => setShowResumeModal(false)}
        />
      )}

      {/* Main Content */}
      <main className="px-4 py-6 space-y-4 max-w-7xl mx-auto">
        {/* Loading State */}
        {isPrefetching && (
          <div className="bg-info-50 border border-info-100 rounded-lg p-4 flex items-center space-x-3">
            <Loader className="w-5 h-5 animate-spin text-info-500" />
            <span className="text-sm text-info-600">Fetching tax data from AIS/Form26AS...</span>
          </div>
        )}

        {/* Filing Person Info */}
        {selectedPerson && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedPerson.name}</h3>
                <p className="text-sm text-gray-500">PAN: {selectedPerson.panNumber}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-info-50 text-info-600 px-2 py-1 rounded-full">
                  {selectedITR}
                </span>
                {verificationResult?.isValid && (
                  <CheckCircle className="w-5 h-5 text-success-500" />
                )}
                {showITRSelector && (
                  <button
                    onClick={() => setShowITRSelector(false)}
                    className="text-xs text-orange-600 hover:text-orange-700 underline"
                  >
                    Change ITR
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Data Source Info Messages */}
        {dataSource === 'form16' && showDocumentUpload && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-semibold text-orange-900 mb-1">Upload Form 16</h3>
                <p className="text-sm text-orange-700">
                  You can upload your Form 16 Part A and Part B documents in the Documents section. The data will be automatically extracted and populated.
                </p>
              </div>
            </div>
          </div>
        )}

        {dataSource === 'it-portal' && showITPortalConnect && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">Connect to Income Tax Portal</h3>
                <p className="text-sm text-blue-700">
                  Connect to the Income Tax Portal to fetch your AIS, 26AS, and pre-filled ITR data. This feature will be available soon.
                </p>
              </div>
            </div>
          </div>
        )}

        {dataSource === 'previous-year' && copiedFromPreviousYear && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-semibold text-green-900 mb-1">Data Copied from Previous Year</h3>
                <p className="text-sm text-green-700">
                  Data from your previous year filing has been copied. Please review and update the information as needed.
                </p>
              </div>
            </div>
          </div>
        )}

        {dataSource === 'manual' && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Manual Entry Mode</h3>
                <p className="text-sm text-gray-700">
                  Enter all information manually. We'll guide you through each section of the ITR form.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ITR Form Selector - Inline */}
        {showITRSelector && selectedPerson && (
          <ITRFormSelector
            selectedPerson={selectedPerson}
            verificationResult={verificationResult}
            onITRSelect={(itr) => {
              setSelectedITR(itr);
              setShowITRSelector(false);
            }}
            initialITR={selectedITR}
            autoDetect={autoDetectITR}
          />
        )}

        {/* Year Selector */}
        <YearSelector
          selectedYear={getFinancialYearFromAY(assessmentYear)}
          onYearChange={(fy) => {
            const newAY = getAYFromFinancialYear(fy);
            setAssessmentYear(newAY);
            // Refresh prefetch data for new year
            handleRefreshPrefetch();
          }}
          assessmentYear={assessmentYear}
        />

        {/* Tax Regime Toggle */}
        <TaxRegimeToggle
          regime={taxRegime}
          onRegimeChange={handleRegimeChange}
          isComparing={showComparison}
          comparisonData={regimeComparison}
        />

        {/* Computation Sheet */}
        <ComputationSheet
          formData={formData}
          taxComputation={taxComputation}
          autoFilledFields={autoFilledFields}
          sources={prefetchSources}
          onRefresh={handleRefreshPrefetch}
          isRefreshing={isPrefetching}
        />

        {/* AI Recommendations Panel */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
                AI Recommendations
              </h3>
              {isLoadingRecommendations && (
                <Loader className="w-4 h-4 animate-spin text-gray-400" />
              )}
            </div>
            <div className="space-y-3">
              {recommendations.slice(0, 5).map((rec) => (
                <div
                  key={rec.id || rec.title || `rec-${rec.type}-${rec.message?.substring(0, 20)}`}
                  className={`p-4 rounded-lg border ${
                    rec.priority === 'high'
                      ? 'bg-error-50 border-error-100'
                      : rec.priority === 'medium'
                      ? 'bg-warning-50 border-warning-100'
                      : 'bg-info-50 border-info-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {rec.type === 'compliance_warning' ? (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        ) : (
                          <Lightbulb className="w-4 h-4 text-yellow-600" />
                        )}
                        <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{rec.message}</p>
                      {rec.impact && (
                        <p className="text-xs text-gray-600">{rec.impact}</p>
                      )}
                    </div>
                    {rec.action && (
                      <button
                        onClick={() => {
                          handleApplyRecommendation(rec);
                        }}
                        className="ml-4 px-3 py-1.5 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Verification Panel */}
        {uploadedData && (
          <div className="mb-6">
            <DataVerificationPanel
              formData={formData}
              uploadedData={uploadedData}
              onResolve={handleResolveDiscrepancy}
            />
          </div>
        )}

        {/* CA Workflow Components */}
        {isCAUser && (
          <div className="space-y-6 mb-6">
            {/* Document Checklist */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <DocumentChecklist
                itrType={selectedITR}
                documents={documents}
                onUpload={async (docId, file) => {
                  try {
                    // TODO: Upload document via API
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('documentType', docId);
                    formData.append('filingId', filingId);

                    // const response = await apiClient.post(`/itr/filings/${filingId}/documents`, formData);
                    // setDocuments(prev => [...prev, { id: docId, status: 'uploaded', uploadedAt: new Date().toISOString() }]);
                    toast.success(`${docId} uploaded successfully`);
                  } catch (error) {
                    toast.error(`Failed to upload ${docId}`);
                  }
                }}
                onRequest={(docId) => {
                  // TODO: Send document request to client
                  toast.info(`Request sent for ${docId}`);
                }}
              />
            </div>

            {/* CA Notes */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <CANotes
                notes={caNotes}
                onAdd={async (note) => {
                  try {
                    // TODO: Save note via API
                    // const response = await apiClient.post(`/itr/filings/${filingId}/notes`, note);
                    const newNote = { ...note, id: Date.now().toString() };
                    setCANotes(prev => [...prev, newNote]);
                    toast.success('Note added');
                  } catch (error) {
                    toast.error('Failed to add note');
                  }
                }}
                onEdit={async (noteId, updates) => {
                  try {
                    // TODO: Update note via API
                    // await apiClient.put(`/itr/filings/${filingId}/notes/${noteId}`, updates);
                    setCANotes(prev => prev.map(n => n.id === noteId ? { ...n, ...updates } : n));
                    toast.success('Note updated');
                  } catch (error) {
                    toast.error('Failed to update note');
                  }
                }}
                onDelete={async (noteId) => {
                  try {
                    // TODO: Delete note via API
                    // await apiClient.delete(`/itr/filings/${filingId}/notes/${noteId}`);
                    setCANotes(prev => prev.filter(n => n.id !== noteId));
                    toast.success('Note deleted');
                  } catch (error) {
                    toast.error('Failed to delete note');
                  }
                }}
                currentCA={user}
              />
            </div>

            {/* Client Communication */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <ClientCommunication
                messages={clientMessages}
                onSendMessage={async (message) => {
                  try {
                    // TODO: Send message via API
                    // const response = await apiClient.post(`/itr/filings/${filingId}/messages`, message);
                    const newMessage = { ...message, id: Date.now().toString(), status: 'sent' };
                    setClientMessages(prev => [...prev, newMessage]);
                    toast.success('Message sent to client');
                  } catch (error) {
                    toast.error('Failed to send message');
                  }
                }}
                onRequestDocument={async (docType, emailNotification) => {
                  try {
                    // TODO: Request document via API
                    const message = {
                      type: 'document-request',
                      text: `Please upload ${docType}`,
                      documentType: docType,
                      emailNotification,
                      createdAt: new Date().toISOString(),
                    };
                    const newMessage = { ...message, id: Date.now().toString(), status: 'sent' };
                    setClientMessages(prev => [...prev, newMessage]);
                    toast.success(`Document request sent for ${docType}`);
                  } catch (error) {
                    toast.error('Failed to send document request');
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Breathing Grid Layout */}
        <BreathingGrid
          expandedSectionId={expandedSectionId}
          onSectionExpand={handleSectionExpand}
          className="mt-6"
        >
          {sections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSectionId === section.id;
            const summary = getSectionSummary(section.id);

            return (
              <SectionCard
                key={section.id}
                id={section.id}
                sectionId={section.id}
                title={section.title}
                icon={Icon}
                description={section.description}
                density={isExpanded ? 'detailed' : 'summary'}
                isExpanded={isExpanded}
                onExpand={() => handleSectionExpand(isExpanded ? null : section.id)}
                primaryValue={summary.primaryValue}
                secondaryValue={summary.secondaryValue}
                status={summary.status}
              >
                {section.id === 'scheduleFA' ? (
                  <ScheduleFA
                    filingId={filingId || draftId}
                    onUpdate={() => {
                      // Refresh foreign assets data
                      if (filingId || draftId) {
                        // Trigger refetch if needed
                      }
                    }}
                  />
                ) : section.id === 'taxOptimizer' ? (
                  <TaxOptimizer
                    filingId={filingId || draftId}
                    currentTaxComputation={taxComputation}
                    onUpdate={() => {
                      // Refresh tax computation after applying simulation
                      if (filingId || draftId) {
                        // Trigger tax recomputation
                        handleComputeTax();
                      }
                    }}
                  />
                ) : (
                  <ComputationSection
                    id={section.id}
                    title={section.title}
                    icon={Icon}
                    description={section.description}
                    isExpanded={isExpanded}
                    onToggle={() => toggleSection(section.id)}
                    formData={formData[section.id]}
                    fullFormData={formData}
                    readOnly={isReadOnly}
                    onUpdate={(data) => updateFormData(section.id, data)}
                    selectedITR={selectedITR}
                    taxComputation={taxComputation}
                    onTaxComputed={setTaxComputation}
                    regime={taxRegime}
                    assessmentYear={assessmentYear}
                    onDataUploaded={handleDataUploaded}
                    renderContentOnly={true}
                  />
                )}
              </SectionCard>
            );
          })}
        </BreathingGrid>

        {/* Action Buttons */}
        {!isReadOnly && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleDownloadJSON}
                disabled={isDownloading}
                className="flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                {isDownloading ? 'Downloading...' : 'Download JSON'}
              </button>
              <button
                onClick={handleFileReturns}
                className="flex items-center justify-center px-6 py-3 bg-success-500 text-white font-semibold rounded-lg hover:bg-success-600 disabled:opacity-50 transition-colors"
              >
                <FileText className="w-5 h-5 mr-2" />
                File Returns
              </button>
            </div>
          </div>
        )}
        {isReadOnly && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-body-sm text-blue-800">
              <Info className="h-4 w-4 inline mr-2" />
              This filing has been submitted and is in read-only mode. You can view the details but cannot make changes.
            </p>
          </div>
        )}

        {/* E-Verification Modal */}
        {showEVerificationModal && (
          <EVerificationModal
            isOpen={showEVerificationModal}
            onClose={() => setShowEVerificationModal(false)}
            draftId={draftId}
            filingId={filingId}
            onVerificationComplete={handleVerificationComplete}
            formData={formData}
          />
        )}
      </main>
    </div>
  );
};

export default ITRComputation;

