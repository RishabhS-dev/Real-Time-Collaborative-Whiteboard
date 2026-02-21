package com.whiteboard.controller;

import com.whiteboard.model.BoardDTO;
import com.whiteboard.service.BoardService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
public class BoardController {
    
    @Autowired
    private BoardService boardService;
    
    @PostMapping
    public ResponseEntity<BoardDTO.BoardResponse> createBoard(
            @Valid @RequestBody BoardDTO.CreateBoardRequest request) {
        BoardDTO.BoardResponse response = boardService.createBoard(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/my")
    public ResponseEntity<List<BoardDTO.BoardResponse>> getUserBoards() {
        List<BoardDTO.BoardResponse> boards = boardService.getUserBoards();
        return ResponseEntity.ok(boards);
    }
    
    @GetMapping("/public")
    public ResponseEntity<List<BoardDTO.BoardResponse>> getPublicBoards() {
        List<BoardDTO.BoardResponse> boards = boardService.getPublicBoards();
        return ResponseEntity.ok(boards);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<BoardDTO.BoardResponse> getBoard(@PathVariable Long id) {
        try {
            BoardDTO.BoardResponse board = boardService.getBoard(id);
            return ResponseEntity.ok(board);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<BoardDTO.BoardResponse> updateBoard(
            @PathVariable Long id,
            @Valid @RequestBody BoardDTO.UpdateBoardRequest request) {
        try {
            BoardDTO.BoardResponse response = boardService.updateBoard(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long id) {
        try {
            boardService.deleteBoard(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
