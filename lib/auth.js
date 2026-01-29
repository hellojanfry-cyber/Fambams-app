import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Sign up a new user
export const signUpUser = async (email, password, userType, displayName) => {
  try {
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update the user's display name
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Create a user document in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      email: user.email,
      displayName: displayName || '',
      userType: userType, // 'parent' or 'viewer'
      createdAt: new Date().toISOString(),
      familyId: userType === 'parent' ? user.uid : null, // Parents create their own family
      allowedFamilies: userType === 'viewer' ? [] : null, // Viewers start with empty allowed families
      relationship: userType === 'viewer' ? '' : null
    });

    // If parent, create a family document
    if (userType === 'parent') {
      const familyDocRef = doc(db, 'families', user.uid);
      await setDoc(familyDocRef, {
        id: user.uid,
        name: `${displayName}'s Family`,
        parentName: displayName || email,
        parentId: user.uid,
        kids: [],
        events: [],
        viewers: [],
        createdAt: new Date().toISOString()
      });
    }

    return { success: true, user };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: error.message };
  }
};

// Sign in an existing user
export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message };
  }
};

// Sign out the current user
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: error.message };
  }
};

// Get user data from Firestore
export const getUserData = async (uid) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: 'User document not found' };
    }
  } catch (error) {
    console.error('Get user data error:', error);
    return { success: false, error: error.message };
  }
};

// Get family data from Firestore
export const getFamilyData = async (familyId) => {
  try {
    const familyDocRef = doc(db, 'families', familyId);
    const familyDoc = await getDoc(familyDocRef);
    
    if (familyDoc.exists()) {
      return { success: true, data: familyDoc.data() };
    } else {
      return { success: false, error: 'Family document not found' };
    }
  } catch (error) {
    console.error('Get family data error:', error);
    return { success: false, error: error.message };
  }
};
