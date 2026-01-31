'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AddActivityModal({ 
  kids,
  onAdd, 
  onClose 
}) {
  const [activityForm, setActivityForm] = useState({
    activity: '',
    date: '',
    time: '',
    location: '',
    kidId: kids[0]?.id || '',
    recurring: false,
    recurrencePattern: 'weekly',
    occurrences: 12
  });
  const [loading, setLoading] = useState(false);

  const recurrenceOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!activityForm.activity || !activityForm.date || !activityForm.time || !activityForm.location || !activityForm.kidId) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    await onAdd(activityForm);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Add Activity</h2>
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
              {loading ? 'Adding...' : 'Add Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
