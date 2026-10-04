import React, { useState, useEffect } from 'react';
import { Calendar, Clock, DoorOpen, Users, Grid, List, CheckCircle2 } from 'lucide-react';
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
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  // On mobile viewports (< 768px), default directly to sleek Daily Schedule List view
  const [viewType, setViewType] = useState<'grid' | 'daily'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'daily';
    }
    return 'grid';
  });

  const [selectedDay, setSelectedDay] = useState(() => {
    const dayIndex = new Date().getDay();
    const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const cur = names[dayIndex];
    return days.includes(cur) ? cur : 'Monday';
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // Auto-adapt to daily list on mobile if user resizes window down
        setViewType(prev => (prev === 'grid' ? 'daily' : prev));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const periods = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '01:00 - 02:00',
    '02:00 - 03:00'
  ];

  const dayLectures = lectures.filter((l) => l.day === selectedDay);

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="greeting-title" style={{ margin: 0 }}>Faculty Weekly Timetable</h1>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '12px',
              background: '#DCFCE7',
              color: '#15803D',
              border: '1px solid #BBF7D0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <CheckCircle2 size={13} color="#16A34A" />
              Verified &amp; Synchronized
            </span>
          </div>
          <p className="teacher-dept-sub" style={{ marginTop: '4px' }}>
            Central campus schedule &bull; {lectures.length} Weekly Teaching Sessions &bull; 0 Overlapping Periods
          </p>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '10px', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setViewType('grid')}
            style={{
              border: 'none',
              background: viewType === 'grid' ? '#FFFFFF' : 'transparent',
              color: viewType === 'grid' ? '#0D9488' : 'var(--text-muted)',
              fontWeight: viewType === 'grid' ? 700 : 500,
              fontSize: '12px',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: viewType === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Grid size={15} />
            <span>Weekly Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewType('daily')}
            style={{
              border: 'none',
              background: viewType === 'daily' ? '#FFFFFF' : 'transparent',
              color: viewType === 'daily' ? '#0D9488' : 'var(--text-muted)',
              fontWeight: viewType === 'daily' ? 700 : 500,
              fontSize: '12px',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: viewType === 'daily' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <List size={15} />
            <span>Daily Schedule</span>
          </button>
        </div>
      </div>

      {viewType === 'grid' ? (
        /* 5x5 Faculty Timetable Grid */
        <div className="content-box-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '920px', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-main)', width: '140px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={15} color="#0D9488" />
                      <span>Period / Time</span>
                    </div>
                  </th>
                  {days.map(d => (
                    <th key={d} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-main)' }}>
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((slot, sIdx) => {
                  const isPostLunch = sIdx === 3;
                  return (
                    <React.Fragment key={slot}>
                      {isPostLunch && (
                        <tr style={{ background: '#FFFBEB', borderTop: '1px solid #FEF3C7', borderBottom: '1px solid #FEF3C7' }}>
                          <td colSpan={6} style={{ padding: '8px 16px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#B45309', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            🍴 12:00 PM – 01:00 PM &bull; Faculty &amp; Campus Recess
                          </td>
                        </tr>
                      )}
                      <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '14px 16px', background: '#F8FAFC', fontWeight: 700, color: 'var(--text-muted)', fontSize: '12px', verticalAlign: 'top', borderRight: '1px solid #E2E8F0' }}>
                          <div style={{ color: '#0D9488', fontWeight: 800 }}>Period {sIdx + 1}</div>
                          <div style={{ marginTop: '2px', color: 'var(--text-main)' }}>{slot}</div>
                        </td>
                        {days.map(d => {
                          const match = lectures.find(l => l.day === d && l.time === slot);
                          return (
                            <td key={d} style={{ padding: '10px 12px', verticalAlign: 'top', borderRight: '1px solid #F1F5F9', background: match ? '#FFFFFF' : '#FAFAFA' }}>
                              {match ? (
                                <div style={{
                                  background: '#F0FDFA',
                                  border: '1px solid #99F6E4',
                                  borderRadius: '8px',
                                  padding: '10px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '6px'
                                }}>
                                  <div style={{ fontWeight: 700, color: '#0F766E', fontSize: '12.5px', lineHeight: '1.3' }}>
                                    {match.subject}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#134E4A', fontWeight: 600 }}>
                                    <Users size={12} color="#0D9488" />
                                    <span>{match.course} (Div {match.division})</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                                    <span style={{
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      background: '#FFFFFF',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      border: '1px solid #CCFBF1',
                                      color: '#0F766E'
                                    }}>
                                      {match.room}
                                    </span>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                      <button 
                                        className="action-chip" 
                                        style={{ fontSize: '10px', padding: '2px 6px' }}
                                        onClick={() => onOpenReschedule(match)}
                                      >
                                        Edit
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ color: '#94A3B8', fontSize: '11px', fontStyle: 'italic', padding: '8px' }}>
                                  Office Hours / Prep
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Daily View */
        <div>
          <div className="day-tabs-bar" style={{ marginBottom: '16px' }}>
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
                  <th>Period &amp; Time</th>
                  <th>Subject</th>
                  <th>Course &amp; Division</th>
                  <th>Assigned Classroom</th>
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
      )}
    </div>
  );
};
