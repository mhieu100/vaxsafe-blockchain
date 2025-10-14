package com.dapp.backend.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateTimeUtil {

    // Các formatter hay dùng
    public static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    public static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    public static final DateTimeFormatter ISO_FORMAT = DateTimeFormatter.ISO_DATE_TIME;

    // Format LocalDate
    public static String format(LocalDate date, DateTimeFormatter formatter) {
        return (date != null) ? date.format(formatter) : null;
    }

    // Format LocalDateTime
    public static String format(LocalDateTime dateTime, DateTimeFormatter formatter) {
        return (dateTime != null) ? dateTime.format(formatter) : null;
    }

    // Parse từ String về LocalDate
    public static LocalDate parseToDate(String date, DateTimeFormatter formatter) {
        return (date != null) ? LocalDate.parse(date, formatter) : null;
    }

    // Parse từ String về LocalDateTime
    public static LocalDateTime parseToDateTime(String dateTime, DateTimeFormatter formatter) {
        return (dateTime != null) ? LocalDateTime.parse(dateTime, formatter) : null;
    }
}
