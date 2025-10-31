// WebSocket経由のリアルタイム共同編集機能

import { useEffect, useRef, useState } from 'react';

export interface CollaborationMessage {
  type: 'update' | 'cursor' | 'join' | 'leave';
  userId: string;
  data: any;
  timestamp: number;
}

export function useCollaboration(projectId: string, userId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [messages, setMessages] = useState<CollaborationMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // WebSocketサーバーへの接続
    // 本番環境では実際のWebSocketサーバーURLを使用
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    
    try {
      const ws = new WebSocket(`${wsUrl}/collaborate/${projectId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // 参加メッセージを送信
        sendMessage({
          type: 'join',
          userId,
          data: { userId },
          timestamp: Date.now()
        });
      };

      ws.onmessage = (event) => {
        try {
          const message: CollaborationMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      };

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          sendMessage({
            type: 'leave',
            userId,
            data: { userId },
            timestamp: Date.now()
          });
        }
        ws.close();
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      // WebSocketが利用できない場合はローカルモードで動作
      setIsConnected(false);
    }
  }, [projectId, userId]);

  const sendMessage = (message: CollaborationMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const handleMessage = (message: CollaborationMessage) => {
    setMessages(prev => [...prev, message]);

    switch (message.type) {
      case 'join':
        setCollaborators(prev => [...new Set([...prev, message.userId])]);
        break;
      
      case 'leave':
        setCollaborators(prev => prev.filter(id => id !== message.userId));
        break;
      
      case 'update':
        // ワークスペースの更新を処理
        break;
      
      case 'cursor':
        // カーソル位置の更新を処理
        break;
    }
  };

  const broadcastUpdate = (data: any) => {
    sendMessage({
      type: 'update',
      userId,
      data,
      timestamp: Date.now()
    });
  };

  const broadcastCursor = (position: { x: number; y: number }) => {
    sendMessage({
      type: 'cursor',
      userId,
      data: position,
      timestamp: Date.now()
    });
  };

  return {
    isConnected,
    collaborators,
    messages,
    broadcastUpdate,
    broadcastCursor
  };
}
