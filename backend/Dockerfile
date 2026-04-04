# ================================================================
# Stage 1: BUILD
# Uses Maven 3.8 + JDK 21 to compile and package the fat JAR
# ================================================================
FROM maven:3.8.8-eclipse-temurin-21 AS builder

WORKDIR /build

# Copy pom.xml first — Docker caches the dependency layer separately
# so repeated builds skip the slow 'mvn dependency:go-offline' step
COPY agri-backend/pom.xml ./pom.xml
RUN mvn dependency:go-offline -B --no-transfer-progress

# Copy full source and build (tests skipped; they run in Jenkins Stage 3)
COPY agri-backend/src ./src
RUN mvn clean package -DskipTests -B --no-transfer-progress

# ================================================================
# Stage 2: RUNTIME
# Minimal JRE 21 Alpine — no Maven, no JDK, no source code
# ================================================================
FROM eclipse-temurin:21-jre-alpine AS runtime

# Non-root user for security hardening
RUN addgroup -S agri && adduser -S agri -G agri

WORKDIR /app

# Copy only the fat JAR produced in Stage 1
COPY --from=builder /build/target/agri-backend-*.jar app.jar

RUN chown agri:agri app.jar
USER agri

EXPOSE 8080

# Docker healthcheck — used by docker-compose depends_on condition
HEALTHCHECK --interval=15s --timeout=5s --start-period=50s --retries=5 \
  CMD wget -qO- http://localhost:8080/api/health || exit 1

# JVM flags tuned for containerised environments:
#   UseContainerSupport  — respect cgroup CPU/memory limits
#   MaxRAMPercentage     — use up to 75% of container RAM for heap
#   urandom              — avoid /dev/random blocking on startup
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
