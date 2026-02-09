import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ref, onValue, onDisconnect, set, serverTimestamp, goOffline, goOnline } from 'firebase/database';
import { db } from '../../services/firebase';
import useAuth from '../../hooks/useAuth';

const ChatLayout = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (!user?._id) return;

        // 1. FORCE CONNECTION (Wake up Firebase connection)
        // This consumes 1 Concurrent Connection slot
        goOnline(db);

        const connectedRef = ref(db, '.info/connected');
        const userStatusRef = ref(db, `/status/${user._id}`);

        const unsubscribe = onValue(connectedRef, (snapshot) => {
            if (snapshot.val() === true) {
                // We are connected!
                
                // A. Setup "Safety Net": If tab closes or internet dies
                onDisconnect(userStatusRef).set({
                    state: 'offline',
                    last_changed: serverTimestamp(),
                });

                // B. Set status to Online
                set(userStatusRef, {
                    state: 'online',
                    last_changed: serverTimestamp(),
                });
            }
        });

        // CLEANUP: Runs when user leaves this layout (e.g. clicks Home/Profile)
        return () => {
            // 1. Manually write "Offline" + Timestamp immediately
            // This ensures "Last Seen" is accurate to the second they left
            set(userStatusRef, {
                state: 'offline',
                last_changed: serverTimestamp(),
            });

            // 2. Stop listening to connection changes
            unsubscribe();

            // 3. FORCE DISCONNECT (Free up the connection slot)
            goOffline(db); 
        };
    }, [user]);

    // Renders the child route (ChatList or ChatPage)
    return <Outlet />;
};

export default ChatLayout;
