package net.engineeringdigest.journalApp.config;

import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import org.bson.types.ObjectId;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configures Jackson to serialize ObjectId as its 24-char hex string.
 * This fixes the "[object Object]" bug in the frontend where entry.id
 * was being received as a complex Java object rather than a plain string.
 *
 * IMPORTANT: We use builder.modulesToInstall() instead of builder.modules().
 * builder.modules() replaces ALL modules and disables Spring Boot's well-known
 * module auto-discovery (including JavaTimeModule). This would break LocalDateTime
 * serialization (used in JournalEntry.date and User.resetTokenExpiry), causing
 * 500 errors on /journal and /admin/all-users.
 * builder.modulesToInstall() ADDS our module without touching the defaults.
 */
@Configuration
public class JacksonConfig {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer objectIdSerializer() {
        return builder -> {
            SimpleModule module = new SimpleModule();
            module.addSerializer(ObjectId.class, new ToStringSerializer());
            builder.modulesToInstall(module);
        };
    }
}
