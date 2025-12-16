# UX Discrepancies Report

## Executive Summary

This report documents all UX inconsistencies and discrepancies found across the Burnblack platform. Issues are categorized by severity and type for systematic resolution.

## Critical Issues (Must Fix)

### 1. Non-Brand Color Usage

**Severity**: CRITICAL  
**Impact**: Brand inconsistency, visual confusion

#### Files with Non-Brand Colors:

1. **`frontend/src/components/Layout/Header.js`**
   - ❌ Uses `gray-*` colors (lines 66, 73, 97, 111, 128, 138, 150, 160, 168, 171, 180, 192, 202)
   - ✅ Should use: `slate-*` for neutrals, `primary-*` for brand elements
   - **Lines to fix**: 66, 73, 97, 111, 128, 138, 150, 160, 168, 171, 180, 192, 202

2. **`frontend/src/components/Layout/Sidebar.js`**
   - ❌ Uses `gray-*` colors (lines 79, 99, 116, 137, 165, 195, 198)
   - ✅ Should use: `slate-*` for neutrals
   - **Lines to fix**: 79, 99, 116, 137, 165, 195, 198

3. **`frontend/src/components/Layout/Footer.js`**
   - ❌ Uses `gray-*` colors (lines 32, 42, 44, 50, 57, 67, 76, 87, 96, 107, 116, 127, 129, 133, 136)
   - ✅ Should use: `slate-*` for neutrals
   - **Lines to fix**: 32, 42, 44, 50, 57, 67, 76, 87, 96, 107, 116, 127, 129, 133, 136

4. **`frontend/src/components/Layout/OnboardingWizard.js`**
   - ❌ Uses `blue-*`, `green-*`, `purple-*` colors (not in brand palette)
   - ❌ Uses `gray-*` instead of `slate-*`
   - ✅ Should use: `info-*` for blue, `success-*` for green, `primary-*` or `ember-*` for accents
   - **Lines to fix**: 105, 108, 122, 127, 134, 152, 156, 167, 212, 216, 220, 224, 228, 232, 241, 242, 247, 262, 267, 279, 280, 285, 299, 311, 326, 331, 343, 344, 349, 363, 364, 389, 390, 433, 441, 453

5. **`frontend/src/components/UI/WelcomeModal.js`**
   - ❌ Uses `gray-*` colors throughout
   - ✅ Should use: `slate-*` for neutrals
   - **Lines to fix**: 53, 66, 70, 90, 93, 111, 118, 119

6. **`frontend/src/components/Layout/NotificationsPanel.js`**
   - ❌ Uses `gray-*` colors
   - ✅ Should use: `slate-*` for neutrals
   - **Lines to fix**: 52, 54, 81, 112

7. **`frontend/src/pages/ITR/ITRComputation.js`**
   - ❌ Uses `neutral-*` colors (lines 4095, 4105, 4108, 4111, 4116, 4117, 4120, 4121, 4410, 4471, 4484, 4577, 4580, 4661, 4665)
   - ✅ Should use: `slate-*` for neutrals
   - **Lines to fix**: 4095, 4105, 4108, 4111, 4116, 4117, 4120, 4121, 4410, 4471, 4484, 4577, 4580, 4661, 4665

8. **`frontend/src/components/UI/ProgressIndicator.js`**
   - ❌ Uses `gray-300` and `gray-600` (line 13, 20)
   - ✅ Should use: `slate-300` and `slate-600`
   - **Lines to fix**: 13, 20

9. **`frontend/src/hooks/useDraftManagement.js`**
   - ❌ Uses `blue-600` and `blue-700` (line 212)
   - ✅ Should use: `info-500` and `info-600`
   - **Lines to fix**: 212

### 2. Inconsistent Border Radius

**Severity**: HIGH  
**Impact**: Visual inconsistency

**Issues Found**:
- Mixed usage of `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`
- Should standardize to design system tokens: `rounded-xl` (12px), `rounded-2xl` (16px), `rounded-3xl` (20px)

**Files to Review**:
- All component files using border-radius

### 3. Inconsistent Shadows

**Severity**: HIGH  
**Impact**: Depth hierarchy confusion

**Issues Found**:
- Mixed usage of `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`
- Should use elevation system: `shadow-elevation-1` through `shadow-elevation-4`

**Files to Review**:
- All component files using box-shadow

### 4. Inconsistent Typography

**Severity**: HIGH  
**Impact**: Readability and hierarchy issues

**Issues Found**:
- Mixed usage of `text-xs`, `text-sm`, `text-base`, `text-lg`
- Should use design system tokens: `text-body-small`, `text-body-regular`, `text-body-large`, `text-heading-1` through `text-heading-4`

**Files to Review**:
- All component files using text sizes

## High Priority Issues

### 5. Button Style Inconsistencies

**Severity**: HIGH  
**Impact**: User confusion, inconsistent interactions

**Issues Found**:
- Multiple button components with different styles
- Inconsistent hover states
- Inconsistent focus states
- Inconsistent disabled states

**Files to Review**:
- `frontend/src/components/UI/Button.js`
- `frontend/src/components/DesignSystem/components/Button.js`
- `frontend/src/components/common/Button.js`
- `frontend/src/components/ITR/PauseResumeButton.js`

**Recommendation**: Consolidate to single button component with variants

### 6. Input Field Inconsistencies

**Severity**: HIGH  
**Impact**: Form usability issues

**Issues Found**:
- Multiple input components with different styles
- Inconsistent validation states
- Inconsistent error message display
- Inconsistent focus states

**Files to Review**:
- `frontend/src/components/UI/TextInput.js`
- `frontend/src/components/UI/input.js`
- `frontend/src/components/DesignSystem/components/Input.js`
- `frontend/src/components/Forms/ValidatedNumberInput.js`
- `frontend/src/components/UI/CurrencyInput/CurrencyInput.js`

**Recommendation**: Consolidate to single input component with variants

### 7. Loading State Inconsistencies

**Severity**: MEDIUM  
**Impact**: User experience during async operations

**Issues Found**:
- Inconsistent loading indicators
- Missing skeleton screens
- Inconsistent spinner styles

**Recommendation**: 
- Use consistent spinner component
- Implement skeleton screens for data loading
- Use design system loading states

### 8. Error Message Inconsistencies

**Severity**: MEDIUM  
**Impact**: User confusion, accessibility issues

**Issues Found**:
- Inconsistent error message placement
- Inconsistent error message styling
- Missing error message icons
- Inconsistent validation feedback

**Recommendation**:
- Standardize error message component
- Use `error-*` brand colors consistently
- Add error icons for visual clarity

## Medium Priority Issues

### 9. Spacing Inconsistencies

**Severity**: MEDIUM  
**Impact**: Visual rhythm issues

**Issues Found**:
- Mixed usage of spacing values
- Should use 4px base unit system: `1` (4px), `2` (8px), `3` (12px), `4` (16px), etc.

**Files to Review**:
- All component files using padding/margin

### 10. Responsive Design Inconsistencies

**Severity**: MEDIUM  
**Impact**: Mobile/tablet usability

**Issues Found**:
- Inconsistent breakpoint usage
- Inconsistent mobile navigation patterns
- Inconsistent touch target sizes

**Recommendation**:
- Standardize breakpoints
- Ensure minimum 44x44px touch targets
- Consistent mobile navigation patterns

### 11. Accessibility Issues

**Severity**: MEDIUM  
**Impact**: WCAG compliance, screen reader support

**Issues Found**:
- Missing ARIA labels
- Inconsistent focus indicators
- Missing keyboard navigation
- Color contrast issues

**Recommendation**:
- Add ARIA labels to all interactive elements
- Use `focus-ring` utility for consistent focus states
- Ensure keyboard navigation for all interactive elements
- Verify color contrast ratios

## Low Priority Issues

### 12. Animation Inconsistencies

**Severity**: LOW  
**Impact**: Perceived performance, polish

**Issues Found**:
- Inconsistent transition durations
- Inconsistent easing functions
- Missing micro-interactions

**Recommendation**:
- Use design system animation tokens
- Standardize transition durations
- Add micro-interactions for feedback

### 13. Icon Size Inconsistencies

**Severity**: LOW  
**Impact**: Visual balance

**Issues Found**:
- Mixed icon sizes: `h-4 w-4`, `h-5 w-5`, `h-6 w-6`
- Should standardize to design system icon sizes

**Recommendation**:
- Standardize icon sizes
- Use consistent icon sizing scale

## Summary Statistics

- **Total Files with Color Issues**: 9
- **Total Lines to Fix**: ~150+
- **Critical Issues**: 4
- **High Priority Issues**: 4
- **Medium Priority Issues**: 3
- **Low Priority Issues**: 2

## Recommended Action Plan

### Phase 1: Critical Fixes (Week 1)
1. Replace all `gray-*` with `slate-*`
2. Replace all `blue-*` with `info-*` or `primary-*`
3. Replace all `green-*` with `success-*`
4. Remove `purple-*` usage (not in brand)
5. Replace `neutral-*` with `slate-*`

### Phase 2: High Priority (Week 2)
1. Consolidate button components
2. Consolidate input components
3. Standardize border radius
4. Standardize shadows
5. Standardize typography

### Phase 3: Medium Priority (Week 3)
1. Standardize spacing
2. Fix responsive design issues
3. Improve accessibility
4. Standardize loading states
5. Standardize error messages

### Phase 4: Low Priority (Week 4)
1. Standardize animations
2. Standardize icon sizes
3. Add micro-interactions

## Color Replacement Guide

| Old Color | New Color | Usage |
|-----------|-----------|-------|
| `gray-*` | `slate-*` | Neutral backgrounds, borders, text |
| `blue-*` | `info-*` or `primary-*` | Information, primary actions |
| `green-*` | `success-*` | Success states, confirmations |
| `purple-*` | `primary-*` or `ember-*` | Accents (remove if not needed) |
| `neutral-*` | `slate-*` | All neutral usage |
| `orange-*` | `ember-*` | Secondary accents, warnings |

## Typography Replacement Guide

| Old Size | New Token | Usage |
|----------|-----------|-------|
| `text-xs` | `text-body-small` | Small helper text |
| `text-sm` | `text-body-regular` | Body text |
| `text-base` | `text-body-large` | Large body text |
| `text-lg` | `text-heading-4` | Small headings |
| `text-xl` | `text-heading-3` | Medium headings |
| `text-2xl` | `text-heading-2` | Large headings |
| `text-3xl` | `text-heading-1` | Extra large headings |

## Shadow Replacement Guide

| Old Shadow | New Shadow | Usage |
|------------|------------|-------|
| `shadow-sm` | `shadow-elevation-1` | Cards at rest |
| `shadow-md` | `shadow-elevation-2` | Cards hover |
| `shadow-lg` | `shadow-elevation-3` | Dropdowns, popovers |
| `shadow-xl` | `shadow-elevation-4` | Modals, dialogs |

## Next Steps

1. Review this report with design team
2. Prioritize fixes based on user impact
3. Create tickets for each phase
4. Begin Phase 1 implementation
5. Test changes for visual consistency
6. Update design system documentation

