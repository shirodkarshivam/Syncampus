import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  DoorOpen, 
  User, 
  Bell, 
  ArrowRight, 
  AlertTriangle,
  CalendarClock,
  RefreshCw,
  CheckCircle2,
  X
} from 'lucide-react';
import type { Lecture } from '../../../data/mockData';
import type { Student } from '../../../data/studentsData';
import type { LectureChangeAlert } from '../../../data/timetableStore';

interface Props {
  student?: Student;
  lectures: Lecture[];
  alerts?: LectureChangeAlert[];
  onDismissAlert?: (id: string) => void;
  defaultDay: string;
  onNavigate: (tab: string) => void;
}

export const StudentHomeView: React.FC<Props> = ({
  student,
  lectures,
  alerts = [],
  onDismissAlert,
  defaultDay = 'Monday',
  onNavigate
}) => {
  const [selectedDay, setSelectedDay] = useState<string>(defaultDay);
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const dayOfWeekIndex = new Date().getDay(); // 0 = Sun, 6 = Sat
  const isWeekend = dayOfWeekIndex === 0 || dayOfWeekIndex === 6;

  const firstName = student ? student.name.split(' ')[0] : 'Student';
  const cohortSub = student
    ? `${student.course} • ${student.year} (Division ${student.division}) • Classroom: ${student.classroom} • Student ID: ${student.id}`
    : 'BSc IT • FY • Division A • Student ID: IT2026001';

  // Lectures for the active selected day
  const displayedLectures = useMemo(() => {
    return lectures.filter(l => l.day === selectedDay);
  }, [lectures, selectedDay]);

  // Specific schedule adjustments affecting this student
  const cancelledLectures = useMemo(() => {
    return lectures.filter(l => l.status === 'Cancelled');
  }, [lectures]);

  const rescheduledLectures = useMemo(() => {
    return lectures.filter(l => l.status === 'Rescheduled');
  }, [lectures]);

  const hasChanges = cancelledLectures.length > 0 || rescheduledLectures.length > 0 || alerts.length > 0;

  return (
    <div>
      {/* Top Greeting (Section 2) */}
      <div className="student-greeting" style={{ marginBottom: '20px' }}>
        <h1 className="greeting-title">Hi, {firstName} 👋</h1>
        <p className="student-cohort-sub">
          {cohortSub}
        </p>
      </div>

      {/* DYNAMIC REAL-TIME SCHEDULE ALERT BANNERS */}
      {hasChanges ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {/* Cancelled Lecture Alert Card */}
          {cancelledLectures.length > 0 && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.05)'
            }}>
              <div style={{
                background: '#FEE2E2',
                color: '#DC2626',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertTriangle size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#991B1B' }}>
                    ⚠️ Lecture Cancellation Alert ({cancelledLectures.length})
                  </h4>
                  <span style={{ fontSize: '10px', fontWeight: 700, background: '#DC2626', color: '#FFF', padding: '2px 8px', borderRadius: '10px' }}>
                    URGENT
                  </span>
                </div>
                <p style={{ margin: '4px 0 8px 0', fontSize: '13px', color: '#B91C1C', lineHeight: '1.4' }}>
                  The following class has been cancelled by faculty / administration. You do not need to attend this period:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {cancelledLectures.map(cl => (
                    <div key={cl.id} style={{
                      background: '#FFFFFF',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #FECACA',
                      fontSize: '12.5px',
                      color: '#7F1D1D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      <div>
                        <strong>{cl.subject}</strong> &bull; {cl.day} ({cl.time}) &bull; Faculty: <strong>{cl.teacher}</strong>
                        {cl.cancelReason && (
                          <div style={{ fontSize: '11px', color: '#991B1B', marginTop: '2px' }}>
                            Reason: {cl.cancelReason}
                          </div>
                        )}
                      </div>
                      <span style={{ fontWeight: 700, color: '#DC2626', fontSize: '11px' }}>
                        CANCELLED
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Rescheduled / Modified Lecture Alert Card */}
          {rescheduledLectures.length > 0 && (
            <div style={{
              background: '#FFFBEB',
              border: '1px solid #FCD34D',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              boxShadow: '0 2px 4px rgba(245, 158, 11, 0.05)'
            }}>
              <div style={{
                background: '#FEF3C7',
                color: '#D97706',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CalendarClock size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#92400E' }}>
                    📢 Timetable Reschedule / Relocation Notice ({rescheduledLectures.length})
                  </h4>
                  <span style={{ fontSize: '10px', fontWeight: 700, background: '#D97706', color: '#FFF', padding: '2px 8px', borderRadius: '10px' }}>
                    UPDATED
                  </span>
                </div>
                <p style={{ margin: '4px 0 8px 0', fontSize: '13px', color: '#B45309', lineHeight: '1.4' }}>
                  A lecture time, room, or assigned teacher has been adjusted for your division:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {rescheduledLectures.map(rl => (
                    <div key={rl.id} style={{
                      background: '#FFFFFF',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #FDE68A',
                      fontSize: '12.5px',
                      color: '#78350F',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      <div>
                        <strong>{rl.subject}</strong> &bull; {rl.day} &bull; Now at: <strong>{rl.time}</strong> in <strong>{rl.room}</strong>
                        {rl.originalTime && (
                          <span style={{ fontSize: '11px', color: '#92400E', marginLeft: '6px' }}>
                            (Was: {rl.originalTime}{rl.originalRoom ? ` in ${rl.originalRoom}` : ''})
                          </span>
                        )}
                        <div style={{ fontSize: '11px', color: '#92400E', marginTop: '2px' }}>
                          Instructor: <strong>{rl.teacher}</strong>
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, color: '#D97706', fontSize: '11px' }}>
                        RESCHEDULED
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Normal Synchronized Status Banner */
        <div className="schedule-alert-banner" style={{ marginBottom: '24px' }}>
          <div className="alert-banner-left">
            <div className="alert-banner-icon">
              <CheckCircle2 size={18} color="#16A34A" />
            </div>
            <div className="alert-banner-text">
              <h4>🔔 Central Timetable Synchronized &amp; Verified</h4>
              <p>
                Your schedule is live with <strong>{student?.classroom || 'designated room'}</strong> and faculty members. No cancellations or changes today.
              </p>
            </div>
          </div>
          <button className="alert-action-btn" onClick={() => onNavigate('timetable')}>
            <span>Weekly Grid</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Main Timetable Card */}
      <div className="timeline-card" style={{ marginBottom: '24px' }}>
        <div className="section-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="section-title" style={{ margin: 0 }}>
                {isWeekend && selectedDay === 'Monday' ? "Upcoming Timetable" : "Today's Timetable"}
              </h3>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '8px',
                background: isWeekend && selectedDay === 'Monday' ? '#FEF3C7' : '#EFF6FF',
                color: isWeekend && selectedDay === 'Monday' ? '#92400E' : '#1D4ED8',
                border: `1px solid ${isWeekend && selectedDay === 'Monday' ? '#FDE68A' : '#BFDBFE'}`
              }}>
                {isWeekend && selectedDay === 'Monday' ? "Weekend • Showing Monday" : selectedDay}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
              Academic schedule &bull; 5 daily periods &bull; {student?.classroom || 'Classroom'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Quick weekday switcher */}
            <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '10px', gap: '2px' }}>
              {weekdays.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDay(d)}
                  style={{
                    border: 'none',
                    background: selectedDay === d ? '#FFFFFF' : 'transparent',
                    color: selectedDay === d ? 'var(--text-main)' : 'var(--text-muted)',
                    fontWeight: selectedDay === d ? 700 : 500,
                    fontSize: '11px',
                    padding: '5px 9px',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    boxShadow: selectedDay === d ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>

            <button 
              className="view-all-link" 
              style={{ margin: 0 }}
              onClick={() => onNavigate('timetable')}
            >
              <span>Weekly Grid</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Timetable Period Rows */}
        <div style={{ marginTop: '20px' }}>
          {displayedLectures.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
              No lectures scheduled for {selectedDay}.
            </div>
          ) : (
            displayedLectures.map((lec, idx) => {
              const isCancelled = lec.status === 'Cancelled';
              const isRescheduled = lec.status === 'Rescheduled';

              return (
                <div 
                  key={lec.id} 
                  className={`student-timeline-row ${isCancelled ? 'cancelled-lecture' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderBottom: idx < displayedLectures.length - 1 ? '1px solid var(--border-light)' : 'none',
                    borderLeft: isCancelled ? '4px solid #EF4444' : isRescheduled ? '4px solid #F59E0B' : '4px solid transparent',
                    background: isCancelled ? '#FEF2F2' : isRescheduled ? '#FFFDF5' : 'transparent',
                    gap: '16px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ minWidth: '110px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={15} color={isCancelled ? '#DC2626' : isRescheduled ? '#D97706' : '#2563EB'} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: isCancelled ? '#B91C1C' : isRescheduled ? '#B45309' : 'var(--text-main)' }}>
                      {lec.time}
                    </span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: isCancelled ? '#991B1B' : 'var(--text-main)',
                      textDecoration: isCancelled ? 'line-through' : 'none'
                    }}>
                      {lec.subject}
                    </div>

                    <div style={{ fontSize: '12px', color: isCancelled ? '#DC2626' : 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={13} color={isCancelled ? '#DC2626' : '#2563EB'} />
                        <strong>{lec.teacher}</strong>
                        {lec.originalTeacher && lec.originalTeacher !== lec.teacher && (
                          <span style={{ color: '#16A34A', fontWeight: 600, fontSize: '11px' }}>(Reassigned)</span>
                        )}
                      </span>
                      <span>&bull;</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <DoorOpen size={13} color={isCancelled ? '#DC2626' : '#2563EB'} />
                        <span>{lec.room}</span>
                        {lec.originalRoom && lec.originalRoom !== lec.room && (
                          <span style={{ color: '#D97706', fontWeight: 600, fontSize: '11px' }}>(Was: {lec.originalRoom})</span>
                        )}
                      </span>
                    </div>

                    {/* Explanatory status subnotes */}
                    {isCancelled && (
                      <div style={{ fontSize: '11.5px', color: '#B91C1C', marginTop: '4px', fontWeight: 600 }}>
                        🚫 Lecture cancelled by instructor/administration {lec.cancelReason ? `(${lec.cancelReason})` : ''}
                      </div>
                    )}
                    {isRescheduled && (
                      <div style={{ fontSize: '11.5px', color: '#B45309', marginTop: '4px', fontWeight: 600 }}>
                        ⏰ Schedule updated: {lec.time} in {lec.room}{lec.originalTime ? ` (Originally ${lec.originalTime})` : ''}
                      </div>
                    )}
                  </div>

                  <div>
                    <span className={`status-badge ${lec.status}`} style={{ fontSize: '11px', fontWeight: 700 }}>
                      {lec.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
