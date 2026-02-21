import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { boardAPI } from '../services/api';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [publicBoards, setPublicBoards] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoard, setNewBoard] = useState({ name: '', description: '', isPublic: false });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    loadBoards();
  }, [activeTab]);

  const loadBoards = async () => {
    try {
      if (activeTab === 'my') {
        const response = await boardAPI.getUserBoards();
        setBoards(response.data);
      } else {
        const response = await boardAPI.getPublicBoards();
        setPublicBoards(response.data);
      }
    } catch (error) {
      console.error('Error loading boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    try {
      const response = await boardAPI.create(newBoard);
      setShowCreateModal(false);
      setNewBoard({ name: '', description: '', isPublic: false });
      navigate(`/board/${response.data.id}`);
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const handleDeleteBoard = async (boardId) => {
    if (window.confirm('Are you sure you want to delete this board?')) {
      try {
        await boardAPI.delete(boardId);
        loadBoards();
      } catch (error) {
        console.error('Error deleting board:', error);
      }
    }
  };

  const displayBoards = activeTab === 'my' ? boards : publicBoards;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>My Whiteboards</h1>
          <div className="header-actions">
            <span className="user-info">Welcome, {user?.displayName || user?.username}!</span>
            <button onClick={logout} className="btn-secondary">Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="tabs">
          <button 
            className={activeTab === 'my' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('my')}
          >
            My Boards
          </button>
          <button 
            className={activeTab === 'public' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('public')}
          >
            Public Boards
          </button>
        </div>

        {activeTab === 'my' && (
          <button onClick={() => setShowCreateModal(true)} className="btn-primary create-btn">
            + Create New Board
          </button>
        )}

        {loading ? (
          <p className="loading">Loading boards...</p>
        ) : (
          <div className="boards-grid">
            {displayBoards.length === 0 ? (
              <p className="empty-state">
                {activeTab === 'my' 
                  ? 'No boards yet. Create your first one!' 
                  : 'No public boards available'}
              </p>
            ) : (
              displayBoards.map((board) => (
                <div key={board.id} className="board-card">
                  <div className="board-header">
                    <h3>{board.name}</h3>
                    {board.isPublic && <span className="public-badge">Public</span>}
                  </div>
                  {board.description && <p className="board-description">{board.description}</p>}
                  <p className="board-meta">
                    Created by {board.ownerUsername} • 
                    {new Date(board.createdAt).toLocaleDateString()}
                  </p>
                  <div className="board-actions">
                    <button 
                      onClick={() => navigate(`/board/${board.id}`)}
                      className="btn-primary"
                    >
                      Open
                    </button>
                    {activeTab === 'my' && (
                      <button 
                        onClick={() => handleDeleteBoard(board.id)}
                        className="btn-danger"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Board</h2>
            <form onSubmit={handleCreateBoard}>
              <div className="form-group">
                <label>Board Name</label>
                <input
                  type="text"
                  value={newBoard.name}
                  onChange={(e) => setNewBoard({ ...newBoard, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  value={newBoard.description}
                  onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={newBoard.isPublic}
                    onChange={(e) => setNewBoard({ ...newBoard, isPublic: e.target.checked })}
                  />
                  Make this board public
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
