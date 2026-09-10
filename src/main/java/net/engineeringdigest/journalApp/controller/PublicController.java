package net.engineeringdigest.journalApp.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.Service.UserDetailsServiceImpl;
import net.engineeringdigest.journalApp.Service.UserService;
import net.engineeringdigest.journalApp.dto.UserDTO;
import net.engineeringdigest.journalApp.entity.User;

import net.engineeringdigest.journalApp.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/public")
@Slf4j
@Tag(name = "Public API's")
public class PublicController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    // =========================================================================
    // MODIFICATION: Added by Antigravity for Brevo-powered Password Reset
    // =========================================================================
    @Autowired
    private net.engineeringdigest.journalApp.repository.UserRepo userRepo;

    @Autowired
    private net.engineeringdigest.journalApp.Service.BrevoEmailService brevoEmailService;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Value("${app.base-url:${APP_BASE_URL:}}")
    private String configuredBaseUrl;

    private String resolveBaseUrl(HttpServletRequest req) {
        if (configuredBaseUrl != null && !configuredBaseUrl.trim().isEmpty()) {
            return configuredBaseUrl.trim().replaceAll("/+$", "");
        }
        String proto = req.getHeader("X-Forwarded-Proto");
        if (proto == null || proto.trim().isEmpty()) {
            proto = req.getScheme();
        }
        String host = req.getHeader("X-Forwarded-Host");
        if (host == null || host.trim().isEmpty()) {
            host = req.getHeader("Host");
        }
        if (host == null || host.trim().isEmpty()) {
            int port = req.getServerPort();
            host = req.getServerName() + (port == 80 || port == 443 ? "" : ":" + port);
        }
        return proto + "://" + host;
    }

    @GetMapping("/health-check")
    public String healthCheck() {
        return "Ok";
    }

    @PostMapping("/signup")
    public void signUp(@RequestBody UserDTO user){

        User newUser = new User();
        newUser.setUserName(user.getUserName());
        newUser.setEmail(user.getEmail());
        newUser.setPassword(user.getPassword());
        newUser.setSentimentAnalysis(user.getSentimentAnalysis() != null && (user.getSentimentAnalysis().equalsIgnoreCase("true") || user.getSentimentAnalysis().equals("1")));
        userService.saveNewUser(newUser);
    }


    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody User user){
     try{
         authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getUserName(),user.getPassword()));
         UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUserName());
         String jwt = jwtUtil.generateToken(userDetails.getUsername());
         return new ResponseEntity<>(jwt,HttpStatus.OK);

     }catch(Exception e){
      log.error("Exception occurred while CreationAuthenticationToken :"+e);
      return new ResponseEntity<>("Incorrect Username or Password", HttpStatus.BAD_REQUEST);
     }
    }

    // =========================================================================
    // MODIFICATION: Added by Antigravity
    // Handles requesting a password reset email via Brevo API
    // =========================================================================
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> request, HttpServletRequest httpRequest) {
        String identifier = request.get("identifier");
        if (identifier == null || identifier.trim().isEmpty()) {
            return new ResponseEntity<>("Username or email is required", HttpStatus.BAD_REQUEST);
        }

        identifier = identifier.trim();
        User user = userRepo.findByUserName(identifier);
        if (user == null) {
            user = userRepo.findByEmail(identifier);
        }

        if (user != null && user.getEmail() != null && !user.getEmail().trim().isEmpty()) {
            String token = java.util.UUID.randomUUID().toString();
            user.setResetToken(token);
            user.setResetTokenExpiry(java.time.LocalDateTime.now().plusMinutes(15));
            userRepo.save(user);

            String baseUrl = resolveBaseUrl(httpRequest);
            String resetLink = baseUrl + "/#/reset-password?token=" + token;
            brevoEmailService.sendPasswordResetEmail(user.getEmail(), user.getUserName(), resetLink);
        }

        return new ResponseEntity<>("If an account exists with that username or email, a password reset link has been sent.", HttpStatus.OK);
    }

    // =========================================================================
    // MODIFICATION: Added by Antigravity
    // Verifies reset token and updates the user's password
    // =========================================================================
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (token == null || token.trim().isEmpty() || newPassword == null || newPassword.trim().isEmpty()) {
            return new ResponseEntity<>("Token and new password are required", HttpStatus.BAD_REQUEST);
        }

        if (newPassword.length() < 6) {
            return new ResponseEntity<>("Password must be at least 6 characters", HttpStatus.BAD_REQUEST);
        }

        User user = userRepo.findByResetToken(token.trim());
        if (user == null || user.getResetTokenExpiry() == null) {
            return new ResponseEntity<>("Invalid or expired password reset link", HttpStatus.BAD_REQUEST);
        }

        if (user.getResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userRepo.save(user);
            return new ResponseEntity<>("Password reset link has expired. Please request a new one.", HttpStatus.BAD_REQUEST);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepo.save(user);

        return new ResponseEntity<>("Password has been successfully reset. You can now log in.", HttpStatus.OK);
    }


}
