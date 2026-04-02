const DEVICE_ID_KEY = 'openclaw-webchat-device-id';
const PRIVATE_KEY_STORAGE = 'openclaw-webchat-private-key';
const PUBLIC_KEY_STORAGE = 'openclaw-webchat-public-key';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export interface DeviceIdentity {
  deviceId: string;
  privateKey: CryptoKey;
  publicKeyRaw: string;
}

export async function generateDeviceIdentity(): Promise<DeviceIdentity> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify']
  );

  const publicKeyDer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const publicKeyBytes = new Uint8Array(publicKeyDer);
  const publicKeyRaw = arrayBufferToBase64(publicKeyDer);
  
  const deviceId = Array.from(publicKeyBytes.slice(-32))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return { deviceId, privateKey: keyPair.privateKey, publicKeyRaw };
}

export async function getOrCreateDeviceIdentity(): Promise<DeviceIdentity> {
  const storedPrivateKey = localStorage.getItem(PRIVATE_KEY_STORAGE);
  const storedDeviceId = localStorage.getItem(DEVICE_ID_KEY);
  const storedPublicKey = localStorage.getItem(PUBLIC_KEY_STORAGE);

  if (storedPrivateKey && storedDeviceId && storedPublicKey) {
    try {
      const privateKey = await crypto.subtle.importKey(
        'pkcs8',
        base64ToArrayBuffer(storedPrivateKey),
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256',
        },
        true,
        ['sign']
      );
      return { deviceId: storedDeviceId, privateKey, publicKeyRaw: storedPublicKey };
    } catch {
      console.warn('[DeviceAuth] Failed to import stored key, generating new one');
    }
  }

  const identity = await generateDeviceIdentity();
  
  const privateKeyDer = await crypto.subtle.exportKey('pkcs8', identity.privateKey);
  localStorage.setItem(PRIVATE_KEY_STORAGE, arrayBufferToBase64(privateKeyDer));
  localStorage.setItem(DEVICE_ID_KEY, identity.deviceId);
  localStorage.setItem(PUBLIC_KEY_STORAGE, identity.publicKeyRaw);

  return identity;
}

export async function signDevicePayload(params: {
  deviceId: string;
  privateKey: CryptoKey;
  clientId: string;
  clientMode: string;
  role: string;
  scopes: string[];
  token?: string;
  nonce: string;
}): Promise<{ signature: string; signedAt: number }> {
  const signedAt = Date.now();
  
  const payloadParts = [
    'v2',
    params.deviceId,
    params.clientId,
    params.clientMode,
    params.role,
    params.scopes.join(','),
    signedAt.toString(),
    params.token || '',
    params.nonce,
  ];
  
  const payload = payloadParts.join(':');
  console.log('[DeviceAuth] Signing payload:', payload);
  
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  
  const signatureBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    params.privateKey,
    data
  );
  
  const signature = arrayBufferToBase64(signatureBuffer);
  
  return { signature, signedAt };
}

export async function buildConnectParams(params: {
  token?: string;
  nonce: string;
}): Promise<any> {
  const { deviceId, privateKey, publicKeyRaw } = await getOrCreateDeviceIdentity();
  
  const clientId = 'openclaw-control-ui';
  const clientMode = 'webchat';
  const role = 'operator';
  const scopes = ['operator.read', 'operator.write', 'operator.admin'];
  
  const { signature, signedAt } = await signDevicePayload({
    deviceId,
    privateKey,
    clientId,
    clientMode,
    role,
    scopes,
    token: params.token,
    nonce: params.nonce,
  });
  
  return {
    minProtocol: 3,
    maxProtocol: 3,
    client: {
      id: clientId,
      version: '1.0.0',
      platform: 'web',
      mode: clientMode,
    },
    role,
    scopes,
    caps: [],
    commands: [],
    permissions: {},
    auth: params.token ? { token: params.token } : undefined,
    locale: 'zh-CN',
    userAgent: 'openclaw-webchat-ext/1.0.0',
    device: {
      id: deviceId,
      publicKey: publicKeyRaw,
      signature,
      signedAt,
      nonce: params.nonce,
    },
  };
}
