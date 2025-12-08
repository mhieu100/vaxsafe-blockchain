package com.dapp.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.time.Period;


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

        if (birthday == null) {
            if (required) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Birthday is required")
                        .addConstraintViolation();
                return false;
            }
            return true;
        }

        LocalDate today = LocalDate.now();
        

        if (birthday.isAfter(today)) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Birthday cannot be in the future")
                    .addConstraintViolation();
            return false;
        }


        Period age = Period.between(birthday, today);
        int years = age.getYears();


        if (years > maxAge) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                    String.format("Birthday cannot be more than %d years ago", maxAge))
                    .addConstraintViolation();
            return false;
        }


        
        log.debug("Valid birthday: {} (age: {} years)", birthday, years);
        return true;
    }
}
