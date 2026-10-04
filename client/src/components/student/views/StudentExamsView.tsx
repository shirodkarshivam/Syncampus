import React from 'react';
import { Calendar, Clock, DoorOpen, AlertCircle } from 'lucide-react';
import type { Examination } from '../../../data/mockData';

interface Props {
  exams: Examination[];
}

export const StudentExamsView: React.FC<Props> = ({ exams }) => {
  const publishedExams = exams.filter(e => e.course === 'BSc IT' && e.semester === 3);

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="greeting-title">Semester Examinations</h1>
          <p className="student-cohort-sub">
            Semester 3 Official Examination Timetable &bull; Room Seating &bull; Hall Guidelines
          </p>
        </div>
      </div>

      <div style={{
        backgroundColor: '#EFF6FF',
        border: '1px solid #BFDBFE',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '13px',
        color: '#1E40AF'
      }}>
        <AlertCircle size={18} style={{ flexShrink: 0 }} />
        <span>Please carry your verified College Identity Card and Hall Ticket. Report 15 minutes before exam commencement.</span>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Date</th>
              <th>Time</th>
              <th>Allocated Hall</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {publishedExams.map((ex) => (
              <tr key={ex.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{ex.subject}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="#2563EB" />
                    <span>{ex.date}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} color="#64748B" />
                    <span>{ex.time}</span>
                  </div>
                </td>
                <td>
                  <span style={{ background: '#F1F5F9', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>
                    {ex.room}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${ex.status === 'Published' ? 'Scheduled' : 'Rescheduled'}`}>
                    {ex.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
