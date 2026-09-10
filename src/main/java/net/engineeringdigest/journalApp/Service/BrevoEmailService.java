package net.engineeringdigest.journalApp.Service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * =========================================================================
 * MODIFICATION: Added by Antigravity
 * Service to send transactional emails using the Brevo (Sendinblue) REST API.
 * =========================================================================
 */
@Service
@Slf4j
public class BrevoEmailService {

    @Value("${app.brevo.api-key:${brevo.api.key:${BREVO_API_KEY:your_brevo_api_key_here}}}")
    private String apiKey;

    @Value("${app.brevo.url:${brevo.api.url:https://api.brevo.com/v3/smtp/email}}")
    private String apiUrl;

    @Value("${app.mail.from:${brevo.sender.email:${MAIL_FROM_ADDRESS:s.tsahilvarma04@gmail.com}}}")
    private String senderEmail;

    @Value("${app.mail.from-name:${brevo.sender.name:Inkwell Journal}}")
    private String senderName;

    @Autowired
    private RestTemplate restTemplate;

    /**
     * Send an HTML email via Brevo REST API.
     */
    public boolean sendEmail(String toEmail, String toName, String subject, String htmlContent) {
        if (apiKey == null || apiKey.trim().isEmpty() || "your_brevo_api_key_here".equals(apiKey.trim())) {
            log.warn("Brevo API key is not configured. Email will not be sent over network. Check application.yml or BREVO_API_KEY env var.");
            return false;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
            headers.set("api-key", apiKey.trim());

            Map<String, Object> body = new HashMap<>();

            Map<String, String> sender = new HashMap<>();
            sender.put("name", senderName);
            sender.put("email", senderEmail);
            body.put("sender", sender);

            List<Map<String, String>> toList = new ArrayList<>();
            Map<String, String> recipient = new HashMap<>();
            recipient.put("email", toEmail);
            recipient.put("name", (toName != null && !toName.isEmpty()) ? toName : toEmail);
            toList.add(recipient);
            body.put("to", toList);

            body.put("subject", subject);
            body.put("htmlContent", htmlContent);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Email successfully sent via Brevo to {} with subject '{}'", toEmail, subject);
                return true;
            } else {
                log.error("Failed to send email via Brevo. Status: {}, Body: {}", response.getStatusCode(), response.getBody());
                return false;
            }
        } catch (Exception e) {
            log.error("Exception while sending email via Brevo to {}: {}", toEmail, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Send a formatted password reset email containing the secure token link.
     */
    public boolean sendPasswordResetEmail(String toEmail, String userName, String resetLink) {
        String subject = "Reset your Inkwell password";

        String html = "<!DOCTYPE html>"
                + "<html>"
                + "<head><meta charset='UTF-8'></head>"
                + "<body style='margin:0;padding:0;background-color:#0a0a0f;font-family:sans-serif;color:#e2e2ec;'>"
                + "  <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color:#0a0a0f;padding:40px 20px;'>"
                + "    <tr>"
                + "      <td align='center'>"
                + "        <table width='540' border='0' cellspacing='0' cellpadding='0' style='background-color:#161620;border:1px solid #2a2a3a;border-radius:12px;padding:36px;'>"
                + "          <tr>"
                + "            <td style='font-size:24px;font-weight:700;color:#f59e0b;padding-bottom:12px;font-family:Georgia,serif;'>"
                + "              Ink<span style='color:#e2e2ec;'>well</span>"
                + "            </td>"
                + "          </tr>"
                + "          <tr>"
                + "            <td style='font-size:18px;font-weight:600;color:#e2e2ec;padding-bottom:16px;'>"
                + "              Hello " + (userName != null ? userName : "there") + ","
                + "            </td>"
                + "          </tr>"
                + "          <tr>"
                + "            <td style='font-size:14px;color:#a0a0b8;line-height:1.6;padding-bottom:24px;'>"
                + "              We received a request to reset your password for your Inkwell journal account. "
                + "              Click the button below to choose a new password. This link is valid for <strong>15 minutes</strong>."
                + "            </td>"
                + "          </tr>"
                + "          <tr>"
                + "            <td align='center' style='padding-bottom:28px;'>"
                + "              <a href='" + resetLink + "' style='background-color:#f59e0b;color:#0a0a0f;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600;font-size:14px;display:inline-block;'>"
                + "                Reset Password"
                + "              </a>"
                + "            </td>"
                + "          </tr>"
                + "          <tr>"
                + "            <td style='font-size:12px;color:#7a7a96;line-height:1.5;border-top:1px solid #2a2a3a;padding-top:20px;'>"
                + "              If the button doesn't work, copy and paste this link into your browser:<br>"
                + "              <a href='" + resetLink + "' style='color:#f59e0b;word-break:break-all;'>" + resetLink + "</a>"
                + "            </td>"
                + "          </tr>"
                + "          <tr>"
                + "            <td style='font-size:12px;color:#55556e;padding-top:16px;'>"
                + "              If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged."
                + "            </td>"
                + "          </tr>"
                + "        </table>"
                + "      </td>"
                + "    </tr>"
                + "  </table>"
                + "</body>"
                + "</html>";

        boolean sent = sendEmail(toEmail, userName, subject, html);
        if (!sent) {
            log.info("=========================================================================");
            log.info("DEVELOPMENT FALLBACK: Password Reset Link for user '{}' (email: {}):", userName, toEmail);
            log.info("👉 {}", resetLink);
            log.info("=========================================================================");
        }
        return sent;
    }
}
