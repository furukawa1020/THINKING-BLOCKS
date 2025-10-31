// WebSocketサーバー（リアルタイム共同編集用）
// 別途起動が必要: node websocket-server.js

const WebSocket = require('ws');

const PORT = process.env.WS_PORT || 3001;

const wss = new WebSocket.Server({ port: PORT });

// プロジェクトごとの接続管理
const rooms = new Map();

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const projectId = url.pathname.split('/').pop();
  
  console.log(`New connection for project: ${projectId}`);

  // ルームに参加
  if (!rooms.has(projectId)) {
    rooms.set(projectId, new Set());
  }
  rooms.get(projectId).add(ws);

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      // 同じプロジェクトの他のクライアントにブロードキャスト
      const room = rooms.get(projectId);
      if (room) {
        room.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
          }
        });
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log(`Connection closed for project: ${projectId}`);
    const room = rooms.get(projectId);
    if (room) {
      room.delete(ws);
      if (room.size === 0) {
        rooms.delete(projectId);
      }
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

console.log(`WebSocket server running on port ${PORT}`);

// ヘルスチェック用のHTTPサーバー
const http = require('http');
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      connections: Array.from(rooms.entries()).map(([id, clients]) => ({
        projectId: id,
        clientCount: clients.size
      }))
    }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT + 1, () => {
  console.log(`Health check server running on port ${PORT + 1}`);
});
