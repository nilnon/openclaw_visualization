const WebSocket = require('ws');

const GATEWAY_URL = 'ws://127.0.0.1:18789';
const TOKEN = '33adf087441f8d055d65f497dc11c4605555484d9e00f523';

console.log('🔌 测试 Gateway 认证协议');
console.log('地址:', GATEWAY_URL);
console.log('');

const ws = new WebSocket(GATEWAY_URL);

ws.on('open', () => {
  console.log('✅ WebSocket 连接成功，等待 challenge...');
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  console.log('📨 收到消息:', JSON.stringify(msg, null, 2));
  
  // 处理 challenge
  if (msg.type === 'event' && msg.event === 'connect.challenge') {
    const nonce = msg.payload.nonce;
    console.log('\n🔐 收到 challenge, nonce:', nonce);
    
    // 发送 connect 请求
    const connectRequest = {
      type: 'req',
      id: crypto.randomUUID(),
      method: 'connect',
      params: {
        minProtocol: 3,
        maxProtocol: 3,
        client: {
          id: 'openclaw-control-ui',
          version: '1.0.0',
          platform: 'web',
          mode: 'ui'
        },
        role: 'operator',
        scopes: ['operator.read', 'operator.write', 'operator.admin'],
        auth: { token: TOKEN },
        locale: 'zh-CN',
        userAgent: 'test-script/1.0.0',
        device: {
          id: 'test-device-' + Math.random().toString(36).substring(2, 10),
          nonce: nonce
        }
      }
    };
    
    console.log('\n📤 发送 connect 请求...');
    ws.send(JSON.stringify(connectRequest));
    return;
  }
  
  // 处理连接响应
  if (msg.type === 'res') {
    if (msg.ok) {
      console.log('\n✅ 认证成功！');
      console.log('协议版本:', msg.payload?.protocol);
    } else {
      console.log('\n❌ 认证失败:', msg.error);
    }
    ws.close();
  }
});

ws.on('error', (err) => {
  console.error('❌ WebSocket 错误:', err.message);
});

ws.on('close', (code, reason) => {
  console.log('\n🔌 连接关闭, code:', code);
  if (reason) console.log('原因:', reason.toString());
  process.exit(0);
});

setTimeout(() => {
  console.log('⏱️ 超时');
  ws.close();
  process.exit(1);
}, 10000);
