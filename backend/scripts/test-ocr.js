#!/usr/bin/env node

/**
 * OCR Testing Script
 * Tests the Document OCR functionality with Tesseract.js
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import the DocumentProcessor
const DocumentProcessor = require('../src/services/documentProcessor_DDL');

async function testOCR() {
  console.log('🔍 Testing OCR Functionality...');
  console.log('=====================================');
  
  const processor = new DocumentProcessor();
  
  try {
    // Test with a sample text file (simulating OCR output)
    const testFilePath = path.join(__dirname, 'test-document.txt');
    
    // Create a test document with sample Form 16 data
    const testContent = `
FORM 16
Certificate under section 203 of the Income-tax Act, 1961 for tax deducted at source

Employee PAN: ABCDE1234F
Employer PAN: XYZYZ9876A

Employer Name: Tech Solutions Pvt Ltd
Financial Year: 2023-2024

Gross Salary: ₹8,50,000
TDS Deducted: ₹75,000
Standard Deduction: ₹50,000
Professional Tax: ₹2,400

Net Salary: ₹7,72,600
    `;
    
    // Write test content to file
    fs.writeFileSync(testFilePath, testContent);
    
    console.log('📄 Test document created');
    console.log('🔍 Testing Form 16 data extraction...');
    
    // Test OCR processing
    const result = await processor.performOCR(testFilePath, 'FORM16');
    
    console.log('\n📊 OCR Results:');
    console.log('================');
    console.log('Success:', result.success);
    console.log('Confidence:', result.confidence);
    console.log('Message:', result.message);
    
    if (result.extractedData) {
      console.log('\n📋 Extracted Data:');
      console.log('==================');
      console.log(JSON.stringify(result.extractedData, null, 2));
    }
    
    if (result.rawText) {
      console.log('\n📝 Raw Text (first 200 chars):');
      console.log('==============================');
      console.log(result.rawText.substring(0, 200) + '...');
    }
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ OCR test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testOCR()
    .then(() => {
      console.log('\n🎉 OCR functionality test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 OCR test failed:', error);
      process.exit(1);
    });
}

module.exports = { testOCR };
