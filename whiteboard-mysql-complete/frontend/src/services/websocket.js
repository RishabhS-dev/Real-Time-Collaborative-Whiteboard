import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  connect(onConnected, onError) {
    const socket = new SockJS('http://localhost:8080/ws');
    
    this.client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.connected = true;
        console.log('WebSocket connected');
        if (onConnected) onConnected();
      },
      onStompError: (frame) => {
        console.error('WebSocket error:', frame);
        this.connected = false;
        if (onError) onError(frame);
      },
      onWebSocketClose: () => {
        this.connected = false;
        console.log('WebSocket disconnected');
      }
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
      this.connected = false;
    }
  }

  subscribeToBoard(boardId, onMessage) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    const destination = `/topic/board/${boardId}`;
    const subscription = this.client.subscribe(destination, (message) => {
      const data = JSON.parse(message.body);
      onMessage(data);
    });

    this.subscriptions.set(boardId, subscription);
    return subscription;
  }

  unsubscribeFromBoard(boardId) {
    const subscription = this.subscriptions.get(boardId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(boardId);
    }
  }

  sendDrawing(boardId, drawingData, username) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return;
    }

    const message = {
      type: 'draw',
      data: drawingData,
      username: username,
      boardId: boardId
    };

    this.client.publish({
      destination: `/app/draw/${boardId}`,
      body: JSON.stringify(message)
    });
  }

  sendClear(boardId, username) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return;
    }

    const message = {
      type: 'clear',
      username: username,
      boardId: boardId
    };

    this.client.publish({
      destination: `/app/clear/${boardId}`,
      body: JSON.stringify(message)
    });
  }
}

export default new WebSocketService();
