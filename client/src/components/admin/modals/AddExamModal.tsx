import React, { useState } from 'react';
import { X, FileText, Plus } from 'lucide-react';
import type { Examination } from '../../../data/mockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddExam: (exam: Examination) => void;
}

export const AddExamModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAddExam
}) => {
  const [subject, setSubject] = useState('');
  const [course, setCourse] = useState('BSc IT');
  const [semester, setSemester] = useState(3);
  const [date, setDate] = useState('20 October 2026');
  const [time, setTime] = useState('10:00 AM – 01:00 PM');
  const [room, setRoom] = useState('Room 204');
  const [status, setStatus] = useState<'Published' | 'Draft'>('Published');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    const newExam: Examination = {
      id: `ex-${Date.now()}`,
      subject: subject.trim(),
      course,
      semester: Number(semester) || 1,
      date,
      time,
      room,
      status
    };

    onAddExam(newExam);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#0284C7" />
            <h3 className="modal-title">Schedule New Examination</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Examination Subject</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Artificial Intelligence, Advanced Taxation"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Course</label>
                <select 
                  className="form-control"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                >
                  <option value="BSc IT">BSc IT</option>
                  <option value="BSc CS">BSc CS</option>
                  <option value="B.Com">B.Com</option>
                  <option value="BFM">BFM</option>
                  <option value="BBI">BBI</option>
                  <option value="BMS">BMS</option>
                  <option value="BBA">BBA</option>
                  <option value="BA">BA</option>
                </select>
              </div>

              <div className="form-group">
                <label>Semester</label>
                <select 
                  className="form-control"
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                >
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                  <option value={3}>Semester 3</option>
                  <option value={4}>Semester 4</option>
                  <option value={5}>Semester 5</option>
                  <option value={6}>Semester 6</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 25 October 2026"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Time Slot</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 10:00 AM – 01:00 PM"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Assigned Room</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Room 204"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Publication Status</label>
                <select 
                  className="form-control"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="Published">Published (Students can view)</option>
                  <option value="Draft">Draft (Internal only)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ background: '#0284C7', borderColor: '#0284C7' }}>
              <Plus size={16} />
              <span>Schedule Examination</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
