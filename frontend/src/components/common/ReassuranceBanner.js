import React from 'react';
import { tokens } from '../../styles/tokens';

/**
 * ReassuranceBanner - Design System Component
 * Reduces anxiety during sensitive steps (PAN, Submission).
 * Tone: Calm, authoritative, CA-like.
 * Migrated from S29 to unified design tokens.
 */
const ReassuranceBanner = ({ message, type = 'info' }) => {
    const styles = {
        info: {
            bg: tokens.colors.info[50],
            text: tokens.colors.info[700],
            border: tokens.colors.info[600],
            icon: '🛡️',
        },
        success: {
            bg: tokens.colors.success[50],
            text: tokens.colors.success[700],
            border: tokens.colors.success[600],
            icon: '✅',
        },
        warning: {
            bg: tokens.colors.warning[50],
            text: tokens.colors.warning[700],
            border: tokens.colors.warning[600],
            icon: '⚠️',
        },
        error: {
            bg: tokens.colors.error[50],
            text: tokens.colors.error[700],
            border: tokens.colors.error[600],
            icon: '❌',
        },
    };

    const current = styles[type] || styles.info;

    return (
        <div
            className="reassurance-banner"
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: `${tokens.spacing['sm-plus']} ${tokens.spacing.md}`,
                backgroundColor: current.bg,
                color: current.text,
                borderRadius: tokens.borderRadius.md,
                borderLeft: `${tokens.borderWidth.thick} solid ${current.border}`,
                fontSize: tokens.typography.fontSize.sm,
                lineHeight: tokens.typography.lineHeight.normal,
                margin: `${tokens.spacing.md} 0`,
                transition: tokens.transitions.fast,
            }}
        >
            <span style={{
                marginRight: tokens.spacing['sm-plus'],
                fontSize: tokens.typography.fontSize.lg
            }}>
                {current.icon}
            </span>
            <span>{message}</span>
        </div>
    );
};

export default ReassuranceBanner;
