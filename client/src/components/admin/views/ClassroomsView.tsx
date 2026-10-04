import React, { useState, useMemo } from 'react';
import { DoorOpen, Plus, CheckCircle, Wrench, Trash2, Search, Monitor, Building2, Users } from 'lucide-react';
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
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Summary counts
  const totalCount = classrooms.length;
  const classroomCount = useMemo(() => classrooms.filter(c => c.type === 'Classroom').length, [classrooms]);
  const labCount = useMemo(() => classrooms.filter(c => c.type === 'Computer Lab').length, [classrooms]);
  const hallCount = useMemo(() => classrooms.filter(c => c.type === 'Auditorium').length, [classrooms]);
  const occupiedCount = useMemo(() => classrooms.filter(c => c.status === 'Occupied').length, [classrooms]);
  const availableCount = useMemo(() => classrooms.filter(c => c.status === 'Available').length, [classrooms]);

  const filtered = useMemo(() => {
    return classrooms.filter((c) => {
      if (filterType !== 'All' && c.type !== filterType) return false;
      if (filterStatus !== 'All' && c.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchCode = (c.code || '').toLowerCase().includes(q);
        const matchDept = (c.departmentUse || '').toLowerCase().includes(q);
        const matchFac = (c.facilities || '').toLowerCase().includes(q);
        const matchLecture = (c.currentLecture || '').toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchDept && !matchFac && !matchLecture) return false;
      }
      return true;
    });
  }, [classrooms, filterType, filterStatus, searchQuery]);

  return (
    <div>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="greeting-title" style={{ margin: 0 }}>Campus Spaces &amp; Laboratories</h1>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '12px',
              background: '#EFF6FF',
              color: '#1D4ED8',
              border: '1px solid #BFDBFE'
            }}>
              {totalCount} Total Spaces
            </span>
          </div>
          <p className="greeting-subtitle" style={{ marginTop: '4px' }}>
            54 Lecture Classrooms, 6 Computer Labs, 2 Seminar Halls &bull; Timetable Allocation &amp; Real-Time Status
          </p>
        </div>
        <button className="btn-primary" onClick={onOpenAddClassroom}>
          <Plus size={18} />
          <span>+ Add Classroom</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="summary-cards-grid" style={{ marginBottom: '24px' }}>
        <div className="summary-card" onClick={() => { setFilterType('All'); setFilterStatus('All'); }} style={{ cursor: 'pointer' }}>
          <div className="summary-icon-box rooms">
            <DoorOpen size={22} strokeWidth={2} />
          </div>
          <div>
            <div className="summary-value">{totalCount}</div>
            <div className="summary-label">Total Campus Spaces</div>
          </div>
        </div>

        <div className="summary-card" onClick={() => setFilterType('Classroom')} style={{ cursor: 'pointer' }}>
          <div className="summary-icon-box classes">
            <Building2 size={22} strokeWidth={2} />
          </div>
          <div>
            <div className="summary-value">{classroomCount}</div>
            <div className="summary-label">Lecture Classrooms</div>
          </div>
        </div>

        <div className="summary-card" onClick={() => setFilterType('Computer Lab')} style={{ cursor: 'pointer' }}>
          <div className="summary-icon-box students" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
            <Monitor size={22} strokeWidth={2} />
          </div>
          <div>
            <div className="summary-value">{labCount}</div>
            <div className="summary-label">Computing / Tech Labs</div>
          </div>
        </div>

        <div className="summary-card" onClick={() => setFilterType('Auditorium')} style={{ cursor: 'pointer' }}>
          <div className="summary-icon-box" style={{ background: '#FAF5FF', color: '#9333EA' }}>
            <Users size={22} strokeWidth={2} />
          </div>
          <div>
            <div className="summary-value">{hallCount}</div>
            <div className="summary-label">Seminar Halls</div>
          </div>
        </div>

        <div className="summary-card" onClick={() => setFilterStatus('Occupied')} style={{ cursor: 'pointer' }}>
          <div className="summary-icon-box" style={{ background: '#EFF6FF', color: '#2563EB' }}>
            <CheckCircle size={22} strokeWidth={2} />
          </div>
          <div>
            <div className="summary-value">{occupiedCount}</div>
            <div className="summary-label">Timetable Occupied</div>
          </div>
        </div>

        <div className="summary-card" onClick={() => setFilterStatus('Available')} style={{ cursor: 'pointer' }}>
          <div className="summary-icon-box" style={{ background: '#F0FDF4', color: '#16A34A' }}>
            <CheckCircle size={22} strokeWidth={2} />
          </div>
          <div>
            <div className="summary-value">{availableCount}</div>
            <div className="summary-label">Available / Reserve</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar" style={{ marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            className="filter-select"
            placeholder="Search by room name, code (ROOM-001, LAB-001), facilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px' }}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Filter Type</label>
          <select 
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Space Types ({totalCount})</option>
            <option value="Classroom">Lecture Classrooms ({classroomCount})</option>
            <option value="Computer Lab">Computer Labs ({labCount})</option>
            <option value="Auditorium">Seminar Halls ({hallCount})</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select 
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Occupied">Active / Occupied ({occupiedCount})</option>
            <option value="Available">Available / Reserve ({availableCount})</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        {(filterType !== 'All' || filterStatus !== 'All' || searchQuery) && (
          <button
            onClick={() => { setFilterType('All'); setFilterStatus('All'); setSearchQuery(''); }}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              background: '#FFF',
              fontSize: '13px',
              color: '#64748B',
              cursor: 'pointer',
              alignSelf: 'flex-end'
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      <div style={{ marginBottom: '12px', fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
        Showing {filtered.length} of {totalCount} campus spaces
      </div>

      {/* Grid of Room Cards */}
      <div className="rooms-grid">
        {filtered.map((room) => (
          <div key={room.id} className="room-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="room-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <h3 className="room-name" style={{ margin: 0 }}>{room.name}</h3>
                    {room.code && (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: '#F1F5F9',
                        color: '#475569',
                        border: '1px solid #E2E8F0'
                      }}>
                        {room.code}
                      </span>
                    )}
                  </div>
                  <div className="room-type">{room.type} &bull; {room.floor}</div>
                </div>
                <span className={`room-badge ${room.status}`}>
                  {room.status}
                </span>
              </div>

              <div className="room-specs" style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span><strong>Capacity:</strong> {room.capacity} seats</span>
                  {room.departmentUse && (
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                      {room.departmentUse}
                    </span>
                  )}
                </div>

                {room.facilities && (
                  <div style={{ fontSize: '12px', color: '#475569', background: '#F8FAFC', padding: '6px 8px', borderRadius: '4px', border: '1px solid #E2E8F0', marginBottom: '8px' }}>
                    <strong>Facilities:</strong> {room.facilities}
                  </div>
                )}

                {room.currentLecture && (
                  <div style={{
                    marginTop: '6px',
                    color: '#1D4ED8',
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    Assigned Cohort: {room.currentLecture}
                  </div>
                )}
              </div>
            </div>

            <div className="room-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
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
