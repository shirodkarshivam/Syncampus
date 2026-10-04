import React from 'react';
import { DoorOpen, CalendarClock, Bell, Megaphone } from 'lucide-react';

export const TeacherUpdatesView: React.FC = () => {
  const updates = [
    {
      id: 'u-1',
      title: 'Classroom Changed • DBMS',
      desc: 'Room 204 → Room 305 (BSc IT Sem 3 Div A)',
      time: 'Today • 09:42 AM',
      type: 'room'
    },
    {
      id: 'u-2',
      title: 'Lecture Rescheduled • Web Development',
      desc: '11:00 AM → 02:00 PM • Room 302',
      time: 'Yesterday • 04:15 PM',
      type: 'reschedule'
    },
    {
      id: 'u-3',
      title: 'Lecture Reminder',
      desc: 'Your DBMS lecture starts in 15 minutes at Room 204.',
      time: 'Today • 09:45 AM',
      type: 'reminder'
    },
    {
      id: 'u-4',
      title: 'Admin Announcement • Semester 3 Examinations',
      desc: 'Final semester examination timetable has been published and synced with student schedules.',
      time: '01 Oct 2026',
      type: 'announcement'
    }
  ];

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="greeting-title">Schedule Updates &amp; Notifications</h1>
          <p className="teacher-dept-sub">
            Real-time feed of schedule modifications, room reassignments, and administrative notices.
          </p>
        </div>
      </div>

      <div className="updates-card">
        {updates.map((u) => (
          <div key={u.id} className="update-entry-item">
            <div className={`update-icon-circle ${u.type}`}>
              {u.type === 'room' && <DoorOpen size={16} />}
              {u.type === 'reschedule' && <CalendarClock size={16} />}
              {u.type === 'reminder' && <Bell size={16} />}
              {u.type === 'announcement' && <Megaphone size={16} />}
            </div>
            <div className="update-details-text">
              <div className="update-title">{u.title}</div>
              <div className="update-path">{u.desc}</div>
              <div className="update-time-tag">{u.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
