import React, { useState } from 'react';
import { X, UserPlus, GraduationCap, CheckCircle2 } from 'lucide-react';
import type { TeacherProfile } from '../../../data/teachersData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddTeacher: (teacher: TeacherProfile) => void;
  suggestedId: string;
}

export const AddTeacherModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAddTeacher,
  suggestedId
}) => {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Science & Technology');
  const [departmentCode, setDepartmentCode] = useState<'SCI_TECH' | 'COMMERCE' | 'MGMT' | 'ARTS'>('SCI_TECH');
  const [subjectsStr, setSubjectsStr] = useState('');
  const [room, setRoom] = useState('Faculty Wing A-305');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'Active' | 'On Leave'>('Active');

  if (!isOpen) return null;

  const handleDeptChange = (deptName: string) => {
    setDepartment(deptName);
    if (deptName === 'Science & Technology') {
      setDepartmentCode('SCI_TECH');
      setRoom('Faculty Wing A-3' + suggestedId.slice(-2));
    } else if (deptName === 'Commerce') {
      setDepartmentCode('COMMERCE');
      setRoom('Faculty Wing B-2' + suggestedId.slice(-2));
    } else if (deptName === 'Management') {
      setDepartmentCode('MGMT');
      setRoom('Faculty Wing C-1' + suggestedId.slice(-2));
    } else {
      setDepartmentCode('ARTS');
      setRoom('Faculty Wing D-1' + suggestedId.slice(-2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const subjects = subjectsStr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const generatedEmail = email.trim() || `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}.${suggestedId.toLowerCase()}@campus.edu`;

    const newTeacher: TeacherProfile = {
      id: suggestedId,
      name: name.trim(),
      title: `Prof. ${name.trim()}`,
      department,
      departmentCode,
      subjects: subjects.length > 0 ? subjects : ['General Academics'],
      email: generatedEmail,
      room: room.trim() || 'Faculty Cabin',
      status
    };

    onAddTeacher(newTeacher);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={20} color="#0D9488" />
            <h3 className="modal-title">Add Official Faculty Member</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label>Assigned Teacher ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={suggestedId}
                  disabled
                  style={{ background: '#F1F5F9', fontWeight: 700, fontFamily: 'monospace' }}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select 
                  className="form-control"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Teacher Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Ramesh Kulkarni"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Academic Department</label>
                <select 
                  className="form-control"
                  value={department}
                  onChange={(e) => handleDeptChange(e.target.value)}
                >
                  <option value="Science & Technology">Science &amp; Technology (SCI_TECH)</option>
                  <option value="Commerce">Commerce (COMMERCE)</option>
                  <option value="Management">Management (MGMT)</option>
                  <option value="Arts">Arts (ARTS)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Cabin / Faculty Room</label>
                <input
                  type="text"
                  className="form-control"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Specialized Subjects (comma-separated)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Data Structures, Python, Cyber Security"
                value={subjectsStr}
                onChange={(e) => setSubjectsStr(e.target.value)}
                required
              />
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                Enter one or more subjects this teacher is qualified to teach.
              </span>
            </div>

            <div className="form-group">
              <label>Campus Email (optional - will auto-generate if empty)</label>
              <input
                type="email"
                className="form-control"
                placeholder={`e.g. name.${suggestedId.toLowerCase()}@campus.edu`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ background: '#0D9488', borderColor: '#0D9488' }}>
              <UserPlus size={16} />
              <span>Register Faculty Member</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
