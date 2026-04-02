import React from 'react';
import { Wifi, WifiOff, Menu, PanelLeftClose } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import { Theme, AccentColor } from '../types';

interface HeaderProps {
  connected: boolean;
  showSidebar: boolean;
  onToggleSidebar: () => void;
  theme: Theme;
  accentColor: AccentColor;
  onThemeChange: (theme: Theme) => void;
  onAccentChange: (accent: AccentColor) => void;
  title?: string;
}

export default function Header({
  connected,
  showSidebar,
  onToggleSidebar,
  theme,
  accentColor,
  onThemeChange,
  onAccentChange,
  title = 'OpenClaw WebChat',
}: HeaderProps) {
  return (
    <header
      style={{
        height: 60,
        padding: '0 var(--spacing-lg)',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--spacing-md)',
      }}
    >
      {/* 左侧 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            padding: 'var(--spacing-sm)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          title={showSidebar ? '隐藏侧边栏' : '显示侧边栏'}
        >
          {showSidebar ? <PanelLeftClose size={20} /> : <Menu size={20} />}
        </button>
        <h1
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {title}
        </h1>
      </div>

      {/* 右侧 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        {/* 连接状态 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)',
            fontSize: 13,
            color: connected ? 'var(--text-secondary)' : 'var(--text-muted)',
          }}
        >
          {connected ? (
            <Wifi size={16} style={{ color: '#10b981' }} />
          ) : (
            <WifiOff size={16} style={{ color: '#ef4444' }} />
          )}
          <span>{connected ? '已连接' : '未连接'}</span>
        </div>

        {/* 主题切换 */}
        <ThemeSwitcher
          currentTheme={theme}
          currentAccent={accentColor}
          onThemeChange={onThemeChange}
          onAccentChange={onAccentChange}
        />
      </div>
    </header>
  );
}
