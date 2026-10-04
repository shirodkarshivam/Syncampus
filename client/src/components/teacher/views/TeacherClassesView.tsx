import React from 'react';
import { Users, BookOpen, Layers, Award } from 'lucide-react';
import type { TeacherProfile } from '../../../data/teachersData';

interface Props {
  teacher?: TeacherProfile;
}

export const TeacherClassesView: React.FC<Props> = ({ teacher }) => {
  const getCourseForDept = (dept?: string, index: number = 0) => {
    if (dept === 'Commerce') {
      const commCourses = ['B.Com', 'BFM', 'BBI', 'BMS'];
      return commCourses[index % commCourses.length];
    }
    if (dept === 'Management') return 'BBA';
    if (dept === 'Arts') return 'BA';
    return index % 2 === 0 ? 'BSc IT' : 'BSc CS';
  };

  const defaultClasses = [
    {
      course: 'BSc IT',
      semester: 3,
      division: 'Division A',
      subject: 'Database Management Systems',
      studentCount: 68,
      room: 'Room 204',
      cr: 'Shivam Shirodkar'
    },
    {
      course: 'BSc IT',
      semester: 1,
      division: 'Division B',
      subject: 'DBMS',
      studentCount: 64,
      room: 'Room 204',
      cr: 'Ananya Patel'
    }
  ];

  const classes = teacher && teacher.subjects.length > 0
    ? teacher.subjects.flatMap((subject, sIdx) => [
        {
          course: getCourseForDept(teacher.department, sIdx),
          semester: (sIdx * 2) + 1,
          division: 'Division A',
          subject: subject,
          studentCount: 62 + (sIdx * 4),
          room: teacher.room.includes('Room') ? teacher.room : 'Room 204',
          cr: ['Shivam Shirodkar', 'Ananya Patel', 'Rohan Deshmukh', 'Sneha Iyer'][sIdx % 4]
        },
        {
          course: getCourseForDept(teacher.department, sIdx + 1),
          semester: (sIdx * 2) + 1,
          division: 'Division B',
          subject: subject,
          studentCount: 58 + (sIdx * 3),
          room: teacher.room.includes('Room') ? teacher.room : 'Room 105',
          cr: ['Kavya Sharma', 'Vikram Singh', 'Tanvi Joshi', 'Aarav Patil'][sIdx % 4]
        }
      ])
    : defaultClasses;


  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="greeting-title">My Assigned Classes</h1>
          <p className="teacher-dept-sub">
            Overview of student divisions, enrolled counts, and course coordination.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {classes.map((cls, idx) => (
          <div key={idx} className="room-card">
            <div>
              <div className="room-header">
                <div>
                  <h3 className="room-name">{cls.subject}</h3>
                  <div className="room-type">{cls.course} &bull; Semester {cls.semester} &bull; {cls.division}</div>
                </div>
              </div>

              <div style={{ margin: '14px 0', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={16} color="#0D9488" />
                  <span>Enrolled Students: <strong>{cls.studentCount} students</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={16} color="#0D9488" />
                  <span>Class Representative: <strong>{cls.cr}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={16} color="#0D9488" />
                  <span>Primary Lecture Hall: <strong>{cls.room}</strong></span>
                </div>
              </div>
            </div>

            <div className="room-footer">
              <button 
                className="action-chip" 
                onClick={() => alert(`Viewing class roster for ${cls.division}`)}
              >
                View Student Roster
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
