import React, { useState } from 'react';
import { X, Building2, Plus } from 'lucide-react';
import type { DepartmentSummary } from '../../../data/mockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddDepartment: (dept: DepartmentSummary) => void;
}

export const AddDepartmentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAddDepartment
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [coursesStr, setCoursesStr] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const courses = coursesStr
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    const newDept: DepartmentSummary = {
      id: `dept-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      coursesCount: courses.length > 0 ? courses.length : 1,
      divisionsCount: (courses.length > 0 ? courses.length : 1) * 3,
      description: description.trim() || 'Academic Faculty Department',
      courses: courses.length > 0 ? courses : ['General Degree']
    };

    onAddDepartment(newDept);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} color="#2563EB" />
            <h3 className="modal-title">Add Academic Department</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label>Department Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Vocational &amp; Applied Studies"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Department Code</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. VOC_STUDIES"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description &amp; Overview</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Brief summary of faculties and study domains..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Offered Courses (comma-separated)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. B.Voc IT, B.Voc Media, Diploma in Data Science"
                value={coursesStr}
                onChange={(e) => setCoursesStr(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Plus size={16} />
              <span>Create Department</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
