'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Upload, ChevronLeft, ChevronRight, Plus, Send, Users, Eye, X, Heart } from 'lucide-react';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
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
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhotoToFirebase = async (file, childName) => {
    if (!file) return null;
    
    try {
      setUploadingPhoto(true);
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `children/${loggedInUser.familyId}/${childName}-${timestamp}.jpg`;
      const storageRef = ref(storage, filename);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddChild = async () => {
    if (!newChildName.trim()) {
      alert('Please enter a child name');
      return;
    }

    let photoURL = 'https://via.placeholder.com/80';
    
    if (selectedPhoto) {
      const uploadedURL = await uploadPhotoToFirebase(selectedPhoto, newChildName);
      if (uploadedURL) {
        photoURL = uploadedURL;
      }
    }

    // Here you would normally save to your database
    // For now, we'll just show a success message
    alert(`Child added: ${newChildName}\nPhoto URL: ${photoURL}`);
    
    // Reset form
    setNewChildName('');
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setShowAddChildModal(false);
  };

  const AddChildModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Plus className="w-6 h-6" />
              <h2 className="text-xl font-bold">Add Child</h2>
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
            Add a child to your family schedule
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
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Profile Photo
            </label>
            
            {photoPreview ? (
              <div className="flex flex-col items-center space-y-3">
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
                />
                <button
                  onClick={() => {
                    setSelectedPhoto(null);
                    setPhotoPreview(null);
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-semibold"
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                  id="photo-upload"
                />
                <label 
                  htmlFor="photo-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="w-10 h-10 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-600">
                    Click to upload photo
                  </span>
                  <span className="text-xs text-gray-500">
                    JPG, PNG (Max 5MB)
                  </span>
                </label>
              </div>
            )}
          </div>

          <button 
            onClick={handleAddChild}
            disabled={uploadingPhoto || !newChildName.trim()}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {uploadingPhoto ? 'Uploading Photo...' : 'Add Child'}
          </button>
        </div>
      </div>
    </div>
  );

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
          <p className="text-white text-sm opacity-90 mt-2">Keep everyone connected</p>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setUserType('parent')}
            className={`flex-1 py-4 text-center font-semibold transition-all ${
              userType === 'parent'
                ? 'text-blue-600 border-b-3 border-blue-600 bg-blue-50'
                : 'text-gray-500'
            }`}
          >
            Parent
          </button>
          <button
            onClick={() => setUserType('viewer')}
            className={`flex-1 py-4 text-center font-semibold transition-all ${
              userType === 'viewer'
                ? 'text-blue-600 border-b-3 border-blue-600 bg-blue-50'
                : 'text-gray-500'
            }`}
          >
            Family Viewer
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              id="email-input"
              placeholder={userType === 'parent' ? 'parent@example.com' : 'viewer@example.com'}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          <button
            onClick={() => {
              const email = document.getElementById('email-input').value || 'grandma@example.com';
              const user = users[email];
              if (user) {
                setLoggedInUser({ email, ...user });
                setCurrentScreen(user.type === 'parent' ? 'parent-dashboard' : 'viewer-schedule');
              }
            }}
            className="w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            {userType === 'parent' ? 'Manage My Family' : 'View Schedules'}
          </button>

          {userType === 'viewer' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
              <p className="text-sm text-blue-800 font-semibold mb-2">Demo Accounts:</p>
              <p className="text-xs text-blue-700">• grandma@example.com (Sarahs kids Grandmother)</p>
              <p className="text-xs text-blue-700">• mike-mil@example.com (Mikes kids Grandmother)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ParentDashboard = () => {
    if (!loggedInUser) return null;
    const family = families[loggedInUser.familyId];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-6">
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white p-6 rounded-b-3xl shadow-lg">
          <h1 className="text-2xl font-bold mb-2">{family.name}</h1>
          <p className="text-sm opacity-90">Manage your family schedule</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setShowAddChildModal(true)}
              className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all flex flex-col items-center space-y-2"
            >
              <div className="bg-gradient-to-br from-blue-400 to-purple-400 p-3 rounded-full">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-gray-700 text-sm">Add Child</span>
            </button>
            
            <button className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all flex flex-col items-center space-y-2">
              <div className="bg-gradient-to-br from-green-400 to-teal-400 p-3 rounded-full">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-gray-700 text-sm">Add Event</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-orange-500" />
              Invite Family Members
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Invite grandparents, aunts, uncles, or cousins to view your kids schedules
            </p>
            
            <button 
              onClick={() => setShowInviteModal(true)}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold py-3 rounded-xl shadow hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>Send New Invitation</span>
            </button>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                Family Members With Access:
              </p>
              <div className="space-y-2">
                {family.viewers.map((viewer, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-pink-50 p-3 rounded-lg border border-orange-100">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{viewer.name || viewer.email}</p>
                      <p className="text-xs text-gray-600 capitalize">{viewer.relationship.replace('-', ' ')}</p>
                    </div>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Your Children</h2>
            <div className="space-y-3">
              {family.kids.map((kid, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <img src={kid.photo} alt={kid.name} className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{kid.name}</p>
                    <p className="text-xs text-gray-500">
                      {family.events.filter(e => e.kidId === kid.id).length} upcoming events
                    </p>
                  </div>
                  <button className="text-blue-600 text-sm font-semibold">Edit</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showInviteModal && <InviteModal family={family} />}
        {showAddChildModal && <AddChildModal />}
      </div>
    );
  };

  const ViewerSchedule = () => {
    if (!loggedInUser) return null;

    const today = new Date(2026, 0, 19);
    const displayMonth = new Date(today.getFullYear(), today.getMonth() + currentMonth, 1);
    const monthName = displayMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    const allowedFamilies = loggedInUser.allowedFamilies.map(id => families[id]);
    
    const viewableKids = allowedFamilies.flatMap(family => 
      family.kids.map(kid => ({ ...kid, familyName: family.name, familyId: family.id }))
    );
    
    const viewableEvents = allowedFamilies.flatMap(family => 
      family.events.map(event => ({ ...event, familyName: family.name, familyId: family.id }))
    );

    const filteredEvents = selectedKid === 'all' 
      ? viewableEvents 
      : viewableEvents.filter(e => e.kidId === selectedKid);

    const sortedEvents = [...filteredEvents].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const viewerRelationship = loggedInUser.relationship 
      ? loggedInUser.relationship.charAt(0).toUpperCase() + loggedInUser.relationship.slice(1).replace('-', '-')
      : 'Family Member';

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-6">
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white p-6 rounded-b-3xl shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Heart className="w-6 h-6 text-pink-600" />
            <h1 className="text-2xl font-bold">Welcome, {viewerRelationship}!</h1>
          </div>
          <p className="text-sm opacity-90 mb-3 text-red-700">View your grandkids activities</p>

          <div className="bg-orange-600/90 backdrop-blur rounded-xl p-3">
            <p className="text-xs font-semibold mb-2 opacity-90 text-gray-900">Youre viewing schedules for:</p>
            {allowedFamilies.map((family, idx) => (
              <div key={idx} className="flex items-center space-x-2 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm font-semibold">{family.name}</span>
                <span className="text-xs opacity-75">({family.kids.map(k => k.name).join(', ')})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedKid('all')}
              className={`flex flex-col items-center space-y-2 transition-all ${
                selectedKid === 'all' ? 'opacity-100' : 'opacity-60 hover:opacity-80'
              }`}
            >
              <div className={`w-20 h-20 rounded-full border-4 ${
                selectedKid === 'all' ? 'border-orange-400' : 'border-gray-300'
              } overflow-hidden bg-white flex items-center justify-center`}>
                <span className="text-2xl font-bold text-gray-400">All</span>
              </div>
              <span className="font-semibold text-sm text-gray-700">Everyone</span>
            </button>
            
            {viewableKids.map((kid) => (
              <button
                key={kid.id}
                onClick={() => setSelectedKid(kid.id)}
                className={`flex flex-col items-center space-y-2 transition-all ${
                  selectedKid === kid.id ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                }`}
              >
                <div className={`w-20 h-20 rounded-full border-4 ${
                  selectedKid === kid.id ? 'border-orange-400' : 'border-gray-300'
                } overflow-hidden bg-white`}>
                  <img src={kid.photo} alt={kid.name} className="w-full h-full object-cover" />
                </div>
                <div className="text-center">
                  <span className="font-semibold text-sm text-gray-700 block">{kid.name}</span>
                  {allowedFamilies.length > 1 && (
                    <span className="text-xs text-gray-500">{kid.familyName}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentMonth(currentMonth - 1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h2 className="text-xl font-bold text-gray-800">{monthName}</h2>
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
