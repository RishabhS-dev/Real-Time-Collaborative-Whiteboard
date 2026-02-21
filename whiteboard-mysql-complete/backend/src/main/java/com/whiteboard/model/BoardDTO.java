package com.whiteboard.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class BoardDTO {
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateBoardRequest {
        @NotBlank(message = "Board name is required")
        private String name;
        
        private String description;
        private Boolean isPublic = false;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateBoardRequest {
        private String name;
        private String description;
        private String boardData;
        private Boolean isPublic;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BoardResponse {
        private Long id;
        private String name;
        private String description;
        private String boardData;
        private Boolean isPublic;
        private Long ownerId;
        private String ownerUsername;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        
        public static BoardResponse fromBoard(Board board) {
            BoardResponse response = new BoardResponse();
            response.setId(board.getId());
            response.setName(board.getName());
            response.setDescription(board.getDescription());
            response.setBoardData(board.getBoardData());
            response.setIsPublic(board.getIsPublic());
            response.setOwnerId(board.getOwner().getId());
            response.setOwnerUsername(board.getOwner().getUsername());
            response.setCreatedAt(board.getCreatedAt());
            response.setUpdatedAt(board.getUpdatedAt());
            return response;
        }
    }
}
