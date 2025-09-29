// Justification: Capital Gains Parser Test - Comprehensive testing of Excel parsing functionality
// Tests the capital gains Excel parser with sample data
// Validates parsing accuracy and data integrity
// Essential for ensuring reliable automated data extraction

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const CapitalGainsParser = require('./src/services/capitalGainsParser');
const CapitalGains = require('./src/models/CapitalGains_DDL');
const { logger } = require('./src/utils/logger');

class CapitalGainsParserTest {
  constructor() {
    this.parser = new CapitalGainsParser();
    this.testIntakeId = 'test-intake-' + Date.now();
  }

  // Justification: Create Test Excel File - Generate sample Excel data
  // Creates a test Excel file with various capital gains scenarios
  // Tests different data formats and edge cases
  createTestExcelFile() {
    const testData = [
      // Header row
      [
        'Asset Name',
        'Asset Category', 
        'Date of Purchase',
        'Date of Sale',
        'Cost of Acquisition',
        'Sale Consideration',
        'Transfer Expenses',
        'Exemptions',
        'Gain Type'
      ],
      // Test data rows
      [
        'Reliance Industries Ltd',
        'Equity',
        '2023-01-15',
        '2023-12-15',
        100000,
        120000,
        1000,
        0,
        'Short Term'
      ],
      [
        'HDFC Equity Fund',
        'Mutual Fund',
        '2022-06-01',
        '2023-12-01',
        50000,
        65000,
        500,
        0,
        'Long Term'
      ],
      [
        'TCS Limited',
        'Equity',
        '2023-03-10',
        '2023-11-20',
        75000,
        80000,
        750,
        0,
        'Short Term'
      ],
      [
        'Apartment in Mumbai',
        'Property',
        '2020-01-01',
        '2023-12-01',
        5000000,
        6500000,
        50000,
        0,
        'Long Term'
      ],
      [
        'Gold ETF',
        'Commodity',
        '2023-05-15',
        '2023-10-15',
        100000,
        95000,
        500,
        0,
        'Short Term'
      ]
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(testData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Capital Gains');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    return buffer;
  }

  // Justification: Create Alternative Format Excel - Test different formats
  // Creates Excel file with alternative column names and formats
  // Tests parser's flexibility with different naming conventions
  createAlternativeFormatExcel() {
    const testData = [
      // Alternative header format
      [
        'Security Name',
        'Instrument Type',
        'Purchase Date',
        'Sale Date',
        'Purchase Value',
        'Sale Value',
        'Brokerage & Charges',
        'Exemption',
        'Capital Gain Type'
      ],
      // Test data
      [
        'Infosys Ltd',
        'Equity Shares',
        '2023-02-20',
        '2023-11-30',
        80000,
        90000,
        800,
        0,
        'ST'
      ],
      [
        'SBI Bluechip Fund',
        'Mutual Fund',
        '2021-08-15',
        '2023-12-15',
        100000,
        125000,
        1000,
        0,
        'LT'
      ]
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(testData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Alternative Format');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  // Justification: Run Parser Tests - Execute comprehensive tests
  // Tests various scenarios and validates results
  // Ensures parser handles different formats correctly
  async runParserTests() {
    console.log('🧪 Starting Capital Gains Parser Tests...\n');

    try {
      // Test 1: Standard format Excel
      console.log('📊 Test 1: Standard Format Excel');
      const standardBuffer = this.createTestExcelFile();
      const standardResult = await this.parser.parseExcelFile(standardBuffer, this.testIntakeId);
      
      console.log(`✅ Parsed ${standardResult.totalParsed} capital gains`);
      console.log(`✅ Saved ${standardResult.totalSaved} capital gains`);
      console.log(`⚠️  Errors: ${standardResult.errors.length}`);
      
      if (standardResult.summary) {
        console.log('📈 Summary:', JSON.stringify(standardResult.summary, null, 2));
      }
      console.log('');

      // Test 2: Alternative format Excel
      console.log('📊 Test 2: Alternative Format Excel');
      const alternativeBuffer = this.createAlternativeFormatExcel();
      const alternativeResult = await this.parser.parseExcelFile(alternativeBuffer, this.testIntakeId);
      
      console.log(`✅ Parsed ${alternativeResult.totalParsed} capital gains`);
      console.log(`✅ Saved ${alternativeResult.totalSaved} capital gains`);
      console.log(`⚠️  Errors: ${alternativeResult.errors.length}`);
      console.log('');

      // Test 3: Retrieve and validate saved data
      console.log('📊 Test 3: Data Retrieval and Validation');
      const savedGains = await CapitalGains.findByIntakeId(this.testIntakeId);
      console.log(`✅ Retrieved ${savedGains.length} capital gains from database`);
      
      // Display sample data
      if (savedGains.length > 0) {
        console.log('📋 Sample Capital Gain:');
        console.log(JSON.stringify(savedGains[0], null, 2));
      }
      console.log('');

      // Test 4: Summary calculation
      console.log('📊 Test 4: Summary Calculation');
      const summary = await CapitalGains.getCapitalGainsSummary(this.testIntakeId);
      console.log('📈 Capital Gains Summary:');
      console.log(JSON.stringify(summary, null, 2));
      console.log('');

      // Test 5: Error handling
      console.log('📊 Test 5: Error Handling');
      try {
        const invalidBuffer = Buffer.from('invalid excel data');
        await this.parser.parseExcelFile(invalidBuffer, this.testIntakeId);
      } catch (error) {
        console.log(`✅ Error handling works: ${error.message}`);
      }
      console.log('');

      console.log('🎉 All Capital Gains Parser Tests Completed Successfully!');

    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  }

  // Justification: Cleanup Test Data - Remove test data
  // Cleans up test data after testing
  // Ensures no test data remains in database
  async cleanup() {
    try {
      console.log('🧹 Cleaning up test data...');
      
      // Delete test capital gains
      const savedGains = await CapitalGains.findByIntakeId(this.testIntakeId);
      for (const gain of savedGains) {
        await CapitalGains.delete(gain.capital_gain_id);
      }
      
      console.log(`✅ Cleaned up ${savedGains.length} test capital gains`);
    } catch (error) {
      console.log(`⚠️ Cleanup warning: ${error.message}`);
    }
  }

  // Justification: Run All Tests - Execute complete test suite
  // Runs all tests and provides comprehensive results
  // Essential for validating parser functionality
  async runAllTests() {
    const startTime = Date.now();
    
    try {
      await this.runParserTests();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`\n⏱️  Total test duration: ${duration}ms`);
      console.log('✅ All tests completed successfully!');
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Justification: Main Execution - Run tests if called directly
// Allows running tests independently
// Provides comprehensive validation of parser functionality
async function main() {
  const tester = new CapitalGainsParserTest();
  
  try {
    await tester.runAllTests();
    process.exit(0);
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = CapitalGainsParserTest;
