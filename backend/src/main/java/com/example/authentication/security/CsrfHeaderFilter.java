package com.example.authentication.security;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

// @Component - Disabled since we use stateless JWT authentication
public class CsrfHeaderFilter extends OncePerRequestFilter {

    private final CsrfTokenRepository csrfTokenRepository = new HttpSessionCsrfTokenRepository();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        CsrfToken csrfToken = csrfTokenRepository.loadToken(request);
        if (csrfToken != null) {
            response.setHeader("X-CSRF-TOKEN", csrfToken.getToken());
        }
        filterChain.doFilter(request, response);
    }
}