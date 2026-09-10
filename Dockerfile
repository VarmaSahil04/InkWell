# =========================================================================
# Multi-Stage Dockerfile — Spring Boot Journal App (Java 21)
# Designed for Railway, Render, Docker deployment
# No secrets or credentials are baked into this image
# =========================================================================

# --- Stage 1: Build Application ---
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B --no-transfer-progress || true

# Copy source code and build package (skipping tests for build speed)
COPY src ./src
RUN mvn clean package -DskipTests --no-transfer-progress

# --- Stage 2: Lightweight Production Runtime ---
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Security: run as non-root user
RUN addgroup -S spring && adduser -S spring -G spring && chown -R spring:spring /app
USER spring:spring

# Copy packaged JAR from builder stage
COPY --chown=spring:spring --from=builder /app/target/journalApp-*.jar app.jar

# Configurable environment variables (to be set in Railway dashboard)
ENV PORT=8080 \
    JAVA_OPTS=""

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} \
  -Djava.security.egd=file:/dev/./urandom \
  -Dserver.port=${PORT} \
  -jar app.jar"]