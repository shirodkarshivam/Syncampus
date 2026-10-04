import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  HelpCircle, 
  LogOut, 
  User, 
  Phone, 
  AlertCircle, 
  Upload, 
  Trash2, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Camera,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import type { TeacherProfile } from '../../../data/teachersData';
import { 
  getUserProfile, 
  saveUserProfile, 
  changeUserPassword, 
  UserProfile 
} from '../../../data/userProfileStore';

interface Props {
  onLogout: () => void;
  email: string;
  teacher?: TeacherProfile;
}

export const TeacherProfileView: React.FC<Props> = ({ onLogout, email, teacher }) => {
  const name = teacher ? teacher.title : 'Prof. Rahul Patil';
  const dept = teacher ? teacher.department : 'Science & Technology';
  const id = teacher ? teacher.id : 'T001';
  const room = teacher ? teacher.room : 'Faculty Wing A-301';
  const status = teacher ? teacher.status : 'Active';
  const subjects = teacher?.subjects && teacher.subjects.length > 0 
    ? teacher.subjects 
    : ['Database Systems', 'DBMS'];
  const displayEmail = teacher?.email || email || 'rahul.patil.t001@campus.edu';
  const userKey = teacher?.email || teacher?.id || email;

  // Profile data from userProfileStore
  const [profile, setProfile] = useState<UserProfile>(() => getUserProfile(userKey));
  const [contactNumber, setContactNumber] = useState<string>(profile.contactNumber);
  const [emergencyContact, setEmergencyContact] = useState<string>(profile.emergencyContact);
  const [contactSuccessMsg, setContactSuccessMsg] = useState<string | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; error: boolean } | null>(null);

  // File upload ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loaded = getUserProfile(userKey);
    setProfile(loaded);
    setContactNumber(loaded.contactNumber);
    setEmergencyContact(loaded.emergencyContact);
  }, [userKey]);

  const initials = teacher
    ? teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'RP';

  // Handle Avatar Upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Selected image size exceeds 2MB limit. Please choose a smaller picture.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      if (base64) {
        const updated = saveUserProfile(userKey, { avatarUrl: base64 });
        setProfile(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    const updated = saveUserProfile(userKey, { avatarUrl: '' });
    setProfile(updated);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle Contact Info Update
  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactNumber.trim()) {
      alert('Please enter a valid faculty contact phone number.');
      return;
    }
    const updated = saveUserProfile(userKey, {
      contactNumber: contactNumber.trim(),
      emergencyContact: emergencyContact.trim()
    });
    setProfile(updated);
    setContactSuccessMsg('Faculty contact and emergency records saved!');
    setTimeout(() => setContactSuccessMsg(null), 3500);
  };

  // Handle Password Change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordMsg({ text: 'Please enter your current password.', error: true });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'New password must be at least 6 characters long.', error: true });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New password and confirmation do not match.', error: true });
      return;
    }

    const res = changeUserPassword(userKey, currentPassword, newPassword);
    if (res.success) {
      setPasswordMsg({ text: res.message, error: false });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(null), 4000);
    } else {
      setPasswordMsg({ text: res.message, error: true });
    }
  };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="greeting-title">Faculty Profile &amp; Preferences</h1>
          <p className="teacher-dept-sub">
            Verified academic credentials, contact info, photo avatar, and security authentication.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '760px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        
        {/* Main Profile & Avatar Card */}
        <div className="content-box-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  background: profile.avatarUrl ? `url(${profile.avatarUrl}) center/cover no-repeat` : '#CCFBF1',
                  color: profile.avatarUrl ? 'transparent' : '#0F766E',
                  fontSize: '24px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.15)',
                  border: '2px solid #FFFFFF'
                }}>
                  {!profile.avatarUrl && initials}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload faculty profile picture"
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#0D9488',
                    color: '#FFFFFF',
                    border: '2px solid #FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}
                >
                  <Camera size={14} />
                </button>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    {name}
                  </h2>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: status === 'Active' ? '#DCFCE7' : '#FEF3C7',
                    color: status === 'Active' ? '#15803D' : '#B45309'
                  }}>
                    ● {status}
                  </span>
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Department of {dept} &bull; ID: {id}
                </div>
              </div>
            </div>

            {/* Avatar Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
              <button
                type="button"
                className="secondary-btn"
                onClick={() => fileInputRef.current?.click()}
                style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
              >
                <Upload size={14} />
                <span>Upload Avatar</span>
              </button>
              {profile.avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  title="Remove uploaded avatar"
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #FECACA',
                    background: '#FEF2F2',
                    color: '#DC2626',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Employee ID
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>
                {id}
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Faculty Cabin / Room
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>
                {room}
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Academic Department
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>
                {dept}
              </div>
            </div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Registered Campus Email
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px', wordBreak: 'break-all' }}>
              {displayEmail}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Specialized Teaching Subjects ({subjects.length})
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {subjects.map((sub, idx) => (
                <span 
                  key={idx} 
                  style={{ 
                    background: '#EFF6FF', 
                    color: '#1D4ED8', 
                    padding: '6px 14px', 
                    borderRadius: '8px', 
                    fontSize: '13px', 
                    fontWeight: 500,
                    border: '1px solid #DBEAFE'
                  }}
                >
                  {sub}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Information & Emergency Contact Card */}
        <div className="content-box-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: '#F0FDFA', color: '#0D9488', padding: '8px', borderRadius: '10px' }}>
              <Phone size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Faculty Contact &amp; Emergency Details
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Used for instant schedule change notifications, room reallocation alerts, and official campus queries.
              </p>
            </div>
          </div>

          {contactSuccessMsg && (
            <div style={{
              background: '#DCFCE7',
              color: '#15803D',
              border: '1px solid #BBF7D0',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <CheckCircle2 size={16} />
              <span>{contactSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveContact}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Mobile / Official Contact Number
                </label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+91 98201 44521"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Emergency Contact (Next of Kin / Alternate Contact)
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="+91 98200 11223 (Spouse / Home)"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="submit" 
                className="primary-btn" 
                style={{ padding: '9px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', background: '#0D9488', borderColor: '#0D9488' }}
              >
                <CheckCircle2 size={16} />
                <span>Save Contact Details</span>
              </button>
            </div>
          </form>
        </div>

        {/* Change Login Password Card */}
        <div className="content-box-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: '#FEF3C7', color: '#D97706', padding: '8px', borderRadius: '10px' }}>
              <KeyRound size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Change Login Password
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Update your faculty portal password (default initial password: password123).
              </p>
            </div>
          </div>

          {passwordMsg && (
            <div style={{
              background: passwordMsg.error ? '#FEE2E2' : '#DCFCE7',
              color: passwordMsg.error ? '#991B1B' : '#15803D',
              border: `1px solid ${passwordMsg.error ? '#FECACA' : '#BBF7D0'}`,
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              {passwordMsg.error ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Current Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 36px 10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748B'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  New Password (min 6 chars)
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="submit" 
                className="primary-btn" 
                style={{ padding: '9px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', background: '#0D9488', borderColor: '#0D9488' }}
              >
                <ShieldCheck size={16} />
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>

        {/* Options */}
        <div className="content-box-card" style={{ padding: '10px 16px' }}>
          <button 
            className="nav-item-btn" 
            style={{ padding: '12px 14px' }}
            onClick={() => alert('Faculty Policy: Academic credentials are maintained by the Dean of Academics.')}
          >
            <Settings size={18} />
            <span>Faculty Handbook &amp; Guidelines</span>
          </button>
          <button 
            className="nav-item-btn" 
            style={{ padding: '12px 14px' }}
            onClick={() => alert('Academic Support: Contact dean.academics@sonopantcollege.edu.in')}
          >
            <HelpCircle size={18} />
            <span>Help &amp; Campus Support</span>
          </button>
          <button 
            className="nav-item-btn" 
            style={{ padding: '12px 14px', color: '#DC2626' }}
            onClick={onLogout}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
