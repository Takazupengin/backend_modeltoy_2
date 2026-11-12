FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY backend/ms-usuarios ./ms-usuarios
RUN mvn -B -f ms-usuarios/pom.xml -DskipTests package
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S modeltoys && adduser -S -G modeltoys modeltoys
COPY --from=build /workspace/ms-usuarios/target/ms-usuarios-0.0.1-SNAPSHOT.jar /app/app.jar
USER modeltoys
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
