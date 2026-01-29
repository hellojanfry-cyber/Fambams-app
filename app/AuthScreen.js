'use client';

import React, { useState } from 'react';
import { Users, Eye, X } from 'lucide-react';

export default function AuthScreen({ 
  onSignIn, 
  onSignUp, 
  onPasswordReset 
}) {
  const [authMode, setAuthMode] = useState('signin');
  const [userType, setUserType] = useState('parent');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const relationshipOptions = [
    { value: 'grandmother', label: 'Grandmother' },
    { value: 'grandfather', label: 'Grandfather' },
    { value: 'great-grandmother', label: 'Great-Grandmother' },
    { value: 'great-grandfather', label: 'Great-Grandfather' },
    { value: 'aunt', label: 'Aunt' },
    { value: 'uncle', label: 'Uncle' },
    { value: 'cousin', label: 'Cousin' },
  ];

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password || !displayName) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await onSignUp(email, password, userType, displayName);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await onSignIn(email, password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    const result = await onPasswordReset(email);
    
    if (result.success) {
      setSuccessMessage('Password reset email sent! Check your inbox.');
      setTimeout(() => {
        setShowForgotPassword(false);
        setSuccessMessage('');
      }, 3000);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <img src="https://i.postimg.cc/L5Ggh0Tt/Logo.png" alt="FamBams Logo" style={{width: '176px', height: 'auto'}} />
            </div>
          </div>
          <h2 className="text-white text-xl font-bold mt-4">Family Schedule</h2>
          <p className="text-white/90 text-sm mt-2">Keep everyone in sync</p>
        </div>

        {showForgotPassword ? (
          <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h3>
            <p className="text-gray-600 mb-6">Enter your email to receive a password reset link</p>
            
            <div className="min-h-[60px]">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
                  {error}
                </div>
              )}
              
              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4">
                  {successMessage}
                </div>
              )}
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setError('');
                  setSuccessMessage('');
                }}
                className="w-full text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Back to Sign In
              </button>
            </form>
          </div>
        ) : (
          <div className="p-8 space-y-6">
            <div className="flex justify-center space-x-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setError('');
                }}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  authMode === 'signin'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setError('');
                }}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  authMode === 'signup'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="min-h-[60px]">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}
            </div>

            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
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
                    type="button"
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
            )}

            <form onSubmit={authMode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none transition-all"
                />
              </div>

              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none transition-all"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Please wait...' : authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {authMode === 'signin' && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setError('');
                  }}
                  className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
