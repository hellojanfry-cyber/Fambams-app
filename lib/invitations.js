import { db } from './firebase';
import { collection, addDoc, doc, getDoc, updateDoc, deleteDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

// ============ SEND INVITATIONS ============

export const sendInvitation = async (fromUserId, fromUserName, toEmail, relationship, familyId) => {
  try {
    // Create invitation document
    const invitationData = {
      fromUserId: fromUserId,
      fromUserName: fromUserName,
      toEmail: toEmail.toLowerCase(),
      relationship: relationship, // 'sibling-parent', 'grandmother', 'grandfather', etc.
      familyId: familyId,
      status: 'pending', // 'pending', 'accepted', 'declined'
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'invitations'), invitationData);
    
    // TODO: In production, send actual email here
    // For now, the invitation is just stored in Firestore
    
    return {
      success: true,
      invitationId: docRef.id,
      message: `Invitation sent to ${toEmail}`
    };
  } catch (error) {
    console.error('Send invitation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ============ GET PENDING INVITATIONS ============

export const getPendingInvitations = async (userEmail) => {
  try {
    const invitationsQuery = query(
      collection(db, 'invitations'),
      where('toEmail', '==', userEmail.toLowerCase()),
      where('status', '==', 'pending')
    );
    
    const snapshot = await getDocs(invitationsQuery);
    const invitations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return {
      success: true,
      invitations: invitations
    };
  } catch (error) {
    console.error('Get pending invitations error:', error);
    return {
      success: false,
      error: error.message,
      invitations: []
    };
  }
};

// ============ ACCEPT INVITATION ============

export const acceptInvitation = async (invitationId, userId) => {
  try {
    // Get the invitation
    const invitationRef = doc(db, 'invitations', invitationId);
    const invitationSnap = await getDoc(invitationRef);
    
    if (!invitationSnap.exists()) {
      return { success: false, error: 'Invitation not found' };
    }
    
    const invitation = invitationSnap.data();
    
    // Update invitation status
    await updateDoc(invitationRef, {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
      acceptedBy: userId
    });
    
    // Get user document
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return { success: false, error: 'User not found' };
    }
    
    const userData = userSnap.data();
    
    // Determine access level based on relationship
    const isSiblingParent = invitation.relationship === 'sibling-parent';
    
    if (isSiblingParent) {
      // Sibling parent gets FULL ACCESS - create family connection
      await addDoc(collection(db, 'familyConnections'), {
        userId: userId,
        familyId: invitation.familyId,
        relationship: 'sibling-parent',
        canEdit: true,
        canAddKids: true,
        canAddEvents: true,
        connectedAt: serverTimestamp()
      });
      
      // Also connect the inviter to this user's family if they have one
      if (userData.familyId) {
        await addDoc(collection(db, 'familyConnections'), {
          userId: invitation.fromUserId,
          familyId: userData.familyId,
          relationship: 'sibling-parent',
          canEdit: true,
          canAddKids: true,
          canAddEvents: true,
          connectedAt: serverTimestamp()
        });
      }
    } else {
      // Extended family gets VIEW-ONLY access
      await addDoc(collection(db, 'familyConnections'), {
        userId: userId,
        familyId: invitation.familyId,
        relationship: invitation.relationship,
        canEdit: false,
        canAddKids: false,
        canAddEvents: false,
        connectedAt: serverTimestamp()
      });
      
      // Update user's relationship field
      await updateDoc(userRef, {
        relationship: invitation.relationship
      });
    }
    
    return {
      success: true,
      message: 'Invitation accepted successfully'
    };
  } catch (error) {
    console.error('Accept invitation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ============ DECLINE INVITATION ============

export const declineInvitation = async (invitationId) => {
  try {
    await updateDoc(doc(db, 'invitations', invitationId), {
      status: 'declined',
      declinedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Decline invitation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ============ GET CONNECTED FAMILIES ============

export const getConnectedFamilies = async (userId) => {
  try {
    // Get all family connections for this user
    const connectionsQuery = query(
      collection(db, 'familyConnections'),
      where('userId', '==', userId)
    );
    
    const connectionsSnap = await getDocs(connectionsQuery);
    const familyIds = connectionsSnap.docs.map(doc => doc.data().familyId);
    
    // Get user's own family if they're a parent
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData.familyId && !familyIds.includes(userData.familyId)) {
        familyIds.push(userData.familyId);
      }
    }
    
    return {
      success: true,
      familyIds: familyIds
    };
  } catch (error) {
    console.error('Get connected families error:', error);
    return {
      success: false,
      error: error.message,
      familyIds: []
    };
  }
};

// ============ GET ALL KIDS FROM CONNECTED FAMILIES ============

export const getAllConnectedKids = async (userId) => {
  try {
    // Get connected family IDs
    const { familyIds } = await getConnectedFamilies(userId);
    
    if (familyIds.length === 0) {
      return { success: true, kids: [] };
    }
    
    // Get all kids from these families
    const allKids = [];
    
    for (const familyId of familyIds) {
      const kidsQuery = query(
        collection(db, 'kids'),
        where('familyId', '==', familyId)
      );
      
      const kidsSnap = await getDocs(kidsQuery);
      kidsSnap.forEach(doc => {
        allKids.push({
          id: doc.id,
          ...doc.data()
        });
      });
    }
    
    return {
      success: true,
      kids: allKids
    };
  } catch (error) {
    console.error('Get all connected kids error:', error);
    return {
      success: false,
      error: error.message,
      kids: []
    };
  }
};

// ============ GET ALL EVENTS FROM CONNECTED FAMILIES ============

export const getAllConnectedEvents = async (userId) => {
  try {
    // Get connected family IDs
    const { familyIds } = await getConnectedFamilies(userId);
    
    if (familyIds.length === 0) {
      return { success: true, events: [] };
    }
    
    // Get all events from these families
    const allEvents = [];
    
    for (const familyId of familyIds) {
      const eventsQuery = query(
        collection(db, 'events'),
        where('familyId', '==', familyId)
      );
      
      const eventsSnap = await getDocs(eventsQuery);
      eventsSnap.forEach(doc => {
        allEvents.push({
          id: doc.id,
          ...doc.data()
        });
      });
    }
    
    // Sort by date
    allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return {
      success: true,
      events: allEvents
    };
  } catch (error) {
    console.error('Get all connected events error:', error);
    return {
      success: false,
      error: error.message,
      events: []
    };
  }
};

// ============ CHECK USER PERMISSIONS ============

export const getUserPermissions = async (userId, familyId) => {
  try {
    // Check if user owns this family
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData.familyId === familyId) {
        return {
          success: true,
          canEdit: true,
          canAddKids: true,
          canAddEvents: true,
          relationship: 'owner'
        };
      }
    }
    
    // Check family connections
    const connectionsQuery = query(
      collection(db, 'familyConnections'),
      where('userId', '==', userId),
      where('familyId', '==', familyId)
    );
    
    const connectionsSnap = await getDocs(connectionsQuery);
    
    if (!connectionsSnap.empty) {
      const connection = connectionsSnap.docs[0].data();
      return {
        success: true,
        canEdit: connection.canEdit || false,
        canAddKids: connection.canAddKids || false,
        canAddEvents: connection.canAddEvents || false,
        relationship: connection.relationship
      };
    }
    
    // No access
    return {
      success: true,
      canEdit: false,
      canAddKids: false,
      canAddEvents: false,
      relationship: null
    };
  } catch (error) {
    console.error('Get user permissions error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
