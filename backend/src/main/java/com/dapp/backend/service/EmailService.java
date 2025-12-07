package com.dapp.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.UnsupportedEncodingException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${mail.from.email}")
    private String fromEmail;

    @Value("${mail.from.name}")
    private String fromName;

    /**
     * Send vaccination reminder email
     * 
     * @throws UnsupportedEncodingException
     */
    @Async
    public void sendVaccinationReminder(
            String toEmail,
            String patientName,
            String vaccineName,
            LocalDate appointmentDate,
            String timeSlot,
            String centerName,
            String centerAddress,
            Integer doseNumber) throws MessagingException, UnsupportedEncodingException {

        Context context = new Context();
        context.setVariable("patientName", patientName);
        context.setVariable("vaccineName", vaccineName);
        context.setVariable("appointmentDate", appointmentDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        context.setVariable("timeSlot", timeSlot);
        context.setVariable("centerName", centerName);
        context.setVariable("centerAddress", centerAddress);
        context.setVariable("doseNumber", doseNumber);
        context.setVariable("year", LocalDate.now().getYear());

        String htmlContent = templateEngine.process("vaccination-reminder", context);

        sendHtmlEmail(
                toEmail,
                "Nhắc nhở: Lịch tiêm chủng của bạn",
                htmlContent);

        log.info("Sent vaccination reminder email to: {}", toEmail);
    }

    /**
     * Send appointment confirmation email
     * 
     * @throws UnsupportedEncodingException
     */
    @Async
    public void sendAppointmentConfirmation(
            String toEmail,
            String patientName,
            String vaccineName,
            LocalDate appointmentDate,
            String timeSlot,
            String centerName,
            Long appointmentId) throws MessagingException, UnsupportedEncodingException {

        Context context = new Context();
        context.setVariable("patientName", patientName);
        context.setVariable("vaccineName", vaccineName);
        context.setVariable("appointmentDate", appointmentDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        context.setVariable("timeSlot", timeSlot);
        context.setVariable("centerName", centerName);
        context.setVariable("appointmentId", appointmentId);
        context.setVariable("year", LocalDate.now().getYear());

        String htmlContent = templateEngine.process("appointment-confirmation", context);

        sendHtmlEmail(
                toEmail,
                "Lịch hẹn đã tạo thành công - Chờ xử lý - VaxSafe",
                htmlContent);

        log.info("Sent appointment confirmation email to: {}", toEmail);
    }

    /**
     * Send appointment scheduled email with full details (cashier, doctor)
     * 
     * @throws UnsupportedEncodingException
     */
    @Async
    public void sendAppointmentScheduled(
            String toEmail,
            String patientName,
            String vaccineName,
            LocalDate appointmentDate,
            String timeSlot,
            String centerName,
            String centerAddress,
            Long appointmentId,
            Integer doseNumber,
            String cashierName,
            String cashierPhone,
            String doctorName,
            String doctorPhone) throws MessagingException, UnsupportedEncodingException {

        Context context = new Context();
        context.setVariable("patientName", patientName);
        context.setVariable("vaccineName", vaccineName);
        context.setVariable("appointmentDate", appointmentDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        context.setVariable("timeSlot", timeSlot);
        context.setVariable("centerName", centerName);
        context.setVariable("centerAddress", centerAddress);
        context.setVariable("appointmentId", appointmentId);
        context.setVariable("doseNumber", doseNumber);
        context.setVariable("cashierName", cashierName);
        context.setVariable("cashierPhone", cashierPhone);
        context.setVariable("doctorName", doctorName);
        context.setVariable("doctorPhone", doctorPhone);
        context.setVariable("year", LocalDate.now().getYear());

        String htmlContent = templateEngine.process("appointment-scheduled", context);

        sendHtmlEmail(
                toEmail,
                "Lịch hẹn đã được xác nhận - VaxSafe",
                htmlContent);

        log.info("Sent appointment scheduled email to: {}", toEmail);
    }

    /**
     * Send appointment cancellation email
     * 
     * @throws UnsupportedEncodingException
     */
    @Async
    public void sendAppointmentCancellation(
            String toEmail,
            String patientName,
            String vaccineName,
            LocalDate appointmentDate,
            String reason) throws MessagingException, UnsupportedEncodingException {

        Context context = new Context();
        context.setVariable("patientName", patientName);
        context.setVariable("vaccineName", vaccineName);
        context.setVariable("appointmentDate", appointmentDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        context.setVariable("reason", reason);
        context.setVariable("year", LocalDate.now().getYear());

        String htmlContent = templateEngine.process("appointment-cancellation", context);

        sendHtmlEmail(
                toEmail,
                "Thông báo hủy lịch hẹn - VaxSafe",
                htmlContent);

        log.info("Sent appointment cancellation email to: {}", toEmail);
    }

    /**
     * Send generic HTML email
     * 
     * @throws UnsupportedEncodingException
     */
    public void sendHtmlEmail(String toEmail, String subject, String htmlContent)
            throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail, fromName);
        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
        log.info("Email sent successfully to: {}", toEmail);
    }

    /**
     * Send next dose reminder email
     * 
     * @throws UnsupportedEncodingException
     */
    @Async
    public void sendNextDoseReminder(
            String toEmail,
            String patientName,
            String vaccineName,
            Integer nextDoseNumber) throws MessagingException, UnsupportedEncodingException {

        Context context = new Context();
        context.setVariable("patientName", patientName);
        context.setVariable("vaccineName", vaccineName);
        context.setVariable("nextDoseNumber", nextDoseNumber);
        context.setVariable("year", LocalDate.now().getYear());

        String htmlContent = templateEngine.process("next-dose-reminder", context);

        sendHtmlEmail(
                toEmail,
                "Nhắc nhở: Đã đến lịch tiêm mũi tiếp theo - VaxSafe",
                htmlContent);

        log.info("Sent next dose reminder email to: {} for dose #{}", toEmail, nextDoseNumber);
    }

    /**
     * Send simple text email
     * 
     * @throws UnsupportedEncodingException
     */
    public void sendSimpleEmail(String toEmail, String subject, String text)
            throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail, fromName);
        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(text, false);

        mailSender.send(message);
        log.info("Simple email sent successfully to: {}", toEmail);
    }
}

