package com.dapp.backend.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import java.time.Duration;
import java.time.Instant;

@Component
public class RequestLoggingInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingInterceptor.class);
    private static final String START_TIME_ATTRIBUTE = "startTime";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        request.setAttribute(START_TIME_ATTRIBUTE, Instant.now());
        
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String query = request.getQueryString();
        String fullUrl = query != null ? uri + "?" + query : uri;
        String methodEmoji = getMethodEmoji(method);
        

        String contentType = request.getHeader("Content-Type");
        String userAgent = request.getHeader("User-Agent");
        String shortUserAgent = userAgent != null && userAgent.length() > 50 
            ? userAgent.substring(0, 47) + "..." 
            : userAgent;
        
        log.info("╔═══════════════════════════════════════════════════════════════════════════════");
        log.info("║ {} {} REQUEST", methodEmoji, method);
        log.info("║ ➜ {}", fullUrl);
        log.info("║ 📍 Client IP: {}", getClientIp(request));
        if (contentType != null) {
            log.info("║ 📦 Content-Type: {}", contentType);
        }
        if (shortUserAgent != null) {
            log.info("║ 🖥️  User-Agent: {}", shortUserAgent);
        }
        log.info("╚═══════════════════════════════════════════════════════════════════════════════");
        
        return true;
    }
    
    private String getMethodEmoji(String method) {
        return switch (method) {
            case "GET" -> "📥";
            case "POST" -> "📤";
            case "PUT" -> "✏️";
            case "PATCH" -> "🔧";
            case "DELETE" -> "🗑️";
            default -> "📨";
        };
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {

    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        Instant startTime = (Instant) request.getAttribute(START_TIME_ATTRIBUTE);
        if (startTime != null) {
            long duration = Duration.between(startTime, Instant.now()).toMillis();
            
            String method = request.getMethod();
            String uri = request.getRequestURI();
            int status = response.getStatus();
            String statusEmoji = getStatusEmoji(status);
            String statusText = getStatusText(status);
            String durationColor = getDurationColor(duration);
            
            log.info("╔═══════════════════════════════════════════════════════════════════════════════");
            log.info("║ {} RESPONSE - {} {}", statusEmoji, status, statusText);
            log.info("║ ➜ {} {}", method, uri);
            log.info("║ {} Duration: {} ms", durationColor, duration);
            if (ex != null) {
                log.error("║ ❌ Exception: {}", ex.getMessage());
            }
            log.info("╚═══════════════════════════════════════════════════════════════════════════════");
        }
    }
    
    private String getStatusText(int status) {
        if (status >= 200 && status < 300) return "SUCCESS";
        if (status >= 300 && status < 400) return "REDIRECT";
        if (status >= 400 && status < 500) return "CLIENT ERROR";
        if (status >= 500) return "SERVER ERROR";
        return "UNKNOWN";
    }
    
    private String getDurationColor(long duration) {
        if (duration < 100) return "⚡";
        if (duration < 500) return "🟢";
        if (duration < 1000) return "🟡";
        return "🔴";
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    private String getStatusEmoji(int status) {
        if (status >= 200 && status < 300) {
            return "✅";
        } else if (status >= 300 && status < 400) {
            return "🔄";
        } else if (status >= 400 && status < 500) {
            return "⚠️";
        } else if (status >= 500) {
            return "❌";
        }
        return "📤";
    }
}
