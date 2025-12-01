// =====================================================
// MOTION & ANIMATION UTILITIES
// Framer Motion variants and transition presets
// =====================================================

/**
 * Transition presets matching UI.md Motion System
 */
export const transitions = {
  instant: { duration: 0 },
  fast: { duration: 0.1 },
  normal: { duration: 0.2 },
  relaxed: { duration: 0.3 },
  slow: { duration: 0.5 },
  slower: { duration: 0.7 },
  breathing: { duration: 0.4, ease: [0, 0, 0.2, 1] },
};

/**
 * Easing functions matching UI.md Motion System
 */
export const easings = {
  'ease-out': [0, 0, 0.2, 1],
  'ease-in': [0.4, 0, 1, 1],
  'ease-both': [0.4, 0, 0.2, 1],
  spring: [0.34, 1.56, 0.64, 1],
};

/**
 * Framer Motion variants for common animations
 */
export const variants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: transitions.normal,
    },
  },

  slideUp: {
    hidden: {
      opacity: 0,
      y: 8,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: transitions.normal,
    },
  },

  slideDown: {
    hidden: {
      opacity: 0,
      y: -8,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: transitions.normal,
    },
  },

  scaleIn: {
    hidden: {
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: transitions.normal,
    },
  },

  staggerChildren: {
    visible: {
      transition: {
        staggerChildren: 0.03,
      },
    },
  },

  // Breathing Grid specific variants (per UI.md specs)
  cardExpand: {
    collapsed: {
      width: 'var(--card-glance-width, 72px)',
      transition: transitions.breathing,
    },
    summary: {
      width: 'var(--card-summary-width, 200px)',
      transition: transitions.breathing,
    },
    expanded: {
      width: 'var(--card-expanded-width, 720px)',
      transition: transitions.breathing,
    },
  },

  contentFade: {
    hidden: {
      opacity: 0,
      y: 8,
    },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.03, // Stagger delay per UI.md (30ms)
        duration: 0.2, // 200ms per UI.md
        ease: easings['ease-out'],
      },
    }),
  },

  // Grid layout transition
  gridLayout: {
    default: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 220px))',
      transition: {
        duration: 0.4, // 400ms per UI.md
        ease: easings['ease-out'],
      },
    },
    expanded: {
      gridTemplateColumns: '72px 72px minmax(480px, 720px) 72px 72px',
      transition: {
        duration: 0.4, // 400ms per UI.md
        ease: easings['ease-out'],
      },
    },
  },

  // Success feedback
  successCheck: {
    hidden: {
      scale: 0,
    },
    visible: {
      scale: [0, 1.1, 1],
      transition: {
        duration: 0.3,
        ease: easings.spring,
      },
    },
  },

  // Toast animations
  toast: {
    hidden: {
      opacity: 0,
      y: 100,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: transitions.normal,
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: transitions.fast,
    },
  },

  // Modal animations
  modal: {
    hidden: {
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: transitions.relaxed,
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: transitions.fast,
    },
  },

  // Bottom sheet animations
  bottomSheet: {
    hidden: {
      y: '100%',
    },
    visible: {
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      y: '100%',
      transition: transitions.normal,
    },
  },
};

/**
 * Get animation variant with custom delay
 * @param {string} variantName - Name of the variant
 * @param {number} delay - Delay in seconds
 * @returns {object} Variant with custom delay
 */
export function getVariantWithDelay(variantName, delay = 0) {
  const variant = variants[variantName];
  if (!variant) {
    return variant;
  }

  if (typeof variant.visible === 'function') {
    return {
      ...variant,
      visible: (i) => ({
        ...variant.visible(i),
        transition: {
          ...variant.visible(i).transition,
          delay: delay + (i || 0) * 0.03,
        },
      }),
    };
  }

  return {
    ...variant,
    visible: {
      ...variant.visible,
      transition: {
        ...variant.visible.transition,
        delay,
      },
    },
  };
}

/**
 * Respect reduced motion preference
 * @param {object} variant - Animation variant
 * @returns {object} Variant with reduced motion support
 */
export function withReducedMotion(variant) {
  if (typeof window === 'undefined') {
    return variant;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }

  return variant;
}

