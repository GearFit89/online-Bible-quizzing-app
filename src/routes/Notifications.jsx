import React from "react";
import { X, Check, BellOff, Info } from 'lucide-react';
import { useConnection, wsClient } from "../connection.jsx";
import { METHODS } from "./QuizStates.jsx";
import './Noti.css'
import { renderToStaticMarkup } from 'react-dom/server';

import { useDataProvider } from "./Router.jsx";
import './Noti.css';
const NOTIFICATION_HANDLERS = {
    friend: {
        acceptMethod: async (meta) => {
            const { success } = await wsClient.emit(METHODS.ACCEPT_FRIEND_REQ, {}, meta.username);
            if (success) setFriends(fs => [...fs, meta.username]);
        }
    },
    game: {
        acceptMethod: async (meta) => {
            navigate(`/play?config=${encodeURIComponent(JSON.stringify({ func: METHODS.ANSWER_INVITE, args: [false, meta.roomId] }))}`);
        }
    }
};

export const getIconDataUri = (IconComponent, color = '#000000') => {
    // 1. Render to static SVG string
    const svgString = renderToStaticMarkup(
        <IconComponent color={color} size={32} strokeWidth={2} />
    );

    // 2. Modern encoding: Use encodeURIComponent then convert to Base64
    // We use btoa safely by ensuring the string is treated as UTF-8
    const base64Data = btoa(
        encodeURIComponent(svgString).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode(parseInt(p1, 16));
        })
    );

    return `data:image/svg+xml;base64,${base64Data}`;
};
function Notifications() {
    const { notifications, removeNotification } = useDataProvider(); //

    // Filter and validate notifications
    const activeNotifs = (notifications || []).filter(n => n);

    // Empty Scene Widget
    if (activeNotifs.length === 0) {
        return (
            <div className="empty-noti-scene">
                <div className="empty-icon">
                    <BellOff size={64} strokeWidth={1.5} />
                </div>
                <h3>All Caught Up!</h3>
                <p>When you get friend requests or challenges, they'll show up here.</p>
            </div>
        );
    }

    return (
        <div className="notifications-container">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#1e293b' }}>
                Activity Feed ({activeNotifs.length})
            </h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {activeNotifs.map((notif) => (
                    <li key={notif.name} className="notification-card">
                        <div className="notification-icon-wrapper">
                            {/* Uses the injected data URI or a fallback icon */}
                            {notif.data?.icon ? (
                                <img src={notif.data.icon} alt="icon" style={{ width: 24, height: 24 }} />
                            ) : (
                                <Info size={24} color="#3b82f6" />
                            )}
                        </div>

                        <div className="notification-content">
                            <h4 className="notification-title">{notif.title || 'Notification'}</h4>
                            <p className="notification-body">{notif.data?.body}</p>
                        </div>

                        <div className="notification-actions">
                            <button
                                className="btn-decline"
                                onClick={() => {
                                    removeNotification(notif.name);
                                    wsClient.emit(notif.declineMethod, {}, ...notif.declineArgs); //
                                }}
                            >
                                <X size={16} style={{ marginRight: 4 }} />
                                Decline
                            </button>
                            <button
                                className="btn-accept"
                                onClick={() => {
                                    const handler = NOTIFICATION_HANDLERS[notif.type];
                                    if (handler) handler.acceptMethod(notif.meta)
                                         else console.warn('No handler for notification type:', notif.type);
                                    removeNotification(notif.name);
                                }}
                            >
                                <Check size={16} style={{ marginRight: 4 }} />
                                Accept
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Notifications;