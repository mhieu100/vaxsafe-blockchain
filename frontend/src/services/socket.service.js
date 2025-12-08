import { io } from 'socket.io-client';

class SocketService {
  constructor(url = 'http://localhost:4000') {
    this.socket = null;
    this.url = url;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(this.url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupListeners();
    return this.socket;
  }

  setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (_reason) => {});

    this.socket.on('connect_error', (_error) => {
      this.reconnectAttempts += 1;
    });

    this.socket.on('error', (_error) => {});
  }

  onBlockchainStats(callback) {
    if (!this.socket) return;
    this.socket.on('blockchainStats', callback);
  }

  onNewBlock(callback) {
    if (!this.socket) return;
    this.socket.on('newBlock', callback);
  }

  offBlockchainStats(callback) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off('blockchainStats', callback);
    } else {
      this.socket.off('blockchainStats');
    }
  }

  offNewBlock(callback) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off('newBlock', callback);
    } else {
      this.socket.off('newBlock');
    }
  }

  getStats() {
    if (!this.socket) return;
    this.socket.emit('getStats');
  }

  onContractTransaction(callback) {
    if (!this.socket) return;
    this.socket.on('contractTransaction', callback);
  }

  offContractTransaction(callback) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off('contractTransaction', callback);
    } else {
      this.socket.off('contractTransaction');
    }
  }

  onContractEvent(callback) {
    if (!this.socket) return;
    this.socket.on('contractEvent', callback);
  }

  offContractEvent(callback) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off('contractEvent', callback);
    } else {
      this.socket.off('contractEvent');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService(
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'
);

export default socketService;
