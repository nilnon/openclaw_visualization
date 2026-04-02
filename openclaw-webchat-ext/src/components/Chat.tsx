import React, { useEffect, useRef } from 'react';
import ChatMessageComponent from './ChatMessage';
import ChatInput from './ChatInput';
import { ChatMessage } from '../types';
import { Loader2, MessageSquare } from 'lucide-react';

interface ChatProps {
  messages: ChatMessage[];
  thinking: string[];
  isStreaming: boolean;
  onSendMessage: (text: string) => void;
}

export default function Chat({ messages, thinking, isStreaming, onSendMessage }: ChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)',
        overflow: 'hidden',
      }}
    >
      {/* 消息列表 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--spacing-lg) 0',
        }}
      >
        {messages.length === 0 && !isStreaming ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              animation: 'fadeIn 0.5s ease',
            }}
          >
            <MessageSquare size={64} style={{ marginBottom: 'var(--spacing-lg)', opacity: 0.2 }} />
            <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 'var(--spacing-sm)' }}>
              开始新对话
            </div>
            <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 400, lineHeight: 1.6 }}>
              输入消息开始与 OpenClaw AI 助手对话
              <br />
              支持 Markdown、代码块和工具调用可视化
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessageComponent key={msg.id} message={msg} />
            ))}
            
            {/* 思考指示器 */}
            {isStreaming && thinking.length === 0 && (
              <div
                style={{
                  padding: 'var(--spacing-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  color: 'var(--text-secondary)',
                  animation: 'fadeIn 0.3s ease',
                }}
              >
                <Loader2 size={16} className="animate-spin" />
                <span>AI 正在思考...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 输入框 */}
      <ChatInput
        onSend={onSendMessage}
        disabled={false}
        isStreaming={isStreaming}
      />
    </div>
  );
}
