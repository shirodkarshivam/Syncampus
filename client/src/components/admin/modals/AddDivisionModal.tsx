import React, { useState } from 'react';
import { X, Layers, Plus } from 'lucide-react';
import type { AcademicDivisionEntry } from '../../../data/mockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddDivision: (entry: AcademicDivisionEntry) => void;
  suggestedNo: number;
}

export const AddDivisionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAddDivision,
  suggestedNo
}) => {
  const [department, setDepartment] = useState('Science & Technology');
  const [departmentCode, setDepartmentCode] = useState('SCI_TECH');
  const [course, setCourse] = useState('BSc IT');
  const [year, setYear] = useState<'FY' | 'SY' | 'TY'>('FY');
  const [divisionsStr, setDivisionsStr] = useState('A, B, C');

  if (!isOpen) return null;

  const handleDeptChange = (dept: string) => {
    setDepartment(dept);
    if (dept === 'Science & Technology') {
      setDepartmentCode('SCI_TECH');
      setCourse('BSc IT');
    } else if (dept === 'Commerce') {
      setDepartmentCode('COMMERCE');
      setCourse('B.Com');
    } else if (dept === 'Management') {
      setDepartmentCode('MGMT');
      setCourse('BBA');
    } else {
      setDepartmentCode('ARTS');
      setCourse('BA');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const divArray = divisionsStr
      .split(',')
      .map(d => d.trim().toUpperCase())
      .filter(Boolean);

    const newEntry: AcademicDivisionEntry = {
      no: suggestedNo,
      department,
      departmentCode,
      course,
      courseCode: course.replace(/\s+/g, '_').toUpperCase(),
      year,
      divisions: divArray.length > 0 ? divArray : ['A'],
      divisionCount: divArray.length > 0 ? divArray.length : 1,
      divisionNames: divArray.join(', ')
    };

    onAddDivision(newEntry);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} color="#0D9488" />
            <h3 className="modal-title">Add Division Cohort</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label>Department</label>
                <select 
                  className="form-control"
                  value={department}
                  onChange={(e) => handleDeptChange(e.target.value)}
                >
                  <option value="Science & Technology">Science &amp; Technology</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Management">Management</option>
                  <option value="Arts">Arts</option>
                </select>
              </div>

              <div className="form-group">
                <label>Course</label>
                <select 
                  className="form-control"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                >
                  {department === 'Science & Technology' && (
                    <>
                      <option value="BSc IT">BSc IT</option>
                      <option value="BSc CS">BSc CS</option>
                    </>
                  )}
                  {department === 'Commerce' && (
                    <>
                      <option value="B.Com">B.Com</option>
                      <option value="BFM">BFM</option>
                      <option value="BBI">BBI</option>
                      <option value="BMS">BMS</option>
                    </>
                  )}
                  {department === 'Management' && (
                    <option value="BBA">BBA</option>
                  )}
                  {department === 'Arts' && (
                    <option value="BA">BA</option>
                  )}
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Academic Year</label>
                <select 
                  className="form-control"
                  value={year}
                  onChange={(e) => setYear(e.target.value as any)}
                >
                  <option value="FY">First Year (FY)</option>
                  <option value="SY">Second Year (SY)</option>
                  <option value="TY">Third Year (TY)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Divisions (comma-separated)</label>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="e.g. A, B, C, D"
                  value={divisionsStr}
                  onChange={(e) => setDivisionsStr(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ background: '#0D9488', borderColor: '#0D9488' }}>
              <Plus size={16} />
              <span>Add Division Cohort</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
