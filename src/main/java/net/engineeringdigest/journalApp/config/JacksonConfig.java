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
 * Using Jackson2ObjectMapperBuilderCustomizer preserves all of Spring Boot's
 * default Jackson configuration (JavaTimeModule, etc.).
 */
@Configuration
public class JacksonConfig {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer objectIdSerializer() {
        return builder -> {
            SimpleModule module = new SimpleModule();
            module.addSerializer(ObjectId.class, new ToStringSerializer());
            builder.modules(module);
        };
    }
}
