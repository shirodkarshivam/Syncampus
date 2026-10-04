import React, { useState, useMemo, useEffect } from 'react';
import { X, CalendarClock, Users, AlertTriangle, CheckCircle2, DoorOpen } from 'lucide-react';
import type { Lecture } from '../../../data/mockData';
import { INITIAL_CLASSROOMS } from '../../../data/mockData';
import { timetableStore } from '../../../data/timetableStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lecture: Lecture | null;
  onConfirmReschedule: (id: string, newTime: string, newRoom: string) => void;
}

export const TeacherRescheduleModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lecture,
  onConfirmReschedule
}) => {
  const [newTime, setNewTime] = useState('02:00 - 03:00');
  const [newRoom, setNewRoom] = useState('Room 204');

  const standardPeriods = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '01:00 - 02:00',
    '02:00 - 03:00'
  ];

  // Initialize
  useEffect(() => {
    if (lecture) {
      setNewTime(lecture.time);
      setNewRoom(lecture.room);
    }
  }, [lecture]);

  // Real-time conflict checking
  const conflictResult = useMemo(() => {
    if (!lecture) return { hasConflict: false, conflict: undefined, conflicts: [] };
    return timetableStore.checkConflict({
      lectureId: lecture.id,
      day: lecture.day,
      time: newTime,
      room: newRoom,
      teacher: lecture.teacher,
      divisionKey: lecture.divisionKey
    });
  }, [lecture, newTime, newRoom]);

  // Compute room occupancy at this new time slot
  const occupancy = useMemo(() => {
    if (!lecture) return { isOccupied: () => undefined };
    return timetableStore.getRoomOccupancy(lecture.day, newTime, lecture.id);
  }, [lecture, newTime]);

  if (!isOpen || !lecture) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (conflictResult.hasConflict) {
      alert(`Timetable Clash: ${conflictResult.conflict?.message}`);
      return;
    }
    onConfirmReschedule(lecture.id, newTime, newRoom);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarClock size={20} color="#2563EB" />
            <h3 className="modal-title">Reschedule Lecture (Conflict-Free)</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  {lecture.subject}
                </h4>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#1E40AF', background: '#DBEAFE', padding: '3px 10px', borderRadius: '12px' }}>
                  {lecture.day}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {lecture.course} &bull; Semester {lecture.semester} &bull; Division {lecture.division}
              </p>
            </div>

            {/* Current vs New preview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Allocation</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>
                  {lecture.time}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lecture.room}</div>
              </div>

              <div style={{ 
                background: conflictResult.hasConflict ? '#FEF2F2' : '#EFF6FF', 
                padding: '12px 14px', 
                borderRadius: '10px', 
                border: conflictResult.hasConflict ? '1px solid #FECACA' : '1px solid #BFDBFE' 
              }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: conflictResult.hasConflict ? '#DC2626' : '#1D4ED8', textTransform: 'uppercase' }}>
                  {conflictResult.hasConflict ? '⚠️ New Allocation (Clash!)' : 'New Schedule Slot'}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: conflictResult.hasConflict ? '#DC2626' : '#1D4ED8', marginTop: '4px' }}>
                  {newTime}
                </div>
                <div style={{ fontSize: '12px', color: conflictResult.hasConflict ? '#DC2626' : '#2563EB', fontWeight: 600 }}>
                  {newRoom}
                </div>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Target Time Slot ({lecture.day})</label>
                <select 
                  className="form-control" 
                  value={newTime} 
                  onChange={(e) => setNewTime(e.target.value)}
                >
                  {standardPeriods.map(p => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Assigned Room</label>
                <select 
                  className="form-control" 
                  value={newRoom} 
                  onChange={(e) => setNewRoom(e.target.value)}
                  style={{
                    borderColor: conflictResult.hasConflict && conflictResult.conflict?.type === 'room' ? '#EF4444' : undefined
                  }}
                >
                  {INITIAL_CLASSROOMS.map(c => {
                    const occ = occupancy.isOccupied(c.name);
                    return (
                      <option key={c.id} value={c.name}>
                        {occ ? `⚠️ ${c.name} (OCCUPIED)` : `✓ ${c.name} (${c.type})`}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Conflict Warning or Clear Status */}
            {conflictResult.hasConflict ? (
              <div style={{
                background: '#FEF2F2',
                border: '1.5px solid #F87171',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991B1B', fontWeight: 700, fontSize: '14px' }}>
                  <AlertTriangle size={18} color="#DC2626" />
                  <span>Timetable Conflict Detected</span>
                </div>
                <div style={{ fontSize: '13px', color: '#7F1D1D', marginTop: '6px', lineHeight: '1.4' }}>
                  {conflictResult.conflict?.message}
                </div>
                <div style={{ fontSize: '12px', color: '#991B1B', marginTop: '6px', fontStyle: 'italic' }}>
                  Please pick another time slot or an unoccupied room to prevent double-booking.
                </div>
              </div>
            ) : (
              <div style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#15803D',
                fontSize: '13px',
                fontWeight: 600
              }}>
                <CheckCircle2 size={16} />
                <span>Verified: Room, faculty, and student cohort are all free at this slot.</span>
              </div>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              padding: '12px 14px',
              borderRadius: '10px',
              color: 'var(--text-muted)',
              fontSize: '12px'
            }}>
              <Users size={16} color="#2563EB" />
              <span>This change will automatically update the master schedule and notify affected students.</span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={conflictResult.hasConflict}
              style={{
                backgroundColor: conflictResult.hasConflict ? '#94A3B8' : '#2563EB',
                cursor: conflictResult.hasConflict ? 'not-allowed' : 'pointer',
                borderColor: conflictResult.hasConflict ? '#94A3B8' : '#2563EB'
              }}
            >
              <span>{conflictResult.hasConflict ? 'Conflict: Resolve First' : 'Confirm Reschedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
