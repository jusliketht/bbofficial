#!/usr/bin/env node

// =====================================================
// IMPORT PATH STANDARDIZATION SCRIPT
// Standardizes import paths across the entire codebase
// =====================================================

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const BACKEND_SRC_PATH = path.join(__dirname, 'src');
const FRONTEND_SRC_PATH = path.join(__dirname, '..', 'frontend', 'src');

// Import path mappings for backend
const BACKEND_IMPORT_MAPPINGS = {
  // Services
  '../../services/auth/authenticationService': '../../services/auth/authenticationService',
  '../services/authService': '../../services/auth/authenticationService',
  '../../services/authService': '../../services/auth/authenticationService',
  '../../services/userService': '../../services/user/userService',
  '../services/userService': '../../services/user/userService',
  '../../services/filingService': '../../services/filing/filingService',
  '../services/filingService': '../../services/filing/filingService',
  
  // Controllers
  '../../controllers/authController': '../../controllers/AuthController',
  '../controllers/authController': '../../controllers/AuthController',
  '../../controllers/userController': '../../controllers/UserController',
  '../controllers/userController': '../../controllers/UserController',
  
  // Models
  '../../models/User': '../../models/User',
  '../models/User': '../../models/User',
  '../../models/Filing': '../../models/Filing',
  '../models/Filing': '../../models/Filing',
  
  // Middleware
  '../../middleware/auth': '../../middleware/auth',
  '../middleware/auth': '../../middleware/auth',
  '../../middleware/validation': '../../middleware/validation',
  '../middleware/validation': '../../middleware/validation',
  
  // Utils
  '../../utils/logger': '../../utils/logger',
  '../utils/logger': '../../utils/logger',
  '../../utils/database': '../../utils/database',
  '../utils/database': '../../utils/database',
  
  // Config
  '../../config/database': '../../config/database',
  '../config/database': '../../config/database',
  '../../config/swagger': '../../config/swagger',
  '../config/swagger': '../../config/swagger'
};

// Import path mappings for frontend
const FRONTEND_IMPORT_MAPPINGS = {
  // Services
  '../services/authService': '../services/authService',
  '../../services/authService': '../services/authService',
  '../services/apiService': '../services/apiService',
  '../../services/apiService': '../services/apiService',
  
  // Components
  '../components/UI': '../components/UI',
  '../../components/UI': '../components/UI',
  '../components/Forms': '../components/Forms',
  '../../components/Forms': '../components/Forms',
  
  // Contexts
  '../contexts/AuthContext': '../contexts/AuthContext',
  '../../contexts/AuthContext': '../contexts/AuthContext',
  '../contexts/TaxContext': '../contexts/TaxContext',
  '../../contexts/TaxContext': '../contexts/TaxContext',
  
  // Hooks
  '../hooks/useAuth': '../hooks/useAuth',
  '../../hooks/useAuth': '../hooks/useAuth',
  '../hooks/useFilingList': '../hooks/useFilingList',
  '../../hooks/useFilingList': '../hooks/useFilingList',
  
  // Utils
  '../utils/infiniteRenderPrevention': '../utils/infiniteRenderPrevention',
  '../../utils/infiniteRenderPrevention': '../utils/infiniteRenderPrevention'
};

// File patterns to process
const BACKEND_PATTERNS = [
  'src/**/*.js',
  'src/**/*.jsx',
  'src/**/*.ts',
  'src/**/*.tsx'
];

const FRONTEND_PATTERNS = [
  'src/**/*.js',
  'src/**/*.jsx',
  'src/**/*.ts',
  'src/**/*.tsx'
];

function standardizeImports(filePath, mappings, basePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Process require statements
    Object.entries(mappings).forEach(([oldPath, newPath]) => {
      const requireRegex = new RegExp(`require\\(['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]\\)`, 'g');
      if (content.match(requireRegex)) {
        content = content.replace(requireRegex, `require('${newPath}')`);
        modified = true;
      }
    });
    
    // Process import statements
    Object.entries(mappings).forEach(([oldPath, newPath]) => {
      const importRegex = new RegExp(`import\\s+.*\\s+from\\s+['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
      if (content.match(importRegex)) {
        content = content.replace(importRegex, (match) => {
          return match.replace(oldPath, newPath);
        });
        modified = true;
      }
    });
    
    // Process dynamic imports
    Object.entries(mappings).forEach(([oldPath, newPath]) => {
      const dynamicImportRegex = new RegExp(`import\\(['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]\\)`, 'g');
      if (content.match(dynamicImportRegex)) {
        content = content.replace(dynamicImportRegex, `import('${newPath}')`);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${path.relative(basePath, filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function createBarrelExports(basePath, exports) {
  const barrelPath = path.join(basePath, 'index.js');
  const content = Object.entries(exports)
    .map(([name, path]) => `module.exports.${name} = require('${path}');`)
    .join('\n') + '\n';
  
  fs.writeFileSync(barrelPath, content, 'utf8');
  console.log(`✅ Created barrel export: ${barrelPath}`);
}

async function standardizeBackendImports() {
  console.log('🔧 Standardizing backend import paths...');
  console.log('=' .repeat(50));
  
  let totalFiles = 0;
  let modifiedFiles = 0;
  
  // Process all backend files
  for (const pattern of BACKEND_PATTERNS) {
    const files = glob.sync(pattern, { cwd: __dirname });
    
    for (const file of files) {
      const filePath = path.join(__dirname, file);
      totalFiles++;
      
      if (standardizeImports(filePath, BACKEND_IMPORT_MAPPINGS, __dirname)) {
        modifiedFiles++;
      }
    }
  }
  
  // Create barrel exports for services
  const servicesPath = path.join(BACKEND_SRC_PATH, 'services');
  if (fs.existsSync(servicesPath)) {
    createBarrelExports(servicesPath, {
      authService: './auth/authenticationService',
      userService: './user/userService',
      filingService: './filing/filingService',
      taxService: './tax/taxService'
    });
  }
  
  // Create barrel exports for controllers
  const controllersPath = path.join(BACKEND_SRC_PATH, 'controllers');
  if (fs.existsSync(controllersPath)) {
    createBarrelExports(controllersPath, {
      AuthController: './AuthController',
      UserController: './UserController',
      FilingController: './FilingController'
    });
  }
  
  console.log(`\n📊 Backend Results:`);
  console.log(`   Total files processed: ${totalFiles}`);
  console.log(`   Files modified: ${modifiedFiles}`);
}

async function standardizeFrontendImports() {
  console.log('\n🔧 Standardizing frontend import paths...');
  console.log('=' .repeat(50));
  
  let totalFiles = 0;
  let modifiedFiles = 0;
  
  // Process all frontend files
  for (const pattern of FRONTEND_PATTERNS) {
    const files = glob.sync(pattern, { cwd: FRONTEND_SRC_PATH });
    
    for (const file of files) {
      const filePath = path.join(FRONTEND_SRC_PATH, file);
      totalFiles++;
      
      if (standardizeImports(filePath, FRONTEND_IMPORT_MAPPINGS, FRONTEND_SRC_PATH)) {
        modifiedFiles++;
      }
    }
  }
  
  // Create barrel exports for components
  const componentsPath = path.join(FRONTEND_SRC_PATH, 'components');
  if (fs.existsSync(componentsPath)) {
    createBarrelExports(componentsPath, {
      Button: './UI/Button',
      Input: './UI/Input',
      Card: './UI/Card',
      Modal: './UI/Modal'
    });
  }
  
  // Create barrel exports for hooks
  const hooksPath = path.join(FRONTEND_SRC_PATH, 'hooks');
  if (fs.existsSync(hooksPath)) {
    createBarrelExports(hooksPath, {
      useAuth: './useAuth',
      useFilingList: './useFilingList',
      useFilingStatistics: './useFilingStatistics'
    });
  }
  
  console.log(`\n📊 Frontend Results:`);
  console.log(`   Total files processed: ${totalFiles}`);
  console.log(`   Files modified: ${modifiedFiles}`);
}

async function validateImports() {
  console.log('\n🔍 Validating import paths...');
  console.log('=' .repeat(50));
  
  const issues = [];
  
  // Check backend imports
  for (const pattern of BACKEND_PATTERNS) {
    const files = glob.sync(pattern, { cwd: __dirname });
    
    for (const file of files) {
      const filePath = path.join(__dirname, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for relative imports that could be absolute
      const relativeImports = content.match(/require\(['"]\.\.\/\.\.\/[^'"]*['"]\)/g) || [];
      const importStatements = content.match(/import.*from\s+['"]\.\.\/\.\.\/[^'"]*['"]/g) || [];
      
      if (relativeImports.length > 0 || importStatements.length > 0) {
        issues.push({
          file: path.relative(__dirname, filePath),
          type: 'relative_import',
          count: relativeImports.length + importStatements.length
        });
      }
    }
  }
  
  if (issues.length > 0) {
    console.log(`⚠️  Found ${issues.length} files with potential import issues:`);
    issues.forEach(issue => {
      console.log(`   - ${issue.file}: ${issue.count} relative imports`);
    });
  } else {
    console.log('✅ No import issues found!');
  }
}

async function main() {
  try {
    console.log('🚀 Starting import path standardization...');
    console.log('=' .repeat(60));
    
    await standardizeBackendImports();
    await standardizeFrontendImports();
    await validateImports();
    
    console.log('\n🎉 Import path standardization completed!');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('❌ Standardization failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  standardizeBackendImports,
  standardizeFrontendImports,
  validateImports
};
