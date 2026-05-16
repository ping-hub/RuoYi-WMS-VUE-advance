const DEFAULT_WSS_PRINT_URL = 'ws://localhost:12353';

function jsonStringifyWithoutEmpty(obj) {
  return JSON.stringify(obj, (key, value) => {
    if (value === '' || value === undefined || value === null) {
      return undefined;
    }
    return value;
  });
}

function parseJsonMessage(data) {
  if (typeof data === 'string') {
    return JSON.parse(data);
  }
  if (data instanceof ArrayBuffer) {
    const text = new TextDecoder().decode(new Uint8Array(data));
    return JSON.parse(text);
  }
  if (data instanceof Blob) {
    return data.text().then(text => JSON.parse(text));
  }
  return JSON.parse(String(data));
}

export function buildQrTscCommand(qrText) {
  const value = qrText == null ? '' : String(qrText);
  return `SIZE 60 mm,40 mm
GAP 2 mm,0 mm
SPEED 5
DENSITY 12
DIRECTION 1
CLS
QRCODE 288,130,M,4,A,0,M2,"${value}"
PRINT 1,1
`;
}

export class WssPrintClient {
  constructor(options = {}) {
    this.url = options.url || DEFAULT_WSS_PRINT_URL;
    this.socket = undefined;
    this.opening = undefined;
    this.pendingQueue = [];
  }

  async connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }
    if (this.opening) {
      await this.opening;
      return;
    }
    this.socket = new WebSocket(this.url);
    this.socket.binaryType = 'arraybuffer';
    this.opening = new Promise((resolve, reject) => {
      const socket = this.socket;
      if (!socket) {
        reject(new Error('socket not initialized'));
        return;
      }
      socket.onopen = () => {
        this.opening = undefined;
        resolve();
      };
      socket.onerror = () => {
        const err = new Error(`connect failed: ${this.url}`);
        this.opening = undefined;
        reject(err);
      };
      socket.onclose = () => {
        const err = new Error('socket closed');
        const pending = this.pendingQueue.splice(0, this.pendingQueue.length);
        pending.forEach(item => item.reject(err));
        this.socket = undefined;
        this.opening = undefined;
      };
      socket.onmessage = async event => {
        let msg;
        try {
          msg = await parseJsonMessage(event.data);
        } catch (e) {
          const current = this.pendingQueue.shift();
          if (current) {
            current.reject(e);
          }
          return;
        }
        const current = this.pendingQueue.shift();
        if (current) {
          current.resolve(msg);
        }
      };
    });
    await this.opening;
  }

  async request(payload) {
    await this.connect();
    const socket = this.socket;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      throw new Error('socket not connected');
    }
    return new Promise((resolve, reject) => {
      this.pendingQueue.push({ resolve, reject });
      socket.send(jsonStringifyWithoutEmpty(payload));
    });
  }

  async listDevices() {
    const res = await this.request({ type: 'ListDevcies' });
    return res?.data || [];
  }

  async sendData(data, printerId) {
    return this.request({ type: 'SendData', printerId, data });
  }

  async closePrinter(printerId) {
    return this.request({ type: 'ClosePrinter', printerId });
  }

  disconnect() {
    const socket = this.socket;
    this.socket = undefined;
    this.opening = undefined;
    const pending = this.pendingQueue.splice(0, this.pendingQueue.length);
    pending.forEach(item => item.reject(new Error('socket disconnected')));
    if (!socket) {
      return;
    }
    try {
      socket.close();
    } catch {
      return;
    }
  }
}

