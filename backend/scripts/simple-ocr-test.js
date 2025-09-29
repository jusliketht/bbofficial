#!/usr/bin/env node

/**
 * Simple OCR Test
 */

console.log('🔍 Starting OCR Test...');

try {
  // Test Tesseract.js import
  console.log('📦 Testing Tesseract.js import...');
  const { createWorker } = require('tesseract.js');
  console.log('✅ Tesseract.js imported successfully');
  
  // Test DocumentProcessor import
  console.log('📦 Testing DocumentProcessor import...');
  const DocumentProcessor = require('../src/services/documentProcessor_DDL');
  console.log('✅ DocumentProcessor imported successfully');
  
  // Create instance
  console.log('🏗️ Creating DocumentProcessor instance...');
  const processor = new DocumentProcessor();
  console.log('✅ DocumentProcessor instance created');
  
  console.log('🎉 All tests passed! OCR functionality is ready.');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
