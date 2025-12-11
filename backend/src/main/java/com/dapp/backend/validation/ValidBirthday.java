package com.dapp.backend.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = BirthdayValidator.class)
@Documented
public @interface ValidBirthday {

    String message() default "Birthday must be between today and 150 years ago";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    int maxAge() default 150;

    int minAge() default 0;

    boolean required() default true;
}
