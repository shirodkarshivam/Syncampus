import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { Lecture, Classroom } from '../../../data/mockData';
import { TEACHERS_DATA } from '../../../data/teachersData';
import type { TeacherProfile } from '../../../data/teachersData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddLecture: (lecture: Lecture) => void;
  existingLectures: Lecture[];
  teachers?: TeacherProfile[];
  classrooms?: Classroom[];
}

export const CreateLectureModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAddLecture,
  existingLectures,
  teachers = TEACHERS_DATA,
  classrooms = []
}) => {
  const [subject, setSubject] = useState('Database Management Systems');
  const [teacher, setTeacher] = useState(teachers[0]?.title || 'Prof. Rahul Patil');
  const [course, setCourse] = useState('BSc IT');
  const [semester, setSemester] = useState(3);
  const [division, setDivision] = useState('A');
  const [day, setDay] = useState('Monday');
  const [time, setTime] = useState('10:00 - 11:00');
  const [room, setRoom] = useState(classrooms[0]?.name || 'Room 204');

  if (!isOpen) return null;

  // Conflict Detection Algorithm (Section 15 of spec)
  const conflictingLecture = existingLectures.find(
    (l) => l.day === day && l.time === time && l.room === room && l.status !== 'Cancelled'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (conflictingLecture) {
      alert('Cannot create lecture with unresolved timetable conflict. Please choose another room or time.');
      return;
    }

    const newLec: Lecture = {
      id: `lec-${Date.now()}`,
      subject,
      teacher,
      course,
      semester,
      division,
      department: 'Information Technology',
      day,
      time,
      room,
      status: 'Scheduled'
    };

    onAddLecture(newLec);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">+ Create Lecture</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                className="form-control"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Teacher</label>
                <select 
                  className="form-control" 
                  value={teacher} 
                  onChange={(e) => setTeacher(e.target.value)}
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.title}>
                      {t.title} ({t.id} • {t.department})
                    </option>
                  ))}
                </select>
              </div>

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
                  <option value="BBI">BBI</option>
                  <option value="BFM">BFM</option>
                  <option value="BMS">BMS</option>
                  <option value="BA">BA</option>
                  <option value="BBA">BBA</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
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

              <div className="form-group">
                <label>Division</label>
                <select 
                  className="form-control" 
                  value={division} 
                  onChange={(e) => setDivision(e.target.value)}
                >
                  <option value="A">Division A</option>
                  <option value="B">Division B</option>
                  <option value="C">Division C</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Day</label>
                <select 
                  className="form-control" 
                  value={day} 
                  onChange={(e) => setDay(e.target.value)}
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                </select>
              </div>

              <div className="form-group">
                <label>Time Slot</label>
                <select 
                  className="form-control" 
                  value={time} 
                  onChange={(e) => setTime(e.target.value)}
                >
                  <option value="09:00 - 10:00">09:00 - 10:00 AM</option>
                  <option value="10:00 - 11:00">10:00 - 11:00 AM</option>
                  <option value="11:00 - 12:00">11:00 - 12:00 PM</option>
                  <option value="01:00 - 02:00">01:00 - 02:00 PM</option>
                  <option value="02:00 - 03:00">02:00 - 03:00 PM</option>
                  <option value="03:00 - 04:00">03:00 - 04:00 PM</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Classroom</label>
              <select 
                className="form-control" 
                value={room} 
                onChange={(e) => setRoom(e.target.value)}
              >
                {classrooms.length > 0 ? (
                  classrooms.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.type} • Cap: {c.capacity})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Room 101">Room 101 (Cap: 60)</option>
                    <option value="Room 204">Room 204 (Cap: 70)</option>
                    <option value="Computer Lab 1">Computer Lab 1 (Cap: 40)</option>
                    <option value="Computer Lab 2">Computer Lab 2 (Cap: 40)</option>
                    <option value="Room 302">Room 302 (Cap: 65)</option>
                    <option value="Auditorium 1">Auditorium 1 (Cap: 250)</option>
                  </>
                )}
              </select>
            </div>

            {/* Section 15: Conflict Detection Alert */}
            {conflictingLecture && (
              <div className="conflict-alert-box">
                <AlertTriangle size={24} className="conflict-icon" />
                <div className="conflict-content">
                  <h4>⚠️ Timetable Conflict Detected</h4>
                  <p>
                    <strong>{room}</strong> is already assigned to <strong>{conflictingLecture.subject}</strong> ({conflictingLecture.time}).
                  </p>
                  <p style={{ marginTop: '4px', fontSize: '12px' }}>
                    <strong>Options:</strong> Choose another room or change the time slot to proceed.
                  </p>
                </div>
              </div>
            )}

            {/* Section 8: Summary before saving */}
            <div className="summary-preview-box">
              <div className="summary-preview-title">Lecture Summary Preview</div>
              <div className="summary-preview-details">
                <strong>{subject}</strong><br />
                {day} • {time}<br />
                {course} • Semester {semester} • Division {division}<br />
                {teacher} • {room}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={!!conflictingLecture}
              style={{ opacity: conflictingLecture ? 0.6 : 1 }}
            >
              <CheckCircle2 size={16} />
              <span>Confirm &amp; Create</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
