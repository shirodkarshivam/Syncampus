import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  DoorOpen, 
  User, 
  Bell, 
  ArrowRight, 
  Calendar, 
  CheckCircle2,
  Megaphone,
  BookOpen
} from 'lucide-react';
import type { Lecture, Announcement } from '../../../data/mockData';
import type { Student } from '../../../data/studentsData';

interface Props {
  student?: Student;
  lectures: Lecture[];
  defaultDay: string;
  announcements: Announcement[];
  onNavigate: (tab: string) => void;
}

export const StudentHomeView: React.FC<Props> = ({
  student,
  lectures,
  defaultDay = 'Monday',
  announcements,
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

  return (
    <div>
      {/* Top Greeting (Section 2) */}
      <div className="student-greeting" style={{ marginBottom: '20px' }}>
        <h1 className="greeting-title">Hi, {firstName} 👋</h1>
        <p className="student-cohort-sub">
          {cohortSub}
        </p>
      </div>

      {/* Schedule Changes / Updates Banner */}
      <div className="schedule-alert-banner" style={{ marginBottom: '24px' }}>
        <div className="alert-banner-left">
          <div className="alert-banner-icon">
            <Bell size={18} />
          </div>
          <div className="alert-banner-text">
            <h4>🔔 Central Schedule Synchronized</h4>
            <p>
              Your timetable is live and verified with <strong>{student?.classroom || 'designated room'}</strong> and assigned course instructors.
            </p>
          </div>
        </div>
        <button className="alert-action-btn" onClick={() => onNavigate('timetable')}>
          <span>Full Timetable</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Main Timetable Card (Replaces the current/next hero cards) */}
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
                    gap: '16px'
                  }}
                >
                  <div style={{ minWidth: '110px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={15} color="#2563EB" />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: isCancelled ? '#B91C1C' : 'var(--text-main)' }}>
                      {lec.time}
                    </span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }} className={isCancelled ? 'cancelled-subject-name' : ''}>
                      {lec.subject}
                    </div>
                    <div style={{ fontSize: '12px', color: isCancelled ? '#B91C1C' : 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={13} color="#2563EB" />
                        <strong>{lec.teacher}</strong>
                      </span>
                      <span>&bull;</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <DoorOpen size={13} color="#2563EB" />
                        <span>{lec.room}</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className={`status-badge ${lec.status}`} style={{ fontSize: '11px', fontWeight: 600 }}>
                      {lec.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Announcements Section */}
      <div className="announcements-card">
        <div className="section-header">
          <h3 className="section-title">Campus Announcements</h3>
          <button className="view-all-link" style={{ margin: 0 }} onClick={() => onNavigate('announcements')}>
            <span>View All</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="announcements-list">
          {announcements.slice(0, 3).map((item) => (
            <div key={item.id} className="announcement-item">
              <div className="announcement-icon-badge">
                <Megaphone size={16} />
              </div>
              <div className="announcement-content">
                <div className="announcement-title">{item.title}</div>
                <div className="announcement-message">{item.message}</div>
                <div className="announcement-date">{item.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
