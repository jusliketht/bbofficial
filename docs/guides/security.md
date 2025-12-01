# Security Notice: xlsx Package Vulnerability

## Overview
The `xlsx` package (version 0.18.5) has known security vulnerabilities:
- **GHSA-4r6h-8v6p-xvw6**: Prototype Pollution in sheetJS
- **GHSA-5pgg-2g8v-p4x9**: SheetJS Regular Expression Denial of Service (ReDoS)

**Status**: No fix available from the maintainer. The package is at the latest version (0.18.5).

## Mitigations Implemented

### 1. File Size Limits
- Maximum file size: **10MB** (prevents ReDoS attacks via large files)
- Implemented in both frontend and backend

### 2. Input Sanitization
- **Prototype Pollution Prevention**: All parsed data is sanitized to remove `__proto__`, `constructor`, and `prototype` properties
- Only own properties are copied from parsed objects
- Implemented in `sanitizeData()` method in both frontend and backend

### 3. Parsing Options Hardening
- `cellDates: false` - Disabled date parsing to reduce attack surface
- `cellNF: false` - Disabled number format parsing
- `cellStyles: false` - Disabled style parsing
- `sheetRows: 10000` - Limited rows to prevent memory exhaustion

### 4. Validation
- Workbook structure validation before processing
- Sheet existence validation
- Transaction data validation after parsing

## Files Modified
- `backend/src/services/business/BrokerFileProcessingService.js`
- `frontend/src/services/BrokerFileProcessor.js`

## Risk Assessment
- **Risk Level**: Medium (mitigated to Low with implemented controls)
- **Attack Vector**: Malicious Excel files uploaded by users
- **Impact**: Prototype pollution could lead to code execution; ReDoS could cause DoS
- **Mitigation Effectiveness**: High - Multiple layers of protection implemented

## Monitoring
- Monitor for any updates to the xlsx package
- Review security advisories regularly
- Consider alternative packages if a secure replacement becomes available

## Alternative Packages (Future Consideration)
- `exceljs` - More actively maintained, better security posture
- `node-xlsx` - Lightweight alternative
- Server-side only processing with additional validation

## References
- https://github.com/advisories/GHSA-4r6h-8v6p-xvw6
- https://github.com/advisories/GHSA-5pgg-2g8v-p4x9

