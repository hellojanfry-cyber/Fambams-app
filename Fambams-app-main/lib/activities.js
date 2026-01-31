import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';

// ============ KIDS MANAGEMENT ============

export const addKid = async (familyId, kidName) => {
  try {
    const kidData = {
      name: kidName,
      familyId: familyId,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'kids'), kidData);
    
    return {
      success: true,
      kidId: docRef.id,
      data: { ...kidData, id: docRef.id }
    };
  } catch (error) {
    console.error('Add kid error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const deleteKid = async (kidId) => {
  try {
    await deleteDoc(doc(db, 'kids', kidId));
    
    // Also delete all activities for this kid
    const activitiesQuery = query(collection(db, 'events'), where('kidId', '==', kidId));
    const activitiesSnapshot = await getDocs(activitiesQuery);
    
    const deletePromises = activitiesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    return { success: true };
  } catch (error) {
    console.error('Delete kid error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ============ ACTIVITIES MANAGEMENT ============

export const addActivity = async (familyId, kidId, kidName, activityData) => {
  try {
    const eventData = {
      familyId: familyId,
      kidId: kidId,
      kidName: kidName,
      activity: activityData.activity,
      date: activityData.date,
      time: activityData.time,
      location: activityData.location,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'events'), eventData);
    
    return {
      success: true,
      activityId: docRef.id,
      data: { ...eventData, id: docRef.id }
    };
  } catch (error) {
    console.error('Add activity error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const updateActivity = async (activityId, updates) => {
  try {
    await updateDoc(doc(db, 'events', activityId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Update activity error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const deleteActivity = async (activityId) => {
  try {
    await deleteDoc(doc(db, 'events', activityId));
    return { success: true };
  } catch (error) {
    console.error('Delete activity error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ============ RECURRING ACTIVITIES ============

export const addRecurringActivity = async (familyId, kidId, kidName, activityData, recurrence) => {
  try {
    // Generate dates based on recurrence pattern
    const dates = generateRecurringDates(activityData.date, recurrence);
    
    const eventPromises = dates.map(date => {
      const eventData = {
        familyId: familyId,
        kidId: kidId,
        kidName: kidName,
        activity: activityData.activity,
        date: date,
        time: activityData.time,
        location: activityData.location,
        recurring: true,
        recurrencePattern: recurrence.pattern,
        createdAt: serverTimestamp(),
      };
      
      return addDoc(collection(db, 'events'), eventData);
    });

    await Promise.all(eventPromises);
    
    return {
      success: true,
      count: dates.length
    };
  } catch (error) {
    console.error('Add recurring activity error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to generate recurring dates
const generateRecurringDates = (startDate, recurrence) => {
  const dates = [];
  const start = new Date(startDate);
  const occurrences = recurrence.occurrences || 12; // Default to 12 occurrences
  
  for (let i = 0; i < occurrences; i++) {
    const newDate = new Date(start);
    
    switch (recurrence.pattern) {
      case 'daily':
        newDate.setDate(start.getDate() + i);
        break;
      case 'weekly':
        newDate.setDate(start.getDate() + (i * 7));
        break;
      case 'biweekly':
        newDate.setDate(start.getDate() + (i * 14));
        break;
      case 'monthly':
        newDate.setMonth(start.getMonth() + i);
        break;
      default:
        break;
    }
    
    // Format as YYYY-MM-DD
    const formattedDate = newDate.toISOString().split('T')[0];
    dates.push(formattedDate);
  }
  
  return dates;
};
