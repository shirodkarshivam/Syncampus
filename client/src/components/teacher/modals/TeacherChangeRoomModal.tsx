import React, { useState, useMemo, useEffect } from 'react';
import { X, DoorOpen, CheckCircle, Bell, AlertTriangle, CheckCircle2, Filter } from 'lucide-react';
import type { Lecture } from '../../../data/mockData';
import { INITIAL_CLASSROOMS } from '../../../data/mockData';
import { timetableStore } from '../../../data/timetableStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lecture: Lecture | null;
  onConfirmChangeRoom: (id: string, newRoom: string) => void;
}

export const TeacherChangeRoomModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lecture,
  onConfirmChangeRoom
}) => {
  const [newRoom, setNewRoom] = useState('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);

  // Compute room occupancy at this lecture's exact day & time slot
  const occupancy = useMemo(() => {
    if (!lecture) return { isOccupied: () => undefined, occupiedMap: new Map<string, Lecture>() };
    return timetableStore.getRoomOccupancy(lecture.day, lecture.time, lecture.id);
  }, [lecture]);

  // Compute available and occupied rooms
  const { availableRooms, occupiedRooms } = useMemo(() => {
    const avail: typeof INITIAL_CLASSROOMS = [];
    const occ: Array<{ room: typeof INITIAL_CLASSROOMS[0]; lecture: Lecture }> = [];

    INITIAL_CLASSROOMS.forEach(c => {
      const occLec = occupancy.isOccupied(c.name);
      if (occLec) {
        occ.push({ room: c, lecture: occLec });
      } else {
        avail.push(c);
      }
    });

    return { availableRooms: avail, occupiedRooms: occ };
  }, [occupancy]);

  // Initialize newRoom when modal opens or lecture changes
  useEffect(() => {
    if (lecture) {
      // If current room is available or find first available room
      const currentIsOcc = occupancy.isOccupied(lecture.room);
      if (!currentIsOcc) {
        setNewRoom(lecture.room);
      } else if (availableRooms.length > 0) {
        setNewRoom(availableRooms[0].name);
      } else {
        setNewRoom(lecture.room);
      }
    }
  }, [lecture, availableRooms, occupancy]);

  if (!isOpen || !lecture) return null;

  // Real-time conflict check for the selected newRoom
  const conflictingLecture = occupancy.isOccupied(newRoom);
  const isConflict = !!conflictingLecture;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isConflict) {
      alert(`Conflict Error: ${newRoom} is already occupied by ${conflictingLecture?.teacher} for "${conflictingLecture?.subject}". Please pick a vacant room.`);
      return;
    }
    onConfirmChangeRoom(lecture.id, newRoom);
    onClose();
  };

  const displayedClassrooms = showOnlyAvailable ? availableRooms : INITIAL_CLASSROOMS;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DoorOpen size={20} color="#0D9488" />
            <h3 className="modal-title">Change Classroom (Conflict-Free)</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  {lecture.subject}
                </h4>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F766E', background: '#CCFBF1', padding: '3px 10px', borderRadius: '12px' }}>
                  {lecture.day} &bull; {lecture.time}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {lecture.course} &bull; Semester {lecture.semester} &bull; Division {lecture.division}
              </p>
            </div>

            {/* Current vs New preview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
              <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Room</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>
                  {lecture.room}
                </div>
              </div>

              <div style={{ 
                background: isConflict ? '#FEF2F2' : '#F0FDFA', 
                padding: '12px 14px', 
                borderRadius: '10px', 
                border: isConflict ? '1px solid #FECACA' : '1px solid #99F6E4' 
              }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: isConflict ? '#DC2626' : '#0F766E', textTransform: 'uppercase' }}>
                  {isConflict ? '⚠️ Target Room (Clash!)' : 'Selected Room (Free)'}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: isConflict ? '#DC2626' : '#0F766E', marginTop: '4px' }}>
                  {newRoom || 'Select a room'}
                </div>
              </div>
            </div>

            {/* Room Selector with Available Filter */}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ margin: 0, fontWeight: 600, fontSize: '13px' }}>
                  Select Target Classroom / Space
                </label>
                <button
                  type="button"
                  onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0F766E',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Filter size={13} />
                  <span>{showOnlyAvailable ? `Showing Free (${availableRooms.length})` : 'Show All Rooms'}</span>
                </button>
              </div>

              <select 
                className="form-control" 
                value={newRoom} 
                onChange={(e) => setNewRoom(e.target.value)}
                style={{
                  borderColor: isConflict ? '#EF4444' : undefined,
                  backgroundColor: isConflict ? '#FFF5F5' : undefined
                }}
              >
                {showOnlyAvailable ? (
                  <>
                    <optgroup label={`Available Vacant Rooms on ${lecture.day} (${availableRooms.length} Spaces)`}>
                      {availableRooms.map(c => (
                        <option key={c.id} value={c.name}>
                          ✓ {c.name} ({c.type} &bull; Capacity: {c.capacity})
                        </option>
                      ))}
                    </optgroup>
                  </>
                ) : (
                  <>
                    <optgroup label={`Available Rooms (${availableRooms.length})`}>
                      {availableRooms.map(c => (
                        <option key={c.id} value={c.name}>
                          ✓ {c.name} (Available &bull; Cap: {c.capacity})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={`Occupied Rooms (${occupiedRooms.length})`}>
                      {occupiedRooms.map(({ room: c, lecture: occ }) => (
                        <option key={c.id} value={c.name}>
                          ⚠️ {c.name} — OCCUPIED by {occ.teacher} ({occ.subject})
                        </option>
                      ))}
                    </optgroup>
                  </>
                )}
              </select>
            </div>

            {/* CONFLICT WARNING BANNER: If selected room is occupied */}
            {isConflict ? (
              <div style={{
                background: '#FEF2F2',
                border: '1.5px solid #F87171',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '16px',
                animation: 'shake 0.3s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991B1B', fontWeight: 700, fontSize: '14px' }}>
                  <AlertTriangle size={18} color="#DC2626" />
                  <span>Room Conflict Detected! Double-Booking Prevented</span>
                </div>
                <div style={{ fontSize: '13px', color: '#7F1D1D', marginTop: '6px', lineHeight: '1.4' }}>
                  <strong>{newRoom}</strong> is currently occupied on <strong>{lecture.day}</strong> at <strong>{lecture.time}</strong> by:
                  <div style={{ background: '#FEE2E2', padding: '8px 10px', borderRadius: '6px', marginTop: '6px', fontWeight: 600 }}>
                    &bull; Faculty: {conflictingLecture.teacher}<br />
                    &bull; Subject: {conflictingLecture.subject}<br />
                    &bull; Cohort: {conflictingLecture.course} (Div {conflictingLecture.division})
                  </div>
                </div>

                {/* Quick 1-click Free Room Suggestions */}
                {availableRooms.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Click any vacant room to select:
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {availableRooms.slice(0, 6).map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setNewRoom(c.name)}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #FCA5A5',
                            color: '#991B1B',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          + {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Verified Vacant Banner */
              <div style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#15803D',
                fontSize: '13px',
                fontWeight: 600
              }}>
                <CheckCircle2 size={16} />
                <span>{newRoom} is verified vacant on {lecture.day} ({lecture.time}). Zero clashes.</span>
              </div>
            )}

            {/* Student Notification Preview */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '12px',
              color: 'var(--text-muted)'
            }}>
              <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', color: 'var(--text-main)' }}>
                <Bell size={14} color="#0D9488" />
                <span>Real-Time Broadcast:</span>
              </div>
              <div>
                Affected students in {lecture.course} Div {lecture.division} will immediately receive a room relocation alert in their top navigation drawer.
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
              disabled={isConflict || !newRoom}
              style={{ 
                backgroundColor: isConflict ? '#94A3B8' : '#0D9488',
                cursor: isConflict ? 'not-allowed' : 'pointer',
                borderColor: isConflict ? '#94A3B8' : '#0D9488'
              }}
            >
              <CheckCircle size={15} />
              <span>{isConflict ? 'Conflict: Room Occupied' : 'Confirm Room Change'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
