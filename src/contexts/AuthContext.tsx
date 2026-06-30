import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { useResumeStore } from "@/store/resumeStore";
import { useSavedJobsStore } from "@/store/savedJobsStore";
import { useApplicationsStore } from "@/store/applicationsStore";

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Resolve the initial session, then let onAuthStateChange keep it fresh.
        // No artificial 5s timeout that flips loading=false with a null session
        // and bounces a slowly-authenticating user to /auth. (P19)
        const getInitialSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);
            } catch (error) {
                logger.error("Error getting session:", error);
            } finally {
                setLoading(false);
            }
        };

        getInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        // Clear per-browser PII so the next user of a shared machine can't read
        // the previous user's résumé / applications after logout. (P16)
        useResumeStore.getState().clearResumeData();
        useSavedJobsStore.getState().clearAllSavedJobs();
        useApplicationsStore.getState().clearAllApplications();
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
