import { useState, useEffect, useRef, useCallback } from 'react';
import { GatewayMessage, Session, ChatMessage } from '../types';
import { buildConnectParams } from '../utils/deviceAuth';

type MessageHandler = (msg: GatewayMessage) => void;

export function useGateway(gatewayUrl?: string, token?: string) {
  const [connected, setConnected] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<string, MessageHandler>>(new Map());
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 连接 WebSocket
  const connect = useCallback((url?: string, authToken?: string) => {
    const wsUrl = url || gatewayUrl || 'ws://127.0.0.1:18789';
    const wsToken = authToken || token;

    // 清理 URL 末尾的斜杠
    const cleanUrl = wsUrl.replace(/\/+$/, '');

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[Gateway] Already connected');
      return;
    }

    // 关闭现有连接
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    console.log(`[Gateway] Connecting to ${cleanUrl}...`);

    try {
      const ws = new WebSocket(cleanUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[Gateway] ✓ WebSocket open, waiting for challenge...');
        setConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const msg: GatewayMessage = JSON.parse(event.data);
          
          // 处理 challenge 认证
          if (msg.type === 'event' && (msg as any).event === 'connect.challenge') {
            const nonce = msg.payload.nonce;
            console.log('[Gateway] Received challenge, nonce:', nonce);
            
            // 使用设备签名构建 connect 请求
            buildConnectParams({ token: wsToken, nonce })
              .then((params) => {
                const requestId = crypto.randomUUID();
                const connectRequest = {
                  type: 'req',
                  id: requestId,
                  method: 'connect',
                  params,
                };
                
                console.log('[Gateway] Sending connect request:', JSON.stringify(connectRequest, null, 2));
                ws.send(JSON.stringify(connectRequest));
              })
              .catch((err) => {
                console.error('[Gateway] Failed to build connect params:', err);
                setError('设备签名失败');
                ws.close();
              });
            return;
          }
          
          // 处理连接响应
          if (msg.type === 'res' && msg.id) {
            if (msg.ok) {
              console.log('[Gateway] ✓ Authentication successful!');
              setError(null);
            } else {
              console.error('[Gateway] ✗ Authentication failed:', msg.error);
              setError(`认证失败: ${msg.error?.message || 'Unknown error'}`);
              ws.close();
            }
            return;
          }
          
          handleMessage(msg);

          // 通知所有注册的处理器
          handlersRef.current.forEach((handler) => {
            handler(msg);
          });
        } catch (err) {
          console.error('[Gateway] Parse error:', err);
        }
      };

      ws.onclose = (event) => {
        console.log(`[Gateway] ✗ Disconnected (code: ${event.code}, reason: ${event.reason || 'N/A'})`);
        setConnected(false);

        // 自动重连（最多重试 5 次）
        if (!event.wasClean) {
          console.log('[Gateway] Will reconnect in 3 seconds...');
          reconnectTimerRef.current = setTimeout(() => {
            connect(cleanUrl, wsToken);
          }, 3000);
        }
      };

      ws.onerror = (err) => {
        console.error('[Gateway] ✗ WebSocket error:', err);
        console.error('[Gateway] Possible causes:');
        console.error('  1. OpenClaw Gateway is not running');
        console.error('  2. Wrong URL (should be ws://host:18789)');
        console.error('  3. CORS issue - check gateway.allowedOrigins config');
        console.error('  4. Firewall blocking port 18789');
        setError(`连接失败: ${cleanUrl}\n请确认 OpenClaw Gateway 正在运行`);
      };
    } catch (err) {
      console.error('[Gateway] ✗ Connection error:', err);
      setError(`无法连接到 Gateway: ${cleanUrl}`);
    }
  }, [gatewayUrl, token]);

  // 处理消息
  const handleMessage = useCallback((msg: GatewayMessage) => {
    switch (msg.type) {
      case 'session.list':
        setSessions(msg.payload.sessions || []);
        break;

      case 'session.update':
        setSessions((prev) => {
          const idx = prev.findIndex((s) => s.id === msg.payload.id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...msg.payload };
            return updated;
          }
          return [...prev, msg.payload];
        });
        break;

      case 'chat.message':
        const { id, delta, done, thinking: thoughtDelta } = msg.payload;
        
        if (thoughtDelta) {
          setThinking((prev) => [...prev, thoughtDelta]);
        }

        if (delta) {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.id === id) {
              return prev.map((m) =>
                m.id === id ? { ...m, content: m.content + delta, done } : m
              );
            } else {
              return [
                ...prev,
                {
                  id,
                  role: 'assistant',
                  content: delta,
                  timestamp: Date.now(),
                  done,
                },
              ];
            }
          });
        }

        if (done) {
          setThinking([]);
        }
        break;

      case 'chat.done':
        setThinking([]);
        setMessages((prev) =>
          prev.map((m) => (m.done === undefined ? { ...m, done: true } : m))
        );
        break;

      case 'agent.event':
        if (msg.payload.thinking) {
          setThinking((prev) => [...prev, msg.payload.thinking]);
        }
        break;
    }
  }, []);

  // 发送消息
  const send = useCallback((type: string, payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('[Gateway] Not connected');
    }
  }, []);

  // 发送聊天消息
  const sendMessage = useCallback((text: string, sessionId?: string) => {
    send('chat.send', {
      text,
      sessionId: sessionId || currentSession,
      idempotencyKey: crypto.randomUUID(),
    });
  }, [send, currentSession]);

  // 创建新会话
  const createSession = useCallback(() => {
    send('session.create', {});
  }, [send]);

  // 切换会话
  const switchSession = useCallback((sessionId: string) => {
    setCurrentSession(sessionId);
    setMessages([]);
    setThinking([]);
    send('session.switch', { sessionId });
  }, [send]);

  // 删除会话
  const deleteSession = useCallback((sessionId: string) => {
    send('session.delete', { sessionId });
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (currentSession === sessionId) {
      setCurrentSession(null);
      setMessages([]);
    }
  }, [send, currentSession]);

  // 注册消息处理器
  const onMessage = useCallback((type: string, handler: MessageHandler) => {
    handlersRef.current.set(type, handler);
    return () => {
      handlersRef.current.delete(type);
    };
  }, []);

  // 断开连接
  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  }, []);

  // 清理
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connected,
    sessions,
    currentSession,
    messages,
    thinking,
    error,
    connect,
    disconnect,
    send,
    sendMessage,
    createSession,
    switchSession,
    deleteSession,
    onMessage,
  };
}
