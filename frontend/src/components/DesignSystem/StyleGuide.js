// =====================================================
// BURNBACK STYLE GUIDE - DESIGN SYSTEM DOCUMENTATION
// Comprehensive style guide and component showcase
// =====================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Typography,
  LoadingSpinner,
  Skeleton,
  DesignTokens,
  A11y
} from './DesignSystem';
import { 
  PageTransition, 
  ModalTransition, 
  CardAnimation, 
  FadeInUp,
  StaggerContainer,
  StaggerItem 
} from './Animations';
import { 
  AccessibleInput, 
  AccessibleButton, 
  AccessibleModal,
  AccessibleTooltip,
  StatusAnnouncer 
} from './Accessibility';

const StyleGuide = () => {
  const [showModal, setShowModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleStatusUpdate = (message) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  return (
    <PageTransition className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Typography.H1 className="mb-4">BurnBlack Design System</Typography.H1>
          <Typography.Body className="text-lg text-neutral-600 max-w-3xl mx-auto">
            A comprehensive design system ensuring consistency, accessibility, and delightful user experiences across the BurnBlack platform.
          </Typography.Body>
        </div>

        {/* Status Announcer */}
        <StatusAnnouncer message={statusMessage} />

        {/* Color Palette */}
        <section className="mb-16">
          <Typography.H2 className="mb-8">Color Palette</Typography.H2>
          
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Primary Colors */}
            <StaggerItem>
              <Card>
                <CardHeader>
                  <CardTitle>Primary Colors</CardTitle>
                  <CardDescription>Brand colors for primary actions and branding</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(DesignTokens.colors.primary).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-3">
                        <div 
                          className="w-12 h-12 rounded-lg border border-neutral-200"
                          style={{ backgroundColor: value }}
                        />
                        <div>
                          <div className="font-medium text-sm">{key}</div>
                          <div className="text-xs text-neutral-500">{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            {/* Secondary Colors */}
            <StaggerItem>
              <Card>
                <CardHeader>
                  <CardTitle>Secondary Colors</CardTitle>
                  <CardDescription>Gold accent colors for premium features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(DesignTokens.colors.secondary).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-3">
                        <div 
                          className="w-12 h-12 rounded-lg border border-neutral-200"
                          style={{ backgroundColor: value }}
                        />
                        <div>
                          <div className="font-medium text-sm">{key}</div>
                          <div className="text-xs text-neutral-500">{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            {/* Semantic Colors */}
            <StaggerItem>
              <Card>
                <CardHeader>
                  <CardTitle>Semantic Colors</CardTitle>
                  <CardDescription>Colors for success, warning, and error states</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(DesignTokens.colors.success).slice(0, 5).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-3">
                        <div 
                          className="w-12 h-12 rounded-lg border border-neutral-200"
                          style={{ backgroundColor: value }}
                        />
                        <div>
                          <div className="font-medium text-sm">Success {key}</div>
                          <div className="text-xs text-neutral-500">{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* Typography */}
        <section className="mb-16">
          <Typography.H2 className="mb-8">Typography</Typography.H2>
          
          <Card>
            <CardContent className="space-y-6">
              <div>
                <Typography.H1>Heading 1 - Main Page Titles</Typography.H1>
                <Typography.Small>Used for main page titles and hero sections</Typography.Small>
              </div>
              
              <div>
                <Typography.H2>Heading 2 - Section Titles</Typography.H2>
                <Typography.Small>Used for major section headings</Typography.Small>
              </div>
              
              <div>
                <Typography.H3>Heading 3 - Subsection Titles</Typography.H3>
                <Typography.Small>Used for subsection headings</Typography.Small>
              </div>
              
              <div>
                <Typography.H4>Heading 4 - Component Titles</Typography.H4>
                <Typography.Small>Used for component and card titles</Typography.Small>
              </div>
              
              <div>
                <Typography.Body>Body text - Main content and descriptions. This is the standard text size for most content on the platform.</Typography.Body>
                <Typography.Small>Used for main content and descriptions</Typography.Small>
              </div>
              
              <div>
                <Typography.Small>Small text - Secondary information and captions</Typography.Small>
                <Typography.Small>Used for secondary information and captions</Typography.Small>
              </div>
              
              <div>
                <Typography.Label>Label text - Form labels and field descriptions</Typography.Label>
                <Typography.Small>Used for form labels and field descriptions</Typography.Small>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Buttons */}
        <section className="mb-16">
          <Typography.H2 className="mb-8">Buttons</Typography.H2>
          
          <Card>
            <CardContent>
              <div className="space-y-8">
                {/* Button Variants */}
                <div>
                  <Typography.H4 className="mb-4">Button Variants</Typography.H4>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="primary" onClick={() => handleStatusUpdate('Primary button clicked')}>
                      Primary
                    </Button>
                    <Button variant="secondary" onClick={() => handleStatusUpdate('Secondary button clicked')}>
                      Secondary
                    </Button>
                    <Button variant="outline" onClick={() => handleStatusUpdate('Outline button clicked')}>
                      Outline
                    </Button>
                    <Button variant="ghost" onClick={() => handleStatusUpdate('Ghost button clicked')}>
                      Ghost
                    </Button>
                    <Button variant="success" onClick={() => handleStatusUpdate('Success button clicked')}>
                      Success
                    </Button>
                    <Button variant="warning" onClick={() => handleStatusUpdate('Warning button clicked')}>
                      Warning
                    </Button>
                    <Button variant="error" onClick={() => handleStatusUpdate('Error button clicked')}>
                      Error
                    </Button>
                  </div>
                </div>

                {/* Button Sizes */}
                <div>
                  <Typography.H4 className="mb-4">Button Sizes</Typography.H4>
                  <div className="flex flex-wrap items-center gap-4">
                    <Button size="xs">Extra Small</Button>
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                    <Button size="xl">Extra Large</Button>
                  </div>
                </div>

                {/* Button States */}
                <div>
                  <Typography.H4 className="mb-4">Button States</Typography.H4>
                  <div className="flex flex-wrap gap-4">
                    <Button>Normal</Button>
                    <Button loading>Loading</Button>
                    <Button disabled>Disabled</Button>
                  </div>
                </div>

                {/* Accessible Buttons */}
                <div>
                  <Typography.H4 className="mb-4">Accessible Buttons</Typography.H4>
                  <div className="flex flex-wrap gap-4">
                    <AccessibleButton 
                      ariaLabel="Save changes to your profile"
                      onClick={() => handleStatusUpdate('Accessible button clicked')}
                    >
                      Save Changes
                    </AccessibleButton>
                    <AccessibleButton 
                      ariaLabel="Delete this item permanently"
                      className="bg-error-500 text-white hover:bg-error-600"
                      onClick={() => handleStatusUpdate('Delete button clicked')}
                    >
                      Delete
                    </AccessibleButton>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Form Elements */}
        <section className="mb-16">
          <Typography.H2 className="mb-8">Form Elements</Typography.H2>
          
          <Card>
            <CardContent>
              <div className="space-y-8">
                {/* Input Variants */}
                <div>
                  <Typography.H4 className="mb-4">Input States</Typography.H4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AccessibleInput
                      label="Normal Input"
                      placeholder="Enter your text here"
                      helpText="This is a normal input field"
                    />
                    <AccessibleInput
                      label="Error Input"
                      placeholder="Enter your text here"
                      error="This field is required"
                      required
                    />
                    <AccessibleInput
                      label="Success Input"
                      placeholder="Enter your text here"
                      helpText="This field has been validated successfully"
                    />
                    <AccessibleInput
                      label="Disabled Input"
                      placeholder="This field is disabled"
                      disabled
                    />
                  </div>
                </div>

                {/* Input Types */}
                <div>
                  <Typography.H4 className="mb-4">Input Types</Typography.H4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AccessibleInput
                      label="Text Input"
                      type="text"
                      placeholder="Enter text"
                    />
                    <AccessibleInput
                      label="Email Input"
                      type="email"
                      placeholder="Enter email"
                    />
                    <AccessibleInput
                      label="Password Input"
                      type="password"
                      placeholder="Enter password"
                    />
                    <AccessibleInput
                      label="Number Input"
                      type="number"
                      placeholder="Enter number"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Cards */}
        <section className="mb-16">
          <Typography.H2 className="mb-8">Cards</Typography.H2>
          
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StaggerItem>
              <Card hover>
                <CardHeader>
                  <CardTitle>Basic Card</CardTitle>
                  <CardDescription>A simple card with header and content</CardDescription>
                </CardHeader>
                <CardContent>
                  <Typography.Body>
                    This is a basic card component with hover effects and smooth animations.
                  </Typography.Body>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card>
                <CardHeader>
                  <CardTitle>Feature Card</CardTitle>
                  <CardDescription>Highlighting key features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success-500 rounded-full" />
                      <Typography.Small>Feature 1</Typography.Small>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success-500 rounded-full" />
                      <Typography.Small>Feature 2</Typography.Small>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success-500 rounded-full" />
                      <Typography.Small>Feature 3</Typography.Small>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card>
                <CardHeader>
                  <CardTitle>Statistics Card</CardTitle>
                  <CardDescription>Displaying key metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <Typography.H3 className="text-success-500">₹1,25,000</Typography.H3>
                    <Typography.Small>Total Refund</Typography.Small>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* Loading States */}
        <section className="mb-16">
          <Typography.H2 className="mb-8">Loading States</Typography.H2>
          
          <Card>
            <CardContent>
              <div className="space-y-8">
                {/* Loading Spinners */}
                <div>
                  <Typography.H4 className="mb-4">Loading Spinners</Typography.H4>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <LoadingSpinner size="sm" />
                      <Typography.Small className="mt-2">Small</Typography.Small>
                    </div>
                    <div className="text-center">
                      <LoadingSpinner size="md" />
                      <Typography.Small className="mt-2">Medium</Typography.Small>
                    </div>
                    <div className="text-center">
                      <LoadingSpinner size="lg" />
                      <Typography.Small className="mt-2">Large</Typography.Small>
                    </div>
                  </div>
                </div>

                {/* Skeleton Loading */}
                <div>
                  <Typography.H4 className="mb-4">Skeleton Loading</Typography.H4>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>

                {/* Card Skeleton */}
                <div>
                  <Typography.H4 className="mb-4">Card Skeleton</Typography.H4>
                  <Card>
                    <CardContent>
                      <div className="space-y-4">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex space-x-2">
                          <Skeleton className="h-8 w-20" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Interactive Components */}
        <section className="mb-16">
          <Typography.H2 className="mb-8">Interactive Components</Typography.H2>
          
          <Card>
            <CardContent>
              <div className="space-y-8">
                {/* Modal */}
                <div>
                  <Typography.H4 className="mb-4">Modal</Typography.H4>
                  <Button onClick={() => setShowModal(true)}>
                    Open Modal
                  </Button>
                  
                  <AccessibleModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title="Example Modal"
                  >
                    <Typography.Body className="mb-6">
                      This is an accessible modal with proper focus management and keyboard navigation.
                    </Typography.Body>
                    <div className="flex justify-end space-x-3">
                      <Button variant="outline" onClick={() => setShowModal(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => {
                        setShowModal(false);
                        handleStatusUpdate('Modal action completed');
                      }}>
                        Confirm
                      </Button>
                    </div>
                  </AccessibleModal>
                </div>

                {/* Tooltip */}
                <div>
                  <Typography.H4 className="mb-4">Tooltip</Typography.H4>
                  <AccessibleTooltip content="This is a helpful tooltip with accessibility features">
                    <Button variant="outline">
                      Hover for Tooltip
                    </Button>
                  </AccessibleTooltip>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Accessibility Features */}
        <section className="mb-16">
          <Typography.H2 className="mb-8">Accessibility Features</Typography.H2>
          
          <Card>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Typography.H4 className="mb-4">Screen Reader Support</Typography.H4>
                  <Typography.Body className="mb-4">
                    All components include proper ARIA labels, roles, and descriptions for screen readers.
                  </Typography.Body>
                  <div className="bg-neutral-100 p-4 rounded-lg">
                    <Typography.Small>
                      <strong>Features:</strong> ARIA labels, roles, descriptions, live regions, focus management
                    </Typography.Small>
                  </div>
                </div>

                <div>
                  <Typography.H4 className="mb-4">Keyboard Navigation</Typography.H4>
                  <Typography.Body className="mb-4">
                    All interactive elements are accessible via keyboard navigation with proper focus indicators.
                  </Typography.Body>
                  <div className="bg-neutral-100 p-4 rounded-lg">
                    <Typography.Small>
                      <strong>Features:</strong> Tab navigation, focus traps, keyboard shortcuts, focus indicators
                    </Typography.Small>
                  </div>
                </div>

                <div>
                  <Typography.H4 className="mb-4">Color Contrast</Typography.H4>
                  <Typography.Body className="mb-4">
                    All color combinations meet WCAG AA contrast standards for readability.
                  </Typography.Body>
                  <div className="bg-neutral-100 p-4 rounded-lg">
                    <Typography.Small>
                      <strong>Standards:</strong> WCAG AA compliance, 4.5:1 contrast ratio minimum
                    </Typography.Small>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Usage Guidelines */}
        <section className="mb-16">
          <Typography.H2 className="mb-8">Usage Guidelines</Typography.H2>
          
          <Card>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Typography.H4 className="mb-4">Consistency</Typography.H4>
                  <Typography.Body>
                    Use the same components and styles throughout the application to maintain visual consistency and user familiarity.
                  </Typography.Body>
                </div>

                <div>
                  <Typography.H4 className="mb-4">Accessibility First</Typography.H4>
                  <Typography.Body>
                    Always consider accessibility when implementing new features. Use the provided accessible components and follow WCAG guidelines.
                  </Typography.Body>
                </div>

                <div>
                  <Typography.H4 className="mb-4">Performance</Typography.H4>
                  <Typography.Body>
                    Use animations sparingly and ensure they enhance rather than hinder the user experience. Consider reduced motion preferences.
                  </Typography.Body>
                </div>

                <div>
                  <Typography.H4 className="mb-4">Responsive Design</Typography.H4>
                  <Typography.Body>
                    All components are designed to work across different screen sizes. Test on various devices to ensure proper functionality.
                  </Typography.Body>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageTransition>
  );
};

export default StyleGuide;
