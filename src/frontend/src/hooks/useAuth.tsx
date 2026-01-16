import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { User, AuthContextType, SignUpData, SignInData } from '../types/auth.types';
import { getAuthErrorMessage, validateSignUpData, validateSignInData } from '../utils/auth.utils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

const mapFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
  photoURL: firebaseUser.photoURL,
  emailVerified: firebaseUser.emailVerified,
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (firebaseUser) {
          setUser(mapFirebaseUser(firebaseUser));
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError('Failed to authenticate. Please refresh the page.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signUp = async (data: SignUpData): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      const validationError = validateSignUpData(
        data.email,
        data.password,
        data.confirmPassword
      );
      if (validationError) {
        throw new Error(validationError);
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      // If the user provided a full name, save it to the Firebase profile
      if (data.fullName) {
        try {
          await updateProfile(userCredential.user, {
            displayName: data.fullName,
          });
        } catch (err) {
          console.warn('Failed to update displayName:', err);
        }
      }

      // Refresh local user state with any updated profile information
      setUser(mapFirebaseUser(userCredential.user));
      console.info('✅ User registered successfully:', userCredential.user.email);
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err);
      setError(errorMessage);
      console.error('Sign up error:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (data: SignInData): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      const validationError = validateSignInData(data.email, data.password);
      if (validationError) {
        throw new Error(validationError);
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      setUser(mapFirebaseUser(userCredential.user));
      console.info('✅ User signed in successfully:', userCredential.user.email);
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err);
      setError(errorMessage);
      console.error('Sign in error:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setError(null);
      await firebaseSignOut(auth);
      setUser(null);
      console.info('✅ User signed out successfully');
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err);
      setError(errorMessage);
      console.error('Sign out error:', err);
      throw new Error(errorMessage);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
