import React, { useState, useMemo } from 'react';
import { Search, UserPlus, Trash2, Filter, GraduationCap, Mail, MapPin } from 'lucide-react';
import type { Student } from '../../../data/studentsData';
import { TOTAL_CAMPUS_STUDENTS_COUNT } from '../../../data/studentsData';

interface Props {
  students: Student[];
  onOpenAddStudent: () => void;
  onDeleteStudent: (id: string) => void;
}

export const StudentsView: React.FC<Props> = ({
  students,
  onOpenAddStudent,
  onDeleteStudent
}) => {
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesDept = selectedDept === 'All' || s.department === selectedDept;
      const matchesCourse = selectedCourse === 'All' || s.course === selectedCourse;
      const matchesYear = selectedYear === 'All' || s.year === selectedYear;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.classroom.toLowerCase().includes(q);

      return matchesDept && matchesCourse && matchesYear && matchesSearch;
    });
  }, [students, selectedDept, selectedCourse, selectedYear, searchQuery]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="greeting-title">Student Directory &amp; Admissions</h1>
          <p className="greeting-subtitle">
            Campus enrollment roster &bull; {TOTAL_CAMPUS_STUDENTS_COUNT} Target Students &bull; 51 Divisions &bull; Verified Academic Identities
          </p>
        </div>
        <button className="btn-primary" onClick={onOpenAddStudent}>
          <UserPlus size={16} />
          <span>Enroll New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar" style={{ marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '220px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '38px', height: '40px' }}
            placeholder="Search student by name, ID (e.g. STU0001), or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Department</label>
          <select 
            className="filter-select"
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setSelectedCourse('All');
              setCurrentPage(1);
            }}
          >
            <option value="All">All Departments</option>
            <option value="Science & Technology">Science &amp; Technology</option>
            <option value="Commerce">Commerce</option>
            <option value="Management">Management</option>
            <option value="Arts">Arts</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Course</label>
          <select 
            className="filter-select"
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Courses</option>
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

        <div className="filter-group">
          <label className="filter-label">Year</label>
          <select 
            className="filter-select"
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Years</option>
            <option value="FY">First Year (FY)</option>
            <option value="SY">Second Year (SY)</option>
            <option value="TY">Third Year (TY)</option>
          </select>
        </div>
      </div>

      {/* Summary Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        marginBottom: '16px',
        fontSize: '13px',
        color: 'var(--text-muted)'
      }}>
        <span>
          Showing <strong>{filteredStudents.length}</strong> matching students
          {searchQuery && <span> for "<strong>{searchQuery}</strong>"</span>}
        </span>
        <span style={{
          fontSize: '12px',
          fontWeight: 600,
          background: '#EFF6FF',
          color: '#1D4ED8',
          padding: '3px 10px',
          borderRadius: '12px'
        }}>
          Total Enrolled: {TOTAL_CAMPUS_STUDENTS_COUNT} Students
        </span>
      </div>

      {/* Student Data Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '90px' }}>Student ID</th>
              <th>Student Name</th>
              <th>Department &amp; Course</th>
              <th style={{ textAlign: 'center' }}>Year &amp; Div</th>
              <th>Classroom</th>
              <th>Batch</th>
              <th>College Email</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No students found matching your criteria.
                </td>
              </tr>
            ) : (
              paginatedStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <span style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '12px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: '#F1F5F9',
                      color: '#1E293B',
                      border: '1px solid #E2E8F0'
                    }}>
                      {student.id}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{student.name}</div>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Status: {student.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontWeight: 600,
                        color: 'var(--student-primary)',
                        background: '#EFF6FF',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}>
                        {student.course}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {student.department}
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: 'var(--text-main)'
                    }}>
                      {student.year} - Div {student.division}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} style={{ color: 'var(--text-dim)' }} />
                      <span>{student.classroom}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: '#F1F5F9',
                      color: '#334155'
                    }}>
                      Batch {student.batch}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {student.email}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="icon-button"
                      title="Remove Student"
                      onClick={() => onDeleteStudent(student.id)}
                      style={{ color: '#EF4444' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Page {currentPage} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className="action-chip"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            <button
              className="action-chip"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
