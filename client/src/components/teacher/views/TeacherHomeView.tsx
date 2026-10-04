import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  DoorOpen, 
  Users, 
  Ban, 
  CalendarClock, 
  ArrowRight, 
  CheckCircle2, 
  Bell, 
  Calendar,
  Layers,
  BookOpen
} from 'lucide-react';
import type { Lecture } from '../../../data/mockData';
import type { TeacherProfile } from '../../../data/teachersData';

interface Props {
  teacher?: TeacherProfile;
  lectures: Lecture[];
  defaultDay: string;
  onOpenCancel: (lec: Lecture) => void;
  onOpenReschedule: (lec: Lecture) => void;
  onOpenChangeRoom: (lec: Lecture) => void;
  onNavigateToTimetable: () => void;
}

export const TeacherHomeView: React.FC<Props> = ({
  teacher,
  lectures,
  defaultDay = 'Monday',
  onOpenCancel,
  onOpenReschedule,
  onOpenChangeRoom,
  onNavigateToTimetable
}) => {
  const [selectedDay, setSelectedDay] = useState<string>(defaultDay);
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const dayOfWeekIndex = new Date().getDay(); // 0 = Sun, 6 = Sat
  const isWeekend = dayOfWeekIndex === 0 || dayOfWeekIndex === 6;

  const teacherTitle = teacher ? teacher.title : 'Prof. Faculty';
  const teacherDept = teacher ? teacher.department : 'Academics';

  // Lectures for the active selected day
  const displayedLectures = useMemo(() => {
    return lectures.filter(l => l.day === selectedDay);
  }, [lectures, selectedDay]);

  return (
    <div>
      {/* Top Greeting */}
      <div className="teacher-greeting" style={{ marginBottom: '20px' }}>
        <h1 className="greeting-title">Good morning, {teacherTitle}</h1>
        <p className="teacher-dept-sub">
          Department of {teacherDept} &bull; Academic Schedule
        </p>
      </div>

      {/* Main Timetable Card (Replaces the current & next lecture cards) */}
      <div className="timeline-section-card" style={{ marginBottom: '24px' }}>
        <div className="section-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="section-title" style={{ margin: 0 }}>
                {isWeekend && selectedDay === 'Monday' ? "Upcoming Faculty Timetable" : "Today's Faculty Timetable"}
              </h3>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '8px',
                background: isWeekend && selectedDay === 'Monday' ? '#FEF3C7' : '#CCFBF1',
                color: isWeekend && selectedDay === 'Monday' ? '#92400E' : '#0F766E',
                border: `1px solid ${isWeekend && selectedDay === 'Monday' ? '#FDE68A' : '#99F6E4'}`
              }}>
                {isWeekend && selectedDay === 'Monday' ? "Weekend • Showing Monday" : selectedDay}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
              Synchronized central college timetable &bull; {displayedLectures.length} scheduled session(s)
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
              onClick={onNavigateToTimetable}
            >
              <span>Weekly Schedule</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Timetable Period Rows */}
        <div className="timeline-items-list" style={{ marginTop: '20px' }}>
          {displayedLectures.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={32} color="#0D9488" style={{ marginBottom: '8px', opacity: 0.8 }} />
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                No lectures scheduled on {selectedDay}
              </div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>
                You have no scheduled teaching hours today. Dedicated for department research and student mentoring.
              </div>
            </div>
          ) : (
            displayedLectures.map((lec) => {
              const isCancelled = lec.status === 'Cancelled';
              return (
                <div key={lec.id} className="timeline-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', gap: '16px' }}>
                  <div className="timeline-time-block" style={{ minWidth: '110px' }}>
                    <Clock size={15} color="#0D9488" style={{ display: 'inline', marginRight: '6px' }} />
                    <span style={{ fontWeight: 700, fontSize: '13px' }}>{lec.time}</span>
                  </div>

                  <div className="timeline-main-info" style={{ flex: 1, minWidth: 0 }}>
                    <div className="timeline-subject-name" style={{ fontSize: '15px', fontWeight: 600 }}>
                      {lec.subject}
                    </div>
                    <div className="timeline-group-meta" style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={13} color="#0D9488" />
                        <span>{lec.course} &bull; {lec.division ? `Div ${lec.division}` : 'Section'}</span>
                      </span>
                      <span>&bull;</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <DoorOpen size={13} color="#0D9488" />
                        <span>{lec.room}</span>
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`status-badge ${lec.status}`} style={{ fontSize: '11px', fontWeight: 600 }}>
                      {lec.status}
                    </span>

                    {/* Quick Faculty Lecture Actions */}
                    {!isCancelled && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="action-chip"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          title="Reschedule this lecture"
                          onClick={() => onOpenReschedule(lec)}
                        >
                          <CalendarClock size={12} style={{ marginRight: '3px' }} />
                          Reschedule
                        </button>
                        <button
                          type="button"
                          className="action-chip"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          title="Change classroom"
                          onClick={() => onOpenChangeRoom(lec)}
                        >
                          <DoorOpen size={12} style={{ marginRight: '3px' }} />
                          Room
                        </button>
                        <button
                          type="button"
                          className="action-chip"
                          style={{ padding: '4px 8px', fontSize: '11px', color: '#DC2626' }}
                          title="Cancel lecture"
                          onClick={() => onOpenCancel(lec)}
                        >
                          <Ban size={12} style={{ marginRight: '3px' }} />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Schedule Changes / Recent Updates */}
      <div className="updates-preview-card">
        <div className="section-header">
          <h3 className="section-title">Faculty Announcements &amp; Notices</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '13px' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '3px' }}>
              Academic Schedule Notice &bull; Examination Sync
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              The central conflict-free timetable is now active across all 51 divisions. Any room changes or reschedules made here will immediately sync to affected students.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
