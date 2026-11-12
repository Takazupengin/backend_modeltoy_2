FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY backend/gateway ./gateway
RUN mvn -B -f gateway/pom.xml -DskipTests package
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S modeltoys && adduser -S -G modeltoys modeltoys
COPY --from=build /workspace/gateway/target/gateway-0.0.1-SNAPSHOT.jar /app/app.jar
USER modeltoys
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
