package net.engineeringdigest.journalApp.service;

import net.engineeringdigest.journalApp.Service.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class EmailServiceTest {

    @Autowired
    private EmailService emailService;

    @Test
    public void testSendMail(){
        emailService.sendEmail("roshanivarma018@gmail.com",
                "Testing Java Mail Sender",
                "Bhailog Java Mein Mail Likhna Sikhau Kya ?");
    }
}
