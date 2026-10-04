import React, { useState } from 'react';
import { Calendar, Clock, DoorOpen, Users } from 'lucide-react';
import type { Lecture } from '../../../data/mockData';

interface Props {
  lectures: Lecture[];
  onOpenReschedule: (lec: Lecture) => void;
  onOpenChangeRoom: (lec: Lecture) => void;
  onOpenCancel: (lec: Lecture) => void;
}

export const TeacherTimetableView: React.FC<Props> = ({
  lectures,
  onOpenReschedule,
  onOpenChangeRoom,
  onOpenCancel
}) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [selectedDay, setSelectedDay] = useState('Monday');

  const dayLectures = lectures.filter((l) => l.day === selectedDay);

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="greeting-title">My Weekly Timetable</h1>
          <p className="teacher-dept-sub">
            Review your weekly teaching schedule, room allocations, and manage active sessions.
          </p>
        </div>
      </div>

      {/* Day Tabs (Section 9: Mon | Tue | Wed | Thu | Fri | Sat) */}
      <div className="day-tabs-bar">
        {days.map((day) => (
          <button
            key={day}
            className={`day-tab-btn ${selectedDay === day ? 'active' : ''}`}
            onClick={() => setSelectedDay(day)}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Subject</th>
              <th>Class &amp; Division</th>
              <th>Room</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dayLectures.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No lectures scheduled for {selectedDay}.
                </td>
              </tr>
            ) : (
              dayLectures.map((lec) => (
                <tr key={lec.id}>
                  <td style={{ fontWeight: 600 }}>{lec.time}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{lec.subject}</div>
                  </td>
                  <td>{lec.course} &bull; Sem {lec.semester} &bull; Div {lec.division}</td>
                  <td>
                    <span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '6px', fontWeight: 500 }}>
                      {lec.room}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${lec.status}`}>
                      {lec.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="row-actions-group" style={{ justifyContent: 'flex-end' }}>
                      <button 
                        className="action-chip" 
                        onClick={() => onOpenChangeRoom(lec)}
                      >
                        Room
                      </button>
                      <button 
                        className="action-chip" 
                        onClick={() => onOpenReschedule(lec)}
                      >
                        Reschedule
                      </button>
                      {lec.status !== 'Cancelled' && (
                        <button 
                          className="action-chip danger" 
                          onClick={() => onOpenCancel(lec)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
