package com.whiteboard.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DrawingMessage {
    private String type; // "draw", "clear", "user_joined", "user_left"
    private DrawingData data;
    private String username;
    private Long boardId;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DrawingData {
        private Integer x;
        private Integer y;
        private Integer prevX;
        private Integer prevY;
        private String color;
        private Integer lineWidth;
        private String tool; // "pen", "eraser", "line", "rectangle", "circle"
    }
}
