'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function EditActivityModal({ 
  activity,
  onEdit, 
  onClose 
}) {
  const [activityForm, setActivityForm] = useState({
    activity: '',
    date: '',
    time: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);

  // Initialize form with activity data
  useEffect(() => {
    if (activity) {
      setActivityForm({
        activity: activity.activity,
        date: activity.date,
        time: activity.time,
        location: activity.location
      });
    }
  }, [activity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!activityForm.activity || !activityForm.date || !activityForm.time || !activityForm.location) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    await onEdit(activity.id, activityForm);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Edit Activity</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
