'use client';

import Image from 'next/image';
import React, { useState, useCallback } from 'react';
import { Calendar, Clock, MapPin, Upload, ChevronLeft, ChevronRight, Plus, Send, Users, Eye, X, Heart } from 'lucide-react';

export default function FamBamsApp() {
  const [currentScreen, setCurrentScreen] = useState('auth');
  const [userType, setUserType] = useState('parent');
  const [currentMonth, setCurrentMonth] = useState(0);
  const [selectedKid, setSelectedKid] = useState('all');
  const [hoveredDay, setHoveredDay] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRelationship, setInviteRelationship] = useState('grandmother');
  const [newChildName, setNewChildName] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const relationshipOptions = [
    { value: 'grandmother', label: 'Grandmother' },
    { value: 'grandfather', label: 'Grandfather' },
    { value: 'great-grandmother', label: 'Great-Grandmother' },
    { value: 'great-grandfather', label: 'Great-Grandfather' },
    { value: 'aunt', label: 'Aunt' },
    { value: 'uncle', label: 'Uncle' },
    { value: 'cousin', label: 'Cousin' },
  ];

  const families = {
    'sarah-family': {
      id: 'sarah-family',
      name: 'Sarah Johnson Family',
      parentName: 'Sarah Johnson',
      kids: [
        { id: 'emma', name: 'Emma', photo: 'https://via.placeholder.com/80' },
        { id: 'jake', name: 'Jake', photo: 'https://via.placeholder.com/80' },
        { id: 'lily', name: 'Lily', photo: 'https://via.placeholder.com/80' }
      ],
      events: [
        { id: 1, kidId: 'emma', kidName: 'Emma', date: '2026-01-20', activity: 'Soccer Practice', time: '4:00 PM', location: 'Park Field #3' },
        { id: 2, kidId: 'jake', kidName: 'Jake', date: '2026-01-20', activity: 'Piano Lesson', time: '5:00 PM', location: 'Music Academy' },
        { id: 3, kidId: 'lily', kidName: 'Lily', date: '2026-01-21', activity: 'Dance Class', time: '3:30 PM', location: 'Studio Dance Co.' },
        { id: 4, kidId: 'emma', kidName: 'Emma', date: '2026-01-22', activity: 'Soccer Game', time: '6:30 PM', location: 'Central Park' },
        { id: 5, kidId: 'jake', kidName: 'Jake', date: '2026-01-24', activity: 'Piano Recital', time: '7:00 PM', location: 'Concert Hall' },
      ],
      viewers: [
        { email: 'grandma@example.com', relationship: 'grandmother', name: 'Grandma Mary' },
        { email: 'grandpa@example.com', relationship: 'grandfather', name: 'Grandpa John' }
      ]
    },
    'mike-family': {
      id: 'mike-family',
      name: 'Mike Johnson Family',
      parentName: 'Mike Johnson',
      kids: [
        { id: 'alex', name: 'Alex', photo: 'https://via.placeholder.com/80' },
        { id: 'sophie', name: 'Sophie', photo: 'https://via.placeholder.com/80' }
      ],
      events: [
        { id: 6, kidId: 'alex', kidName: 'Alex', date: '2026-01-20', activity: 'Baseball Practice', time: '5:30 PM', location: 'Sports Complex' },
        { id: 7, kidId: 'sophie', kidName: 'Sophie', date: '2026-01-21', activity: 'Art Class', time: '4:00 PM', location: 'Community Center' },
        { id: 8, kidId: 'alex', kidName: 'Alex', date: '2026-01-23', activity: 'Baseball Game', time: '6:00 PM', location: 'Stadium Field 1' },
        { id: 9, kidId: 'sophie', kidName: 'Sophie', date: '2026-01-24', activity: 'Gymnastics', time: '3:00 PM', location: 'Elite Gym' },
      ],
      viewers: [
        { email: 'mike-mil@example.com', relationship: 'grandmother', name: 'Grandma Linda' }
      ]
    }
  };

  const users = {
    'sarah@example.com': { type: 'parent', familyId: 'sarah-family' },
    'mike@example.com': { type: 'parent', familyId: 'mike-family' },
    'grandma@example.com': { type: 'viewer', allowedFamilies: ['sarah-family', 'mike-family'], relationship: 'grandmother' },
    'mike-mil@example.com': { type: 'viewer', allowedFamilies: ['mike-family'], relationship: 'grandmother' },
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

  const handleAddChild = () => {
    if (!newChildName.trim()) {
      alert('Please enter a child name');
      return;
    }

    // For now, just show a message that the feature is coming soon
    alert(`Child "${newChildName}" will be added!\n\nNote: Photo upload feature will be enabled in the next update.`);
    
    setNewChildName('');
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setShowAddChildModal(false);
  };

  // Modal component moved outside to prevent re-creation
  const AddChildModal = useCallback(({ family }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Plus className="w-6 h-6" />
              <h2 className="text-xl font-bold">Add a Child</h2>
            </div>
            <button 
              onClick={() => {
                setShowAddChildModal(false);
                setNewChildName('');
                setSelectedPhoto(null);
                setPhotoPreview(null);
              }}
              className="p-1 hover:bg-white/20 rounded-lg transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm opacity-90 mt-2">
            Add a new child to your family schedule
          </p>
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
              placeholder="Enter child's name"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Photo (Optional)
            </label>
            <div className="flex items-center space-x-4">
              {photoPreview ? (
                <div className="relative">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="w-20 h-20 rounded-full object-cover border-4 border-cyan-400"
                  />
                  <button
                    onClick={() => {
                      setSelectedPhoto(null);
                      setPhotoPreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="w-20 h-20 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center hover:border-cyan-400 transition-all bg-gray-50">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              )}
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  Upload a photo of your child
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  (Feature coming soon)
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleAddChild}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            Add Child
          </button>
        </div>
      </div>
    </div>
  ), [newChildName, photoPreview, selectedPhoto]);

  const InviteModal = ({ family }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
             <Heart className="w-6 h-6" />
              <h2 className="text-xl font-bold">Invite Family Member</h2>
            </div>
            <button 
              onClick={() => setShowInviteModal(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm opacity-90 mt-2">
            Share your kids schedules with someone special
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What is their relationship to your kids?
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
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Their Email Address
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="family@example.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>They will receive:</strong> {family.parentName} has invited you to view {family.kids.map(k => k.name).join(', ')} activities as their <strong>{relationshipOptions.find(r => r.value === inviteRelationship)?.label}</strong>
            </p>
          </div>

          <button 
            onClick={() => {
              alert(`Invitation sent to ${inviteEmail} as ${relationshipOptions.find(r => r.value === inviteRelationship)?.label}!`);
              setShowInviteModal(false);
              setInviteEmail('');
              setInviteRelationship('grandmother');
            }}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            Send Invitation
          </button>
        </div>
      </div>
    </div>
  );

  const AuthScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-2xl shadow-lg"> <img src="https://i.postimg.cc/L5Ggh0Tt/Logo.png" alt="FamBams Logo" style={{width: '176px', height: 'auto'}} />
                          </div>
          </div>
          <h2 className="text-white text-xl font-bold mt-4">Family Schedule</h2>
          <p className="text-white/90 text-sm mt-2">Keep everyone in sync</p>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setUserType('parent')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  userType === 'parent'
                    ? 'border-cyan-500 bg-cyan-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users className="w-8 h-8 mx-auto mb-2 text-cyan-600" />
                <span className="block text-sm font-semibold">Parent</span>
              </button>
              <button
                onClick={() => setUserType('viewer')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  userType === 'viewer'
                    ? 'border-cyan-500 bg-cyan-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Eye className="w-8 h-8 mx-auto mb-2 text-cyan-600" />
                <span className="block text-sm font-semibold">Family Member</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder={userType === 'parent' ? 'parent@example.com' : 'grandma@example.com'}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none transition-all"
            />
          </div>

          <button
            onClick={() => {
              const screen = userType === 'parent' ? 'parent-dashboard' : 'viewer-schedule';
              setCurrentScreen(screen);
              setLoggedInUser(userType === 'parent' ? 'sarah@example.com' : 'grandma@example.com');
            }}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            Sign In
          </button>

          <div className="text-center">
            <a href="#" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">
              Forgot password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const ParentDashboard = () => {
    const family = families[users[loggedInUser]?.familyId];
    if (!family) return null;

    const today = new Date();
    const displayMonth = new Date(today.getFullYear(), today.getMonth() + currentMonth, 1);

    const filteredEvents = selectedKid === 'all' 
      ? family.events 
      : family.events.filter(e => e.kidId === selectedKid);

    const sortedEvents = [...filteredEvents].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-8">
        {showInviteModal && <InviteModal family={family} />}
        {showAddChildModal && <AddChildModal family={family} />}

        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white px-6 pt-8 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{family.name}</h1>
              <p className="text-sm opacity-90">Parent Dashboard</p>
            </div>
            <div className="bg-white p-2 rounded-xl shadow-lg">
              <img src="https://i.postimg.cc/L5Ggh0Tt/Logo.png" alt="Logo" className="w-20" />
            </div>
          </div>

          <div className="flex space-x-3 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedKid('all')}
              className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedKid === 'all'
                  ? 'bg-white text-orange-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              All Kids
            </button>
            {family.kids.map((kid) => (
              <button
                key={kid.id}
                onClick={() => setSelectedKid(kid.id)}
                className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedKid === kid.id
                    ? 'bg-white text-orange-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {kid.name}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 -mt-4">
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentMonth(currentMonth - 1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h2 className="text-xl font-bold text-gray-800">
                {displayMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={() => setCurrentMonth(currentMonth + 1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <CalendarGrid 
              displayMonth={displayMonth}
              events={filteredEvents}
              today={today}
              hoveredDay={hoveredDay}
              setHoveredDay={setHoveredDay}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setShowAddChildModal(true)}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Child</span>
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-gradient-to-r from-pink-400 to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>Invite Family</span>
            </button>
          </div>
        </div>

        <div className="px-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {selectedKid === 'all' 
              ? 'All Events'
              : `${family.kids.find(k => k.id === selectedKid)?.name}s Events`
            }
          </h2>
          <div className="space-y-3">
            {sortedEvents.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 shadow text-center text-gray-500">
                No events scheduled
              </div>
            ) : (
              sortedEvents.map((event) => (
                <EventCard key={event.id} event={event} showFamily={false} />
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const ViewerSchedule = () => {
    const userInfo = users[loggedInUser];
    if (!userInfo) return null;

    const allowedFamilies = userInfo.allowedFamilies;
    
    const allKids = [];
    const allEvents = [];
    
    allowedFamilies.forEach(familyId => {
      const family = families[familyId];
      family.kids.forEach(kid => {
        allKids.push({ ...kid, familyId, familyName: family.name });
      });
      family.events.forEach(event => {
        allEvents.push({ ...event, familyId, familyName: family.name });
      });
    });

    const today = new Date();
    const displayMonth = new Date(today.getFullYear(), today.getMonth() + currentMonth, 1);

    const filteredEvents = selectedKid === 'all' 
      ? allEvents 
      : allEvents.filter(e => e.kidId === selectedKid);

    const sortedEvents = [...filteredEvents].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    const viewableKids = selectedKid === 'all' ? allKids : allKids.filter(k => k.id === selectedKid);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-8">
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white px-6 pt-8 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Family Schedule</h1>
              <p className="text-sm opacity-90">
                Viewing as {userInfo.relationship}
              </p>
            </div>
            <div className="bg-white p-2 rounded-xl shadow-lg">
              <img src="https://i.postimg.cc/L5Ggh0Tt/Logo.png" alt="Logo" className="w-20" />
            </div>
          </div>

          <div className="flex space-x-3 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedKid('all')}
              className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedKid === 'all'
                  ? 'bg-white text-orange-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              All Kids
            </button>
            {allKids.map((kid) => (
              <button
                key={`${kid.familyId}-${kid.id}`}
                onClick={() => setSelectedKid(kid.id)}
                className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedKid === kid.id
                    ? 'bg-white text-orange-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {kid.name}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 -mt-4">
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentMonth(currentMonth - 1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h2 className="text-xl font-bold text-gray-800">
                {displayMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={() => setCurrentMonth(currentMonth + 1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <CalendarGrid 
              displayMonth={displayMonth}
              events={filteredEvents}
              today={today}
              hoveredDay={hoveredDay}
              setHoveredDay={setHoveredDay}
            />
          </div>
        </div>

        <div className="px-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {selectedKid === 'all' 
              ? 'All Events'
              : `${viewableKids.find(k => k.id === selectedKid)?.name}s Events`
            }
          </h2>
          <div className="space-y-3">
            {sortedEvents.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 shadow text-center text-gray-500">
                No events scheduled
              </div>
            ) : (
              sortedEvents.map((event) => (
                <EventCard key={event.id} event={event} showFamily={allowedFamilies.length > 1} />
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const CalendarGrid = ({ displayMonth, events, today, hoveredDay, setHoveredDay }) => {
    const year = displayMonth.getFullYear();
    const month = displayMonth.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    const getDayEvents = (day) => {
      if (!day) return [];
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return events.filter(e => e.date === dateStr);
    };

    const isToday = (day) => {
      if (!day) return false;
      return day === today.getDate() && 
             month === today.getMonth() && 
             year === today.getFullYear();
    };

    return (
      <div>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const dayEvents = getDayEvents(day);
            const hasEvents = dayEvents.length > 0;
            const dateKey = day ? `${year}-${month}-${day}` : null;
            
            return (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => day && hasEvents && setHoveredDay(dateKey)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <div
                  className={`aspect-square border-2 rounded-lg p-1 ${
                    !day 
                      ? 'border-transparent' 
                      : isToday(day)
                      ? 'border-yellow-400 bg-yellow-100'
                      : hasEvents
                      ? 'border-cyan-300 bg-cyan-50 cursor-pointer hover:bg-blue-100'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-semibold ${
                        isToday(day) ? 'text-orange-600' : 'text-gray-700'
                      }`}>
                        {day}
                      </div>
                      {hasEvents && (
                        <div className="flex flex-wrap gap-0.5 mt-1">
                          {dayEvents.slice(0, 3).map((event, idx) => (
                            <div
                              key={idx}
                              className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {hasEvents && hoveredDay === dateKey && (
                  <div className="absolute z-50 top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-2xl border-2 border-gray-200 p-3 min-w-[220px] max-w-[280px]">
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l-2 border-t-2 border-gray-200 rotate-45"></div>
                    <div className="space-y-3">
                      {dayEvents.map((event, idx) => (
                        <div key={idx} className="text-xs border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
                          <div className="font-bold text-gray-800 mb-1">{event.kidName}: {event.activity}</div>
                          <div className="flex items-center space-x-1 text-gray-600 mb-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-600">
                            <MapPin className="w-3 h-3" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const EventCard = ({ event, showFamily }) => {
    const eventDate = new Date(event.date);
    const dateStr = eventDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });

    return (
      <div className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-sm font-semibold text-gray-500">{dateStr}</span>
            <h3 className="font-bold text-gray-800 text-lg mt-1">{event.activity}</h3>
          </div>
          <div className="text-right">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold block">
              {event.kidName}
            </span>
            {showFamily && (
              <span className="text-xs text-gray-500 mt-1 block">
                {event.familyName}
              </span>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{event.time}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{event.location}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans">
      {currentScreen === 'auth' && <AuthScreen />}
      {currentScreen === 'parent-dashboard' && <ParentDashboard />}
      {currentScreen === 'viewer-schedule' && <ViewerSchedule />}
    </div>
  );
}
