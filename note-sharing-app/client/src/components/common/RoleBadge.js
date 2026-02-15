import React from 'react';
import { FaCrown, FaShieldAlt } from 'react-icons/fa';

const RoleBadge = ({ user }) => {
    if (!user) return null;

    const MAIN_ADMIN_EMAIL = import.meta.env.VITE_MAIN_ADMIN_EMAIL;
    const isMainAdmin = user.email === MAIN_ADMIN_EMAIL;
    const isAdmin = user.role === 'admin';

    // Base Glassmorphism Styles
    const baseStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 10px',
        borderRadius: '999px', // Pill shape is more modern
        fontSize: '10px',
        fontWeight: '700',
        marginLeft: '8px',
        verticalAlign: 'middle',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        backdropFilter: 'blur(4px)',
        transition: 'all 0.3s ease',
        cursor: 'default',
        border: '1px solid'
    };

    const variants = {
        main: {
            // "Admin" (The Boss) - Dark Gold Glass
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(184, 134, 11, 0.1) 100%)',
            color: '#FFD700',
            borderColor: 'rgba(255, 215, 0, 0.3)',
            boxShadow: '0 2px 10px -3px rgba(255, 215, 0, 0.2)',
        },
        mod: {
            // "Mod" (The Staff) - Frosty Cyan
            background: 'rgba(0, 212, 255, 0.08)',
            color: '#70eaff',
            borderColor: 'rgba(0, 212, 255, 0.2)',
        }
    };

    if (isMainAdmin) {
        return (
            <span style={{ ...baseStyle, ...variants.main }} title="Founder & Owner">
                <FaCrown style={{ filter: 'drop-shadow(0 0 2px gold)' }} size={11} /> 
                Admin
            </span>
        );
    }

    if (isAdmin) {
        return (
            <span style={{ ...baseStyle, ...variants.mod }} title="Community Moderator">
                <FaShieldAlt size={10} /> 
                Mod
            </span>
        );
    }

    return null;
};

export default RoleBadge;
