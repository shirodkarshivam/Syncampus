import React, { useState } from 'react';
import { X, DoorOpen, Plus } from 'lucide-react';
import type { Classroom } from '../../../data/mockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddClassroom: (classroom: Classroom) => void;
}

export const AddClassroomModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAddClassroom
}) => {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(60);
  const [floor, setFloor] = useState('2nd Floor');
  const [type, setType] = useState<'Classroom' | 'Computer Lab' | 'Auditorium'>('Classroom');
  const [status, setStatus] = useState<'Available' | 'Occupied' | 'Maintenance'>('Available');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newRoom: Classroom = {
      id: `c-${Date.now()}`,
      name: name.trim(),
      capacity: Number(capacity) || 60,
      floor,
      type,
      status
    };

    onAddClassroom(newRoom);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DoorOpen size={20} color="#D97706" />
            <h3 className="modal-title">Add Campus Space / Lab</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label>Space / Room Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Room 402, Computing Lab 3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Seating Capacity</label>
                <input
                  type="number"
                  className="form-control"
                  min={10}
                  max={500}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Space Type</label>
                <select 
                  className="form-control"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                >
                  <option value="Classroom">General Classroom (54 total)</option>
                  <option value="Computer Lab">Computer / Technical Lab (6 total)</option>
                  <option value="Auditorium">Seminar Hall / Auditorium (2 total)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Building Floor</label>
                <select 
                  className="form-control"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                >
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="1st Floor">1st Floor</option>
                  <option value="2nd Floor">2nd Floor</option>
                  <option value="3rd Floor">3rd Floor</option>
                  <option value="4th Floor">4th Floor</option>
                  <option value="Lab Block A">Lab Block A</option>
                  <option value="Lab Block B">Lab Block B</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Initial Status</label>
              <select 
                className="form-control"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="Available">Available for Timetabling</option>
                <option value="Maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ background: '#D97706', borderColor: '#D97706' }}>
              <Plus size={16} />
              <span>Create Space</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
