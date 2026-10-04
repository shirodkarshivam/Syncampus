import React, { useState } from 'react';
import { X, UserPlus, GraduationCap } from 'lucide-react';
import type { Student } from '../../../data/studentsData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (student: Student) => void;
  suggestedId: string;
}

export const AddStudentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAddStudent,
  suggestedId
}) => {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Science & Technology');
  const [course, setCourse] = useState('BSc IT');
  const [year, setYear] = useState('FY');
  const [division, setDivision] = useState('A');
  const [classroom, setClassroom] = useState('Room 101');
  const [batch, setBatch] = useState('A');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleDeptChange = (dept: string) => {
    setDepartment(dept);
    if (dept === 'Science & Technology') {
      setCourse('BSc IT');
      setClassroom('Room 101');
    } else if (dept === 'Commerce') {
      setCourse('B.Com');
      setClassroom('Room 201');
    } else if (dept === 'Management') {
      setCourse('BBA');
      setClassroom('Room 301');
    } else {
      setCourse('BA');
      setClassroom('Room 401');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const generatedEmail = email.trim() || `${suggestedId.toLowerCase()}@sonopantcollege.edu.in`;

    const newStudent: Student = {
      id: suggestedId,
      name: name.trim(),
      department,
      course,
      year,
      division,
      classroom: classroom.trim() || 'Room 101',
      batch,
      email: generatedEmail,
      status: 'Enrolled'
    };

    onAddStudent(newStudent);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={20} color="#2563EB" />
            <h3 className="modal-title">Enroll New Student</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label>Assigned Student ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={suggestedId}
                  disabled
                  style={{ background: '#F1F5F9', fontWeight: 700, fontFamily: 'monospace' }}
                />
              </div>

              <div className="form-group">
                <label>Student Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Ananya Deshmukh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Department</label>
                <select 
                  className="form-control"
                  value={department}
                  onChange={(e) => handleDeptChange(e.target.value)}
                >
                  <option value="Science & Technology">Science &amp; Technology</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Management">Management</option>
                  <option value="Arts">Arts</option>
                </select>
              </div>

              <div className="form-group">
                <label>Degree Course</label>
                <select 
                  className="form-control"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                >
                  {department === 'Science & Technology' && (
                    <>
                      <option value="BSc IT">BSc IT</option>
                      <option value="BSc CS">BSc CS</option>
                    </>
                  )}
                  {department === 'Commerce' && (
                    <>
                      <option value="B.Com">B.Com</option>
                      <option value="BFM">BFM</option>
                      <option value="BBI">BBI</option>
                      <option value="BMS">BMS</option>
                    </>
                  )}
                  {department === 'Management' && (
                    <option value="BBA">BBA</option>
                  )}
                  {department === 'Arts' && (
                    <option value="BA">BA</option>
                  )}
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Academic Year</label>
                <select 
                  className="form-control"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  <option value="FY">First Year (FY)</option>
                  <option value="SY">Second Year (SY)</option>
                  <option value="TY">Third Year (TY)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Division</label>
                <select 
                  className="form-control"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                >
                  <option value="A">Division A</option>
                  <option value="B">Division B</option>
                  <option value="C">Division C</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Assigned Classroom</label>
                <input
                  type="text"
                  className="form-control"
                  value={classroom}
                  onChange={(e) => setClassroom(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Practical Batch</label>
                <select 
                  className="form-control"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                >
                  <option value="A">Batch A</option>
                  <option value="B">Batch B</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>College Email (optional)</label>
              <input
                type="email"
                className="form-control"
                placeholder={`${suggestedId.toLowerCase()}@sonopantcollege.edu.in`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <UserPlus size={16} />
              <span>Enroll Student</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
