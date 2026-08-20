import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  if (typeof window !== 'undefined') {
    // Nếu chạy Localhost, trỏ tới port 3001
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `http://${window.location.hostname}:3001`;
    }
    // Trên Production nếu đi qua Nginx / Caddy reverse proxy, sử dụng cùng domain gốc
    return window.location.origin;
  }
  return 'http://localhost:3001';
}

export function initSocket(): Socket {
  if (typeof window === 'undefined') {
    return null as any;
  }

  if (!socket) {
    const url = getSocketUrl();
    socket = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('⚡ [Socket Client] Connected to real-time chat server:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('⚡ [Socket Client] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ [Socket Client] Connection error (will retry or use fallback):', err.message);
    });
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export function getSocket(): Socket | null {
  if (!socket && typeof window !== 'undefined') {
    return initSocket();
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
