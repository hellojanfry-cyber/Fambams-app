'use client';

import Image from 'next/image';
import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, Clock, MapPin, Upload, ChevronLeft, ChevronRight, Plus, Send, Users, Eye, X, Heart, LogOut, Edit, Trash2 } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { signUpUser, signInUser, signOutUser, resetPassword, getUserData, getCompleteFamilyData } from '../lib/auth';
import { addKid, deleteKid, addActivity, updateActivity, deleteActivity, addRecurringActivity } from '../lib/activities';
import AuthScreen from './AuthScreen';

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
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRelationship, setInviteRelationship] = useState('grandmother');
  const [newChildName, setNewChildName] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [activityForm, setActivityForm] = useState({
    activity: '',
    date: '',
    time: '',
    location: '',
    kidId: '',
    recurring: false,
    recurrencePattern: 'weekly',
    occurrences: 12
  });

  const relationshipOptions = [
    { value: 'grandmother', label: 'Grandmother' },
    { value: 'grandfather', label: 'Grandfather' },
    { value: 'great-grandmother', label: 'Great-Grandmother' },
    { value: 'great-grandfather', label: 'Great-Grandfather' },
    { value: 'aunt', label: 'Aunt' },
    { value: 'uncle', label: 'Uncle' },
    { value: 'cousin', label: 'Cousin' },
  ];

  const recurrenceOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  // Refresh family data
  const refreshFamilyData = async () => {
    if (userData && userData.familyId) {
      const result = await getCompleteFamilyData(userData.familyId);
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
          
          // Load complete family data if user is parent
          if (userDataResult.data.userType === 'parent') {
            const familyDataResult = await getCompleteFamilyData(userDataResult.data.familyId);
            if (familyDataResult.success) {
              setFamilyData(familyDataResult.data);
              setCurrentScreen('parent-dashboard');
            }
          } else if (userDataResult.data.userType === 'viewer') {
            setCurrentScreen('viewer-schedule');
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

  const handleOpenAddActivity = () => {
    // Reset form
    setActivityForm({
      activity: '',
      date: '',
      time: '',
      location: '',
      kidId: familyData?.kids?.[0]?.id || '',
      recurring: false,
      recurrencePattern: 'weekly',
      occurrences: 12
    });
    setShowAddActivityModal(true);
  };

  const handleAddActivity = async () => {
    if (!activityForm.activity || !activityForm.date || !activityForm.time || !activityForm.location || !activityForm.kidId) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);

    const kid = familyData.kids.find(k => k.id === activityForm.kidId);
    
    let result;
    if (activityForm.recurring) {
      result = await addRecurringActivity(
        userData.familyId,
        activityForm.kidId,
        kid.name,
        {
          activity: activityForm.activity,
          date: activityForm.date,
          time: activityForm.time,
          location: activityForm.location
        },
        {
          pattern: activityForm.recurrencePattern,
          occurrences: activityForm.occurrences
        }
      );
    } else {
      result = await addActivity(
        userData.familyId,
        activityForm.kidId,
        kid.name,
        {
          activity: activityForm.activity,
          date: activityForm.date,
          time: activityForm.time,
          location: activityForm.location
        }
      );
    }

    if (result.success) {
      setShowAddActivityModal(false);
      await refreshFamilyData();
    } else {
      alert(`Error adding activity: ${result.error}`);
    }
    setLoading(false);
  };

  const handleOpenEditActivity = (activity) => {
    setSelectedActivity(activity);
    setActivityForm({
      activity: activity.activity,
      date: activity.date,
      time: activity.time,
      location: activity.location,
      kidId: activity.kidId,
      recurring: false,
      recurrencePattern: 'weekly',
      occurrences: 12
    });
    setShowEditActivityModal(true);
  };

  const handleEditActivity = async () => {
    if (!activityForm.activity || !activityForm.date || !activityForm.time || !activityForm.location) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);

    const result = await updateActivity(selectedActivity.id, {
      activity: activityForm.activity,
      date: activityForm.date,
      time: activityForm.time,
      location: activityForm.location
    });

    if (result.success) {
      setShowEditActivityModal(false);
      setSelectedActivity(null);
      await refreshFamilyData();
    } else {
      alert(`Error updating activity: ${result.error}`);
    }
    setLoading(false);
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
          <span>{event.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-600" />
          <span>{event.location}</span>
        </div>
      </div>
    </div>
  );

  // Add Activity Modal
  const AddActivityModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Add Activity</h2>
            <button
              onClick={() => setShowAddActivityModal(false)}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Child
            </label>
            <select
              value={activityForm.kidId}
              onChange={(e) => setActivityForm({...activityForm, kidId: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Select a child</option>
              {kids.map(kid => (
                <option key={kid.id} value={kid.id}>{kid.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Activity Name
            </label>
            <input
              type="text"
              value={activityForm.activity}
              onChange={(e) => setActivityForm({...activityForm, activity: e.target.value})}
              placeholder="Soccer practice"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={activityForm.date}
                onChange={(e) => setActivityForm({...activityForm, date: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Time
              </label>
              <input
                type="time"
                value={activityForm.time}
                onChange={(e) => setActivityForm({...activityForm, time: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={activityForm.location}
              onChange={(e) => setActivityForm({...activityForm, location: e.target.value})}
              placeholder="Community Center"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="border-t pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activityForm.recurring}
                onChange={(e) => setActivityForm({...activityForm, recurring: e.target.checked})}
                className="w-5 h-5 text-cyan-500 rounded focus:ring-2 focus:ring-cyan-500"
              />
              <span className="font-semibold text-gray-700">Recurring Activity</span>
            </label>
          </div>

          {activityForm.recurring && (
            <div className="space-y-4 pl-7">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Repeat Pattern
                </label>
                <select
                  value={activityForm.recurrencePattern}
                  onChange={(e) => setActivityForm({...activityForm, recurrencePattern: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none"
                >
                  {recurrenceOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Occurrences
                </label>
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={activityForm.occurrences}
                  onChange={(e) => setActivityForm({...activityForm, occurrences: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowAddActivityModal(false)}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddActivity}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Activity'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Edit Activity Modal
  const EditActivityModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Edit Activity</h2>
            <button
              onClick={() => {
                setShowEditActivityModal(false);
                setSelectedActivity(null);
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
              Activity Name
            </label>
            <input
              type="text"
              value={activityForm.activity}
              onChange={(e) => setActivityForm({...activityForm, activity: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={activityForm.date}
                onChange={(e) => setActivityForm({...activityForm, date: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Time
              </label>
              <input
                type="time"
                value={activityForm.time}
                onChange={(e) => setActivityForm({...activityForm, time: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={activityForm.location}
              onChange={(e) => setActivityForm({...activityForm, location: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setShowEditActivityModal(false);
                setSelectedActivity(null);
              }}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEditActivity}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
                <img src="https://i.postimg.cc/L5Ggh0Tt/Logo.png" alt="FamBams" style={{width: '120px', height: 'auto'}} />
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
              <button
                key={kid.id}
                onClick={() => setSelectedKid(kid.id)}
                className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedKid === kid.id
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
                }`}
              >
                {kid.name}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
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
                              className="text-xs bg-cyan-500 text-white px-2 py-1 rounded truncate"
                              title={`${event.activity} - ${event.kidName}`}
                            >
                              {event.activity}
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
                    type="text"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none"
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

        {showAddActivityModal && <AddActivityModal />}
        {showEditActivityModal && <EditActivityModal />}
      </div>
    );
  };

  const ViewerSchedule = () => {
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
          <p className="text-gray-600 font-semibold">Loading FamBams...</p>
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
    </div>
  );
}
