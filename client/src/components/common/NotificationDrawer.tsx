import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  CalendarClock, 
  UserCheck, 
  DoorOpen, 
  CheckCheck, 
  RotateCcw,
  Clock
} from 'lucide-react';
import type { LectureChangeAlert } from '../../data/timetableStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeAlerts: LectureChangeAlert[];
  dismissedAlerts: LectureChangeAlert[];
  onDismissAlert: (id: string) => void;
  onRestoreAlert?: (id: string) => void;
  onMarkAllAsRead: () => void;
  role: 'student' | 'teacher';
  userName: string;
}

export const NotificationDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  activeAlerts,
  dismissedAlerts,
  onDismissAlert,
  onRestoreAlert,
  onMarkAllAsRead,
  role,
  userName
}) => {
  const [tab, setTab] = useState<'active' | 'history'>('active');

  if (!isOpen) return null;

  const currentList = tab === 'active' ? activeAlerts : dismissedAlerts;

  const getAlertIcon = (type: LectureChangeAlert['type']) => {
    switch (type) {
      case 'cancelled':
        return <AlertTriangle size={16} color="#DC2626" />;
      case 'rescheduled':
        return <CalendarClock size={16} color="#D97706" />;
      case 'teacher_changed':
        return <UserCheck size={16} color="#2563EB" />;
      case 'room_changed':
        return <DoorOpen size={16} color="#0D9488" />;
      default:
        return <Bell size={16} color="#64748B" />;
    }
  };

  const getBadgeStyle = (type: LectureChangeAlert['type']) => {
    switch (type) {
      case 'cancelled':
        return { background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' };
      case 'rescheduled':
        return { background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' };
      case 'teacher_changed':
        return { background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE' };
      case 'room_changed':
        return { background: '#F0FDFA', color: '#115E59', border: '1px solid #99F6E4' };
      default:
        return { background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' };
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          background: '#FFFFFF',
          boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.25s ease-out'
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FAFAFA'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bell size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                  Notifications &amp; Schedule Alerts
                </h3>
                {activeAlerts.length > 0 && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    background: '#EF4444',
                    color: '#FFF',
                    padding: '2px 7px',
                    borderRadius: '10px'
                  }}>
                    {activeAlerts.length}
                  </span>
                )}
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                {role === 'student' ? 'Timetable changes affecting your division' : 'Live updates affecting your teaching schedule'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              border: 'none',
              background: '#F1F5F9',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch & Actions */}
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          background: '#FFFFFF'
        }}>
          <div style={{ display: 'flex', gap: '6px', background: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
            <button
              onClick={() => setTab('active')}
              style={{
                border: 'none',
                background: tab === 'active' ? '#FFFFFF' : 'transparent',
                color: tab === 'active' ? '#0F172A' : '#64748B',
                fontWeight: tab === 'active' ? 700 : 500,
                fontSize: '12px',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: tab === 'active' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              Active ({activeAlerts.length})
            </button>
            <button
              onClick={() => setTab('history')}
              style={{
                border: 'none',
                background: tab === 'history' ? '#FFFFFF' : 'transparent',
                color: tab === 'history' ? '#0F172A' : '#64748B',
                fontWeight: tab === 'history' ? 700 : 500,
                fontSize: '12px',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: tab === 'history' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              Past / History ({dismissedAlerts.length})
            </button>
          </div>

          {tab === 'active' && activeAlerts.length > 0 && (
            <button
              onClick={onMarkAllAsRead}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#2563EB',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#F1F5F9',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto'
              }}>
                <Bell size={24} />
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#475569', margin: '0 0 4px 0' }}>
                {tab === 'active' ? 'No Active Schedule Alerts' : 'No History Yet'}
              </h4>
              <p style={{ fontSize: '12px', margin: 0 }}>
                {tab === 'active' 
                  ? 'Your timetable is currently running according to the master plan.' 
                  : 'Dismissed or resolved schedule changes will appear here.'}
              </p>
            </div>
          ) : (
            currentList.map((alert) => (
              <div 
                key={alert.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  position: 'relative'
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {getAlertIcon(alert.type)}
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      ...getBadgeStyle(alert.type)
                    }}>
                      {alert.type.replace('_', ' ')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={11} />
                      {alert.timestamp}
                    </span>

                    {tab === 'active' ? (
                      <button
                        onClick={() => onDismissAlert(alert.id)}
                        title="Dismiss notification"
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex'
                        }}
                      >
                        <X size={15} />
                      </button>
                    ) : onRestoreAlert ? (
                      <button
                        onClick={() => onRestoreAlert(alert.id)}
                        title="Move back to active"
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#2563EB',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex'
                        }}
                      >
                        <RotateCcw size={13} />
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Subject & Division */}
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                    {alert.subject}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    Division: <strong>{alert.divisionKey.replace(/_/g, ' ')}</strong>
                  </div>
                </div>

                {/* Change Details */}
                <div style={{
                  background: '#F8FAFC',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #F1F5F9',
                  fontSize: '12px'
                }}>
                  {alert.oldValue && (
                    <div style={{ color: '#64748B' }}>
                      Previous: <span style={{ textDecoration: 'line-through' }}>{alert.oldValue}</span>
                    </div>
                  )}
                  {alert.newValue && (
                    <div style={{ color: '#0F172A', fontWeight: 600, marginTop: '2px' }}>
                      Updated: {alert.newValue}
                    </div>
                  )}
                  {alert.reason && (
                    <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', fontStyle: 'italic' }}>
                      Note: &ldquo;{alert.reason}&rdquo;
                    </div>
                  )}
                </div>

                {/* Footer Metadata */}
                <div style={{ fontSize: '11px', color: '#94A3B8', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Authorized by: <strong>{alert.triggeredBy}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid #E2E8F0',
          background: '#FAFAFA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Logged in as <strong>{userName}</strong>
          </span>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
