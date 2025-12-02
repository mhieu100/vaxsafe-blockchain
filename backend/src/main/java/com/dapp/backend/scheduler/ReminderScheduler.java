package com.dapp.backend.scheduler;

import com.dapp.backend.service.NextDoseReminderService;
import com.dapp.backend.service.VaccinationReminderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReminderScheduler {

    private final VaccinationReminderService reminderService;
    private final NextDoseReminderService nextDoseReminderService;

    /**
     * Send pending reminders every day at 8:00 AM
     * Cron format: second minute hour day month weekday
     */
    @Scheduled(cron = "${reminder.cron:0 0 8 * * ?}")
    public void sendDailyReminders() {
        log.info("======= Starting daily reminder scheduler =======");
        
        try {
            reminderService.sendPendingReminders();
            log.info("Daily reminder scheduler completed successfully");
        } catch (Exception e) {
            log.error("Error in daily reminder scheduler", e);
        }
        
        log.info("======= Finished daily reminder scheduler =======");
    }

    /**
     * Send next dose reminders at 8:00 AM (same batch as appointment reminders)
     */
    @Scheduled(cron = "${reminder.cron:0 0 8 * * ?}")
    public void sendNextDoseReminders() {
        log.info("======= Starting next dose reminder scheduler =======");
        
        try {
            nextDoseReminderService.sendNextDoseReminders();
            log.info("Next dose reminder scheduler completed successfully");
        } catch (Exception e) {
            log.error("Error in next dose reminder scheduler", e);
        }
        
        log.info("======= Finished next dose reminder scheduler =======");
    }

    /**
     * Retry failed reminders every 2 hours
     */
    @Scheduled(cron = "0 0 */2 * * ?")
    public void retryFailedReminders() {
        log.info("======= Starting retry failed reminders scheduler =======");
        
        try {
            reminderService.retryFailedReminders();
            log.info("Retry failed reminders scheduler completed successfully");
        } catch (Exception e) {
            log.error("Error in retry failed reminders scheduler", e);
        }
        
        log.info("======= Finished retry failed reminders scheduler =======");
    }
}
