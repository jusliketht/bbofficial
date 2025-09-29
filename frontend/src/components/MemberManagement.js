// =====================================================
// MEMBER MANAGEMENT COMPONENT
// =====================================================

import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useAuth } from '../../contexts/AuthContext';
import memberService from '../../services/memberService';
import { enterpriseLogger } from '../../utils/logger';
import toast from 'react-hot-toast';

const MemberManagement = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    panNumber: '',
    dateOfBirth: '',
    relationship: 'other',
    gender: 'male',
    maritalStatus: 'single',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    }
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await memberService.getMembers();
      setMembers(response.data || []);
    } catch (error) {
      enterpriseLogger.error('Failed to load members', { error: error.message });
      toast.error('Failed to load members');
      
      // Fallback to mock data if API fails
      const mockMembers = [
        {
          id: '1',
          firstName: user?.fullName?.split(' ')[0] || 'Self',
          lastName: user?.fullName?.split(' ')[1] || 'User',
          panNumber: 'ABCDE1234F',
          dateOfBirth: '1990-01-01',
          relationship: 'self',
          gender: 'male',
          maritalStatus: 'single',
          panVerified: true,
          createdAt: new Date().toISOString()
        }
      ];
      setMembers(mockMembers);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    setFormData({
      firstName: '',
      lastName: '',
      panNumber: '',
      dateOfBirth: '',
      relationship: 'other',
      gender: 'male',
      maritalStatus: 'single',
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      }
    });
    setEditingMember(null);
    setShowAddModal(true);
  };

  const handleEditMember = (member) => {
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      panNumber: member.panNumber,
      dateOfBirth: member.dateOfBirth,
      relationship: member.relationship,
      gender: member.gender,
      maritalStatus: member.maritalStatus,
      phone: member.phone || '',
      email: member.email || '',
      address: member.address || {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      }
    });
    setEditingMember(member);
    setShowAddModal(true);
  };

  const handleSaveMember = async () => {
    try {
      if (editingMember) {
        await memberService.updateMember(editingMember.id, formData);
        toast.success('Member updated successfully');
      } else {
        await memberService.createMember(formData);
        toast.success('Member added successfully');
      }
      
      setShowAddModal(false);
      loadMembers(); // Reload members
    } catch (error) {
      enterpriseLogger.error('Failed to save member', { error: error.message });
      toast.error('Failed to save member');
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await memberService.deleteMember(memberId);
        toast.success('Member deleted successfully');
        loadMembers(); // Reload members
      } catch (error) {
        enterpriseLogger.error('Failed to delete member', { error: error.message });
        toast.error('Failed to delete member');
      }
    }
  };

  const verifyPAN = async (memberId) => {
    try {
      await memberService.verifyPAN(memberId);
      toast.success('PAN verification initiated');
      loadMembers(); // Reload to get updated verification status
    } catch (error) {
      enterpriseLogger.error('PAN verification failed', { error: error.message });
      toast.error('Failed to verify PAN');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getRelationshipLabel = (relationship) => {
    const labels = {
      self: 'Self',
      spouse: 'Spouse',
      son: 'Son',
      daughter: 'Daughter',
      father: 'Father',
      mother: 'Mother',
      other: 'Other'
    };
    return labels[relationship] || 'Other';
  };

  if (loading) {
    return (
      <div className="member-management loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="member-management">
      <div className="page-header">
        <h1>Family Members</h1>
        <p>Manage family members for ITR filing (up to 5 members)</p>
        <Button
          variant="primary"
          onClick={handleAddMember}
          disabled={members.length >= 5}
        >
          Add Member ({members.length}/5)
        </Button>
      </div>

      <div className="members-grid">
        {members.map((member) => (
          <Card key={member.id} className="member-card">
            <div className="member-header">
              <h3>{member.firstName} {member.lastName}</h3>
              <div className="member-badges">
                <span className={`pan-status ${member.panVerified ? 'verified' : 'unverified'}`}>
                  {member.panVerified ? '✓ PAN Verified' : '⚠ PAN Unverified'}
                </span>
                <span className="relationship-badge">
                  {getRelationshipLabel(member.relationship)}
                </span>
              </div>
            </div>
            
            <div className="member-details">
              <p><strong>PAN:</strong> {member.panNumber}</p>
              <p><strong>DOB:</strong> {formatDate(member.dateOfBirth)} ({getAge(member.dateOfBirth)} years)</p>
              <p><strong>Gender:</strong> {member.gender}</p>
              <p><strong>Marital Status:</strong> {member.maritalStatus}</p>
              {member.phone && <p><strong>Phone:</strong> {member.phone}</p>}
              {member.email && <p><strong>Email:</strong> {member.email}</p>}
            </div>

            <div className="member-actions">
              <Button
                variant="secondary"
                size="small"
                onClick={() => handleEditMember(member)}
              >
                Edit
              </Button>
              
              {!member.panVerified && (
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => verifyPAN(member.id)}
                >
                  Verify PAN
                </Button>
              )}
              
              {member.relationship !== 'self' && (
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => handleDeleteMember(member.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {members.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No Family Members Added</h3>
          <p>Add family members to file ITR for them</p>
          <Button
            variant="primary"
            onClick={handleAddMember}
          >
            Add First Member
          </Button>
        </div>
      )}

      {/* Add/Edit Member Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingMember ? 'Edit Member' : 'Add New Member'}
        size="large"
      >
        <div className="member-form">
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>PAN Number *</label>
              <input
                type="text"
                value={formData.panNumber}
                onChange={(e) => setFormData({...formData, panNumber: e.target.value.toUpperCase()})}
                placeholder="ABCDE1234F"
                maxLength="10"
                required
              />
            </div>
            <div className="form-group">
              <label>Date of Birth *</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Relationship *</label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                required
              >
                <option value="self">Self</option>
                <option value="spouse">Spouse</option>
                <option value="son">Son</option>
                <option value="daughter">Daughter</option>
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+91 9876543210"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="member@example.com"
              />
            </div>
          </div>

          <div className="form-actions">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveMember}
            >
              {editingMember ? 'Update Member' : 'Add Member'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MemberManagement;
