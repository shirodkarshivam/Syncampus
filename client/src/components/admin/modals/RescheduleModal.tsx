import React, { useState } from 'react';
import { X, CalendarClock, Users, RefreshCw } from 'lucide-react';
import type { Lecture } from '../../../data/mockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lecture: Lecture | null;
  onConfirmReschedule: (id: string, newTime: string, newRoom: string) => void;
}

export const RescheduleModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lecture,
  onConfirmReschedule
}) => {
  const [newTime, setNewTime] = useState('02:00 - 03:00');
  const [newRoom, setNewRoom] = useState('Room 305');

  if (!isOpen || !lecture) return null;

  const handleConfirm = () => {
    onConfirmReschedule(lecture.id, newTime, newRoom);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarClock size={20} color="#2563EB" />
            <h3 className="modal-title">Reschedule Lecture?</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
              {lecture.subject}
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {lecture.course} • Semester {lecture.semester} • Division {lecture.division}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>
                {lecture.time}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lecture.room}</div>
            </div>

            <div style={{ background: '#EFF6FF', padding: '12px 14px', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#1D4ED8', textTransform: 'uppercase' }}>New Schedule</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1D4ED8', marginTop: '4px' }}>
                {newTime}
              </div>
              <div style={{ fontSize: '12px', color: '#2563EB' }}>{newRoom}</div>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Select New Time</label>
              <select 
                className="form-control" 
                value={newTime} 
                onChange={(e) => setNewTime(e.target.value)}
              >
                <option value="09:00 - 10:00">09:00 - 10:00 AM</option>
                <option value="11:00 - 12:00">11:00 - 12:00 PM</option>
                <option value="01:00 - 02:00">01:00 - 02:00 PM</option>
                <option value="02:00 - 03:00">02:00 - 03:00 PM</option>
                <option value="03:00 - 04:00">03:00 - 04:00 PM</option>
              </select>
            </div>

            <div className="form-group">
              <label>Select New Room</label>
              <select 
                className="form-control" 
                value={newRoom} 
                onChange={(e) => setNewRoom(e.target.value)}
              >
                <option value="Room 305">Room 305 (Cap: 65)</option>
                <option value="Room 101">Room 101 (Cap: 60)</option>
                <option value="Room 302">Room 302 (Cap: 65)</option>
                <option value="Computer Lab 2">Computer Lab 2 (Cap: 40)</option>
                <option value="Auditorium 1">Auditorium 1 (Cap: 250)</option>
              </select>
            </div>
          </div>

          {/* Section 18: Important Impact Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#FEF3C7',
            border: '1px solid #FDE68A',
            padding: '12px 14px',
            borderRadius: '10px',
            color: '#92400E',
            fontSize: '13px',
            fontWeight: 600
          }}>
            <Users size={18} />
            <span>142 students &amp; teacher will be automatically synchronized and notified.</span>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleConfirm}>
            <RefreshCw size={15} />
            <span>Confirm Change</span>
          </button>
        </div>
      </div>
    </div>
  );
};
