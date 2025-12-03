package com.dapp.backend.controller;

import com.dapp.backend.annotation.ApiMessage;
import com.dapp.backend.exception.AppException;
import com.dapp.backend.model.User;
import com.dapp.backend.model.UserNotificationSetting;
import com.dapp.backend.service.AuthService;
import com.dapp.backend.service.NotificationLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * API for user email notification preferences
 */
@RestController
@RequestMapping({"/api/notification-settings", "/notification-settings"})
@RequiredArgsConstructor
@Slf4j
public class NotificationSettingController {

    private final NotificationLogService notificationLogService;
    private final AuthService authService;

    /**
     * Get current user's notification settings
     * GET /api/notification-settings
     * @throws AppException 
     */
    @GetMapping
    @ApiMessage("Get notification settings")
    public ResponseEntity<UserNotificationSetting> getSettings() throws AppException {
        User user = authService.getCurrentUserLogin();
        UserNotificationSetting settings = notificationLogService.getUserSettings(user);
        return ResponseEntity.ok(settings);
    }

    /**
     * Update notification settings
     * PUT /api/notification-settings
     * @throws AppException 
     */
    @PutMapping
    @ApiMessage("Update notification settings")
    public ResponseEntity<UserNotificationSetting> updateSettings(
            @RequestBody UserNotificationSetting newSettings) throws AppException {
        User user = authService.getCurrentUserLogin();
        UserNotificationSetting updated = notificationLogService.updateUserSettings(user, newSettings);
        return ResponseEntity.ok(updated);
    }
}
