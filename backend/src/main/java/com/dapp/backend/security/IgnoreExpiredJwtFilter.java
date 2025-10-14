package com.dapp.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class IgnoreExpiredJwtFilter extends OncePerRequestFilter {

    private static final String[] WHITE_LIST = {
            "/", "/auth/login/password", "/auth/refresh", "/auth/register", "/storage/**", "/email/**"
    };

    private final AntPathMatcher pathMatcher = new AntPathMatcher();


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        boolean isWhiteList = false;
        for (String pattern : WHITE_LIST) {
            if (pathMatcher.match(pattern, path)) {
                isWhiteList = true;
                break;
            }
        }
        if (isWhiteList) {
            request = new HttpServletRequestWrapper(request) {
                @Override
                public String getHeader(String name) {
                    if ("Authorization".equalsIgnoreCase(name)) return null;
                    return super.getHeader(name);
                }
            };
        }
        filterChain.doFilter(request, response);
    }
}
