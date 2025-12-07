package com.dapp.backend.security;

import com.dapp.backend.model.Role;
import com.dapp.backend.model.User;
import com.dapp.backend.repository.RoleRepository;
import com.dapp.backend.repository.UserRepository;
import com.dapp.backend.service.NotificationLogService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtUtil jwtUtil;
    private final NotificationLogService notificationLogService;

    @Value("${cors.allowed-origins}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();

        // Extract user info from Google
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // Find or create user
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    // Get PATIENT role (Google OAuth only creates PATIENT users)
                    Role patientRole = roleRepository.findByName("PATIENT")
                            .orElseThrow(() -> new RuntimeException("Patient role not found"));

                    // Create new user with builder
                    // Only PATIENT role requires profile completion (isActive = false)
                    User newUser = User.builder()
                            .email(email)
                            .fullName(name)
                            .role(patientRole)
                            .isActive(false) // PATIENT must complete profile before using the system
                            .isDeleted(false)
                            .build();

                    return userRepository.save(newUser);
                });

        // Create default notification settings for new OAuth user if not exists
        if (user.getId() != null) {
            try {
                // Check if settings already exist (in case of race condition)
                if (!notificationLogService.hasUserSettings(user)) {
                    notificationLogService.createDefaultSettings(user);
                }
            } catch (Exception e) {
                // Log error but don't fail the login process
                System.err.println("Error creating notification settings for OAuth user: " + user.getEmail() + " - "
                        + e.getMessage());
            }
        }
        String accessToken = jwtUtil.createAccessToken(user.getEmail(), user.getRole().getName());
        String refreshToken = jwtUtil.createRefreshToken(user.getEmail());

        // Update refresh token in database using direct query to avoid collection
        // issues
        userRepository.updateRefreshTokenByEmail(user.getEmail(), refreshToken);

        // Add refresh token as HTTP-only cookie
        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(false); // Set to true in production with HTTPS
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        response.addCookie(refreshTokenCookie);

        // Check if profile is complete - user is active means profile is completed
        boolean isProfileComplete = user.isActive();

        // Redirect to frontend with token and user info (encode to handle Unicode
        // characters)
        String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/callback")
                .queryParam("token", accessToken)
                .queryParam("email", user.getEmail())
                .queryParam("fullName", user.getFullName())
                .queryParam("role", user.getRole().getName())
                .queryParam("isProfileComplete", isProfileComplete)
                .queryParam("userId", user.getId())
                .build()
                .encode()
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
