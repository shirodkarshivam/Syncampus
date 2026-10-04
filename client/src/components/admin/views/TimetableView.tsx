import React, { useState } from 'react';
import { PlusCircle, Search, Filter, CalendarClock, Ban, Edit2 } from 'lucide-react';
import type { Lecture } from '../../../data/mockData';

interface Props {
  lectures: Lecture[];
  onOpenCreateLecture: () => void;
  onOpenReschedule: (lecture: Lecture) => void;
  onCancelLecture: (id: string) => void;
}

export const TimetableView: React.FC<Props> = ({
  lectures,
  onOpenCreateLecture,
  onOpenReschedule,
  onCancelLecture
}) => {
  const [selectedDept, setSelectedDept] = useState('Science & Technology');
  const [selectedCourse, setSelectedCourse] = useState('BSc IT');
  const [selectedSemester, setSelectedSemester] = useState('3');
  const [selectedDivision, setSelectedDivision] = useState('A');
  const [selectedDay, setSelectedDay] = useState('Monday');

  const filteredLectures = lectures.filter((lec) => {
    return (
      (selectedDept === 'All' || lec.department === selectedDept) &&
      lec.course === selectedCourse &&
      lec.semester.toString() === selectedSemester &&
      lec.division === selectedDivision &&
      lec.day === selectedDay
    );
  });

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="greeting-title">Timetable Management</h1>
          <p className="greeting-subtitle">
            Configure central lecture schedules, manage classrooms, and handle division exceptions.
          </p>
        </div>
        <button className="btn-primary" onClick={onOpenCreateLecture}>
          <PlusCircle size={18} />
          <span>+ Create Lecture</span>
        </button>
      </div>

      {/* Filter Bar (Section 7) */}
      <div className="filter-bar">
        <div className="filter-group">
          <label className="filter-label">Department</label>
          <select 
            className="filter-select"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="Science & Technology">Science &amp; Technology</option>
            <option value="Commerce">Commerce</option>
            <option value="Arts">Arts</option>
            <option value="Management">Management</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Course</label>
          <select 
            className="filter-select"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="BSc IT">BSc IT</option>
            <option value="BSc CS">BSc CS</option>
            <option value="B.Com">B.Com</option>
            <option value="BBI">BBI</option>
            <option value="BFM">BFM</option>
            <option value="BMS">BMS</option>
            <option value="BA">BA</option>
            <option value="BBA">BBA</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Semester / Year</label>
          <select 
            className="filter-select"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            <option value="1">Sem 1 (FY)</option>
            <option value="2">Sem 2 (FY)</option>
            <option value="3">Sem 3 (SY)</option>
            <option value="4">Sem 4 (SY)</option>
            <option value="5">Sem 5 (TY)</option>
            <option value="6">Sem 6 (TY)</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Division</label>
          <select 
            className="filter-select"
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
          >
            <option value="A">Division A</option>
            <option value="B">Division B</option>
            <option value="C">Division C</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Day</label>
          <select 
            className="filter-select"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
          >
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
          </select>
        </div>
      </div>

      {/* Timetable Table (Section 7) */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Subject</th>
              <th>Teacher</th>
              <th>Classroom</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLectures.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No lectures found for the selected division and day.
                </td>
              </tr>
            ) : (
              filteredLectures.map((lec) => (
                <tr key={lec.id}>
                  <td style={{ fontWeight: 600 }}>{lec.time}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{lec.subject}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {lec.course} Sem {lec.semester} &bull; Div {lec.division}
                    </div>
                  </td>
                  <td>{lec.teacher}</td>
                  <td>
                    <span style={{ 
                      background: '#F1F5F9', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontWeight: 500,
                      fontSize: '13px'
                    }}>
                      {lec.room}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${lec.status}`}>
                      {lec.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="row-actions-group" style={{ justifyContent: 'flex-end' }}>
                      <button 
                        className="action-chip" 
                        onClick={() => alert(`Edit lecture: ${lec.subject}`)}
                        title="Edit Details"
                      >
                        <Edit2 size={13} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                        Edit
                      </button>
                      <button 
                        className="action-chip" 
                        onClick={() => onOpenReschedule(lec)}
                        title="Reschedule / Change Room"
                      >
                        <CalendarClock size={13} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                        Reschedule
                      </button>
                      {lec.status !== 'Cancelled' && (
                        <button 
                          className="action-chip danger" 
                          onClick={() => onCancelLecture(lec.id)}
                          title="Cancel Lecture"
                        >
                          <Ban size={13} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
