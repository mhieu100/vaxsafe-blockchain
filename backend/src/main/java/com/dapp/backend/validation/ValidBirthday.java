package com.dapp.backend.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validates that a birthday is within a reasonable range
 * - Must be in the past
 * - Must not be more than 150 years ago
 * - Can be as recent as today (for newborns)
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = BirthdayValidator.class)
@Documented
public @interface ValidBirthday {
    
    String message() default "Birthday must be between today and 150 years ago";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
    
    /**
     * Maximum age in years (default 150)
     */
    int maxAge() default 150;
    
    /**
     * Whether birthday is required
     */
    boolean required() default true;
}
