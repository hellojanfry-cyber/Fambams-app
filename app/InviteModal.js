'use client';

import React from 'react';
import { X, Heart } from 'lucide-react';

export default function InviteModal({ 
  inviteEmail, 
  setInviteEmail, 
  inviteRelationship, 
  setInviteRelationship,
  relationshipOptions,
  onSend,
  onClose,
  loading 
}) {
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
              onClick={onClose}
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
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="family@example.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
              autoComplete="off"
            />
          </div>

          <button
            onClick={onSend}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Invitation'}
          </button>
        </div>
      </div>
    </div>
  );
}
