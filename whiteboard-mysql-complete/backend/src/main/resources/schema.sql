-- ============================================
-- COLLABORATIVE WHITEBOARD - MYSQL SCHEMA
-- ============================================

CREATE DATABASE IF NOT EXISTS whiteboard_db;
USE whiteboard_db;

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLE: boards
-- ============================================
CREATE TABLE IF NOT EXISTS boards (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    board_data LONGTEXT,
    is_public BOOLEAN DEFAULT FALSE,
    owner_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner_id (owner_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- DEMO USER (Password: demo123)
-- ============================================
-- BCrypt hash for 'demo123'
INSERT INTO users (username, email, password, display_name) VALUES
('demo', 'demo@whiteboard.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye1J8X1Hfmq.h5sEXW8HyJGZ7JGQmVmD6', 'Demo User')
ON DUPLICATE KEY UPDATE username=username;

-- ============================================
-- DEMO BOARD
-- ============================================
INSERT INTO boards (name, description, owner_id, is_public) VALUES
('My First Whiteboard', 'Welcome! Start drawing here.', 1, TRUE)
ON DUPLICATE KEY UPDATE name=name;
