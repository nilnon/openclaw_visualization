# OpenClaw WebChat Ext

基于 OpenClaw Control UI 设计系统的完整聊天界面实现。

## ✨ 功能特性

### 核心功能
- 💬 **实时聊天** - WebSocket 连接，流式消息接收
- 🧠 **思考过程展示** - 可展开的 AI 思考步骤
- 🔧 **工具调用可视化** - 查看工具参数和结果
- 📝 **Markdown 渲染** - 支持代码块、粗体、斜体等
- 📋 **会话管理** - 创建、切换、删除会话

### UI 特性
- 🎨 **主题切换** - 深色、浅色、OLED 三种主题
- 🌈 **6 种强调色** - 青色、紫色、翡翠、琥珀、玫瑰、蓝色
- 📱 **响应式设计** - 可折叠侧边栏
- ⚡ **流畅动画** - 淡入、脉冲、旋转等动效
- 🎯 **CSS 变量系统** - 完全复用 OpenClaw Control UI 样式

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

默认访问: http://localhost:5175

### 配置 Gateway 连接

#### 方式 1: URL 参数
```
http://localhost:5175?gatewayUrl=ws://127.0.0.1:18789
```

#### 方式 2: Hash Token
```
http://localhost:5175?gatewayUrl=ws://127.0.0.1:18789#token=your-token-here
```

## 📁 项目结构

```
src/
├── components/          # React 组件
│   ├── Header.tsx      # 顶部导航栏
│   ├── Sidebar.tsx     # 会话侧边栏
│   ├── Chat.tsx        # 聊天主界面
│   ├── ChatMessage.tsx # 消息渲染（含思考/工具调用）
│   ├── ChatInput.tsx   # 消息输入框
│   └── ThemeSwitcher.tsx # 主题切换器
├── hooks/              # 自定义 Hooks
│   ├── useGateway.ts   # WebSocket 连接和消息处理
│   └── useTheme.ts     # 主题管理和 CSS 变量应用
├── styles/
│   └── global.css      # 全局样式和 CSS 变量
├── types/
│   └── index.ts        # TypeScript 类型定义
├── App.tsx             # 主应用组件
└── main.tsx            # 入口文件
```

## 🎨 样式系统

### CSS 变量（从 OpenClaw Control UI 复制）

#### 主题变量
- `--bg-primary` - 主背景色
- `--bg-secondary` - 次背景色
- `--bg-tertiary` - 第三背景色
- `--text-primary` - 主文本色
- `--text-secondary` - 次文本色
- `--border-color` - 边框颜色

#### 强调色变量
- `--accent-primary` - 主强调色
- `--accent-hover` - 悬停强调色
- `--accent-light` - 浅色强调色

#### 间距变量
- `--spacing-xs` - 4px
- `--spacing-sm` - 8px
- `--spacing-md` - 12px
- `--spacing-lg` - 16px
- `--spacing-xl` - 24px

### 主题切换

通过 `useTheme` hook 动态切换主题，所有 CSS 变量会自动更新：

```typescript
const { theme, accentColor, setTheme, setAccentColor } = useTheme();

setTheme('dark');  // 'dark' | 'light' | 'oled'
setAccentColor('cyan');  // 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose' | 'blue'
```

## 🔌 WebSocket 协议

### 连接
```typescript
const { connect, connected } = useGateway(url, token);
```

### 消息类型
- `session.list` - 会话列表
- `session.update` - 会话更新
- `chat.message` - 聊天消息（流式）
- `chat.done` - 消息完成
- `agent.event` - Agent 事件（思考过程）

### 发送消息
```typescript
const { sendMessage } = useGateway();
sendMessage('你好，OpenClaw!');
```

## 🛠 技术栈

- **React 18.2** - UI 框架
- **TypeScript 5.0** - 类型安全
- **Vite 4.4** - 构建工具
- **Lucide React** - 图标库
- **Marked** - Markdown 解析
- **DOMPurify** - XSS 防护

## 📝 开发说明

### 添加新组件
所有组件使用 CSS 变量，自动适配主题：

```tsx
<div style={{
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-color)',
  padding: 'var(--spacing-md)',
  borderRadius: 'var(--radius-md)'
}}>
  内容
</div>
```

### 自定义样式
编辑 `src/styles/global.css` 添加新的 CSS 变量或类。

## 🎯 与原版对比

| 特性 | 原版 | WebChat Ext |
|------|------|-------------|
| 聊天界面 | ✅ 基础 | ✅ 完整 |
| 会话管理 | ❌ | ✅ |
| 主题切换 | ❌ | ✅ 3 主题 + 6 色 |
| 思考展示 | ✅ 基础 | ✅ 可展开 |
| 工具调用 | ❌ | ✅ 可视化 |
| Markdown | ❌ | ✅ |
| CSS 变量 | ❌ | ✅ OpenClaw 样式 |
| 响应式 | ❌ | ✅ |

## 📄 License

MIT
