package com.example.authentication.controller;

import com.example.authentication.dto.UserResponse;
import com.example.authentication.entity.User;
import com.example.authentication.security.UserPrincipal;
import com.example.authentication.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Returns the authenticated user. The identity comes from the validated
     * JWT via the Spring Security context, never from a request body or
     * query parameter sent by the frontend.
     */
    @GetMapping("/user")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userService.getUserByUsername(principal.getUsername());
        return ResponseEntity.ok(userService.toUserResponse(user));
    }
}