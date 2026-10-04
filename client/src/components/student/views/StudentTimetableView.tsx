import React, { useState } from 'react';
import type { Lecture } from '../../../data/mockData';
import type { Student } from '../../../data/studentsData';

interface Props {
  lectures: Lecture[];
  student?: Student;
}

export const StudentTimetableView: React.FC<Props> = ({ lectures, student }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const [selectedDay, setSelectedDay] = useState('Monday');

  const dayLectures = lectures.filter((l) => l.day === selectedDay);

  const cohortSub = student
    ? `${student.course} • ${student.year} (Division ${student.division}) • Classroom: ${student.classroom} • Conflict-Free Schedule`
    : 'BSc IT • Semester 3 • Division A • Verified Academic Master Timetable';

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="greeting-title">Weekly Schedule</h1>
          <p className="student-cohort-sub">
            {cohortSub}
          </p>
        </div>
      </div>

      {/* Tabs: Mon | Tue | Wed | Thu | Fri | Sat (Section 8) */}
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
              <th>Classroom</th>
              <th>Instructor</th>
              <th>Status</th>
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
                return (
                  <tr key={lec.id}>
                    <td style={{ fontWeight: 600 }}>{lec.time}</td>
                    <td>
                      <div style={{ fontWeight: 600 }} className={isCancelled ? 'cancelled-subject-name' : ''}>
                        {lec.subject}
                      </div>
                    </td>
                    <td>
                      <span style={{ background: '#F1F5F9', padding: '4px 8px', borderRadius: '6px', fontWeight: 500 }}>
                        {lec.room}
                      </span>
                    </td>
                    <td>{lec.teacher}</td>
                    <td>
                      <span className={`status-badge ${lec.status}`}>
                        {lec.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
