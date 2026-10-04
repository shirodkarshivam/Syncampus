import React from 'react';
import { DoorOpen, CalendarClock, Ban, Bell, Megaphone } from 'lucide-react';

export const StudentUpdatesView: React.FC = () => {
  const updates = [
    {
      id: 'su-1',
      title: 'Schedule Updated • Web Development',
      desc: 'Lecture rescheduled from 11:00 AM to 02:00 PM. Classroom moved: Room 302 → Room 401.',
      time: 'Today • 10:20 AM',
      type: 'reschedule'
    },
    {
      id: 'su-2',
      title: 'Room Changed • Database Management System',
      desc: 'DBMS will now be conducted in Room 305 (3rd Floor) instead of Room 204.',
      time: 'Today • 09:42 AM',
      type: 'room'
    },
    {
      id: 'su-3',
      title: 'Lecture Cancelled • Cyber Security Essentials',
      desc: '3:00 PM lecture has been cancelled by Prof. Sharma due to faculty meeting.',
      time: 'Today • 08:30 AM',
      type: 'cancelled'
    },
    {
      id: 'su-4',
      title: 'Exam Schedule Published • Semester 3',
      desc: 'Internal and external practical examination timetable is now active in your exam portal.',
      time: 'Yesterday',
      type: 'announcement'
    }
  ];

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="greeting-title">Live Schedule Updates</h1>
          <p className="student-cohort-sub">
            Real-time feed of classroom shifts, rescheduled sessions, and cancellations.
          </p>
        </div>
      </div>

      <div className="updates-card">
        {updates.map((u) => (
          <div key={u.id} className="update-entry-item">
            <div className={`update-icon-circle ${u.type === 'cancelled' ? 'reschedule' : u.type}`}>
              {u.type === 'room' && <DoorOpen size={16} />}
              {u.type === 'reschedule' && <CalendarClock size={16} />}
              {u.type === 'cancelled' && <Ban size={16} color="#DC2626" />}
              {u.type === 'announcement' && <Megaphone size={16} />}
            </div>
            <div className="update-details-text">
              <div className="update-title" style={{ color: u.type === 'cancelled' ? '#991B1B' : 'var(--text-main)' }}>
                {u.title}
              </div>
              <div className="update-path">{u.desc}</div>
              <div className="update-time-tag">{u.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
