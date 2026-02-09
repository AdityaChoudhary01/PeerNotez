import { useEffect } from 'react';
import { ref, onValue, onDisconnect, set, serverTimestamp } from 'firebase/database';
import { db } from '../services/firebase';
import useAuth from './useAuth';

const usePresence = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (!user?._id) return;

        // References in Firebase Realtime DB
        const connectedRef = ref(db, '.info/connected');
        const userStatusRef = ref(db, `/status/${user._id}`);

        const unsubscribe = onValue(connectedRef, (snapshot) => {
            if (snapshot.val() === true) {
                // We're connected (or reconnected)!
                
                // 1. Establish "On Disconnect" hook FIRST
                // If the internet cuts out, Firebase server will run this automatically
                onDisconnect(userStatusRef).set({
                    state: 'offline',
                    last_changed: serverTimestamp(),
                });

                // 2. Set status to Online
                set(userStatusRef, {
                    state: 'online',
                    last_changed: serverTimestamp(),
                });
            }
        });

        return () => {
            // Clean up listener when component unmounts (e.g., logout)
            unsubscribe();
        };
    }, [user]);
};

export default usePresence;
