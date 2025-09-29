// Justification: Naming Convention Fixer - Systematic naming standardization
// Fixes naming inconsistencies across the codebase
// Ensures all names follow established conventions
// Essential for code maintainability and team collaboration

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Justification: Naming Convention Rules - Comprehensive naming standards
// Defines all naming patterns and their justifications
// Essential for consistent codebase maintenance
const NAMING_RULES = {
  // Database naming (snake_case)
  database: {
    tables: /^[a-z][a-z0-9_]*$/,
    columns: /^[a-z][a-z0-9_]*$/,
    indexes: /^idx_[a-z][a-z0-9_]*$/,
    constraints: /^[a-z][a-z0-9_]*_key$/
  },
  
  // JavaScript naming (camelCase/PascalCase)
  javascript: {
    classes: /^[A-Z][a-zA-Z0-9]*$/,
    variables: /^[a-z][a-zA-Z0-9]*$/,
    functions: /^[a-z][a-zA-Z0-9]*$/,
    constants: /^[A-Z][A-Z0-9_]*$/
  },
  
  // File naming (kebab-case)
  files: {
    javascript: /^[a-z][a-z0-9-]*\.js$/,
    sql: /^[a-z][a-z0-9-]*\.sql$/
  }
};

// Justification: Naming Violations - Common naming issues to fix
// Identifies and categorizes naming violations
// Essential for systematic naming correction
const NAMING_VIOLATIONS = {
  // Remove _DDL suffixes from class names
  removeDDLSuffix: {
    pattern: /_DDL$/,
    replacement: '',
    justification: 'Remove _DDL suffix for cleaner class names'
  },
  
  // Fix inconsistent camelCase/snake_case
  fixCaseInconsistency: {
    pattern: /([a-z])([A-Z])/g,
    replacement: '$1_$2',
    justification: 'Convert camelCase to snake_case for database'
  },
  
  // Fix inconsistent PascalCase
  fixPascalCase: {
    pattern: /^[a-z]/,
    replacement: (match) => match.toUpperCase(),
    justification: 'Ensure class names start with uppercase'
  }
};

// Justification: File Scanner - Recursive file discovery
// Scans all files in the codebase for naming violations
// Essential for comprehensive naming audit
function scanFiles(dir, extensions = ['.js', '.sql', '.md']) {
  const files = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  scanDirectory(dir);
  return files;
}

// Justification: Naming Validator - Pattern validation
// Validates names against established conventions
// Essential for maintaining naming standards
function validateNaming(name, type, context = '') {
  const rules = NAMING_RULES[type];
  if (!rules) return { isValid: true, violations: [] };
  
  const violations = [];
  
  for (const [ruleName, pattern] of Object.entries(rules)) {
    if (!pattern.test(name)) {
      violations.push({
        rule: ruleName,
        pattern: pattern.toString(),
        name,
        context
      });
    }
  }
  
  return {
    isValid: violations.length === 0,
    violations
  };
}

// Justification: Naming Fixer - Automatic correction
// Automatically fixes common naming violations
// Essential for systematic naming standardization
function fixNamingViolations(content, filePath) {
  let fixedContent = content;
  const fixes = [];
  
  // Fix _DDL suffixes in class names
  const ddlPattern = /class\s+([A-Z][a-zA-Z0-9]*)_DDL/g;
  fixedContent = fixedContent.replace(ddlPattern, (match, className) => {
    const newName = className;
    fixes.push({
      type: 'removeDDLSuffix',
      old: match,
      new: `class ${newName}`,
      justification: 'Remove _DDL suffix for cleaner class names'
    });
    return `class ${newName}`;
  });
  
  // Fix inconsistent variable naming
  const camelCasePattern = /const\s+([a-z][a-zA-Z0-9]*)_([a-z][a-zA-Z0-9]*)/g;
  fixedContent = fixedContent.replace(camelCasePattern, (match, prefix, suffix) => {
    const newName = prefix + suffix.charAt(0).toUpperCase() + suffix.slice(1);
    fixes.push({
      type: 'fixCamelCase',
      old: match,
      new: `const ${newName}`,
      justification: 'Convert snake_case to camelCase for JavaScript variables'
    });
    return `const ${newName}`;
  });
  
  // Fix inconsistent function naming
  const functionPattern = /function\s+([a-z][a-zA-Z0-9]*)_([a-z][a-zA-Z0-9]*)/g;
  fixedContent = fixedContent.replace(functionPattern, (match, prefix, suffix) => {
    const newName = prefix + suffix.charAt(0).toUpperCase() + suffix.slice(1);
    fixes.push({
      type: 'fixFunctionNaming',
      old: match,
      new: `function ${newName}`,
      justification: 'Convert snake_case to camelCase for JavaScript functions'
    });
    return `function ${newName}`;
  });
  
  return { content: fixedContent, fixes };
}

// Justification: Report Generator - Comprehensive naming audit
// Generates detailed reports of naming violations and fixes
// Essential for tracking naming standardization progress
function generateNamingReport(files, violations, fixes) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: files.length,
      filesWithViolations: violations.length,
      totalViolations: violations.reduce((sum, v) => sum + v.violations.length, 0),
      totalFixes: fixes.length
    },
    violations: violations,
    fixes: fixes,
    recommendations: []
  };
  
  // Generate recommendations
  if (violations.length > 0) {
    report.recommendations.push({
      priority: 'high',
      action: 'Fix naming violations',
      description: `Found ${report.summary.totalViolations} naming violations across ${report.summary.filesWithViolations} files`
    });
  }
  
  if (fixes.length > 0) {
    report.recommendations.push({
      priority: 'medium',
      action: 'Review automatic fixes',
      description: `Applied ${fixes.length} automatic naming fixes`
    });
  }
  
  return report;
}

// Justification: Main Execution - Orchestrates naming standardization
// Coordinates the entire naming standardization process
// Essential for systematic codebase improvement
async function standardizeNaming() {
  console.log('🔍 Starting comprehensive naming standardization...\n');
  
  const backendDir = path.join(__dirname, '..', 'src');
  const files = scanFiles(backendDir);
  
  console.log(`📁 Found ${files.length} files to analyze\n`);
  
  const violations = [];
  const fixes = [];
  const processedFiles = [];
  
  // Analyze each file
  for (const filePath of files) {
    console.log(`📄 Analyzing: ${path.relative(__dirname, filePath)}`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileViolations = [];
      
      // Check file naming
      const fileName = path.basename(filePath);
      const fileNameValidation = validateNaming(fileName, 'files', filePath);
      if (!fileNameValidation.isValid) {
        fileViolations.push(...fileNameValidation.violations);
      }
      
      // Check class names
      const classPattern = /class\s+([A-Z][a-zA-Z0-9]*)/g;
      let classMatch;
      while ((classMatch = classPattern.exec(content)) !== null) {
        const className = classMatch[1];
        const validation = validateNaming(className, 'javascript', filePath);
        if (!validation.isValid) {
          fileViolations.push(...validation.violations);
        }
      }
      
      // Check variable names
      const varPattern = /(?:const|let|var)\s+([a-zA-Z][a-zA-Z0-9]*)/g;
      let varMatch;
      while ((varMatch = varPattern.exec(content)) !== null) {
        const varName = varMatch[1];
        const validation = validateNaming(varName, 'javascript', filePath);
        if (!validation.isValid) {
          fileViolations.push(...validation.violations);
        }
      }
      
      // Apply fixes
      const fixResult = fixNamingViolations(content, filePath);
      if (fixResult.fixes.length > 0) {
        fixes.push(...fixResult.fixes.map(fix => ({ ...fix, file: filePath })));
        
        // Write fixed content back to file
        fs.writeFileSync(filePath, fixResult.content, 'utf8');
        console.log(`  ✅ Applied ${fixResult.fixes.length} fixes`);
      }
      
      if (fileViolations.length > 0) {
        violations.push({
          file: filePath,
          violations: fileViolations
        });
        console.log(`  ⚠️  Found ${fileViolations.length} violations`);
      } else {
        console.log(`  ✅ No violations found`);
      }
      
      processedFiles.push(filePath);
      
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
    }
  }
  
  // Generate and save report
  const report = generateNamingReport(processedFiles, violations, fixes);

  const reportPath = path.join(__dirname, '..', 'naming-standardization-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n📊 Naming Standardization Report');
  console.log('================================');
  console.log(`📁 Files analyzed: ${report.summary.totalFiles}`);
  console.log(`⚠️  Files with violations: ${report.summary.filesWithViolations}`);
  console.log(`🔧 Total violations: ${report.summary.totalViolations}`);
  console.log(`✅ Total fixes applied: ${report.summary.totalFixes}`);
  console.log(`📄 Report saved to: ${reportPath}`);
  
  // Print recommendations
  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.action}: ${rec.description}`);
    });
  }
  
  return report;
}

// Justification: CLI Interface - Command-line execution
// Provides command-line interface for naming standardization
// Essential for easy integration into development workflow
if (require.main === module) {
  standardizeNaming()
    .then(() => {
      console.log('\n✅ Naming standardization completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Naming standardization failed:', error);
      process.exit(1);
    });
}

module.exports = {
  standardizeNaming,
  validateNaming,
  fixNamingViolations,
  generateNamingReport,
  NAMING_RULES,
  NAMING_VIOLATIONS
};
