import React from 'react';
import { FaCrown, FaShieldAlt } from 'react-icons/fa';

const RoleBadge = ({ user }) => {
    // Safety check
    if (!user) return null;

    const MAIN_ADMIN_EMAIL = process.env.REACT_APP_MAIN_ADMIN_EMAIL;
    const isMainAdmin = user.email === MAIN_ADMIN_EMAIL;
    const isAdmin = user.role === 'admin';

    const styles = {
        badge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            marginLeft: '8px',
            verticalAlign: 'middle',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
        },
        superAdmin: {
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', // Gold Gradient
            color: '#000',
            border: '1px solid #FFD700',
            boxShadow: '0 0 8px rgba(255, 215, 0, 0.6)'
        },
        admin: {
            background: 'rgba(0, 212, 255, 0.15)', // Cyan/Blue transparent
            color: '#00d4ff',
            border: '1px solid rgba(0, 212, 255, 0.4)',
        }
    };

    if (isMainAdmin) {
        return (
            <span style={{ ...styles.badge, ...styles.superAdmin }} title="Platform Owner">
                <FaCrown size={10} /> SUPER ADMIN
            </span>
        );
    }

    if (isAdmin) {
        return (
            <span style={{ ...styles.badge, ...styles.admin }} title="Platform Administrator">
                <FaShieldAlt size={10} /> ADMIN
            </span>
        );
    }

    return null;
};

export default RoleBadge;
