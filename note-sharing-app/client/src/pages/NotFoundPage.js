// client/src/pages/NotFoundPage.js
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

const NotFoundPage = () => {
    return (
        <div className="content-page not-found-page-wrapper">
            <Helmet>
                <title>404 - Page Not Found | PeerNotez</title>
            </Helmet>
            
            <div className="not-found-container">
                <FaExclamationTriangle className="error-icon" size={60} style={{color: 'var(--warning-color)'}} />
                <h1 className="error-code">404</h1>
                <h2 className="error-title" style={{borderBottom: 'none', marginBottom: '1.5rem'}}>Oops! Page Not Found</h2>
                <p className="error-message" style={{fontSize: '1.2rem', color: 'var(--subtle-text-color)', maxWidth: '600px', margin: '0 auto 2rem'}}>
                    We couldn't find the page you were looking for. It might have been moved, deleted, or you might have mistyped the address.
                </p>
                <Link to="/" className="main-cta-button" style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}>
                    <FaHome /> Go to Homepage
                </Link>
            </div>
            
            <style jsx>{`
                .not-found-page-wrapper {
                    text-align: center;
                    padding-top: 5rem;
                    min-height: 70vh;
                }
                .error-icon {
                    margin-bottom: 1rem;
                }
                .error-code {
                    font-size: 6rem;
                    font-weight: 900;
                    color: var(--error-color);
                    border: none;
                    padding: 0;
                    margin: 0;
                    line-height: 1;
                }
            `}</style>
        </div>
    );
};

export default NotFoundPage;