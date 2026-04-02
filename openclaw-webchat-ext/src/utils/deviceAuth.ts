export async function buildConnectParams(params: {
  token?: string;
  nonce: string;
}): Promise<any> {
  return {
    minProtocol: 3,
    maxProtocol: 3,
    client: {
      id: 'cli',
      version: '2026.4.1',
      platform: 'win32',
      mode: 'cli',
    },
    role: 'operator',
    scopes: ['operator.read', 'operator.write'],
    caps: [],
    commands: [],
    permissions: {},
    auth: params.token ? { token: params.token } : undefined,
    locale: 'zh-CN',
    userAgent: 'openclaw-webchat-ext/1.0.0',
  };
}
