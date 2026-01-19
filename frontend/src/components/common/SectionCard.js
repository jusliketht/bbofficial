import React from 'react';
import { tokens } from '../../styles/tokens';

/**
 * SectionCard - Design System Pattern
 * "One Thought Per Screen" container.
 * Migrated from S29 to unified design tokens.
 */
const SectionCard = ({ title, description, children, footer }) => {
    return (
        <div
            className="section-card"
            style={{
                backgroundColor: tokens.colors.neutral.white,
                borderRadius: tokens.borderRadius.lg,
                border: `${tokens.borderWidth.thin} solid ${tokens.colors.neutral[200]}`,
                boxShadow: tokens.shadows.md,
                padding: tokens.spacing.xl,
                maxWidth: '600px',
                margin: `${tokens.spacing.lg} auto`,
                animation: 'slideUp 250ms ease-out',
            }}
        >
            {title && (
                <h2 style={{
                    fontSize: tokens.typography.fontSize['2xl'],
                    marginBottom: description ? tokens.spacing.sm : tokens.spacing.lg,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                }}>
                    {title}
                </h2>
            )}
            {description && (
                <p style={{
                    color: tokens.colors.neutral[500],
                    fontSize: tokens.typography.fontSize.base,
                    marginBottom: tokens.spacing.lg,
                    lineHeight: tokens.typography.lineHeight.normal,
                }}>
                    {description}
                </p>
            )}
            <div className="card-content">
                {children}
            </div>
            {footer && (
                <div style={{
                    marginTop: tokens.spacing.xl,
                    paddingTop: tokens.spacing.lg,
                    borderTop: `${tokens.borderWidth.thin} solid ${tokens.colors.neutral[200]}`,
                }}>
                    {footer}
                </div>
            )}
        </div>
    );
};

export default SectionCard;
