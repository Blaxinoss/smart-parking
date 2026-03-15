import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

const AuthContext = createContext<{
    firebaseUser: User | null,
    isFirebaseLoading: boolean,
}>({
    firebaseUser: null,
    isFirebaseLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [isFirebaseLoading, setisFirebaseLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setFirebaseUser(user);
            setisFirebaseLoading(false); // أول ما فايربيز يرد، بنقفل اللودينج
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ firebaseUser, isFirebaseLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);