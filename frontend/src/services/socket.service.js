/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import { io } from 'socket.io-client';

/**
 * Socket.io service for real-time blockchain updates
 */
class SocketService {
  /**
   * Create a new SocketService instance
   * @param {string} url - Socket.io server URL (default: http://localhost:4000)
   */
  constructor(url = 'http://localhost:4000') {
    this.socket = null;
    this.url = url;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Connect to Socket.io server
   * @returns {object} Socket instance
   */
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

  /**
   * Setup default socket event listeners
   * @private
   */
  setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket.IO Connected!');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection Error:', error.message);
      this.reconnectAttempts += 1;
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket Error:', error);
    });
  }

  /**
   * Listen for blockchain statistics updates
   * @param {Function} callback - Callback function to handle stats data
   */
  onBlockchainStats(callback) {
    if (!this.socket) return;
    this.socket.on('blockchainStats', callback);
  }

  /**
   * Listen for new block events
   * @param {Function} callback - Callback function to handle new block data
   */
  onNewBlock(callback) {
    if (!this.socket) return;
    this.socket.on('newBlock', callback);
  }

  /**
   * Stop listening for blockchain stats
   * @param {Function} [callback] - Optional specific callback to remove
   */
  offBlockchainStats(callback) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off('blockchainStats', callback);
    } else {
      this.socket.off('blockchainStats');
    }
  }

  /**
   * Stop listening for new blocks
   * @param {Function} [callback] - Optional specific callback to remove
   */
  offNewBlock(callback) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off('newBlock', callback);
    } else {
      this.socket.off('newBlock');
    }
  }

  /**
   * Disconnect from Socket.io server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if socket is connected
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.socket?.connected || false;
  }

  /**
   * Get the socket instance
   * @returns {object|null} Socket instance or null
   */
  getSocket() {
    return this.socket;
  }
}

// Export singleton instance
export const socketService = new SocketService(
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'
);

export default socketService;
