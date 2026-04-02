const WebSocket = require('ws');

const GATEWAY_URL = 'ws://127.0.0.1:18789';
const TOKEN = '33adf087441f8d055d65f497dc11c4605555484d9e00f523';

console.log('🔌 测试 Gateway 连接');
console.log('');

const ws = new WebSocket(GATEWAY_URL);

ws.on('open', () => {
  console.log('✅ WebSocket 连接成功，等待 challenge...');
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  console.log('📨 收到消息:', JSON.stringify(msg, null, 2));
  
  if (msg.type === 'event' && msg.event === 'connect.challenge') {
    const nonce = msg.payload.nonce;
    console.log('\n🔐 收到 challenge, nonce:', nonce);
    
    // 发送简单的 connect 请求（不带设备签名）
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
          mode: 'webchat',
        },
        role: 'operator',
        scopes: ['operator.read', 'operator.write', 'operator.admin'],
        caps: [],
        commands: [],
        permissions: {},
        auth: { token: TOKEN },
        locale: 'zh-CN',
        userAgent: 'test-script/1.0.0',
      },
    };
    
    console.log('\n📤 发送 connect 请求（无设备签名）:');
    console.log(JSON.stringify(connectRequest, null, 2));
    ws.send(JSON.stringify(connectRequest));
    return;
  }
  
  if (msg.type === 'res') {
    if (msg.ok) {
      console.log('\n✅ 连接成功！');
    } else {
      console.log('\n❌ 连接失败:', msg.error);
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
