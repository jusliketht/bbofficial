// =====================================================
// DOCUMENT ROUTES
// =====================================================

const express = require('express');
const router = express.Router();
const documentController = require('../controllers/DocumentController');
const authMiddleware = require('../middleware/auth');
const S3Service = require('../services/integration/S3Service');
const enterpriseLogger = require('../utils/logger');

// Apply authentication middleware to all routes
router.use(authMiddleware.authenticateToken);

// Generate presigned upload URL
router.post('/presign', documentController.generatePresignedUrl);

// Complete file upload
router.post('/complete', documentController.completeUpload);

// Get user documents
router.get('/', documentController.getUserDocuments);

// Get document download URL
router.get('/:id/download', documentController.getDownloadUrl);

// Delete document
router.delete('/:id', documentController.deleteDocument);

// Get document statistics
router.get('/stats', documentController.getDocumentStats);

// Get document categories
router.get('/categories', documentController.getDocumentCategories);

// Get service status
router.get('/status', documentController.getServiceStatus);

// Local file upload (for development)
router.post('/upload-local',
  S3Service.getMulterMiddleware().single('file'),
  documentController.uploadLocalFile,
);

// Local file download (for development)
router.get('/download-local/:path', documentController.downloadLocalFile);

// Form16 extraction endpoint
const multer = require('multer');
const path = require('path');
const { AppError } = require('../middleware/errorHandler');

const form16Upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid file type. Only PDF and image files are allowed.', 400), false);
    }
  },
});

router.post('/form16/extract', form16Upload.single('file'), async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    enterpriseLogger.info('Processing Form16 extraction', {
      userId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
    });

    // Import Form16 OCR service (create if doesn't exist)
    let Form16OCRService;
    try {
      Form16OCRService = require('../services/business/Form16OCRService');
    } catch (error) {
      // If service doesn't exist, use basic extraction
      enterpriseLogger.warn('Form16OCRService not found, using basic extraction', {
        error: error.message,
      });

      // Basic extraction - extract text from PDF
      const pdfParse = require('pdf-parse');
      const extractedText = await pdfParse(req.file.buffer);

      // Process extracted text using pattern matching (similar to frontend)
      const processedData = processForm16Text(extractedText.text);

      return res.json({
        success: true,
        extractedText: extractedText.text,
        extractedData: processedData, // Also include as extractedData for compatibility
        data: processedData,
        confidence: 0.75,
        warnings: ['Using basic extraction - Form16OCRService not fully implemented'],
        message: 'Form16 extracted successfully',
      });
    }

    // Use Form16 OCR service if available
    const result = await Form16OCRService.processDocument(req.file);

    res.json({
      success: true,
      extractedText: result.extractedText,
      extractedData: result.extractedData, // Also include as extractedData for compatibility
      data: result.extractedData,
      confidence: result.confidence || 0.85,
      warnings: result.warnings || [],
      message: 'Form16 extracted successfully',
    });

  } catch (error) {
    enterpriseLogger.error('Form16 extraction failed', {
      userId: req.user?.userId,
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to extract Form 16 data',
    });
  }
});

/**
 * Basic Form16 text processing (fallback)
 */
function processForm16Text(text) {
  const data = {
    employer: {},
    employee: {},
    financialYear: {},
    salary: {},
    tax: {},
    monthly: {},
  };

  // Basic pattern matching (simplified version)
  const patterns = {
    employeeName: /Employee\s*Name[:\s]*([A-Za-z\s]+?)(?=PAN|Date|Designation)/i,
    employeePAN: /Employee\s*PAN[:\s]*([A-Z]{5}[0-9]{4}[A-Z])/i,
    employerName: /Employer\s*Name[:\s]*([A-Za-z\s&]+(?:Pvt\.?|Ltd\.?|Private\s*Limited)?)/i,
    employerPAN: /Employer\s*PAN[:\s]*([A-Z]{5}[0-9]{4}[A-Z])/i,
    employerTAN: /TAN[:\s]*([A-Z]{4}[0-9]{5}[A-Z])/i,
    grossSalary: /Gross\s*Salary[:\s]*₹?\s*([\d,]+\.?\d*)/i,
    basicSalary: /Basic\s*Salary[:\s]*₹?\s*([\d,]+\.?\d*)/i,
    hra: /HRA[:\s]*₹?\s*([\d,]+\.?\d*)/i,
    totalTax: /Total\s*Tax[:\s]*₹?\s*([\d,]+\.?\d*)/i,
    tds: /TDS[:\s]*₹?\s*([\d,]+\.?\d*)/i,
    deduction80C: /Deduction\s*u\/s\s*80C[:\s]*₹?\s*([\d,]+\.?\d*)/i,
  };

  // Extract values
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const value = match[1].trim().replace(/[₹,]/g, '');
      const numValue = parseFloat(value);
      
      if (key.includes('Name')) {
        if (key.includes('employee')) {
          data.employee.name = value;
        } else {
          data.employer.name = value;
        }
      } else if (key.includes('PAN')) {
        if (key.includes('employee')) {
          data.employee.pan = value.toUpperCase();
        } else {
          data.employer.pan = value.toUpperCase();
        }
      } else if (key === 'employerTAN') {
        data.employer.tan = value.toUpperCase();
      } else if (key.includes('Salary') || key.includes('hra') || key.includes('Tax') || key.includes('tds') || key.includes('deduction')) {
        if (key.includes('gross')) {
          data.salary.gross = numValue;
        } else if (key.includes('basic')) {
          data.salary.basic = numValue;
        } else if (key.includes('hra')) {
          data.salary.hra = numValue;
        } else if (key.includes('totalTax')) {
          data.tax.totalTax = numValue;
        } else if (key.includes('tds')) {
          data.tax.tds = numValue;
        } else if (key.includes('80C')) {
          data.tax.deduction80C = numValue;
        }
      }
    }
  }

  return data;
}

// Error handling middleware
router.use((error, req, res, next) => {
  enterpriseLogger.error('Document route error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id,
  });

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

enterpriseLogger.info('Document routes configured');

module.exports = router;