package com.example.authentication.service;

import com.example.authentication.dto.RegisterRequest;
import com.example.authentication.dto.UserResponse;
import com.example.authentication.entity.User;
import com.example.authentication.exception.EmailAlreadyExistsException;
import com.example.authentication.exception.ResourceNotFoundException;
import com.example.authentication.exception.UsernameAlreadyExistsException;
import com.example.authentication.exception.ValidationException;
import com.example.authentication.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class UserService {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^[0-9]{10,15}$");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Validates the registration request, hashes the password with BCrypt and
     * saves a new user. Handles all user-management concerns only; JWT /
     * authentication logic lives in AuthenticationService.
     */
    public User register(RegisterRequest request) {
        validateRegistration(request);

        if (userRepository.existsByUsername(request.getUsername().trim())) {
            throw new UsernameAlreadyExistsException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail().trim())) {
            throw new EmailAlreadyExistsException("Email already registered");
        }

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPhone(request.getPhone().trim());

        return userRepository.save(user);
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone()
        );
    }

    private void validateRegistration(RegisterRequest request) {
        if (isBlank(request.getUsername())) {
            throw new ValidationException("Username is required");
        }
        if (request.getUsername().trim().length() < 3 || request.getUsername().trim().length() > 50) {
            throw new ValidationException("Username must be between 3 and 50 characters");
        }
        if (isBlank(request.getPassword())) {
            throw new ValidationException("Password is required");
        }
        if (request.getPassword().length() < 8 || request.getPassword().length() > 64) {
            throw new ValidationException("Password must be at least 8 characters long");
        }
        if (isBlank(request.getConfirmPassword())) {
            throw new ValidationException("Confirm password is required");
        }
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("Passwords do not match");
        }
        if (isBlank(request.getEmail())) {
            throw new ValidationException("Email is required");
        }
        if (!EMAIL_PATTERN.matcher(request.getEmail().trim()).matches()) {
            throw new ValidationException("Invalid email format");
        }
        if (isBlank(request.getPhone())) {
            throw new ValidationException("Phone is required");
        }
        if (!PHONE_PATTERN.matcher(request.getPhone().trim()).matches()) {
            throw new ValidationException("Invalid phone number. Enter 10-15 digits");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}