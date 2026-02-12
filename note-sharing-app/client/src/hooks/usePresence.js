// src/hooks/usePresence.js
import { useEffect } from 'react';
import { ref, onValue, onDisconnect, set, serverTimestamp } from 'firebase/database';
// 1. Import getAuth to check login status
import { getAuth, onAuthStateChanged } from 'firebase/auth'; 
import { db } from '../services/firebase';
import useAuth from './useAuth';

const usePresence = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (!user?._id) return;

        const auth = getAuth();
        const connectedRef = ref(db, '.info/connected');
        const userStatusRef = ref(db, `/status/${user._id}`);

        // We need two things to be true:
        // A. We are connected to the internet (.info/connected)
        // B. We are logged into Firebase (auth.currentUser)

        let isConnected = false;

        // 1. Listen for Connection Status
        const unsubscribeConnection = onValue(connectedRef, (snapshot) => {
            isConnected = snapshot.val() === true;
            if (isConnected && auth.currentUser) {
                setOnlineStatus();
            }
        });

        // 2. Listen for Auth Status (Fixes the race condition)
        const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser && isConnected) {
                setOnlineStatus();
            }
        });

        // Helper function to write to DB
        const setOnlineStatus = () => {
            // Safety check: Ensure we don't write if logged out
            if (!auth.currentUser) return;

            console.log("✅ Setting Presence: Online");

            // A. Set "Offline" on disconnect (server-side trigger)
            onDisconnect(userStatusRef).set({
                state: 'offline',
                last_changed: serverTimestamp(),
            }).then(() => {
                // B. Set "Online" now
                set(userStatusRef, {
                    state: 'online',
                    last_changed: serverTimestamp(),
                });
            }).catch((err) => {
                console.error("Presence Error:", err);
            });
        };

        return () => {
            unsubscribeConnection();
            unsubscribeAuth();
            // Optional: Set offline when component unmounts (e.g. logout)
            if (auth.currentUser) {
                 set(userStatusRef, {
                    state: 'offline',
                    last_changed: serverTimestamp(),
                }).catch(() => {}); // Ignore errors on unmount
            }
        };
    }, [user]);
};

export default usePresence;
