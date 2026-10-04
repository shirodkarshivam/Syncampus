import React from 'react';
import { 
  Building2, 
  BookOpen, 
  Layers, 
  DoorOpen, 
  PlusCircle, 
  Calendar, 
  ArrowRight, 
  CalendarClock, 
  Megaphone, 
  Clock, 
  Users,
  FileText,
  UserCheck
} from 'lucide-react';
import type { Lecture, ActivityLog } from '../../../data/mockData';
import { COLLEGE_METRICS, DEPARTMENTS_DATA } from '../../../data/mockData';

interface Props {
  lectures: Lecture[];
  activities: ActivityLog[];
  onNavigate: (tab: string) => void;
  onOpenCreateLecture: () => void;
  onOpenAnnouncement: () => void;
  departmentsCount?: number;
  divisionsCount?: number;
  teachersCount?: number;
  studentsCount?: number;
  classroomsCount?: number;
}

export const OverviewView: React.FC<Props> = ({
  lectures,
  activities,
  onNavigate,
  onOpenCreateLecture,
  onOpenAnnouncement,
  departmentsCount = 4,
  divisionsCount = 51,
  teachersCount = 135,
  studentsCount = 2700,
  classroomsCount = 62
}) => {
  return (
    <div>
      {/* Greeting Section */}
      <div className="overview-greeting">
        <h1 className="greeting-title">Good morning, Admin</h1>
        <p className="greeting-subtitle">
          Academic Administration &bull; Academic Year 2026–27 &bull; Central Campus Hierarchy
        </p>
      </div>

      {/* Summary Cards based on college.txt official numbers */}
      <div className="summary-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="summary-card" onClick={() => onNavigate('students')} style={{ cursor: 'pointer' }}>
          <div className="summary-icon-box students">
            <UserCheck size={24} strokeWidth={2} />
          </div>
          <div>
            <div className="summary-value">{studentsCount.toLocaleString()}</div>
            <div className="summary-label">Students</div>
          </div>
        </div>

        <div className="summary-card" onClick={() => onNavigate('faculty')} style={{ cursor: 'pointer' }}>
          <div className="summary-icon-box students" style={{ background: '#F0FDFA', color: '#0D9488' }}>
            <Users size={24} strokeWidth={2} />
          </div>
          <div>
            <div className="summary-value">{teachersCount}</div>
            <div className="summary-label">Official Faculty</div>
          </div>
        </div>

        <div className="summary-card" onClick={() => onNavigate('departments')} style={{ cursor: 'pointer' }}>
          <div className="summary-icon-box students">
            <Building2 size={24} strokeWidth={2} />
          </div>
          <div>
            <div className="summary-value">{departmentsCount}</div>
            <div className="summary-label">Departments</div>
          </div>
        </div>

        <div className="summary-card" onClick={() => onNavigate('divisions')} style={{ cursor: 'pointer' }}>
          <div className="summary-icon-box classes">
            <Layers size={24} strokeWidth={2} />
          </div>
          <div>
            <div className="summary-value">{divisionsCount}</div>
            <div className="summary-label">Divisions</div>
          </div>
        </div>

        <div className="summary-card" onClick={() => onNavigate('classrooms')} style={{ cursor: 'pointer' }}>
          <div className="summary-icon-box rooms">
            <DoorOpen size={24} strokeWidth={2} />
          </div>
          <div>
            <div className="summary-value">{classroomsCount}</div>
            <div className="summary-label">Spaces &amp; Labs</div>
          </div>
        </div>
      </div>

      {/* Department Breakdown Table (Official Structure from User Prompt) */}
      <div className="content-box-card" style={{ marginBottom: '32px' }}>
        <div className="section-header">
          <div>
            <h3 className="section-title">Department, Curriculum &amp; Faculty Distribution</h3>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Comprehensive allocation of 8 degree courses, 51 divisions, and 135 teachers
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="view-all-link" style={{ margin: 0 }} onClick={() => onNavigate('faculty')}>
              <span>View 135 Faculty</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        <div className="data-table-container" style={{ marginTop: '16px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Department Code</th>
                <th style={{ textAlign: 'right' }}>Courses</th>
                <th style={{ textAlign: 'right' }}>Divisions</th>
                <th style={{ textAlign: 'right' }}>Faculty</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {DEPARTMENTS_DATA.map((dept) => {
                const teachersCount = dept.code === 'SCI_TECH' ? 60 : dept.code === 'COMMERCE' ? 40 : dept.code === 'MGMT' ? 20 : 15;
                return (
                  <tr key={dept.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{dept.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{dept.courses.join(', ')}</div>
                    </td>
                    <td>
                      <code style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', color: '#2563EB', fontWeight: 600 }}>
                        {dept.code}
                      </code>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{dept.coursesCount}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--student-primary)' }}>{dept.divisionsCount}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#0D9488' }}>{teachersCount}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button 
                          className="action-chip"
                          onClick={() => onNavigate('faculty')}
                        >
                          Faculty ({teachersCount})
                        </button>
                        <button 
                          className="action-chip"
                          onClick={() => onNavigate('divisions')}
                        >
                          Divisions
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr style={{ background: '#F8FAFC', fontWeight: 700 }}>
                <td><strong>Total Academic Roster</strong></td>
                <td><code style={{ fontSize: '12px' }}>ALL_DEPTS</code></td>
                <td style={{ textAlign: 'right' }}><strong>8</strong></td>
                <td style={{ textAlign: 'right', color: '#2563EB' }}><strong>51</strong></td>
                <td style={{ textAlign: 'right', color: '#0D9488' }}><strong>135</strong></td>
                <td style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>2,700 Students &bull; 62 Spaces</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section-header">
        <h2 className="section-title">Quick Actions</h2>
      </div>
      <div className="quick-actions-grid">
        <button className="quick-action-btn" onClick={onOpenCreateLecture}>
          <div className="action-icon-circle">
            <PlusCircle size={20} />
          </div>
          <span className="quick-action-title">+ Create Lecture</span>
        </button>

        <button className="quick-action-btn" onClick={() => onNavigate('faculty')}>
          <div className="action-icon-circle" style={{ background: '#F0FDFA', color: '#0D9488' }}>
            <Users size={20} />
          </div>
          <span className="quick-action-title">Faculty (135)</span>
        </button>

        <button className="quick-action-btn" onClick={() => onNavigate('curriculum')}>
          <div className="action-icon-circle" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
            <BookOpen size={20} />
          </div>
          <span className="quick-action-title">Curriculum &amp; Subjects</span>
        </button>

        <button className="quick-action-btn" onClick={() => onNavigate('divisions')}>
          <div className="action-icon-circle">
            <Layers size={20} />
          </div>
          <span className="quick-action-title">Divisions (51)</span>
        </button>

        <button className="quick-action-btn" onClick={() => onNavigate('timetable')}>
          <div className="action-icon-circle">
            <Calendar size={20} />
          </div>
          <span className="quick-action-title">Timetable Master</span>
        </button>

        <button className="quick-action-btn" onClick={() => onNavigate('classrooms')}>
          <div className="action-icon-circle">
            <DoorOpen size={20} />
          </div>
          <span className="quick-action-title">Classrooms</span>
        </button>

        <button className="quick-action-btn" onClick={onOpenAnnouncement}>
          <div className="action-icon-circle">
            <Megaphone size={20} />
          </div>
          <span className="quick-action-title">Announcement</span>
        </button>
      </div>

      {/* Two Column Layout: Today's Schedule & Recent Activity */}
      <div className="dashboard-twin-grid">
        {/* Today's Campus Schedule */}
        <div className="content-box-card">
          <div className="section-header">
            <h3 className="section-title">Today&apos;s Campus Schedule</h3>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Monday Schedule</span>
          </div>

          <div className="schedule-stat-row">
            <div className="schedule-pill total">
              <div className="schedule-pill-number">185</div>
              <div className="schedule-pill-label">Total Lectures</div>
            </div>
            <div className="schedule-pill scheduled">
              <div className="schedule-pill-number" style={{ color: '#1D4ED8' }}>172</div>
              <div className="schedule-pill-label">Scheduled</div>
            </div>
            <div className="schedule-pill rescheduled">
              <div className="schedule-pill-number" style={{ color: '#B45309' }}>8</div>
              <div className="schedule-pill-label">Rescheduled</div>
            </div>
            <div className="schedule-pill cancelled">
              <div className="schedule-pill-number" style={{ color: '#B91C1C' }}>5</div>
              <div className="schedule-pill-label">Cancelled</div>
            </div>
          </div>

          {/* Mini preview list */}
          <div className="mini-schedule-list">
            {lectures.slice(0, 4).map((lec) => (
              <div key={lec.id} className="mini-schedule-item">
                <div className="mini-time">{lec.time}</div>
                <div className="mini-subject-info">
                  <div className="mini-subject-title">{lec.subject}</div>
                  <div className="mini-subject-meta">
                    {lec.teacher} &bull; {lec.room} &bull; {lec.course} Sem {lec.semester} Div {lec.division}
                  </div>
                </div>
                <span className={`status-badge ${lec.status}`}>
                  {lec.status}
                </span>
              </div>
            ))}
          </div>

          <button className="view-all-link" onClick={() => onNavigate('timetable')}>
            <span>View Full Timetable</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Recent Activity */}
        <div className="content-box-card">
          <div className="section-header">
            <h3 className="section-title">Recent Activity</h3>
            <span style={{ fontSize: '12px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
              Live Sync
            </span>
          </div>

          <div className="activity-feed-list">
            {activities.map((act) => (
              <div key={act.id} className="activity-item">
                <div className={`activity-bullet ${act.type}`}>
                  {act.type === 'room_change' && <DoorOpen size={16} />}
                  {act.type === 'reschedule' && <CalendarClock size={16} />}
                  {act.type === 'announcement' && <Megaphone size={16} />}
                  {act.type === 'status' && <Clock size={16} />}
                </div>
                <div className="activity-content">
                  <div className="activity-time">{act.time}</div>
                  <div className="activity-title">{act.title}</div>
                  <div className="activity-detail">{act.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
