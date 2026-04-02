import React, { useState, useMemo } from 'react';
import { ChatMessage, ToolCall } from '../types';
import { ChevronDown, ChevronUp, Wrench, Brain } from 'lucide-react';
import ChartRenderer from './ChartRenderer';
import { extractChartData } from '../utils/chartDetector';

interface ChatMessageProps {
  message: ChatMessage;
}

export default function ChatMessageComponent({ message }: ChatMessageProps) {
  const [showThinking, setShowThinking] = useState(false);
  const [showToolCalls, setShowToolCalls] = useState(false);
  const isUser = message.role === 'user';
  const chartData = useMemo(() => {
    if (isUser || !message.content) return null;
    return extractChartData(message.content);
  }, [message.content, isUser]);

  const renderMarkdown = (content: string) => {
    // 简易 Markdown 渲染（实际应使用 marked 库）
    return content
      .split('\n')
      .map((line, i) => {
        // 代码块
        if (line.startsWith('```')) {
          return null;
        }
        // 行内代码
        line = line.replace(/`([^`]+)`/g, '<code>$1</code>');
        // 粗体
        line = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        // 斜体
        line = line.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        return (
          <span
            key={i}
            dangerouslySetInnerHTML={{ __html: line }}
            style={{ display: 'block', minHeight: '1.6em' }}
          />
        );
      })
      .filter(Boolean);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: 'var(--spacing-md)',
        padding: 'var(--spacing-lg)',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      {/* 头像 */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: isUser ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isUser ? 'white' : 'var(--text-primary)',
          fontWeight: 'bold',
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {isUser ? 'U' : 'AI'}
      </div>

      {/* 消息内容 */}
      <div
        style={{
          flex: 1,
          maxWidth: '80%',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-sm)',
        }}
      >
        {/* 思考过程 */}
        {message.thinking && message.thinking.length > 0 && (
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setShowThinking(!showThinking)}
              style={{
                width: '100%',
                padding: 'var(--spacing-md)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                color: 'var(--text-secondary)',
                fontSize: 13,
              }}
            >
              <Brain size={14} />
              <span>思考过程 ({message.thinking.length} 步)</span>
              {showThinking ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showThinking && (
              <div
                style={{
                  padding: 'var(--spacing-md)',
                  borderTop: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                }}
              >
                {message.thinking.map((thought, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginBottom: 'var(--spacing-sm)',
                      paddingLeft: 'var(--spacing-md)',
                      borderLeft: '2px solid var(--accent-primary)',
                      color: 'var(--text-secondary)',
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}
                  >
                    <strong style={{ color: 'var(--text-primary)' }}>
                      Step {idx + 1}:
                    </strong>{' '}
                    {thought}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 工具调用 */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setShowToolCalls(!showToolCalls)}
              style={{
                width: '100%',
                padding: 'var(--spacing-md)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                color: 'var(--text-secondary)',
                fontSize: 13,
              }}
            >
              <Wrench size={14} />
              <span>工具调用 ({message.toolCalls.length})</span>
              {showToolCalls ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showToolCalls && (
              <div
                style={{
                  padding: 'var(--spacing-md)',
                  borderTop: '1px solid var(--border-color)',
                }}
              >
                {message.toolCalls.map((tool) => (
                  <ToolCallItem key={tool.id} toolCall={tool} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 图表渲染 */}
        {chartData && <ChartRenderer visSyntax={chartData.visSyntax} />}

        {/* 消息文本 */}
        {message.content && (
          <div
            style={{
              padding: isUser ? 'var(--spacing-md) var(--spacing-lg)' : 0,
              background: isUser ? 'var(--bg-message-user)' : 'transparent',
              borderRadius: isUser ? 'var(--radius-lg)' : 0,
              color: 'var(--text-primary)',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {renderMarkdown(message.content)}
          </div>
        )}

        {/* 时间戳 */}
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            alignSelf: isUser ? 'flex-end' : 'flex-start',
          }}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

// 工具调用子组件
function ToolCallItem({ toolCall }: { toolCall: ToolCall }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return '#f59e0b';
      case 'completed':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      default:
        return 'var(--text-muted)';
    }
  };

  return (
    <div
      style={{
        marginBottom: 'var(--spacing-sm)',
        padding: 'var(--spacing-md)',
        background: 'var(--bg-primary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: getStatusColor(toolCall.status),
              animation: toolCall.status === 'running' ? 'pulse 2s infinite' : 'none',
            }}
          />
          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
            {toolCall.name}
          </span>
        </div>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </div>
      {expanded && (
        <div style={{ marginTop: 'var(--spacing-md)', fontSize: 12 }}>
          <div style={{ marginBottom: 'var(--spacing-sm)' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>参数:</strong>
            <pre
              style={{
                marginTop: 'var(--spacing-xs)',
                padding: 'var(--spacing-sm)',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'auto',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {JSON.stringify(toolCall.args, null, 2)}
            </pre>
          </div>
          {toolCall.result && (
            <div>
              <strong style={{ color: 'var(--text-secondary)' }}>结果:</strong>
              <pre
                style={{
                  marginTop: 'var(--spacing-xs)',
                  padding: 'var(--spacing-sm)',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'auto',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {toolCall.result}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
