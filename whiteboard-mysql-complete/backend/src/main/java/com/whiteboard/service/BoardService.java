package com.whiteboard.service;

import com.whiteboard.model.Board;
import com.whiteboard.model.BoardDTO;
import com.whiteboard.model.User;
import com.whiteboard.repository.BoardRepository;
import com.whiteboard.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BoardService {
    
    @Autowired
    private BoardRepository boardRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    @Transactional
    public BoardDTO.BoardResponse createBoard(BoardDTO.CreateBoardRequest request) {
        User currentUser = getCurrentUser();
        
        Board board = new Board();
        board.setName(request.getName());
        board.setDescription(request.getDescription());
        board.setIsPublic(request.getIsPublic());
        board.setOwner(currentUser);
        board.setBoardData("[]"); // Empty canvas initially
        
        Board savedBoard = boardRepository.save(board);
        return BoardDTO.BoardResponse.fromBoard(savedBoard);
    }
    
    public List<BoardDTO.BoardResponse> getUserBoards() {
        User currentUser = getCurrentUser();
        List<Board> boards = boardRepository.findByOwnerId(currentUser.getId());
        return boards.stream()
                .map(BoardDTO.BoardResponse::fromBoard)
                .collect(Collectors.toList());
    }
    
    public List<BoardDTO.BoardResponse> getPublicBoards() {
        List<Board> boards = boardRepository.findByIsPublicTrue();
        return boards.stream()
                .map(BoardDTO.BoardResponse::fromBoard)
                .collect(Collectors.toList());
    }
    
    public BoardDTO.BoardResponse getBoard(Long boardId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        
        User currentUser = getCurrentUser();
        if (!board.getIsPublic() && !board.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }
        
        return BoardDTO.BoardResponse.fromBoard(board);
    }
    
    @Transactional
    public BoardDTO.BoardResponse updateBoard(Long boardId, BoardDTO.UpdateBoardRequest request) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        
        User currentUser = getCurrentUser();
        if (!board.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }
        
        if (request.getName() != null) {
            board.setName(request.getName());
        }
        if (request.getDescription() != null) {
            board.setDescription(request.getDescription());
        }
        if (request.getBoardData() != null) {
            board.setBoardData(request.getBoardData());
        }
        if (request.getIsPublic() != null) {
            board.setIsPublic(request.getIsPublic());
        }
        
        Board updatedBoard = boardRepository.save(board);
        return BoardDTO.BoardResponse.fromBoard(updatedBoard);
    }
    
    @Transactional
    public void deleteBoard(Long boardId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        
        User currentUser = getCurrentUser();
        if (!board.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }
        
        boardRepository.delete(board);
    }
}
