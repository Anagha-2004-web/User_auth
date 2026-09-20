package com.example.authentication.service;

import com.example.authentication.dto.LoginRequest;
import com.example.authentication.dto.LoginResponse;
import com.example.authentication.entity.JwtToken;
import com.example.authentication.entity.User;
import com.example.authentication.exception.InvalidCredentialsException;
import com.example.authentication.repository.JwtTokenRepository;
import com.example.authentication.repository.UserRepository;
import com.example.authentication.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
public class AuthenticationService {

    private final UserRepository userRepository;
    private final JwtTokenRepository jwtTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthenticationService(UserRepository userRepository,
                                 JwtTokenRepository jwtTokenRepository,
                                 PasswordEncoder passwordEncoder,
                                 JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtTokenRepository = jwtTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid username or password"));

        if (request.getPassword() == null
                || request.getPassword().isEmpty()
                || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        String token = jwtService.generateToken(user.getUserId(), user.getUsername());
        storeToken(user, token);
        return new LoginResponse("Login successful", token, user.getUsername());
    }

    @Transactional
    public void logout(String token) {
        jwtTokenRepository.findByToken(token).ifPresent(jwtTokenRepository::delete);
    }

    /**
     * A token is active when it is still stored in jwt_tokens AND its JWT
     * signature is valid AND it has not expired.
     */
    public boolean isTokenActive(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }
        if (!jwtService.isSignatureValid(token)) {
            return false;
        }
        if (jwtService.isTokenExpired(token)) {
            return false;
        }
        return jwtTokenRepository.existsByToken(token);
    }

    private void storeToken(User user, String token) {
        LocalDateTime expiresAt = jwtService.extractExpiration(token)
                .toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();

        JwtToken jwtToken = new JwtToken();
        jwtToken.setUser(user);
        jwtToken.setToken(token);
        jwtToken.setExpiresAt(expiresAt);
        jwtTokenRepository.save(jwtToken);
    }
}