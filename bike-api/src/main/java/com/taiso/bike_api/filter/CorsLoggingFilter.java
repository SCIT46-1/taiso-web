package com.taiso.bike_api.filter;

import java.io.IOException;
import java.util.Enumeration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class CorsLoggingFilter implements Filter {
    private static final Logger logger = LoggerFactory.getLogger(CorsLoggingFilter.class);

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        logger.info("Incoming request: {} {}", req.getMethod(), req.getRequestURI());
        logger.info("Origin header: {}", req.getHeader("Origin"));
        
        // 요청 헤더 로깅
        Enumeration<String> headerNames = req.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            logger.info("Request Header: {} = {}", headerName, req.getHeader(headerName));
        }

        chain.doFilter(request, response);

        // 응답 헤더 로깅
        res.getHeaderNames().forEach(headerName -> {
            logger.info("Response Header: {} = {}", headerName, res.getHeader(headerName));
        });
    }
} 