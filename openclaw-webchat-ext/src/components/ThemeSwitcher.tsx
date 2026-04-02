import React from 'react';
import { Palette } from 'lucide-react';
import { Theme, AccentColor } from '../types';

interface ThemeSwitcherProps {
  currentTheme: Theme;
  currentAccent: AccentColor;
  onThemeChange: (theme: Theme) => void;
  onAccentChange: (accent: AccentColor) => void;
}

const themes: { value: Theme; label: string; icon: string }[] = [
  { value: 'dark', label: '深色', icon: '🌙' },
  { value: 'light', label: '浅色', icon: '☀️' },
  { value: 'oled', label: 'OLED', icon: '⚫' },
];

const accents: { value: AccentColor; label: string; color: string }[] = [
  { value: 'cyan', label: '青色', color: '#06b6d4' },
  { value: 'violet', label: '紫色', color: '#8b5cf6' },
  { value: 'emerald', label: '翡翠', color: '#10b981' },
  { value: 'amber', label: '琥珀', color: '#f59e0b' },
  { value: 'rose', label: '玫瑰', color: '#f43f5e' },
  { value: 'blue', label: '蓝色', color: '#3b82f6' },
];

export default function ThemeSwitcher({
  currentTheme,
  currentAccent,
  onThemeChange,
  onAccentChange,
}: ThemeSwitcherProps) {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          padding: 'var(--spacing-sm)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-xs)',
          transition: 'all var(--transition-fast)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <Palette size={18} />
      </button>

      {showMenu && (
        <>
          {/* 遮罩层 */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={() => setShowMenu(false)}
          />
          
          {/* 菜单 */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 'var(--spacing-sm)',
              padding: 'var(--spacing-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              minWidth: 200,
              zIndex: 1000,
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {/* 主题选择 */}
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: 'var(--spacing-sm)',
                }}
              >
                主题
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                {themes.map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => onThemeChange(theme.value)}
                    style={{
                      flex: 1,
                      padding: 'var(--spacing-sm)',
                      background:
                        currentTheme === theme.value
                          ? 'var(--accent-light)'
                          : 'var(--bg-primary)',
                      border:
                        currentTheme === theme.value
                          ? '1px solid var(--accent-primary)'
                          : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 'var(--spacing-xs)',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{theme.icon}</span>
                    <span
                      style={{
                        fontSize: 10,
                        color:
                          currentTheme === theme.value
                            ? 'var(--accent-primary)'
                            : 'var(--text-secondary)',
                      }}
                    >
                      {theme.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 强调色选择 */}
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: 'var(--spacing-sm)',
                }}
              >
                强调色
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
                {accents.map((accent) => (
                  <button
                    key={accent.value}
                    onClick={() => onAccentChange(accent.value)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: accent.color,
                      border:
                        currentAccent === accent.value
                          ? '2px solid var(--text-primary)'
                          : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      position: 'relative',
                    }}
                    title={accent.label}
                  >
                    {currentAccent === accent.value && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: 'white',
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
