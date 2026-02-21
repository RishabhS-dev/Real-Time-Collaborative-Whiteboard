import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { boardAPI } from '../services/api';
import websocketService from '../services/websocket';
import '../styles/Whiteboard.css';

export default function Whiteboard() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [board, setBoard] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState(1);
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    loadBoard();
    connectWebSocket();
    
    return () => {
      websocketService.unsubscribeFromBoard(id);
    };
  }, [id]);

  const loadBoard = async () => {
    try {
      const response = await boardAPI.getBoard(id);
      setBoard(response.data);
      
      // Load existing board data if available
      if (response.data.boardData) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = response.data.boardData;
      }
    } catch (error) {
      console.error('Error loading board:', error);
      alert('Error loading board');
      navigate('/dashboard');
    }
  };

  const connectWebSocket = () => {
    websocketService.connect(
      () => {
        websocketService.subscribeToBoard(id, handleRemoteDrawing);
      },
      (error) => {
        console.error('WebSocket connection error:', error);
      }
    );
  };

  const handleRemoteDrawing = (message) => {
    if (message.username === user.username) return; // Ignore own messages
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (message.type === 'clear') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else if (message.type === 'draw' && message.data) {
      drawLine(
        ctx,
        message.data.prevX,
        message.data.prevY,
        message.data.x,
        message.data.y,
        message.data.color,
        message.data.lineWidth,
        message.data.tool
      );
    }
  };

  const drawLine = (ctx, x1, y1, x2, y2, color, width, tool) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? width * 3 : width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    lastPos.current = { x, y };
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    drawLine(ctx, lastPos.current.x, lastPos.current.y, x, y, color, lineWidth, tool);
    
    // Send drawing data via WebSocket
    websocketService.sendDrawing(id, {
      x,
      y,
      prevX: lastPos.current.x,
      prevY: lastPos.current.y,
      color,
      lineWidth,
      tool
    }, user.username);
    
    lastPos.current = { x, y };
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveBoard();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    websocketService.sendClear(id, user.username);
    saveBoard();
  };

  const saveBoard = async () => {
    try {
      const canvas = canvasRef.current;
      const boardData = canvas.toDataURL();
      await boardAPI.update(id, { boardData });
    } catch (error) {
      console.error('Error saving board:', error);
    }
  };

  return (
    <div className="whiteboard-container">
      <div className="toolbar">
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">
          ← Back
        </button>
        
        <div className="board-info">
          <h2>{board?.name}</h2>
          <span className="users-count">{connectedUsers} user(s) online</span>
        </div>
        
        <div className="tools">
          <button 
            className={tool === 'pen' ? 'tool-btn active' : 'tool-btn'}
            onClick={() => setTool('pen')}
            title="Pen"
          >
            ✏️
          </button>
          <button 
            className={tool === 'eraser' ? 'tool-btn active' : 'tool-btn'}
            onClick={() => setTool('eraser')}
            title="Eraser"
          >
            🧹
          </button>
          
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="color-picker"
            disabled={tool === 'eraser'}
          />
          
          <select 
            value={lineWidth} 
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="width-select"
          >
            <option value="1">Thin</option>
            <option value="2">Normal</option>
            <option value="4">Thick</option>
            <option value="8">Very Thick</option>
          </select>
          
          <button onClick={clearCanvas} className="btn-danger">
            Clear
          </button>
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        width={1200}
        height={700}
        className="whiteboard-canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
}
