import React, { useState, useEffect, useMemo } from 'react';
import { X, CalendarClock, Users, RefreshCw, AlertTriangle, UserCheck, CheckCircle2 } from 'lucide-react';
import type { Lecture, Classroom } from '../../../data/mockData';
import { TEACHERS_DATA } from '../../../data/teachersData';
import type { TeacherProfile } from '../../../data/teachersData';
import { INITIAL_CLASSROOMS } from '../../../data/mockData';
import { timetableStore } from '../../../data/timetableStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lecture: Lecture | null;
  onConfirmReschedule: (id: string, newTime: string, newRoom: string, newDay?: string, newTeacher?: string) => void;
  onCancelLecture?: (id: string) => void;
  teachers?: TeacherProfile[];
  classrooms?: Classroom[];
}

export const RescheduleModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lecture,
  onConfirmReschedule,
  onCancelLecture,
  teachers = TEACHERS_DATA,
  classrooms = INITIAL_CLASSROOMS
}) => {
  const [newTime, setNewTime] = useState('02:00 - 03:00');
  const [newRoom, setNewRoom] = useState('Room 101');
  const [newDay, setNewDay] = useState('Monday');
  const [newTeacher, setNewTeacher] = useState('');

  useEffect(() => {
    if (lecture) {
      setNewTime(lecture.time);
      setNewRoom(lecture.room);
      setNewDay(lecture.day);
      setNewTeacher(lecture.teacher);
    }
  }, [lecture]);

  // Real-time multi-dimensional conflict checking
  const conflictResult = useMemo(() => {
    if (!lecture) return { hasConflict: false, conflict: undefined, conflicts: [] };
    return timetableStore.checkConflict({
      lectureId: lecture.id,
      day: newDay,
      time: newTime,
      room: newRoom,
      teacher: newTeacher,
      divisionKey: lecture.divisionKey
    });
  }, [lecture, newDay, newTime, newRoom, newTeacher]);

  if (!isOpen || !lecture) return null;

  const handleConfirm = () => {
    if (conflictResult.hasConflict) {
      alert(`Timetable Conflict: ${conflictResult.conflict?.message}`);
      return;
    }
    onConfirmReschedule(lecture.id, newTime, newRoom, newDay, newTeacher);
    onClose();
  };

  const handleCancel = () => {
    if (onCancelLecture) {
      onCancelLecture(lecture.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarClock size={20} color="#2563EB" />
            <h3 className="modal-title">Modify Schedule or Faculty</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                {lecture.subject}
              </h4>
              <span className={`status-badge ${lecture.status}`}>
                {lecture.status}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {lecture.course} &bull; Semester {lecture.semester} &bull; Division {lecture.division}
            </p>
          </div>

          {/* Current vs Proposed Preview */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Allocation</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
                {lecture.day} &bull; {lecture.time}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Room: <strong>{lecture.room}</strong>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Teacher: <strong>{lecture.teacher}</strong>
              </div>
            </div>

            <div style={{ background: '#EFF6FF', padding: '12px 14px', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase' }}>New Synchronized Allocation</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1D4ED8', marginTop: '4px' }}>
                {newDay} &bull; {newTime}
              </div>
              <div style={{ fontSize: '12px', color: '#1E40AF', marginTop: '2px' }}>
                Room: <strong>{newRoom}</strong>
              </div>
              <div style={{ fontSize: '12px', color: '#1E40AF', marginTop: '2px' }}>
                Teacher: <strong>{newTeacher}</strong>
              </div>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Day of Week</label>
              <select 
                className="form-control" 
                value={newDay} 
                onChange={(e) => setNewDay(e.target.value)}
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
              </select>
            </div>

            <div className="form-group">
              <label>Period / Time Slot</label>
              <select 
                className="form-control" 
                value={newTime} 
                onChange={(e) => setNewTime(e.target.value)}
              >
                <option value="09:00 - 10:00">09:00 - 10:00 AM</option>
                <option value="10:00 - 11:00">10:00 - 11:00 AM</option>
                <option value="11:00 - 12:00">11:00 - 12:00 PM</option>
                <option value="01:00 - 02:00">01:00 - 02:00 PM</option>
                <option value="02:00 - 03:00">02:00 - 03:00 PM</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Assigned Classroom / Lab ({classrooms.length} Spaces)</label>
              <select 
                className="form-control" 
                value={newRoom} 
                onChange={(e) => setNewRoom(e.target.value)}
              >
                {classrooms.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.type} &bull; Cap: {c.capacity})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Assigned Faculty ({teachers.length} Teachers)</label>
              <select 
                className="form-control" 
                value={newTeacher} 
                onChange={(e) => setNewTeacher(e.target.value)}
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.title}>
                    {t.title} ({t.department} &bull; {t.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conflict Warning or Verified Banner */}
          {conflictResult.hasConflict ? (
            <div style={{
              background: '#FEF2F2',
              border: '1.5px solid #F87171',
              borderRadius: '10px',
              padding: '12px 14px',
              marginTop: '12px',
              color: '#991B1B'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px' }}>
                <AlertTriangle size={16} color="#DC2626" />
                <span>Timetable Conflict Detected</span>
              </div>
              <div style={{ fontSize: '12px', marginTop: '4px', lineHeight: '1.4' }}>
                {conflictResult.conflict?.message}
              </div>
            </div>
          ) : (
            <div style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '10px',
              padding: '10px 14px',
              marginTop: '12px',
              color: '#15803D',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckCircle2 size={15} />
              <span>Verified conflict-free: Room, faculty, and division are clear.</span>
            </div>
          )}

          {/* Sync Notice */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            padding: '12px 14px',
            borderRadius: '10px',
            color: '#1E40AF',
            fontSize: '13px',
            fontWeight: 500,
            marginTop: '10px'
          }}>
            <Users size={18} color="#2563EB" />
            <span>
              All students in <strong>{lecture.course} {lecture.year || `Sem ${lecture.semester}`} Div {lecture.division}</strong> and faculty <strong>{newTeacher}</strong> will see this update instantly.
            </span>
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            {onCancelLecture && lecture.status !== 'Cancelled' && (
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleCancel}
                style={{ color: '#EF4444', borderColor: '#FCA5A5' }}
              >
                <AlertTriangle size={15} />
                <span>Cancel Lecture</span>
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Close
            </button>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={handleConfirm}
              disabled={conflictResult.hasConflict}
              style={{
                backgroundColor: conflictResult.hasConflict ? '#94A3B8' : undefined,
                cursor: conflictResult.hasConflict ? 'not-allowed' : 'pointer',
                borderColor: conflictResult.hasConflict ? '#94A3B8' : undefined
              }}
            >
              <RefreshCw size={15} />
              <span>{conflictResult.hasConflict ? 'Conflict: Resolve First' : 'Apply & Synchronize'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
