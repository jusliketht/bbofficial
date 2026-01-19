import React from 'react';
import { tokens } from '../../styles/tokens';

/**
 * InlineHint - Design System Component
 * Law-based or CA-like explanations without clutter.
 * Migrated from S29 to unified design tokens.
 */
const InlineHint = ({ children, icon = '💡' }) => {
    return (
        <div
            className="inline-hint"
            style={{
                display: 'flex',
                gap: tokens.spacing.sm,
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing['xs-plus'],
                fontStyle: 'italic',
                lineHeight: tokens.typography.lineHeight.normal,
            }}
        >
            <span>{icon}</span>
            <span>{children}</span>
        </div>
    );
};

export default InlineHint;
