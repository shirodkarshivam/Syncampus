import React from 'react';
import { ShieldCheck, Wifi, Database, Mail, Server } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="greeting-title">System Settings &amp; Health</h1>
          <p className="greeting-subtitle">
            Configure system parameters, verify sync pipelines, and audit infrastructure services.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
        <div className="content-box-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Server size={20} color="#2563EB" />
            <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Central Campus Synchronization</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            SyncCampus core principle: One change in the system automatically synchronizes to every student, teacher, and administrator in real-time.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>WebSocket Layer</div>
              <div style={{ color: '#059669', fontWeight: 600, fontSize: '14px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }}></span>
                Connected (Socket.IO)
              </div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Conflict Engine</div>
              <div style={{ color: '#2563EB', fontWeight: 600, fontSize: '14px', marginTop: '4px' }}>
                4-Way Checker Active
              </div>
            </div>
          </div>
        </div>

        <div className="content-box-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Mail size={20} color="#7C3AED" />
            <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Authentication &amp; Access</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            All campus members authenticate via verified 6-digit email OTP. Passwords are eliminated for zero-friction campus security.
          </p>
          <div style={{ fontSize: '13px', color: 'var(--text-main)' }}>
            <strong>OTP Expiry Window:</strong> 5 minutes &bull; <strong>Max Attempts:</strong> 3 &bull; <strong>Session Duration:</strong> 7 days
          </div>
        </div>
      </div>
    </div>
  );
};
