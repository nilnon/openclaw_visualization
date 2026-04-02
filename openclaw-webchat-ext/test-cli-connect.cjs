const WebSocket = require('ws');
const crypto = require('crypto');

const GATEWAY_URL = 'ws://127.0.0.1:18789';
const TOKEN = '33adf087441f8d055d65f497dc11c4605555484d9e00f523';

console.log('🔌 测试 Gateway 连接 (使用 cli 客户端)');
console.log('地址:', GATEWAY_URL);
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
    
    // 生成临时密钥对 (PEM 格式)
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    
    // 从 PEM 格式的公钥提取 deviceId
    const publicKeyDer = Buffer.from(publicKey.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\n/g, ''), 'base64');
    const deviceId = publicKeyDer.slice(-32).toString('hex');
    
    // 公钥转 base64 (DER 格式)
    const publicKeyBase64 = publicKeyDer.toString('base64');
    
    const signedAt = Date.now();
    
    // 使用 cli 客户端 ID - 不需要 Origin 验证
    const clientId = 'cli';
    const clientMode = 'cli';
    const role = 'operator';
    const scopes = ['operator.read', 'operator.write', 'operator.admin'];
    
    // 构建签名 payload
    const payloadParts = [
      'v2',
      deviceId,
      clientId,
      clientMode,
      role,
      scopes.join(','),
      signedAt.toString(),
      TOKEN,
      nonce,
    ];
    const payloadStr = payloadParts.join(':');
    
    // 签名
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(payloadStr);
    const signature = sign.sign(privateKey, 'base64');
    
    // 构建 connect 请求
    const connectRequest = {
      type: 'req',
      id: crypto.randomUUID(),
      method: 'connect',
      params: {
        minProtocol: 3,
        maxProtocol: 3,
        client: {
          id: clientId,
          version: '2026.4.1',
          platform: 'win32',
          mode: clientMode,
        },
        role,
        scopes,
        caps: [],
        commands: [],
        permissions: {},
        auth: { token: TOKEN },
        locale: 'zh-CN',
        userAgent: 'openclaw-webchat-ext/1.0.0',
        device: {
          id: deviceId,
          publicKey: publicKeyBase64,
          signature,
          signedAt,
          nonce,
        },
      },
    };
    
    console.log('\n📤 发送 connect 请求 (cli 模式):');
    ws.send(JSON.stringify(connectRequest));
  }
  
  if (msg.type === 'res') {
    if (msg.ok) {
      console.log('\n✅ 认证成功！');
      console.log('协议版本:', msg.payload?.protocol);
    } else {
      console.log('\n❌ 认证失败:', JSON.stringify(msg.error, null, 2));
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
