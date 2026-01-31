'use client';

import Image from 'next/image';
import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, Clock, MapPin, Upload, ChevronLeft, ChevronRight, Plus, Send, Users, Eye, X, Heart, LogOut, Edit, Trash2 } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { signUpUser, signInUser, signOutUser, resetPassword, getUserData, getCompleteFamilyData } from '../lib/auth';
import { addKid, deleteKid, addActivity, updateActivity, deleteActivity, addRecurringActivity } from '../lib/activities';
import { sendInvitation, getPendingInvitations, acceptInvitation, declineInvitation } from '../lib/invitations';
import AuthScreen from './AuthScreen';
import AddActivityModal from './AddActivityModal';
import EditActivityModal from './EditActivityModal';

export default function FamBamsApp() {
  const [currentScreen, setCurrentScreen] = useState('loading');
  const [currentMonth, setCurrentMonth] = useState(0);
  const [selectedKid, setSelectedKid] = useState('all');
  const [hoveredDay, setHoveredDay] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [familyData, setFamilyData] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [showEditActivityModal, setShowEditActivityModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRelationship, setInviteRelationship] = useState('grandmother');
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [showInvitationsModal, setShowInvitationsModal] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  


  const relationshipOptions = [
    { value: 'sibling-parent', label: 'Sibling Parent (Full Access)' },
    { value: 'grandmother', label: 'Grandmother' },
    { value: 'grandfather', label: 'Grandfather' },
    { value: 'great-grandmother', label: 'Great-Grandmother' },
    { value: 'great-grandfather', label: 'Great-Grandfather' },
    { value: 'aunt', label: 'Aunt' },
    { value: 'uncle', label: 'Uncle' },
    { value: 'cousin', label: 'Cousin' },
  ];
  // Convert 24-hour time to 12-hour format
  const formatTime = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };




  // Refresh family data
  const refreshFamilyData = async () => {
    if (currentUser) {
      const result = await getCompleteFamilyData(currentUser.uid);
      if (result.success) {
        setFamilyData(result.data);
      }
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Load user data
        const userDataResult = await getUserData(user.uid);
        if (userDataResult.success) {
          setUserData(userDataResult.data);
          
          // Check for pending invitations
          console.log('Checking invitations for:', user.email);
          const invitationsResult = await getPendingInvitations(user.email);
          console.log('Invitations result:', invitationsResult);
          if (invitationsResult.success && invitationsResult.invitations.length > 0) {
            console.log('Setting pending invitations:', invitationsResult.invitations);
            setPendingInvitations(invitationsResult.invitations);
            setShowInvitationsModal(true);
          } else {
            console.log('No pending invitations found or error occurred');
          }
          
          // Load complete family data (from all connected families)
          const familyDataResult = await getCompleteFamilyData(user.uid);
          if (familyDataResult.success) {
            setFamilyData(familyDataResult.data);
            if (userDataResult.data.userType === 'parent') {
              setCurrentScreen('parent-dashboard');
            } else if (userDataResult.data.userType === 'viewer') {
              setCurrentScreen('viewer-schedule');
            }
          }
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
        setFamilyData(null);
        setCurrentScreen('auth');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentScreen('auth');
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddChild = async () => {
    if (!newChildName.trim()) {
      alert('Please enter a child name');
      return;
    }

    setLoading(true);
    const result = await addKid(userData.familyId, newChildName.trim());
    
    if (result.success) {
      setNewChildName('');
      setShowAddChildModal(false);
      await refreshFamilyData();
    } else {
      alert(`Error adding child: ${result.error}`);
    }
    setLoading(false);
  };

  const handleDeleteKid = async (kidId) => {
    if (!confirm('Are you sure? This will delete the child and all their activities.')) {
      return;
    }

    setLoading(true);
    const result = await deleteKid(kidId);
    
    if (result.success) {
      // If deleted kid was selected, switch to "all"
      if (selectedKid === kidId) {
        setSelectedKid('all');
      }
      await refreshFamilyData();
    } else {
      alert(`Error deleting child: ${result.error}`);
    }
    setLoading(false);
  };

  // Send invitation
  const handleSendInvitation = async () => {
    if (!inviteEmail.trim()) {
      alert('Please enter an email address');
      return;
    }

    setLoading(true);
    const result = await sendInvitation(
      currentUser.uid,
      userData.displayName || currentUser.email,
      inviteEmail.trim(),
      inviteRelationship,
      userData.familyId
    );
    
    if (result.success) {
      alert(`Invitation sent to ${inviteEmail}!`);
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRelationship('grandmother');
    } else {
      alert(`Error sending invitation: ${result.error}`);
    }
    setLoading(false);
  };

  // Accept invitation
  const handleAcceptInvitation = async (invitationId) => {
    setLoading(true);
    const result = await acceptInvitation(invitationId, currentUser.uid);
    
    if (result.success) {
      // Remove from pending list
      setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      
      // Refresh family data to show new connected families
      await refreshFamilyData();
      
      // Close modal if no more invitations
      if (pendingInvitations.length === 1) {
        setShowInvitationsModal(false);
      }
    } else {
      alert(`Error accepting invitation: ${result.error}`);
    }
    setLoading(false);
  };

  // Decline invitation
  const handleDeclineInvitation = async (invitationId) => {
    setLoading(true);
    const result = await declineInvitation(invitationId);
    
    if (result.success) {
      // Remove from pending list
      setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      
      // Close modal if no more invitations
      if (pendingInvitations.length === 1) {
        setShowInvitationsModal(false);
      }
    } else {
      alert(`Error declining invitation: ${result.error}`);
    }
    setLoading(false);
  };

  const handleOpenAddActivity = () => {
    setShowAddActivityModal(true);
  };

  const handleAddActivity = async (formData) => {
    const kid = familyData.kids.find(k => k.id === formData.kidId);
    
    let result;
    if (formData.recurring) {
      result = await addRecurringActivity(
        userData.familyId,
        formData.kidId,
        kid.name,
        {
          activity: formData.activity,
          date: formData.date,
          time: formData.time,
          location: formData.location
        },
        {
          pattern: formData.recurrencePattern,
          occurrences: formData.occurrences
        }
      );
    } else {
      result = await addActivity(
        userData.familyId,
        formData.kidId,
        kid.name,
        {
          activity: formData.activity,
          date: formData.date,
          time: formData.time,
          location: formData.location
        }
      );
    }

    if (result.success) {
      setShowAddActivityModal(false);
      await refreshFamilyData();
    } else {
      alert(`Error adding activity: ${result.error}`);
    }
  };

  const handleOpenEditActivity = (activity) => {
    setSelectedActivity(activity);
    setShowEditActivityModal(true);
  };

  const handleEditActivity = async (activityId, formData) => {
    const result = await updateActivity(activityId, {
      activity: formData.activity,
      date: formData.date,
      time: formData.time,
      location: formData.location
    });

    if (result.success) {
      setShowEditActivityModal(false);
      setSelectedActivity(null);
      await refreshFamilyData();
    } else {
      alert(`Error updating activity: ${result.error}`);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!confirm('Are you sure you want to delete this activity?')) {
      return;
    }

    setLoading(true);
    const result = await deleteActivity(activityId);
    
    if (result.success) {
      await refreshFamilyData();
    } else {
      alert(`Error deleting activity: ${result.error}`);
    }
    setLoading(false);
  };

  const getMonthData = () => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() + currentMonth, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    return { year, month, firstDay, daysInMonth };
  };

  const { year, month, firstDay, daysInMonth } = getMonthData();
  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Get kids for display
  const kids = familyData?.kids || [];
  
  // Filter events
  const events = familyData?.events || [];
  const filteredEvents = selectedKid === 'all' 
    ? events 
    : events.filter(e => e.kidId === selectedKid);

  // Group events by date
  const eventsByDate = {};
  filteredEvents.forEach(event => {
    if (!eventsByDate[event.date]) {
      eventsByDate[event.date] = [];
    }
    eventsByDate[event.date].push(event);
  });

  const EventCard = ({ event }) => (
    <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow border-l-4 border-cyan-500">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-800">{event.activity}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenEditActivity(event)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Edit"
          >
            <Edit className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => handleDeleteActivity(event.id)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
      <div className="space-y-1 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-600" />
          <span>{event.kidName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-600" />
          <span>{new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-600" />
          <span>{formatTime(event.time)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-600" />
          <span>{event.location}</span>
        </div>
      </div>
    </div>
  );






  // Pending Invitations Modal
  const PendingInvitationsModal = () => {
    if (pendingInvitations.length === 0) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-6 sticky top-0">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Family Invitations</h2>
              <button
                onClick={() => setShowInvitationsModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-white/90 text-sm mt-2">
              You have {pendingInvitations.length} pending invitation{pendingInvitations.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="p-6 space-y-4">
            {pendingInvitations.map(invitation => (
              <div key={invitation.id} className="border-2 border-gray-200 rounded-xl p-4">
                <div className="mb-3">
                  <p className="font-bold text-gray-800">{invitation.fromUserName}</p>
                  <p className="text-sm text-gray-600">
                    wants you to view their family schedule as their{' '}
                    <span className="font-semibold">
                      {relationshipOptions.find(r => r.value === invitation.relationship)?.label || invitation.relationship}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptInvitation(invitation.id)}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-400 to-green-500 text-white font-bold py-3 rounded-xl shadow hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineInvitation(invitation.id)}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-red-400 to-red-500 text-white font-bold py-3 rounded-xl shadow hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Invite Modal (Updated)
  const InviteModal = () => {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl w-full max-w-md">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white">Invite Family Member</h2>
              </div>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                  setInviteRelationship('grandmother');
                }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Relationship to Your Kids
              </label>
              <select
                value={inviteRelationship}
                onChange={(e) => setInviteRelationship(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all bg-white"
              >
                {relationshipOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {inviteRelationship === 'sibling-parent' && (
                <p className="text-xs text-blue-600 mt-2">
                  ⭐ Full Access: Can add/edit kids and activities
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Their Email Address
              </label>
              <input
                key="invite-email-input"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="family@example.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
                autoComplete="off"
              />
            </div>

            <button
              onClick={handleSendInvitation}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Event Details Modal
  const EventDetailsModal = () => {
    if (!selectedEventDetails) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl w-full max-w-md">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Event Details</h2>
              <button
                onClick={() => {
                  setShowEventDetailsModal(false);
                  setSelectedEventDetails(null);
                }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-500">Activity</label>
              <p className="text-xl font-bold text-gray-800">{selectedEventDetails.activity}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-500">Child</label>
              <p className="text-lg text-gray-800">{selectedEventDetails.kidName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-500">Date</label>
                <p className="text-lg text-gray-800">
                  {new Date(selectedEventDetails.date + 'T00:00:00').toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500">Time</label>
                <p className="text-lg text-gray-800">{formatTime(selectedEventDetails.time)}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-500">Location</label>
              <p className="text-lg text-gray-800">{selectedEventDetails.location}</p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowEventDetailsModal(false);
                  setSelectedEventDetails(null);
                  handleOpenEditActivity(selectedEventDetails);
                }}
                className="flex-1 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setShowEventDetailsModal(false);
                  setSelectedEventDetails(null);
                  handleDeleteActivity(selectedEventDetails.id);
                }}
                className="flex-1 bg-gradient-to-r from-red-400 to-red-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ParentDashboard = () => {
    // Get events for current month
    const monthEvents = filteredEvents.filter(event => {
      const eventDate = new Date(event.date + 'T00:00:00');
      return eventDate.getMonth() === month && eventDate.getFullYear() === year;
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50">
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-6 shadow-lg">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">{userData?.displayName}'s Family</h1>
              <p className="text-white/90 mt-1">Parent Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-lg">
                <img src="https://i.postimg.cc/L5Ggh0Tt/Logo.png" alt="FamBamz" style={{width: '120px', height: 'auto'}} />
              </div>
              <button
                onClick={handleSignOut}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedKid('all')}
              className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedKid === 'all'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
              }`}
            >
              All Kids
            </button>
            {kids.map(kid => (
              <div key={kid.id} className="relative group">
                <button
                  onClick={() => setSelectedKid(kid.id)}
                  className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                    selectedKid === kid.id
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
                  }`}
                >
                  {kid.name}
                </button>
                <button
                  onClick={() => handleDeleteKid(kid.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                  title="Delete child"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => setShowAddChildModal(true)}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 text-cyan-600 font-bold"
            >
              <Plus className="w-6 h-6" />
              Add Child
            </button>
            <button
              onClick={handleOpenAddActivity}
              disabled={kids.length === 0}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-6 h-6" />
              Add Activity
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 font-bold"
            >
              <Send className="w-6 h-6" />
              Invite Family
            </button>
          </div>

          {kids.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Children Yet</h3>
              <p className="text-gray-600 mb-6">Add your first child to start scheduling activities!</p>
              <button
                onClick={() => setShowAddChildModal(true)}
                className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                Add Your First Child
              </button>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setCurrentMonth(currentMonth - 1)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <h2 className="text-2xl font-bold text-gray-800">{monthName}</h2>
                  <button
                    onClick={() => setCurrentMonth(currentMonth + 1)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-semibold text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                  
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayEvents = eventsByDate[dateStr] || [];
                    const hasEvents = dayEvents.length > 0;

                    return (
                      <div
                        key={day}
                        className={`min-h-[100px] p-2 rounded-lg border-2 transition-all ${
                          hasEvents
                            ? 'border-cyan-300 bg-cyan-50 hover:bg-cyan-100'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-semibold text-gray-800 mb-1">{day}</div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              onClick={() => {
                                setSelectedEventDetails(event);
                                setShowEventDetailsModal(true);
                              }}
                              className="text-xs bg-cyan-500 text-white px-2 py-1 rounded truncate cursor-pointer hover:bg-cyan-600 transition-colors"
                              title="Click for details"
                            >
                              {event.kidName}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-cyan-600 font-semibold">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {selectedKid === 'all' ? 'All Activities' : `${kids.find(k => k.id === selectedKid)?.name}'s Activities`}
                </h3>
                {monthEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-4">No activities scheduled for this month</p>
                    <button
                      onClick={handleOpenAddActivity}
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                    >
                      Add Your First Activity
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {monthEvents
                      .sort((a, b) => new Date(a.date) - new Date(b.date))
                      .map(event => (
                        <EventCard key={event.id} event={event} />
                      ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {showAddChildModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-md">
              <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Add Child</h2>
                  <button
                    onClick={() => {
                      setShowAddChildModal(false);
                      setNewChildName('');
                    }}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Child's Name
                  </label>
                  <input
                    key="add-child-input"
                    type="text"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none"
                    autoComplete="off"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAddChildModal(false);
                      setNewChildName('');
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddChild}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Adding...' : 'Add Child'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showInvitationsModal && <PendingInvitationsModal />}
        {showInviteModal && <InviteModal />}
        {showEventDetailsModal && <EventDetailsModal />}
        {showAddActivityModal && (
          <AddActivityModal 
            kids={kids}
            onAdd={handleAddActivity}
            onClose={() => setShowAddActivityModal(false)}
          />
        )}
        {showEditActivityModal && selectedActivity && (
          <EditActivityModal 
            activity={selectedActivity}
            onEdit={handleEditActivity}
            onClose={() => {
              setShowEditActivityModal(false);
              setSelectedActivity(null);
            }}
          />
        )}
      </div>
    );
  };

  const ViewerSchedule = () => {
    // If viewer has connected families, show them the calendar
    if (familyData && familyData.kids && familyData.kids.length > 0) {
      const kids = familyData.kids || [];
      const events = familyData.events || [];
      
      // Filter events for current month
      const today = new Date();
      const targetDate = new Date(today.getFullYear(), today.getMonth() + currentMonth, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      
      const monthEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getFullYear() === year && eventDate.getMonth() === month;
      }).filter(event => selectedKid === 'all' || event.kidId === selectedKid);

      return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 p-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-3xl p-6 mb-6 shadow-xl flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Family Schedule</h1>
                <p className="text-white/90">View-only access</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>

            {/* Kids Filter */}
            <div className="bg-white rounded-2xl p-4 mb-6 shadow-lg overflow-x-auto">
              <div className="flex gap-3 min-w-max">
                <button
                  onClick={() => setSelectedKid('all')}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${
                    selectedKid === 'all'
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Kids
                </button>
                {kids.map(kid => (
                  <button
                    key={kid.id}
                    onClick={() => setSelectedKid(kid.id)}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${
                      selectedKid === kid.id
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {kid.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar and List - same as parent view but read-only */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Calendar */}
              <div className="bg-white rounded-3xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setCurrentMonth(currentMonth - 1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                  </button>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => setCurrentMonth(currentMonth + 1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-bold text-gray-600 text-sm py-2">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: new Date(year, month, 1).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: new Date(year, month + 1, 0).getDate() }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayEvents = monthEvents.filter(e => e.date === dateStr).slice(0, 2);
                    
                    return (
                      <div
                        key={day}
                        className="aspect-square p-2 border-2 border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-sm font-semibold text-gray-700 mb-1">{day}</div>
                        <div className="space-y-1">
                          {dayEvents.map(event => (
                            <div
                              key={event.id}
                              onClick={() => {
                                setSelectedEventDetails(event);
                                setShowEventDetailsModal(true);
                              }}
                              className="text-xs bg-cyan-500 text-white px-2 py-1 rounded truncate cursor-pointer hover:bg-cyan-600 transition-colors"
                              title="Click for details"
                            >
                              {event.kidName}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-cyan-600 font-semibold">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Activities List */}
              <div className="bg-white rounded-3xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {selectedKid === 'all' ? 'All Activities' : `${kids.find(k => k.id === selectedKid)?.name}'s Activities`}
                </h3>
                {monthEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No activities scheduled for this month</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {monthEvents
                      .sort((a, b) => new Date(a.date) - new Date(b.date))
                      .map(event => (
                        <div
                          key={event.id}
                          className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-4 shadow hover:shadow-lg transition-all cursor-pointer"
                          onClick={() => {
                            setSelectedEventDetails(event);
                            setShowEventDetailsModal(true);
                          }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-gray-800 text-lg">{event.activity}</h4>
                            <span className="bg-cyan-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                              {event.kidName}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-gray-600 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(event.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                            {event.time && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatTime(event.time)}
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // No family connections yet - show waiting screen
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-12 shadow-2xl text-center max-w-md">
          <Eye className="w-20 h-20 text-cyan-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Family Member View</h2>
          <p className="text-gray-600 mb-8">
            Waiting for family invitations...
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Once a parent invites you, you'll be able to view the family schedule here.
          </p>
          <button
            onClick={handleSignOut}
            className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  };

  if (currentScreen === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading FamBamz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans">
      {currentScreen === 'auth' && (
        <AuthScreen 
          onSignIn={signInUser}
          onSignUp={signUpUser}
          onPasswordReset={resetPassword}
        />
      )}
      {currentScreen === 'parent-dashboard' && <ParentDashboard />}
      {currentScreen === 'viewer-schedule' && <ViewerSchedule />}
      
      {/* Invitations modal - shows for all users */}
      {showInvitationsModal && <PendingInvitationsModal />}
    </div>
  );
}
