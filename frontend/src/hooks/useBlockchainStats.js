import { useEffect, useState } from 'react';
import socketService from '../services/socket.service';

/**
 * Custom hook for real-time blockchain statistics via Socket.io
 * @returns {object} Blockchain stats, latest block, recent blocks, connection status
 */
export const useBlockchainStats = () => {
  const [stats, setStats] = useState(null);
  const [latestBlock, setLatestBlock] = useState(null);
  const [recentBlocks, setRecentBlocks] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Connect to socket
    const socket = socketService.connect();
    setIsConnected(socketService.isConnected());

    if (!socketService.isConnected()) {
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);

    // Listen for blockchain stats
    const handleBlockchainStats = (newStats) => {
      setStats(newStats);
      setIsLoading(false);
    };

    // Listen for new blocks
    const handleNewBlock = (block) => {
      setLatestBlock(block);
      setRecentBlocks((prev) => {
        const updated = [block, ...prev];
        // Keep only last 10 blocks
        return updated.slice(0, 10);
      });
    };

    // Listen for connection events
    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    socketService.onBlockchainStats(handleBlockchainStats);
    socketService.onNewBlock(handleNewBlock);

    if (socket) {
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
    }

    // Cleanup
    return () => {
      socketService.offBlockchainStats(handleBlockchainStats);
      socketService.offNewBlock(handleNewBlock);

      if (socket) {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      }
    };
  }, []);

  return {
    stats,
    latestBlock,
    recentBlocks,
    isConnected,
    isLoading,
  };
};
