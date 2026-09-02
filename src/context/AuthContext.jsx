import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import AuthModal from '../components/auth/AuthModal';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingMessage, setPendingMessage] = useState('');

  // Helper to fetch profile from Firestore
  const fetchProfile = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Register a new user
  async function register(email, password, fullName, phone) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const newProfile = {
      uid: user.uid,
      fullName,
      email,
      phone,
      role: 'customer',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      emailVerified: user.emailVerified
    };

    await setDoc(doc(db, 'users', user.uid), newProfile);
    setUserProfile(newProfile);
    return userCredential;
  }

  // Login an existing user
  async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update lastLogin on success
    const docRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(docRef, { lastLogin: new Date().toISOString() }, { merge: true });
    
    await fetchProfile(userCredential.user.uid);
    return userCredential;
  }

  // Logout
  function logout() {
    setUserProfile(null);
    return signOut(auth);
  }

  // Google Sign In
  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      const newProfile = {
        uid: user.uid,
        fullName: user.displayName || 'Google User',
        email: user.email,
        phone: user.phoneNumber || '',
        role: 'customer',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        emailVerified: user.emailVerified
      };
      await setDoc(docRef, newProfile);
      setUserProfile(newProfile);
    } else {
      await setDoc(docRef, { lastLogin: new Date().toISOString() }, { merge: true });
      setUserProfile({ ...docSnap.data(), lastLogin: new Date().toISOString() });
    }

    return userCredential;
  }

  // Password reset
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // Action Gating
  function requireAuth(actionCallback, message = '') {
    if (currentUser) {
      actionCallback();
    } else {
      setPendingAction(() => actionCallback);
      setPendingMessage(message);
      setIsModalOpen(true);
    }
  }

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchProfile(user.uid);
        
        // Execute pending action if logged in successfully
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
          setPendingMessage('');
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [pendingAction]);

  const value = {
    currentUser,
    userProfile,
    loading,
    isAuthenticated: !!currentUser,
    login,
    register,
    signInWithGoogle,
    logout,
    resetPassword,
    requireAuth,
    updateCartItems: async (newCartItems) => {
      if (!currentUser) return;
      const docRef = doc(db, 'users', currentUser.uid);
      await setDoc(docRef, { cartItems: newCartItems }, { merge: true });
      setUserProfile(prev => ({ ...prev, cartItems: newCartItems }));
    },
    openAuthModal: () => setIsModalOpen(true),
    refreshProfile: () => currentUser && fetchProfile(currentUser.uid)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setPendingAction(null);
          setPendingMessage('');
        }} 
        pendingActionText={pendingMessage}
      />
    </AuthContext.Provider>
  );
}
