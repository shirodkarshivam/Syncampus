import React, { useState } from 'react';
import { DoorOpen, Plus, CheckCircle, AlertOctagon, Wrench, Trash2 } from 'lucide-react';
import type { Classroom } from '../../../data/mockData';

interface Props {
  classrooms: Classroom[];
  onToggleStatus: (id: string) => void;
  onOpenAddClassroom: () => void;
  onDeleteClassroom: (id: string) => void;
}

export const ClassroomsView: React.FC<Props> = ({ 
  classrooms, 
  onToggleStatus,
  onOpenAddClassroom,
  onDeleteClassroom
}) => {
  const [filterType, setFilterType] = useState('All');

  const filtered = classrooms.filter((c) => {
    if (filterType === 'All') return true;
    return c.type === filterType;
  });

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="greeting-title">Campus Spaces &amp; Laboratories</h1>
          <p className="greeting-subtitle">
            54 Classrooms, 6 Computer Labs, 2 Auditoriums &bull; Capacity and Real-Time Availability
          </p>
        </div>
        <button className="btn-primary" onClick={onOpenAddClassroom}>
          <Plus size={18} />
          <span>+ Add Classroom</span>
        </button>
      </div>

      <div className="filter-bar" style={{ marginBottom: '24px' }}>
        <div className="filter-group">
          <label className="filter-label">Filter Room Type</label>
          <select 
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Spaces (Classrooms, Labs &amp; Halls)</option>
            <option value="Classroom">Lecture Classrooms</option>
            <option value="Computer Lab">Computer Labs</option>
            <option value="Auditorium">Auditoriums</option>
          </select>
        </div>
      </div>

      <div className="rooms-grid">
        {filtered.map((room) => (
          <div key={room.id} className="room-card">
            <div>
              <div className="room-header">
                <div>
                  <h3 className="room-name">{room.name}</h3>
                  <div className="room-type">{room.type} &bull; {room.floor}</div>
                </div>
                <span className={`room-badge ${room.status}`}>
                  {room.status}
                </span>
              </div>

              <div className="room-specs">
                <div><strong>Capacity:</strong> {room.capacity} seats</div>
                {room.currentLecture && (
                  <div style={{ marginTop: '6px', color: '#1D4ED8', fontSize: '12px', fontWeight: 500 }}>
                    Active: {room.currentLecture}
                  </div>
                )}
              </div>
            </div>

            <div className="room-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                className="action-chip" 
                onClick={() => onToggleStatus(room.id)}
              >
                {room.status === 'Maintenance' ? (
                  <>
                    <CheckCircle size={13} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                    Mark Available
                  </>
                ) : (
                  <>
                    <Wrench size={13} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                    Set Maintenance
                  </>
                )}
              </button>
              <button 
                className="icon-button" 
                title="Remove Space"
                onClick={() => onDeleteClassroom(room.id)}
                style={{ color: '#EF4444' }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
