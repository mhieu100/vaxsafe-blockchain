package com.dapp.backend.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateTimeUtil {


    public static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    public static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    public static final DateTimeFormatter ISO_FORMAT = DateTimeFormatter.ISO_DATE_TIME;


    public static String format(LocalDate date, DateTimeFormatter formatter) {
        return (date != null) ? date.format(formatter) : null;
    }


    public static String format(LocalDateTime dateTime, DateTimeFormatter formatter) {
        return (dateTime != null) ? dateTime.format(formatter) : null;
    }


    public static LocalDate parseToDate(String date, DateTimeFormatter formatter) {
        return (date != null) ? LocalDate.parse(date, formatter) : null;
    }


    public static LocalDateTime parseToDateTime(String dateTime, DateTimeFormatter formatter) {
        return (dateTime != null) ? LocalDateTime.parse(dateTime, formatter) : null;
    }
}
