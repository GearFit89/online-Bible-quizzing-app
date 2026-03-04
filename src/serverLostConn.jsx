
import React from 'react'
import { RefreshCw } from 'lucide-react';
export function ServerDisconnectedPage() {
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#fff5f5' // Very light red tint
    };

    const iconStyle = {
        fontSize: '80px',
        marginBottom: '20px',
        filter: 'drop-shadow(0 0 10px rgba(231, 76, 60, 0.2))'
    };

    return (
        <div style={containerStyle}>
            <div style={iconStyle}>📡</div>
            <h1 style={{ fontSize: '3.5rem', color: '#c0392b', margin: '0' }}>503</h1>
            <h2 style={{ color: '#e74c3c', marginTop: '10px' }}>Connection Interrupted</h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0' }}>
                <div className="animate-spin" style={{ color: '#e74c3c' }}>
                    <RefreshCw size={24} />
                </div>
                <p style={{ color: '#7f8c8d', fontSize: '1.1rem', margin: 0 }}>
                    Reconnecting to the server... will be ready shortly.
                </p>
            </div>

            <blockquote style={{
                fontStyle: 'italic',
                color: '#95a5a6',
                borderLeft: '4px solid #e74c3c',
                paddingLeft: '15px',
                maxWidth: '450px',
                margin: '30px 0'
            }}>
                "Wait for the Lord; be strong and take heart and wait for the Lord." — Psalm 27:14
            </blockquote>

            <p style={{ fontSize: '0.85rem', color: '#bdc3c7' }}>
                The application will automatically resume once the path is restored.
            </p>
        </div>
    );
}