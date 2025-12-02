package com.dapp.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.time.Period;

/**
 * Validator for birthday dates
 * Ensures birthday is within a reasonable range
 */
@Slf4j
public class BirthdayValidator implements ConstraintValidator<ValidBirthday, LocalDate> {

    private int maxAge;
    private boolean required;

    @Override
    public void initialize(ValidBirthday constraintAnnotation) {
        this.maxAge = constraintAnnotation.maxAge();
        this.required = constraintAnnotation.required();
    }

    @Override
    public boolean isValid(LocalDate birthday, ConstraintValidatorContext context) {
        // If birthday is null
        if (birthday == null) {
            if (required) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Birthday is required")
                        .addConstraintViolation();
                return false;
            }
            return true; // null is valid if not required
        }

        LocalDate today = LocalDate.now();
        
        // Birthday cannot be in the future
        if (birthday.isAfter(today)) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Birthday cannot be in the future")
                    .addConstraintViolation();
            return false;
        }

        // Calculate age
        Period age = Period.between(birthday, today);
        int years = age.getYears();

        // Birthday cannot be more than maxAge years ago
        if (years > maxAge) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                    String.format("Birthday cannot be more than %d years ago", maxAge))
                    .addConstraintViolation();
            return false;
        }

        // Additional validation: Birthday should be a valid date
        // LocalDate already handles this (e.g., no Feb 31)
        
        log.debug("Valid birthday: {} (age: {} years)", birthday, years);
        return true;
    }
}
