import React, { useState } from 'react';
import { Grid, List, Clock, User, DoorOpen, Calendar, CheckCircle2, AlertTriangle, CalendarClock } from 'lucide-react';
import type { Lecture } from '../../../data/mockData';
import type { Student } from '../../../data/studentsData';

interface Props {
  lectures: Lecture[];
  student?: Student;
}

export const StudentTimetableView: React.FC<Props> = ({ lectures, student }) => {
  const [viewType, setViewType] = useState<'grid' | 'daily'>('grid');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const [selectedDay, setSelectedDay] = useState('Monday');

  const periods = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '01:00 - 02:00',
    '02:00 - 03:00'
  ];

  const dayLectures = lectures.filter((l) => l.day === selectedDay);

  const cancelledCount = lectures.filter(l => l.status === 'Cancelled').length;
  const rescheduledCount = lectures.filter(l => l.status === 'Rescheduled').length;

  const cohortSub = student
    ? `${student.course} • ${student.year} (Division ${student.division}) • Classroom: ${student.classroom} • Conflict-Free Schedule`
    : 'BSc IT • Semester 3 • Division A • Verified Academic Master Timetable';

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="greeting-title" style={{ margin: 0 }}>Weekly Academic Timetable</h1>
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
              Live Synchronized
            </span>
          </div>
          <p className="student-cohort-sub" style={{ marginTop: '4px' }}>
            {cohortSub}
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
              color: viewType === 'grid' ? '#2563EB' : 'var(--text-muted)',
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
              color: viewType === 'daily' ? '#2563EB' : 'var(--text-muted)',
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

      {/* Notice Badges if there are changes */}
      {(cancelledCount > 0 || rescheduledCount > 0) && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {cancelledCount > 0 && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              background: '#FEE2E2',
              color: '#B91C1C',
              padding: '4px 10px',
              borderRadius: '8px',
              border: '1px solid #FCA5A5'
            }}>
              <AlertTriangle size={13} />
              {cancelledCount} Class{cancelledCount > 1 ? 'es' : ''} Cancelled
            </span>
          )}
          {rescheduledCount > 0 && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              background: '#FEF3C7',
              color: '#92400E',
              padding: '4px 10px',
              borderRadius: '8px',
              border: '1px solid #FCD34D'
            }}>
              <CalendarClock size={13} />
              {rescheduledCount} Schedule Adjustment{rescheduledCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {viewType === 'grid' ? (
        /* 5x5 Timetable Grid */
        <div className="content-box-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-main)', width: '140px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={15} color="var(--student-primary)" />
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
                            🍴 12:00 PM – 01:00 PM &bull; Lunch &amp; Campus Recess Break
                          </td>
                        </tr>
                      )}
                      <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '14px 16px', background: '#F8FAFC', fontWeight: 700, color: 'var(--text-muted)', fontSize: '12px', verticalAlign: 'top', borderRight: '1px solid #E2E8F0' }}>
                          <div style={{ color: 'var(--student-primary)', fontWeight: 800 }}>Period {sIdx + 1}</div>
                          <div style={{ marginTop: '2px', color: 'var(--text-main)' }}>{slot}</div>
                        </td>
                        {days.map(d => {
                          const match = lectures.find(l => l.day === d && l.time === slot);
                          if (!match) {
                            return (
                              <td key={d} style={{ padding: '10px 12px', verticalAlign: 'top', borderRight: '1px solid #F1F5F9', background: '#FAFAFA' }}>
                                <div style={{ color: '#94A3B8', fontSize: '11px', fontStyle: 'italic', padding: '8px' }}>
                                  Self-Study / Library
                                </div>
                              </td>
                            );
                          }

                          const isCancelled = match.status === 'Cancelled';
                          const isRescheduled = match.status === 'Rescheduled';

                          return (
                            <td key={d} style={{ padding: '8px 10px', verticalAlign: 'top', borderRight: '1px solid #F1F5F9', background: isCancelled ? '#FEF2F2' : isRescheduled ? '#FFFDF5' : '#FFFFFF' }}>
                              <div style={{
                                background: isCancelled ? '#FEF2F2' : isRescheduled ? '#FFFBEB' : '#F0F9FF',
                                border: `1px solid ${isCancelled ? '#FECACA' : isRescheduled ? '#FDE68A' : '#BAE6FD'}`,
                                borderRadius: '8px',
                                padding: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '5px',
                                transition: 'all 0.15s ease'
                              }}>
                                <div style={{
                                  fontWeight: 700,
                                  color: isCancelled ? '#991B1B' : isRescheduled ? '#92400E' : '#0369A1',
                                  fontSize: '12.5px',
                                  lineHeight: '1.3',
                                  textDecoration: isCancelled ? 'line-through' : 'none'
                                }}>
                                  {match.subject}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: isCancelled ? '#DC2626' : '#334155' }}>
                                  <User size={12} color={isCancelled ? '#DC2626' : '#0284C7'} />
                                  <span>{match.teacher}</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                                  <span style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    background: '#FFFFFF',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    border: '1px solid #E2E8F0',
                                    color: isCancelled ? '#991B1B' : 'var(--text-muted)'
                                  }}>
                                    {match.room}
                                  </span>
                                  <span className={`status-badge ${match.status}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                                    {match.status}
                                  </span>
                                </div>

                                {isCancelled && (
                                  <div style={{ fontSize: '10px', color: '#DC2626', fontWeight: 600, marginTop: '2px' }}>
                                    🚫 Class Cancelled
                                  </div>
                                )}
                                {isRescheduled && (
                                  <div style={{ fontSize: '10px', color: '#D97706', fontWeight: 600, marginTop: '2px' }}>
                                    ⏰ Updated Time/Room
                                  </div>
                                )}
                              </div>
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
        /* Daily List Table View */
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
                  <th>Classroom</th>
                  <th>Assigned Faculty</th>
                  <th>Status &amp; Notes</th>
                </tr>
              </thead>
              <tbody>
                {dayLectures.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No classes scheduled on {selectedDay} 🎉
                    </td>
                  </tr>
                ) : (
                  dayLectures.map((lec) => {
                    const isCancelled = lec.status === 'Cancelled';
                    const isRescheduled = lec.status === 'Rescheduled';

                    return (
                      <tr 
                        key={lec.id}
                        style={{
                          background: isCancelled ? '#FEF2F2' : isRescheduled ? '#FFFBEB' : 'transparent'
                        }}
                      >
                        <td style={{ fontWeight: 600, color: isCancelled ? '#991B1B' : 'inherit' }}>
                          {lec.time}
                        </td>
                        <td>
                          <div 
                            style={{ 
                              fontWeight: 600, 
                              color: isCancelled ? '#991B1B' : 'inherit',
                              textDecoration: isCancelled ? 'line-through' : 'none'
                            }}
                          >
                            {lec.subject}
                          </div>
                          {isCancelled && lec.cancelReason && (
                            <div style={{ fontSize: '11px', color: '#DC2626', marginTop: '2px' }}>
                              Reason: {lec.cancelReason}
                            </div>
                          )}
                          {isRescheduled && lec.originalTime && (
                            <div style={{ fontSize: '11px', color: '#92400E', marginTop: '2px' }}>
                              Original: {lec.originalTime} ({lec.originalRoom})
                            </div>
                          )}
                        </td>
                        <td>
                          <span style={{ 
                            background: '#F1F5F9', 
                            padding: '4px 8px', 
                            borderRadius: '6px', 
                            fontWeight: 600,
                            color: isCancelled ? '#991B1B' : 'inherit'
                          }}>
                            {lec.room}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{lec.teacher}</div>
                          {lec.originalTeacher && lec.originalTeacher !== lec.teacher && (
                            <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>
                              Reassigned (Was: {lec.originalTeacher})
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={`status-badge ${lec.status}`}>
                              {lec.status}
                            </span>
                            {isCancelled && (
                              <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 600 }}>
                                No Attendance Required
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
