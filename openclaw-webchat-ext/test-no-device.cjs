const WebSocket = require('ws');
const crypto = require('crypto');

const GATEWAY_URL = 'ws://127.0.0.1:18789';
const TOKEN = '33adf087441f8d055d65f497dc11c4605555484d9e00f523';

console.log('🔌 测试 Gateway 连接 (无设备签名)');
console.log('');

const ws = new WebSocket(GATEWAY_URL);

ws.on('open', () => {
  console.log('✅ WebSocket 连接成功');
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  console.log('📨 收到:', JSON.stringify(msg).substring(0, 200));
  
  if (msg.type === 'event' && msg.event === 'connect.challenge') {
    const nonce = msg.payload.nonce;
    
    const connectRequest = {
      type: 'req',
      id: crypto.randomUUID(),
      method: 'connect',
      params: {
        minProtocol: 3,
        maxProtocol: 3,
        client: { id: 'cli', version: '2026.4.1', platform: 'win32', mode: 'cli' },
        role: 'operator',
        scopes: ['operator.read', 'operator.write'],
        caps: [],
        commands: [],
        permissions: {},
        auth: { token: TOKEN },
        locale: 'zh-CN',
        userAgent: 'test/1.0.0',
      },
    };
    
    console.log('📤 发送 connect (无 device):');
    ws.send(JSON.stringify(connectRequest));
  }
  
  if (msg.type === 'res') {
    if (msg.ok) {
      console.log('\n✅ 成功!', JSON.stringify(msg.payload));
    } else {
      console.log('\n❌ 失败:', JSON.stringify(msg.error));
    }
    ws.close();
  }
});

ws.on('close', () => process.exit(0));
setTimeout(() => { ws.close(); process.exit(1); }, 8000);
