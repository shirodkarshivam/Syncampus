import React, { useState, useMemo } from 'react';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  CalendarClock, 
  Ban, 
  Edit2, 
  CheckCircle2, 
  Grid, 
  List, 
  User, 
  DoorOpen, 
  Building2, 
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import type { Lecture } from '../../../data/mockData';
import { TEACHERS_DATA } from '../../../data/teachersData';

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
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'faculty' | 'room'>('grid');
  
  // Filters
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState('BSc IT');
  const [selectedYear, setSelectedYear] = useState('FY');
  const [selectedDivision, setSelectedDivision] = useState('A');
  const [selectedDay, setSelectedDay] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Faculty & Room specific view states
  const [selectedTeacherId, setSelectedTeacherId] = useState('T001');
  const [selectedRoom, setSelectedRoom] = useState('Room 101');

  // Pagination for table view
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '01:00 - 02:00',
    '02:00 - 03:00'
  ];

  // Helper to map year to semester
  const matchesYear = (lecSemester: number, year: string) => {
    if (year === 'All') return true;
    if (year === 'FY') return lecSemester === 1 || lecSemester === 2;
    if (year === 'SY') return lecSemester === 3 || lecSemester === 4;
    if (year === 'TY') return lecSemester === 5 || lecSemester === 6;
    return true;
  };

  // Filtered lectures for Master Table View
  const filteredLectures = useMemo(() => {
    return lectures.filter((lec) => {
      const matchDept = selectedDept === 'All' || lec.department === selectedDept;
      const matchCourse = selectedCourse === 'All' || lec.course === selectedCourse;
      const matchYr = matchesYear(lec.semester, selectedYear);
      const matchDiv = selectedDivision === 'All' || lec.division === selectedDivision;
      const matchDay = selectedDay === 'All' || lec.day === selectedDay;

      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q || 
        lec.subject.toLowerCase().includes(q) ||
        lec.teacher.toLowerCase().includes(q) ||
        lec.room.toLowerCase().includes(q) ||
        lec.course.toLowerCase().includes(q);

      return matchDept && matchCourse && matchYr && matchDiv && matchDay && matchSearch;
    });
  }, [lectures, selectedDept, selectedCourse, selectedYear, selectedDivision, selectedDay, searchQuery]);

  // Division Grid Lectures (for the active division)
  const divisionGridLectures = useMemo(() => {
    return lectures.filter(lec => 
      lec.course === selectedCourse &&
      matchesYear(lec.semester, selectedYear) &&
      lec.division === selectedDivision
    );
  }, [lectures, selectedCourse, selectedYear, selectedDivision]);

  // Faculty Schedule Lectures (for the selected teacher)
  const facultyLectures = useMemo(() => {
    const t = TEACHERS_DATA.find(tc => tc.id === selectedTeacherId);
    if (!t) return [];
    return lectures.filter(lec => lec.teacher.toLowerCase().includes(t.name.toLowerCase()) || lec.teacher.toLowerCase().includes(t.id.toLowerCase()));
  }, [lectures, selectedTeacherId]);

  // Room Schedule Lectures (for the selected room)
  const roomLectures = useMemo(() => {
    return lectures.filter(lec => lec.room.toLowerCase() === selectedRoom.toLowerCase());
  }, [lectures, selectedRoom]);

  // Pagination slice
  const totalPages = Math.ceil(filteredLectures.length / itemsPerPage) || 1;
  const paginatedLectures = filteredLectures.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Available unique classrooms from lectures
  const allRooms = useMemo(() => {
    const set = new Set<string>();
    lectures.forEach(l => { if (l.room) set.add(l.room); });
    return Array.from(set).sort();
  }, [lectures]);

  return (
    <div>
      {/* Section Header */}
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="greeting-title" style={{ margin: 0 }}>Master College Timetable</h1>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '12px',
              background: '#DCFCE7',
              color: '#15803D',
              border: '1px solid #BBF7D0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <CheckCircle2 size={13} color="#16A34A" />
              100% Conflict-Free Verified
            </span>
          </div>
          <p className="greeting-subtitle" style={{ marginTop: '4px' }}>
            Central academic schedule &bull; {lectures.length} Total Periods &bull; 51 Divisions &bull; {TEACHERS_DATA.length} Faculty Members &bull; 51 Classrooms
          </p>
        </div>

        <button className="btn-primary" onClick={onOpenCreateLecture}>
          <PlusCircle size={18} />
          <span>+ Schedule Lecture</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="content-box-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Master Lectures
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
            {lectures.length}
          </div>
          <div style={{ fontSize: '12px', color: '#16A34A', marginTop: '4px' }}>
            25 periods / division / week
          </div>
        </div>

        <div className="content-box-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Active Divisions
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
            51 Divisions
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            8 Courses across 4 Departments
          </div>
        </div>

        <div className="content-box-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Faculty Coverage
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
            {TEACHERS_DATA.length} Teachers
          </div>
          <div style={{ fontSize: '12px', color: '#0D9488', marginTop: '4px' }}>
            Synchronized with faculty portals
          </div>
        </div>

        <div className="content-box-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Classroom Allocation
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
            {allRooms.length} Classrooms
          </div>
          <div style={{ fontSize: '12px', color: '#2563EB', marginTop: '4px' }}>
            Room 101 to Room 151
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '12px', gap: '4px' }}>
          <button
            type="button"
            className={`nav-item-btn ${viewMode === 'grid' ? 'active' : ''}`}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600 }}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={15} />
            <span>Division Timetable Grid</span>
          </button>

          <button
            type="button"
            className={`nav-item-btn ${viewMode === 'table' ? 'active' : ''}`}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600 }}
            onClick={() => setViewMode('table')}
          >
            <List size={15} />
            <span>All Master Lectures ({lectures.length})</span>
          </button>

          <button
            type="button"
            className={`nav-item-btn ${viewMode === 'faculty' ? 'active' : ''}`}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600 }}
            onClick={() => setViewMode('faculty')}
          >
            <User size={15} />
            <span>Faculty Schedule Lookup</span>
          </button>

          <button
            type="button"
            className={`nav-item-btn ${viewMode === 'room' ? 'active' : ''}`}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600 }}
            onClick={() => setViewMode('room')}
          >
            <DoorOpen size={15} />
            <span>Room Occupancy Schedule</span>
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="input-field-wrapper" style={{ maxWidth: '320px', background: '#FFFFFF' }}>
          <Search size={16} className="input-icon" />
          <input
            type="text"
            className="text-input"
            placeholder="Search subject, teacher, room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* MODE 1: DIVISION WEEKLY GRID */}
      {viewMode === 'grid' && (
        <div>
          {/* Division Selector Filters */}
          <div className="filter-bar" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
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
                <option value="BFM">BFM</option>
                <option value="BBI">BBI</option>
                <option value="BMS">BMS</option>
                <option value="BBA">BBA</option>
                <option value="BA">BA</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Year / Semester</label>
              <select 
                className="filter-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="FY">First Year (FY &bull; Sem 1 &amp; 2)</option>
                <option value="SY">Second Year (SY &bull; Sem 3 &amp; 4)</option>
                <option value="TY">Third Year (TY &bull; Sem 5 &amp; 6)</option>
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
                <option value="C">Division C (Commerce)</option>
              </select>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Viewing Division:
              </span>
              <span style={{
                background: '#EFF6FF',
                color: '#1D4ED8',
                fontWeight: 700,
                fontSize: '13px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #BFDBFE'
              }}>
                {selectedCourse} {selectedYear} &bull; Division {selectedDivision} &bull; {divisionGridLectures[0]?.room || 'Classroom'}
              </span>
            </div>
          </div>

          {/* 5-Day Weekly Grid Table */}
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '130px' }}>Time Slot</th>
                  {days.map(d => (
                    <th key={d} style={{ textAlign: 'center' }}>{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((time) => (
                  <tr key={time}>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '12px' }}>
                      <Clock size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px', color: '#2563EB' }} />
                      {time}
                    </td>
                    {days.map(d => {
                      const lec = divisionGridLectures.find(l => l.day === d && l.time === time);
                      if (!lec) {
                        return (
                          <td key={d} style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px', background: '#F8FAFC' }}>
                            -
                          </td>
                        );
                      }
                      const isCancelled = lec.status === 'Cancelled';
                      const isRescheduled = lec.status === 'Rescheduled';

                      return (
                        <td key={d} style={{ padding: '8px' }}>
                          <div 
                            style={{
                              background: isCancelled ? '#FEF2F2' : isRescheduled ? '#FFFBEB' : '#F0F9FF',
                              border: `1px solid ${isCancelled ? '#FECACA' : isRescheduled ? '#FDE68A' : '#BAE6FD'}`,
                              borderRadius: '8px',
                              padding: '8px 10px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              position: 'relative',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{
                              fontSize: '12.5px',
                              fontWeight: 700,
                              color: isCancelled ? '#991B1B' : isRescheduled ? '#92400E' : '#0369A1',
                              textDecoration: isCancelled ? 'line-through' : 'none'
                            }}>
                              {lec.subject}
                            </div>
                            <div style={{ fontSize: '11px', color: isCancelled ? '#DC2626' : '#0284C7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <User size={11} />
                              <span>{lec.teacher}</span>
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                              <span style={{ fontWeight: 600 }}>{lec.room}</span>
                              <span className={`status-badge ${lec.status}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                                {lec.status}
                              </span>
                            </div>

                            {/* Quick Action Overlay Row */}
                            <div style={{ display: 'flex', gap: '4px', marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed #E2E8F0' }}>
                              <button
                                type="button"
                                onClick={() => onOpenReschedule(lec)}
                                style={{
                                  flex: 1,
                                  border: 'none',
                                  background: '#FFFFFF',
                                  color: '#2563EB',
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  padding: '3px 6px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}
                              >
                                Edit / Reschedule
                              </button>
                              {!isCancelled && (
                                <button
                                  type="button"
                                  onClick={() => onCancelLecture(lec.id)}
                                  style={{
                                    border: 'none',
                                    background: '#FEE2E2',
                                    color: '#B91C1C',
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    padding: '3px 6px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                  title="Cancel Lecture"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODE 2: ALL MASTER LECTURES TABLE */}
      {viewMode === 'table' && (
        <div>
          {/* Multi-filter row */}
          <div className="filter-bar" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div className="filter-group">
              <label className="filter-label">Department</label>
              <select 
                className="filter-select"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                <option value="All">All Departments</option>
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
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="All">All Years</option>
                <option value="FY">FY</option>
                <option value="SY">SY</option>
                <option value="TY">TY</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Division</label>
              <select 
                className="filter-select"
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
              >
                <option value="All">All Divisions</option>
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
                <option value="All">All Days (Mon-Fri)</option>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Showing {filteredLectures.length} of {lectures.length} lectures
              </span>
            </div>
          </div>

          {/* Master Table */}
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Day &amp; Time</th>
                  <th>Subject</th>
                  <th>Course &amp; Cohort</th>
                  <th>Faculty Instructor</th>
                  <th>Classroom</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLectures.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No lectures found matching the active filters.
                    </td>
                  </tr>
                ) : (
                  paginatedLectures.map((lec) => (
                    <tr key={lec.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '13px' }}>{lec.day}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lec.time}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{lec.subject}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{lec.department}</div>
                      </td>
                      <td>
                        <span style={{
                          background: '#EFF6FF',
                          color: '#1D4ED8',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '12px'
                        }}>
                          {lec.course} &bull; Div {lec.division}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{lec.teacher}</div>
                      </td>
                      <td>
                        <span style={{ background: '#F1F5F9', padding: '4px 8px', borderRadius: '6px', fontWeight: 600, fontSize: '12px' }}>
                          {lec.room}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${lec.status}`} style={{ fontSize: '11px' }}>
                          {lec.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="row-actions-group" style={{ justifyContent: 'flex-end' }}>
                          <button 
                            className="action-chip"
                            onClick={() => onOpenReschedule(lec)}
                            title="Reschedule / Change Room"
                          >
                            <CalendarClock size={13} style={{ marginRight: '3px' }} />
                            Reschedule
                          </button>
                          {lec.status !== 'Cancelled' && (
                            <button 
                              className="action-chip danger"
                              onClick={() => onCancelLecture(lec.id)}
                              title="Cancel Lecture"
                            >
                              <Ban size={13} style={{ marginRight: '3px' }} />
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

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Page {currentPage} of {totalPages} ({filteredLectures.length} total filtered)
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="action-chip"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="action-chip"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: FACULTY SCHEDULE LOOKUP */}
      {viewMode === 'faculty' && (
        <div>
          <div className="filter-bar" style={{ marginBottom: '20px', gap: '14px', alignItems: 'center' }}>
            <div className="filter-group" style={{ flex: 1, maxWidth: '400px' }}>
              <label className="filter-label">Select Faculty Member ({TEACHERS_DATA.length} Available)</label>
              <select
                className="filter-select"
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
              >
                {TEACHERS_DATA.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.id} &bull; {t.department})
                  </option>
                ))}
              </select>
            </div>

            {(() => {
              const activeT = TEACHERS_DATA.find(t => t.id === selectedTeacherId);
              return activeT ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Specializations:</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {activeT.subjects.map(s => (
                      <span key={s} style={{ background: '#CCFBF1', color: '#0F766E', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
          </div>

          {/* Teacher Weekly Table */}
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time Slot</th>
                  <th>Subject</th>
                  <th>Assigned Course &amp; Division</th>
                  <th>Classroom</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {facultyLectures.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No active lectures scheduled for this faculty member.
                    </td>
                  </tr>
                ) : (
                  facultyLectures.map((lec) => (
                    <tr key={lec.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{lec.day}</td>
                      <td style={{ fontWeight: 600 }}>{lec.time}</td>
                      <td style={{ fontWeight: 600, color: '#0369A1' }}>{lec.subject}</td>
                      <td>
                        <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '3px 8px', borderRadius: '6px', fontWeight: 600, fontSize: '12px' }}>
                          {lec.course} &bull; Div {lec.division}
                        </span>
                      </td>
                      <td>
                        <span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                          {lec.room}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${lec.status}`}>
                          {lec.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODE 4: CLASSROOM OCCUPANCY SCHEDULE */}
      {viewMode === 'room' && (
        <div>
          <div className="filter-bar" style={{ marginBottom: '20px', gap: '14px', alignItems: 'center' }}>
            <div className="filter-group" style={{ maxWidth: '300px' }}>
              <label className="filter-label">Select Classroom (51 Available)</label>
              <select
                className="filter-select"
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
              >
                {allRooms.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Showing all weekly periods allocated to <strong>{selectedRoom}</strong> ({roomLectures.length} sessions).
            </div>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time Slot</th>
                  <th>Subject</th>
                  <th>Occupying Division</th>
                  <th>Faculty Instructor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {roomLectures.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No lectures scheduled in {selectedRoom}.
                    </td>
                  </tr>
                ) : (
                  roomLectures.map((lec) => (
                    <tr key={lec.id}>
                      <td style={{ fontWeight: 700 }}>{lec.day}</td>
                      <td style={{ fontWeight: 600 }}>{lec.time}</td>
                      <td style={{ fontWeight: 600 }}>{lec.subject}</td>
                      <td>
                        <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '3px 8px', borderRadius: '6px', fontWeight: 600, fontSize: '12px' }}>
                          {lec.course} &bull; Div {lec.division}
                        </span>
                      </td>
                      <td>{lec.teacher}</td>
                      <td>
                        <span className={`status-badge ${lec.status}`}>
                          {lec.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableView;
