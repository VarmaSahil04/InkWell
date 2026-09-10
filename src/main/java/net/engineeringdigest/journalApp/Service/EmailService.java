package net.engineeringdigest.journalApp.Service;

import lombok.extern.slf4j.Slf4j;

import net.engineeringdigest.journalApp.cache.AppCache;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * =========================================================================
 * EmailService — thin wrapper around BrevoEmailService.
 *
 * The project uses the Brevo (Sendinblue) REST API for sending mail.
 * Spring's JavaMailSender / SMTP stack is NOT used and is NOT configured.
 * All calls are delegated to BrevoEmailService so that the scheduler and
 * any legacy callers continue to work without any SMTP bean.
 * =========================================================================
 */
@Service
@Slf4j
public class EmailService {

    @Autowired
    private BrevoEmailService brevoEmailService;

    @Autowired
    private AppCache appCache;

    /**
     * Send a plain-text email via Brevo REST API.
     *
     * @param to      recipient email address
     * @param subject email subject
     * @param body    plain-text body (wrapped in minimal HTML for Brevo)
     */
    public void sendEmail(String to, String subject, String body) {
        try {
            // Brevo requires HTML content; wrap plain text in a simple <pre> block.
            String htmlBody = "<html><body><pre style='font-family:sans-serif;white-space:pre-wrap;'>"
                    + escapeHtml(body)
                    + "</pre></body></html>";
            boolean sent = brevoEmailService.sendEmail(to, to, subject, htmlBody);
            if (!sent) {
                log.warn("EmailService: Brevo could not send email to {} with subject '{}'", to, subject);
            }
        } catch (Exception e) {
            log.error("Exception while sending email to {}: {}", to, e.getMessage(), e);
        }
    }

    /** Minimal HTML escaping to prevent XSS in the body. */
    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;");
    }

    @Scheduled(cron = "0 */5 * * * *")
    public void clearAppCache() {
        appCache.init();
    }
}
