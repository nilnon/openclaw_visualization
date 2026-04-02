import React, { useState, useEffect, useCallback } from 'react';
import { useGateway } from './hooks/useGateway';
import { useTheme } from './hooks/useTheme';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import ConnectionBanner from './components/ConnectionBanner';
import './styles/global.css';

export default function App() {
  const [showSidebar, setShowSidebar] = useState(true);
  const { theme, accentColor, setTheme, setAccentColor } = useTheme();

  // 从 URL 参数获取 gatewayUrl 和 token
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash;
  
  // 优先使用 URL 中的 token，否则使用 Gateway 配置的默认 token
  const token = hash.replace('#token=', '') || '33adf087441f8d055d65f497dc11c4605555484d9e00f523';
  
  // 尝试多种连接方式
  // 1. 如果指定了 gatewayUrl 参数，使用它
  // 2. 否则直连 Gateway
  const gatewayUrl = params.get('gatewayUrl') || 'ws://127.0.0.1:18789';
  
  console.log('[App] 尝试连接 Gateway:', gatewayUrl);

  console.log('[App] Gateway URL:', gatewayUrl);
  console.log('[App] Token:', token ? '***' : '(none)');

  const {
    connected,
    sessions,
    currentSession,
    messages,
    thinking,
    error,
    connect,
    sendMessage,
    createSession,
    switchSession,
    deleteSession,
  } = useGateway(gatewayUrl, token);

  // 连接 Gateway
  useEffect(() => {
    console.log('[App] useEffect 触发，准备连接...');
    connect();
  }, [connect]);

  // 发送消息
  const handleSendMessage = useCallback(
    (text: string) => {
      sendMessage(text);
    },
    [sendMessage]
  );

  // 重试连接
  const handleRetry = useCallback(() => {
    connect();
  }, [connect]);

  // 切换侧边栏
  const toggleSidebar = useCallback(() => {
    setShowSidebar((prev) => !prev);
  }, []);

  const isStreaming = thinking.length > 0 || messages.some((m) => m.role === 'assistant' && !m.done);

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)',
      }}
    >
      {/* 连接错误提示 */}
      <ConnectionBanner error={error} onRetry={handleRetry} />

      {/* 头部 */}
      <Header
        connected={connected}
        showSidebar={showSidebar}
        onToggleSidebar={toggleSidebar}
        theme={theme}
        accentColor={accentColor}
        onThemeChange={setTheme}
        onAccentChange={setAccentColor}
        title="OpenClaw WebChat Ext"
      />

      {/* 主体 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 侧边栏 */}
        {showSidebar && (
          <Sidebar
            sessions={sessions}
            currentSession={currentSession}
            onSelectSession={switchSession}
            onCreateSession={createSession}
            onDeleteSession={deleteSession}
            width={280}
          />
        )}

        {/* 聊天区域 */}
        <Chat
          messages={messages}
          thinking={thinking}
          isStreaming={isStreaming}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}