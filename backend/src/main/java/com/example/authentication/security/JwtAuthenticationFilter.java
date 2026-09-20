package com.example.authentication.security;

import com.example.authentication.entity.User;
import com.example.authentication.service.AuthenticationService;
import com.example.authentication.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// @Component - Registered via SecurityConfig only
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserService userService;
    private final AuthenticationService authenticationService;

    public JwtAuthenticationFilter(JwtService jwtService,
                                   UserService userService,
                                   AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.authenticationService = authenticationService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);

        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if ((authentication == null || !authentication.isAuthenticated() 
                    || authentication instanceof AnonymousAuthenticationToken)
                    && authenticationService.isTokenActive(token)) {
                String username = jwtService.extractUsername(token);
                User user = userService.getUserByUsername(username);

                UserPrincipal principal = UserPrincipal.from(user);
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (Exception e) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}