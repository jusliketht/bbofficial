// =====================================================
// SESSION MANAGEMENT COMPONENT
// =====================================================

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Monitor, 
  Smartphone, 
  Tablet, 
  MapPin, 
  Clock, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiClient from '../services/apiClient';

const SessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revokingSession, setRevokingSession] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/auth/sessions');
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId) => {
    try {
      setRevokingSession(sessionId);
      await apiClient.delete(`/auth/sessions/${sessionId}`);
      toast.success('Session revoked successfully');
      loadSessions();
    } catch (error) {
      console.error('Failed to revoke session:', error);
      toast.error('Failed to revoke session');
    } finally {
      setRevokingSession(null);
    }
  };

  const revokeAllSessions = async () => {
    if (!window.confirm('Are you sure you want to revoke all sessions? This will log you out of all devices.')) {
      return;
    }

    try {
      await apiClient.post('/auth/revoke-all');
      toast.success('All sessions revoked successfully');
      loadSessions();
    } catch (error) {
      console.error('Failed to revoke all sessions:', error);
      toast.error('Failed to revoke all sessions');
    }
  };

  const getDeviceIcon = (userAgent) => {
    if (userAgent.includes('Mobile')) {
      return <Smartphone className="w-5 h-5" />;
    } else if (userAgent.includes('Tablet')) {
      return <Tablet className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  const getDeviceName = (userAgent) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const isCurrentSession = (session) => {
    // This would need to be implemented based on how you identify the current session
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Active Sessions</h2>
          <p className="text-gray-600 mt-1">
            Manage your active sessions across different devices
          </p>
        </div>
        <button
          onClick={revokeAllSessions}
          className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Revoke All
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Sessions</h3>
          <p className="text-gray-600">You don't have any active sessions.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`bg-white rounded-lg border p-6 ${
                isCurrentSession(session) ? 'border-primary-200 bg-primary-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getDeviceIcon(session.deviceInfo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {getDeviceName(session.deviceInfo)}
                      </h3>
                      {isCurrentSession(session) && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {session.deviceInfo}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {session.ipAddress}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Last active: {formatDate(session.lastActive)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!isCurrentSession(session) && (
                    <button
                      onClick={() => revokeSession(session.id)}
                      disabled={revokingSession === session.id}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {revokingSession === session.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      ) : (
                        <>
                          <X className="w-4 h-4 mr-1" />
                          Revoke
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Security Notice
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              If you notice any suspicious activity or unrecognized sessions, 
              revoke them immediately and change your password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionManagement;
