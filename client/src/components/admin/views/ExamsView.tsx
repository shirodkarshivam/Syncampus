import React from 'react';
import { Plus, Calendar, FileText, CheckCircle, Clock, Trash2 } from 'lucide-react';
import type { Examination } from '../../../data/mockData';

interface Props {
  exams: Examination[];
  onPublishExam: (id: string) => void;
  onOpenAddExam: () => void;
  onDeleteExam: (id: string) => void;
}

export const ExamsView: React.FC<Props> = ({ 
  exams, 
  onPublishExam,
  onOpenAddExam,
  onDeleteExam
}) => {
  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="greeting-title">Examination Management</h1>
          <p className="greeting-subtitle">
            Schedule semester exams, manage hall allocations, check room conflicts, and publish timetables.
          </p>
        </div>
        <button className="btn-primary" onClick={onOpenAddExam}>
          <Plus size={18} />
          <span>+ Schedule Exam</span>
        </button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Course &amp; Semester</th>
              <th>Date</th>
              <th>Time</th>
              <th>Examination Hall</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((ex) => (
              <tr key={ex.id}>
                <td style={{ fontWeight: 600 }}>{ex.subject}</td>
                <td>{ex.course} &bull; Semester {ex.semester}</td>
                <td>{ex.date}</td>
                <td>{ex.time}</td>
                <td>
                  <span style={{ background: '#F1F5F9', padding: '4px 8px', borderRadius: '6px', fontWeight: 500 }}>
                    {ex.room}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${ex.status === 'Published' ? 'Scheduled' : 'Rescheduled'}`}>
                    {ex.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {ex.status === 'Draft' ? (
                      <button 
                        className="btn-primary" 
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => onPublishExam(ex.id)}
                      >
                        <CheckCircle size={13} />
                        <span>Publish</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>
                        Active
                      </span>
                    )}
                    <button
                      className="icon-button"
                      title="Cancel / Delete Examination"
                      onClick={() => onDeleteExam(ex.id)}
                      style={{ color: '#EF4444' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
