import React from 'react';
import { AlertCircle, RefreshCw, Settings } from 'lucide-react';

interface ConnectionBannerProps {
  error: string | null;
  onRetry: () => void;
}

export default function ConnectionBanner({ error, onRetry }: ConnectionBannerProps) {
  if (!error) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 70,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid #ef4444',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-lg)',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
          maxWidth: 500,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-md)',
        }}
      >
        {/* 错误标题 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <AlertCircle size={20} style={{ color: '#ef4444' }} />
          <strong style={{ color: '#ef4444', fontSize: 14 }}>连接失败</strong>
        </div>

        {/* 错误信息 */}
        <div
          style={{
            color: 'var(--text-secondary)',
            fontSize: 13,
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
          }}
        >
          {error}
        </div>

        {/* 排查建议 */}
        <div
          style={{
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-md)',
            fontSize: 12,
            color: 'var(--text-muted)',
          }}
        >
          <strong style={{ color: 'var(--text-secondary)' }}>排查建议：</strong>
          <ol style={{ margin: 'var(--spacing-sm) 0 0', paddingLeft: 20 }}>
            <li>确认 OpenClaw Gateway 正在运行</li>
            <li>检查 URL 是否正确 (ws://host:18789)</li>
            <li>确认防火墙未阻止端口 18789</li>
            <li>检查 Gateway 的 allowedOrigins 配置</li>
          </ol>
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
          <button
            onClick={onRetry}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-md)',
              background: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              fontSize: 13,
              fontWeight: 500,
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent-primary)')}
          >
            <RefreshCw size={14} />
            <span>重试连接</span>
          </button>
        </div>
      </div>
    </div>
  );
}
