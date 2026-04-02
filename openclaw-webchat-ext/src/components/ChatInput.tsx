import React, { useState, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  isStreaming?: boolean;
}

export default function ChatInput({ onSend, disabled = false, isStreaming = false }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        padding: 'var(--spacing-lg)',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-primary)',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 'var(--spacing-md)',
          alignItems: 'flex-end',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isStreaming ? 'AI 正在思考...' : '输入消息... (Enter 发送, Shift+Enter 换行)'}
          disabled={disabled || isStreaming}
          rows={1}
          style={{
            flex: 1,
            padding: 'var(--spacing-md)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 1.6,
            resize: 'none',
            minHeight: 44,
            maxHeight: 200,
            transition: 'border-color var(--transition-fast)',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
        />
        <button
          onClick={handleSend}
          disabled={disabled || isStreaming || !input.trim()}
          style={{
            padding: 'var(--spacing-md)',
            background: input.trim() && !disabled && !isStreaming
              ? 'var(--accent-primary)'
              : 'var(--bg-tertiary)',
            color: input.trim() && !disabled && !isStreaming
              ? 'white'
              : 'var(--text-muted)',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            cursor: input.trim() && !disabled && !isStreaming
              ? 'pointer'
              : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 44,
            minHeight: 44,
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            if (input.trim() && !disabled && !isStreaming) {
              e.currentTarget.style.background = 'var(--accent-hover)';
            }
          }}
          onMouseLeave={(e) => {
            if (input.trim() && !disabled && !isStreaming) {
              e.currentTarget.style.background = 'var(--accent-primary)';
            }
          }}
        >
          {isStreaming ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
      <div
        style={{
          textAlign: 'center',
          fontSize: 11,
          color: 'var(--text-muted)',
          marginTop: 'var(--spacing-sm)',
        }}
      >
        OpenClaw WebChat Ext • 按 Enter 发送消息
      </div>
    </div>
  );
}
