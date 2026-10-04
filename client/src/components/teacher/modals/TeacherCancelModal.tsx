import React, { useState } from 'react';
import { X, AlertTriangle, Ban } from 'lucide-react';
import type { Lecture } from '../../../data/mockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lecture: Lecture | null;
  onConfirmCancel: (lectureId: string, reason: string) => void;
}

export const TeacherCancelModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lecture,
  onConfirmCancel
}) => {
  const [reason, setReason] = useState('Department faculty meeting');

  if (!isOpen || !lecture) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmCancel(lecture.id, reason);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} color="#DC2626" />
            <h3 className="modal-title">Cancel this lecture?</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
                {lecture.subject}
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {lecture.time} &bull; {lecture.room} &bull; {lecture.course} Sem {lecture.semester} Div {lecture.division}
              </p>
            </div>

            <div className="form-group">
              <label>Reason for cancellation</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Enter reason for students..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            {/* Section 14 Notification Impact Notice */}
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '10px',
              padding: '12px 14px',
              color: '#991B1B',
              fontSize: '13px',
              lineHeight: 1.4
            }}>
              <strong>Automatic Notification:</strong> All enrolled students in {lecture.course} Sem {lecture.semester} Div {lecture.division} will receive an instant cancellation notification on their dashboard.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Go Back
            </button>
            <button type="submit" className="btn-danger">
              <Ban size={15} style={{ marginRight: '6px' }} />
              Confirm Cancellation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
