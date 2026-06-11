'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { COLLECTIONS, type LuxaUser } from '../firestore';

interface AuthState {
  user:      User | null;
  userData:  LuxaUser | null;
  isAdmin:   boolean;
  isLoading: boolean;
  error:     string | null;
}

interface AuthContextValue extends AuthState {
  login:      (email: string, password: string) => Promise<void>;
  signup:     (email: string, password: string, displayName: string) => Promise<void>;
  logout:     () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function generateLuxaId(displayName: string, uid: string): string {
  const cleaned = displayName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20);
  const suffix  = uid.slice(-6);
  return `luxa_${cleaned}_${suffix}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user:      null,
    userData:  null,
    isAdmin:   false,
    isLoading: true,
    error:     null,
  });

  const fetchUserData = useCallback(async (firebaseUser: User): Promise<LuxaUser | null> => {
    const snap = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));
    if (!snap.exists()) return null;
    return snap.data() as LuxaUser;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setState(prev => ({ ...prev, user: null, userData: null, isAdmin: false, isLoading: false }));
        return;
      }
      const userData = await fetchUserData(firebaseUser);
      setState(prev => ({
        ...prev,
        user:      firebaseUser,
        userData,
        isAdmin:   userData?.role === 'admin',
        isLoading: false,
      }));
    });
    return () => unsubscribe();
  }, [fetchUserData]);

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      const message = mapAuthError(err);
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      throw new Error(message);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, displayName: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(firebaseUser, { displayName });

      const luxaId = generateLuxaId(displayName, firebaseUser.uid);
      const now    = serverTimestamp();

      const newUser: Omit<LuxaUser, 'uid'> = {
        email,
        displayName,
        luzaId:    luxaId,
        role:      'member',
        isActive:  true,
        createdAt: now as ReturnType<typeof serverTimestamp>,
        updatedAt: now as ReturnType<typeof serverTimestamp>,
      };

      await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), newUser);
    } catch (err: unknown) {
      const message = mapAuthError(err);
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

function mapAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  const map: Record<string, string> = {
    'auth/email-already-in-use':   'This email is already registered.',
    'auth/invalid-email':          'Please enter a valid email address.',
    'auth/weak-password':          'Password must be at least 6 characters.',
    'auth/user-not-found':         'No account found with this email.',
    'auth/wrong-password':         'Incorrect password.',
    'auth/too-many-requests':      'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/user-disabled':          'This account has been suspended.',
    'auth/invalid-credential':     'Invalid credentials. Please try again.',
  };
  return map[code] ?? 'An unexpected error occurred.';
}
