package com.hieunguyen.podcastai.config;

import com.hieunguyen.podcastai.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Slf4j
@Configuration
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
@RequiredArgsConstructor
public class WebSocketSecurityConfig implements WebSocketMessageBrokerConfigurer {
    
    private final SecurityUtils securityUtils;
    
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    // Extract JWT token from headers
                    String authToken = accessor.getFirstNativeHeader("Authorization");
                    
                    if (authToken != null && authToken.startsWith("Bearer ")) {
                        try {
                            String token = authToken.substring(7);
                            
                            // Validate token and get authentication
                            Authentication authentication = securityUtils.getAuthenticationFromToken(token);
                            
                            if (authentication != null && authentication.isAuthenticated()) {
                                // Set authentication in accessor and SecurityContext
                                accessor.setUser(authentication);
                                SecurityContextHolder.getContext().setAuthentication(authentication);
                                log.info("WebSocket authenticated user: {}", authentication.getName());
                            } else {
                                // Invalid token - allow anonymous connection
                                log.warn("Invalid JWT token in WebSocket connection, allowing anonymous connection");
                            }
                        } catch (Exception e) {
                            // Error validating token - allow anonymous connection
                            log.warn("Error authenticating WebSocket connection: {}, allowing anonymous connection", e.getMessage());
                        }
                    } else {
                        // No token provided - allow anonymous connection (optional authentication)
                        log.debug("No Authorization header in WebSocket CONNECT message, allowing anonymous connection");
                    }
                }
                
                return message;
            }
        });
    }
}

