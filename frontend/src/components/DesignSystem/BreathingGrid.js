// =====================================================
// BREATHING GRID COMPONENT
// Implements the Breathing Grid Layout System from UI.md
// Three density states: Glance → Summary → Detailed
// Fully compliant with UI.md specifications including animations and keyboard navigation
// =====================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BREATHING_GRID } from '../../constants/designTokens';
import { variants, transitions } from '../../lib/motion';

const BreathingGrid = ({
  children,
  expandedSectionId = null,
  onSectionExpand = () => {},
  className = '',
  'aria-label': ariaLabel = 'ITR Filing Sections',
}) => {
  const [gridState, setGridState] = useState('default'); // 'default' | 'expanded'
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const gridRef = useRef(null);
  const sectionRefs = useRef([]);

  // Get array of section IDs
  const sectionIds = React.Children.toArray(children)
    .map((child) => child?.props?.id || child?.props?.sectionId)
    .filter(Boolean);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1280);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Update grid state when expanded section changes
  useEffect(() => {
    if (expandedSectionId) {
      setGridState('expanded');
    } else {
      setGridState('default');
    }
  }, [expandedSectionId]);

  // Enhanced keyboard navigation per UI.md specs
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle if focus is within grid or on a section card
      const isWithinGrid = gridRef.current?.contains(e.target);
      const isSectionCard = e.target.closest('.section-card');

      if (!isWithinGrid && !isSectionCard) return;

      // Escape: Collapse expanded section
      if (e.key === 'Escape' && expandedSectionId) {
        e.preventDefault();
        e.stopPropagation();
        onSectionExpand(null);
        // Return focus to the collapsed section
        const expandedIndex = sectionIds.indexOf(expandedSectionId);
        if (expandedIndex !== -1 && sectionRefs.current[expandedIndex]) {
          setTimeout(() => {
            sectionRefs.current[expandedIndex]?.focus();
          }, 100);
        }
        return;
      }

      // Home: Focus first section
      if (e.key === 'Home' && !isMobile && !isTablet) {
        e.preventDefault();
        setFocusedIndex(0);
        if (sectionRefs.current[0]) {
          sectionRefs.current[0].focus();
        }
        return;
      }

      // End: Focus last section
      if (e.key === 'End' && !isMobile && !isTablet) {
        e.preventDefault();
        const lastIndex = sectionIds.length - 1;
        setFocusedIndex(lastIndex);
        if (sectionRefs.current[lastIndex]) {
          sectionRefs.current[lastIndex].focus();
        }
        return;
      }

      // Arrow keys: Navigate between sections (desktop only)
      if (!isMobile && !isTablet && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();

        const currentIndex = expandedSectionId
          ? sectionIds.indexOf(expandedSectionId)
          : focusedIndex !== null
          ? focusedIndex
          : 0;

        let newIndex = currentIndex;

        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          newIndex = currentIndex > 0 ? currentIndex - 1 : sectionIds.length - 1;
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          newIndex = currentIndex < sectionIds.length - 1 ? currentIndex + 1 : 0;
        }

        const newSectionId = sectionIds[newIndex];
        setFocusedIndex(newIndex);

        // Focus the new section
        if (sectionRefs.current[newIndex]) {
          sectionRefs.current[newIndex].focus();
        }

        return;
      }

      // Enter/Space: Expand/collapse focused section
      if ((e.key === 'Enter' || e.key === ' ') && focusedIndex !== null) {
        const sectionId = sectionIds[focusedIndex];
        if (sectionId) {
          e.preventDefault();
          e.stopPropagation();
          onSectionExpand(sectionId === expandedSectionId ? null : sectionId);
        }
      }
    };

    const gridElement = gridRef.current;
    if (gridElement) {
      gridElement.addEventListener('keydown', handleKeyDown);
      return () => {
        gridElement.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [expandedSectionId, focusedIndex, isMobile, isTablet, sectionIds, onSectionExpand]);

  // Handle click outside to collapse (desktop only)
  const handleGridClick = useCallback((e) => {
    if (e.target === e.currentTarget && expandedSectionId) {
      onSectionExpand(null);
    }
  }, [expandedSectionId, onSectionExpand]);

  // Mobile/Tablet: Render glance bar + expanded content
  if (isMobile || isTablet) {
    return (
      <div
        className={`breathing-grid-mobile ${className}`}
        ref={gridRef}
        role="region"
        aria-label={ariaLabel}
      >
        {/* Glance Bar */}
        <div className="glance-bar-container">
          <div
            className="glance-bar"
            role="tablist"
            aria-label="Section navigation"
            style={{
              display: 'flex',
              gap: '8px',
              padding: '12px 16px',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {React.Children.map(children, (child, index) => {
              if (!child) return null;
              const sectionId = child.props?.id || child.props?.sectionId;
              const isExpanded = sectionId === expandedSectionId;
              const title = child.props?.title || child.props?.name || `Section ${index + 1}`;

              return (
                <div
                  key={sectionId || child.key || index}
                  role="tab"
                  aria-selected={isExpanded}
                  aria-controls={`section-${sectionId}`}
                  tabIndex={isExpanded ? 0 : -1}
                  onClick={() => onSectionExpand(isExpanded ? null : sectionId)}
                  style={{
                    minWidth: '56px',
                    width: '56px',
                    height: '56px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    borderBottom: isExpanded ? '3px solid #FF6B00' : '3px solid transparent',
                    scrollSnapAlign: 'start',
                    transition: 'all 200ms ease-out',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFF8F2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {React.cloneElement(child, {
                    density: 'glance',
                    isExpanded: false,
                    onExpand: () => onSectionExpand(isExpanded ? null : sectionId),
                    'aria-label': title,
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Expanded Content */}
        {expandedSectionId && (
          <div
            className="expanded-content-mobile"
            role="tabpanel"
            id={`section-${expandedSectionId}`}
            aria-labelledby={`tab-${expandedSectionId}`}
            style={{
              width: '100%',
              padding: '16px',
            }}
          >
            {React.Children.map(children, (child) => {
              if (!child) return null;
              const sectionId = child.props?.id || child.props?.sectionId;
              if (sectionId === expandedSectionId) {
                return React.cloneElement(child, {
                  density: 'detailed',
                  isExpanded: true,
                  onExpand: () => onSectionExpand(null),
                  key: sectionId || child.key,
                });
              }
              return null;
            })}
          </div>
        )}
      </div>
    );
  }

  // Desktop: Render CSS Grid layout with animations
  return (
    <motion.div
      ref={gridRef}
      className={`breathing-grid breathing-grid-${gridState} ${className}`}
      data-state={gridState}
      onClick={handleGridClick}
      role="region"
      aria-label={ariaLabel}
      initial={false}
      animate={{
        gridTemplateColumns: gridState === 'default'
          ? 'repeat(auto-fit, minmax(180px, 220px))'
          : '72px 72px minmax(480px, 720px) 72px 72px',
      }}
      transition={{
        duration: 0.4,
        ease: [0, 0, 0.2, 1], // cubic-bezier(0, 0, 0.2, 1)
      }}
      style={{
        display: 'grid',
        gap: BREATHING_GRID.gaps.grid,
        padding: BREATHING_GRID.padding.desktop,
        justifyContent: 'center',
        maxWidth: '1440px',
        margin: '0 auto',
      }}
    >
      {React.Children.map(children, (child, index) => {
        if (!child) return null;
        const sectionId = child.props?.id || child.props?.sectionId;
        const isExpanded = sectionId === expandedSectionId;
        const title = child.props?.title || child.props?.name || `Section ${index + 1}`;

        // Determine density state
        let density = 'summary';
        if (isExpanded) {
          density = 'detailed';
        } else if (gridState === 'expanded') {
          // Check if this card is adjacent to expanded card
          const expandedIndex = React.Children.toArray(children).findIndex(
            (c) => (c?.props?.id || c?.props?.sectionId) === expandedSectionId,
          );
          const distance = Math.abs(index - expandedIndex);
          if (distance <= 2 && distance > 0) {
            density = 'glance';
          }
        }

        return (
          <motion.div
            key={sectionId || child.key || index}
            initial={false}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.2,
              delay: index * 0.03, // Stagger animation
            }}
            ref={(el) => {
              if (el) {
                sectionRefs.current[index] = el;
              }
            }}
          >
            {React.cloneElement(child, {
              density,
              isExpanded,
              onExpand: () => {
                setFocusedIndex(index);
                onSectionExpand(isExpanded ? null : sectionId);
              },
              'aria-label': title,
              tabIndex: isExpanded ? 0 : density === 'summary' ? 0 : -1,
              role: 'article',
              'aria-expanded': isExpanded,
              className: `${child.props?.className || ''} section-card`,
            })}
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default BreathingGrid;

