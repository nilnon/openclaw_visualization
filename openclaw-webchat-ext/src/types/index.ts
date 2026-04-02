// Gateway WebSocket 消息类型
export interface GatewayMessage {
  type: string;
  payload?: any;
  id?: string;
  method?: string;
  event?: string;
  ok?: boolean;
  error?: {
    code?: string;
    message?: string;
  };
}

// 会话类型
export interface Session {
  id: string;
  title: string;
  preview: string;
  channel: string;
  tokenUsage?: number;
  tokenLimit?: number;
  lastActivity: number;
  isCron?: boolean;
}

// 聊天消息
import { DataType } from '../utils/chartDetector';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  thinking?: string[];
  toolCalls?: ToolCall[];
  chartData?: {
    data: any[];
    dataType: DataType;
    visSyntax: string;
  };
  timestamp: number;
  done?: boolean;
}

// 工具调用
export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
  result?: string;
  status: 'running' | 'completed' | 'failed';
  startTime: number;
  endTime?: number;
}

// Trace 事件
export interface TraceEvent {
  name: string;
  startTime: number;
  endTime?: number;
  attributes?: Record<string, any>;
  children?: TraceEvent[];
}

// 主题类型
export type Theme = 'dark' | 'light' | 'oled';
export type AccentColor = 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose' | 'blue';

// 用户偏好设置
export interface UserPreferences {
  theme: Theme;
  accentColor: AccentColor;
  sidebarWidth: number;
  fontSize: number;
  lineHeight: number;
}
