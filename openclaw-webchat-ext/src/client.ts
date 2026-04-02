// WebSocket 连接管理
export interface WSMessage {
  type: string;
  payload?: any;
}

export class OpenClawWS {
  private ws: WebSocket | null = null;
  private url: string;
  private token?: string;
  private handlers: ((msg: WSMessage) => void)[] = [];

  constructor(url: string, token?: string) {
    this.url = url;
    this.token = token;
  }

  connect() {
    const wsUrl = this.token
      ? `${this.url}#token=${this.token}`
      : this.url;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('[OpenClawWS] connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        this.handlers.forEach((h) => h(msg));
      } catch (e) {
        console.error('[OpenClawWS] parse error', e);
      }
    };

    this.ws.onerror = (err) => {
      console.error('[OpenClawWS] error', err);
    };

    this.ws.onclose = () => {
      console.log('[OpenClawWS] closed');
    };
  }

  send(type: string, payload?: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('[OpenClawWS] not connected');
    }
  }

  onMessage(handler: (msg: WSMessage) => void) {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  disconnect() {
    this.ws?.close();
  }
}
