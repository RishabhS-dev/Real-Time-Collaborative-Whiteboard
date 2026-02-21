package com.whiteboard.controller;

import com.whiteboard.model.DrawingMessage;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {
    
    @MessageMapping("/draw/{boardId}")
    @SendTo("/topic/board/{boardId}")
    public DrawingMessage handleDrawing(@DestinationVariable Long boardId, DrawingMessage message) {
        message.setBoardId(boardId);
        return message;
    }
    
    @MessageMapping("/clear/{boardId}")
    @SendTo("/topic/board/{boardId}")
    public DrawingMessage handleClear(@DestinationVariable Long boardId, DrawingMessage message) {
        message.setBoardId(boardId);
        message.setType("clear");
        return message;
    }
}
