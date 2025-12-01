// =====================================================
// PDF TEMPLATE ENGINE
// Reusable templates for PDF generation with branding
// =====================================================

class PDFTemplateEngine {
  /**
   * Add header to PDF document
   * @param {PDFDocument} doc - PDF document instance
   * @param {string} title - Document title
   */
  static addHeader(doc, title) {
    // Logo/Branding area
    doc.fontSize(20)
      .fillColor('#FF6B35') // Orange brand color
      .text('BurnBlack', 50, 50)
      .fontSize(12)
      .fillColor('#666666')
      .text('ITR Filing Platform', 50, 75);

    // Title
    doc.fontSize(16)
      .fillColor('#000000')
      .text(title, 50, 100);

    // Date
    doc.fontSize(10)
      .fillColor('#666666')
      .text(`Generated on: ${new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`, 400, 100);

    // Horizontal line
    doc.moveTo(50, 130)
      .lineTo(550, 130)
      .strokeColor('#CCCCCC')
      .lineWidth(1)
      .stroke();
  }

  /**
   * Add footer to PDF document
   * @param {PDFDocument} doc - PDF document instance
   */
  static addFooter(doc) {
    const pageHeight = doc.page.height;
    const pageWidth = doc.page.width;
    
    doc.fontSize(8)
      .fillColor('#999999')
      .text('This is a computer-generated document and does not require a signature.', 50, pageHeight - 40)
      .text('© BurnBlack Technologies Pvt Ltd. All rights reserved.', 50, pageHeight - 25)
      .text(`Page ${doc.page.number}`, pageWidth - 100, pageHeight - 25, { align: 'right' });
  }

  /**
   * Generate ITR draft PDF content
   * @param {PDFDocument} doc - PDF document instance
   * @param {object} formData - Form data
   * @param {object} taxComputation - Tax computation result
   * @param {string} filingId - Filing ID
   */
  static generateITRDraftContent(doc, formData, taxComputation, filingId) {
    let yPosition = 150;

    // Header
    this.addHeader(doc, 'ITR Draft - Income Tax Return');

    // Filing Information
    doc.fontSize(12)
      .fillColor('#000000')
      .text('Filing Information', 50, yPosition);
    
    yPosition += 20;
    doc.fontSize(10)
      .fillColor('#333333')
      .text(`Filing ID: ${filingId}`, 50, yPosition)
      .text(`Assessment Year: ${formData.assessmentYear || '2024-25'}`, 200, yPosition)
      .text(`ITR Type: ${formData.itrType || 'ITR-1'}`, 400, yPosition);

    yPosition += 40;

    // Personal Information
    if (formData.personalInfo) {
      doc.fontSize(12)
        .fillColor('#000000')
        .text('Personal Information', 50, yPosition);
      
      yPosition += 20;
      const personalInfo = formData.personalInfo;
      doc.fontSize(10)
        .fillColor('#333333')
        .text(`Name: ${personalInfo.name || personalInfo.full_name || 'N/A'}`, 50, yPosition)
        .text(`PAN: ${personalInfo.pan || 'N/A'}`, 200, yPosition)
        .text(`Date of Birth: ${personalInfo.dateOfBirth || 'N/A'}`, 400, yPosition);
      
      yPosition += 15;
      if (personalInfo.address) {
        doc.text(`Address: ${this.formatAddress(personalInfo.address)}`, 50, yPosition);
        yPosition += 15;
      }
      yPosition += 20;
    }

    // Income Details
    if (formData.income) {
      doc.fontSize(12)
        .fillColor('#000000')
        .text('Income Details', 50, yPosition);
      
      yPosition += 20;
      const income = formData.income;
      
      if (income.salary) {
        const salary = typeof income.salary === 'object' ? income.salary : { grossSalary: income.salary };
        doc.fontSize(10)
          .fillColor('#333333')
          .text(`Salary Income: ₹${this.formatCurrency(parseFloat(salary.grossSalary || 0))}`, 50, yPosition);
        yPosition += 15;
      }
      
      if (income.houseProperty) {
        const houseProperty = typeof income.houseProperty === 'object' ? income.houseProperty : { annualRentalIncome: income.houseProperty };
        doc.text(`House Property Income: ₹${this.formatCurrency(parseFloat(houseProperty.annualRentalIncome || 0))}`, 50, yPosition);
        yPosition += 15;
      }
      
      if (income.businessIncome) {
        doc.text(`Business Income: ₹${this.formatCurrency(parseFloat(income.businessIncome || 0))}`, 50, yPosition);
        yPosition += 15;
      }
      
      if (income.capitalGains) {
        doc.text(`Capital Gains: ₹${this.formatCurrency(parseFloat(income.capitalGains || 0))}`, 50, yPosition);
        yPosition += 15;
      }
      
      yPosition += 20;
    }

    // Deductions
    if (formData.deductions) {
      doc.fontSize(12)
        .fillColor('#000000')
        .text('Deductions', 50, yPosition);
      
      yPosition += 20;
      const deductions = formData.deductions;
      doc.fontSize(10)
        .fillColor('#333333')
        .text(`Section 80C: ₹${this.formatCurrency(parseFloat(deductions.section80C || 0))}`, 50, yPosition)
        .text(`Section 80D: ₹${this.formatCurrency(parseFloat(deductions.section80D || 0))}`, 200, yPosition)
        .text(`Section 80G: ₹${this.formatCurrency(parseFloat(deductions.section80G || 0))}`, 400, yPosition);
      
      yPosition += 30;
    }

    // Tax Computation Summary
    if (taxComputation) {
      doc.fontSize(12)
        .fillColor('#000000')
        .text('Tax Computation Summary', 50, yPosition);
      
      yPosition += 20;
      doc.fontSize(10)
        .fillColor('#333333')
        .text(`Gross Total Income: ₹${this.formatCurrency(parseFloat(taxComputation.grossTotalIncome || 0))}`, 50, yPosition);
      yPosition += 15;
      doc.text(`Total Deductions: ₹${this.formatCurrency(parseFloat(taxComputation.totalDeductions || 0))}`, 50, yPosition);
      yPosition += 15;
      doc.text(`Taxable Income: ₹${this.formatCurrency(parseFloat(taxComputation.taxableIncome || 0))}`, 50, yPosition);
      yPosition += 15;
      doc.fontSize(11)
        .fillColor('#000000')
        .text(`Total Tax Liability: ₹${this.formatCurrency(parseFloat(taxComputation.totalTaxLiability || taxComputation.finalTax || 0))}`, 50, yPosition);
      
      yPosition += 30;
    }

    // Bank Details
    if (formData.bankDetails) {
      doc.fontSize(12)
        .fillColor('#000000')
        .text('Bank Details', 50, yPosition);
      
      yPosition += 20;
      const bankDetails = formData.bankDetails;
      doc.fontSize(10)
        .fillColor('#333333')
        .text(`Bank Name: ${bankDetails.bankName || 'N/A'}`, 50, yPosition)
        .text(`Account Number: ${bankDetails.accountNumber ? `****${bankDetails.accountNumber.slice(-4)}` : 'N/A'}`, 200, yPosition)
        .text(`IFSC: ${bankDetails.ifsc || 'N/A'}`, 400, yPosition);
    }

    // Footer on each page
    doc.on('pageAdded', () => {
      this.addFooter(doc);
    });
    this.addFooter(doc);
  }

  /**
   * Generate tax computation PDF content
   * @param {PDFDocument} doc - PDF document instance
   * @param {object} taxComputation - Tax computation result
   * @param {object} formData - Form data
   */
  static generateTaxComputationContent(doc, taxComputation, formData) {
    let yPosition = 150;

    // Header
    this.addHeader(doc, 'Tax Computation Report');

    // Summary Section
    doc.fontSize(14)
      .fillColor('#000000')
      .text('Tax Computation Summary', 50, yPosition);
    
    yPosition += 30;

    // Income Breakdown
    doc.fontSize(12)
      .fillColor('#000000')
      .text('Income Breakdown', 50, yPosition);
    
    yPosition += 20;
    doc.fontSize(10)
      .fillColor('#333333')
      .text(`Gross Total Income: ₹${this.formatCurrency(parseFloat(taxComputation.grossTotalIncome || 0))}`, 50, yPosition);
    yPosition += 15;
    doc.text(`Total Deductions: ₹${this.formatCurrency(parseFloat(taxComputation.totalDeductions || 0))}`, 50, yPosition);
    yPosition += 15;
    doc.fontSize(11)
      .fillColor('#000000')
      .text(`Taxable Income: ₹${this.formatCurrency(parseFloat(taxComputation.taxableIncome || 0))}`, 50, yPosition);
    
    yPosition += 30;

    // Tax Calculation
    doc.fontSize(12)
      .fillColor('#000000')
      .text('Tax Calculation', 50, yPosition);
    
    yPosition += 20;
    if (taxComputation.taxComputation) {
      const taxCalc = taxComputation.taxComputation;
      doc.fontSize(10)
        .fillColor('#333333')
        .text(`Income Tax: ₹${this.formatCurrency(parseFloat(taxCalc.totalTax || 0))}`, 50, yPosition);
      yPosition += 15;
      if (taxCalc.surcharge) {
        doc.text(`Surcharge: ₹${this.formatCurrency(parseFloat(taxCalc.surcharge || 0))}`, 50, yPosition);
        yPosition += 15;
      }
      if (taxComputation.cess) {
        doc.text(`Cess: ₹${this.formatCurrency(parseFloat(taxComputation.cess || 0))}`, 50, yPosition);
        yPosition += 15;
      }
    }
    
    yPosition += 20;
    doc.fontSize(12)
      .fillColor('#FF6B35')
      .text(`Total Tax Liability: ₹${this.formatCurrency(parseFloat(taxComputation.totalTaxLiability || taxComputation.finalTax || 0))}`, 50, yPosition);

    // Footer
    doc.on('pageAdded', () => {
      this.addFooter(doc);
    });
    this.addFooter(doc);
  }

  /**
   * Generate discrepancy report PDF content
   * @param {PDFDocument} doc - PDF document instance
   * @param {Array} discrepancies - Array of discrepancies
   * @param {string} filingId - Filing ID
   */
  static generateDiscrepancyReportContent(doc, discrepancies, filingId) {
    let yPosition = 150;

    // Header
    this.addHeader(doc, 'Discrepancy Report');

    // Summary
    doc.fontSize(12)
      .fillColor('#000000')
      .text(`Filing ID: ${filingId}`, 50, yPosition);
    
    yPosition += 20;
    const stats = {
      total: discrepancies.length,
      critical: discrepancies.filter(d => d.severity === 'critical').length,
      warning: discrepancies.filter(d => d.severity === 'warning').length,
      info: discrepancies.filter(d => d.severity === 'info').length,
      resolved: discrepancies.filter(d => d.status === 'resolved').length,
    };

    doc.fontSize(10)
      .fillColor('#333333')
      .text(`Total Discrepancies: ${stats.total}`, 50, yPosition)
      .text(`Critical: ${stats.critical}`, 150, yPosition)
      .text(`Warning: ${stats.warning}`, 250, yPosition)
      .text(`Info: ${stats.info}`, 350, yPosition)
      .text(`Resolved: ${stats.resolved}`, 450, yPosition);

    yPosition += 30;

    // Discrepancy Table
    doc.fontSize(12)
      .fillColor('#000000')
      .text('Discrepancy Details', 50, yPosition);
    
    yPosition += 20;

    // Table Header
    doc.fontSize(10)
      .fillColor('#666666')
      .text('Field', 50, yPosition)
      .text('Manual Value', 150, yPosition)
      .text('Source Value', 250, yPosition)
      .text('Severity', 400, yPosition)
      .text('Status', 480, yPosition);

    yPosition += 15;
    doc.moveTo(50, yPosition)
      .lineTo(550, yPosition)
      .strokeColor('#CCCCCC')
      .lineWidth(0.5)
      .stroke();

    yPosition += 10;

    // Table Rows
    discrepancies.slice(0, 20).forEach((discrepancy) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      const severityColor = {
        critical: '#FF0000',
        warning: '#FF6B35',
        info: '#0066CC',
      }[discrepancy.severity] || '#333333';

      doc.fontSize(9)
        .fillColor('#333333')
        .text(discrepancy.field || 'N/A', 50, yPosition, { width: 100 })
        .text(String(discrepancy.manualValue || 'N/A'), 150, yPosition, { width: 100 })
        .text(String(discrepancy.sourceValue || 'N/A'), 250, yPosition, { width: 150 })
        .fillColor(severityColor)
        .text(discrepancy.severity || 'N/A', 400, yPosition, { width: 80 })
        .fillColor('#333333')
        .text(discrepancy.status || 'pending', 480, yPosition, { width: 70 });

      yPosition += 15;
    });

    // Footer
    doc.on('pageAdded', () => {
      this.addFooter(doc);
    });
    this.addFooter(doc);
  }

  /**
   * Generate acknowledgment PDF content
   * @param {PDFDocument} doc - PDF document instance
   * @param {object} acknowledgmentData - Acknowledgment data
   */
  static generateAcknowledgmentContent(doc, acknowledgmentData) {
    let yPosition = 150;

    // Header
    this.addHeader(doc, 'ITR Acknowledgment');

    // Acknowledgment Number (Highlighted)
    doc.fontSize(16)
      .fillColor('#FF6B35')
      .text('ACKNOWLEDGMENT NUMBER', 50, yPosition, { align: 'center' });
    
    yPosition += 30;
    doc.fontSize(20)
      .fillColor('#000000')
      .text(acknowledgmentData.acknowledgmentNumber || 'N/A', 50, yPosition, { align: 'center' });

    yPosition += 40;

    // Submission Details
    doc.fontSize(12)
      .fillColor('#000000')
      .text('Submission Details', 50, yPosition);
    
    yPosition += 20;
    doc.fontSize(10)
      .fillColor('#333333')
      .text(`Submission Date: ${new Date(acknowledgmentData.submittedAt || Date.now()).toLocaleString('en-IN')}`, 50, yPosition)
      .text(`ITR Type: ${acknowledgmentData.itrType || 'N/A'}`, 50, yPosition + 15)
      .text(`Assessment Year: ${acknowledgmentData.assessmentYear || 'N/A'}`, 50, yPosition + 30)
      .text(`E-Verification Status: ${acknowledgmentData.eVerificationStatus || 'Pending'}`, 50, yPosition + 45);

    yPosition += 70;

    // Next Steps
    doc.fontSize(12)
      .fillColor('#000000')
      .text('Next Steps', 50, yPosition);
    
    yPosition += 20;
    const nextSteps = [
      'Your ITR has been successfully submitted.',
      'Please complete e-verification within 120 days of filing.',
      'You will receive updates on your email regarding processing status.',
      'Check refund status in the Refund Tracking section.',
    ];

    nextSteps.forEach((step, index) => {
      doc.fontSize(10)
        .fillColor('#333333')
        .text(`${index + 1}. ${step}`, 50, yPosition);
      yPosition += 15;
    });

    // Footer
    this.addFooter(doc);
  }

  /**
   * Generate refund status PDF content
   * @param {PDFDocument} doc - PDF document instance
   * @param {object} refundData - Refund data
   */
  static generateRefundStatusContent(doc, refundData) {
    let yPosition = 150;

    // Header
    this.addHeader(doc, 'Refund Status Report');

    // Refund Details
    doc.fontSize(14)
      .fillColor('#000000')
      .text('Refund Information', 50, yPosition);
    
    yPosition += 30;
    doc.fontSize(10)
      .fillColor('#333333')
      .text(`Refund Amount: ₹${this.formatCurrency(parseFloat(refundData.amount || 0))}`, 50, yPosition)
      .text(`Status: ${refundData.status || 'Pending'}`, 200, yPosition)
      .text(`Processing Date: ${refundData.processedAt ? new Date(refundData.processedAt).toLocaleDateString('en-IN') : 'N/A'}`, 400, yPosition);

    yPosition += 30;

    // Timeline
    if (refundData.timeline && refundData.timeline.length > 0) {
      doc.fontSize(12)
        .fillColor('#000000')
        .text('Refund Timeline', 50, yPosition);
      
      yPosition += 20;
      refundData.timeline.forEach((event) => {
        doc.fontSize(10)
          .fillColor('#333333')
          .text(`${event.date}: ${event.status} - ${event.description}`, 50, yPosition);
        yPosition += 15;
      });
    }

    // Footer
    this.addFooter(doc);
  }

  /**
   * Generate schedule-specific PDF content
   * @param {PDFDocument} doc - PDF document instance
   * @param {object} scheduleData - Schedule data
   * @param {string} scheduleType - Schedule type
   */
  static generateScheduleContent(doc, scheduleData, scheduleType) {
    let yPosition = 150;

    // Header
    this.addHeader(doc, `Schedule ${scheduleType}`);

    // Schedule-specific content
    doc.fontSize(12)
      .fillColor('#000000')
      .text(`Schedule ${scheduleType} Details`, 50, yPosition);
    
    yPosition += 30;

    // Generic schedule content rendering
    if (Array.isArray(scheduleData)) {
      scheduleData.forEach((item, index) => {
        doc.fontSize(10)
          .fillColor('#333333')
          .text(`Item ${index + 1}:`, 50, yPosition);
        yPosition += 15;
        
        Object.keys(item).forEach((key) => {
          doc.text(`${key}: ${item[key]}`, 70, yPosition);
          yPosition += 12;
        });
        yPosition += 10;
      });
    } else {
      Object.keys(scheduleData).forEach((key) => {
        doc.fontSize(10)
          .fillColor('#333333')
          .text(`${key}: ${scheduleData[key]}`, 50, yPosition);
        yPosition += 15;
      });
    }

    // Footer
    doc.on('pageAdded', () => {
      this.addFooter(doc);
    });
    this.addFooter(doc);
  }

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @returns {string} - Formatted currency string
   */
  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(amount || 0);
  }

  /**
   * Format address
   * @param {object} address - Address object
   * @returns {string} - Formatted address string
   */
  static formatAddress(address) {
    if (typeof address === 'string') return address;
    const parts = [
      address.street,
      address.city,
      address.state,
      address.pincode,
    ].filter(Boolean);
    return parts.join(', ');
  }
}

module.exports = PDFTemplateEngine;

