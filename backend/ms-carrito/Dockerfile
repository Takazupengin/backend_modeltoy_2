FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY backend/ms-carrito ./ms-carrito
RUN mvn -B -f ms-carrito/pom.xml -DskipTests package
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S modeltoys && adduser -S -G modeltoys modeltoys
COPY --from=build /workspace/ms-carrito/target/ms-carrito-0.0.1-SNAPSHOT.jar /app/app.jar
USER modeltoys
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
