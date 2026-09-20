package com.example.authentication.repository;

import com.example.authentication.entity.JwtToken;
import com.example.authentication.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JwtTokenRepository extends JpaRepository<JwtToken, Long> {

    Optional<JwtToken> findByToken(String token);

    boolean existsByToken(String token);

    void deleteByToken(String token);

    void deleteByUser(User user);
}