import React from 'react';
import { Plus, Trash2, MessageSquare, Clock } from 'lucide-react';
import { Session } from '../types';

interface SidebarProps {
  sessions: Session[];
  currentSession: string | null;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  width: number;
}

export default function Sidebar({
  sessions,
  currentSession,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  width,
}: SidebarProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    return date.toLocaleDateString();
  };

  return (
    <div
      style={{
        width: `${width}px`,
        height: '100%',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--transition-normal)',
      }}
    >
      {/* 头部 */}
      <div
        style={{
          padding: 'var(--spacing-lg)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <button
          onClick={onCreateSession}
          style={{
            width: '100%',
            padding: 'var(--spacing-md)',
            background: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--spacing-sm)',
            fontWeight: 500,
            transition: 'background var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent-primary)')}
        >
          <Plus size={16} />
          <span>新会话</span>
        </button>
      </div>

      {/* 会话列表 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-sm)' }}>
        {sessions.length === 0 ? (
          <div
            style={{
              padding: 'var(--spacing-xl)',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <MessageSquare size={32} style={{ margin: '0 auto var(--spacing-md)', opacity: 0.3 }} />
            <div>暂无会话</div>
            <div style={{ fontSize: 12, marginTop: 'var(--spacing-xs)' }}>
              创建新会话开始聊天
            </div>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              style={{
                padding: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-xs)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                background:
                  currentSession === session.id ? 'var(--accent-light)' : 'transparent',
                border:
                  currentSession === session.id
                    ? '1px solid var(--accent-primary)'
                    : '1px solid transparent',
                transition: 'all var(--transition-fast)',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (currentSession !== session.id) {
                  e.currentTarget.style.background = 'var(--hover-bg)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentSession !== session.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--spacing-xs)',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'var(--text-primary)',
                  }}
                >
                  {session.title || '新会话'}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  style={{
                    padding: 'var(--spacing-xs)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'all var(--transition-fast)',
                    opacity: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.color = 'var(--accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: 'var(--spacing-xs)',
                }}
              >
                {session.preview || '新对话'}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                }}
              >
                <Clock size={10} />
                <span>{formatTime(session.lastActivity)}</span>
                {session.tokenUsage && session.tokenLimit && (
                  <>
                    <span style={{ margin: '0 var(--spacing-xs)' }}>•</span>
                    <div
                      style={{
                        flex: 1,
                        height: 3,
                        background: 'var(--bg-tertiary)',
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${(session.tokenUsage / session.tokenLimit) * 100}%`,
                          background: 'var(--accent-primary)',
                          borderRadius: 2,
                        }}
                      />
                    </div>
                    <span>{Math.round((session.tokenUsage / session.tokenLimit) * 100)}%</span>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
