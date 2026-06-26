FROM maven:3.9-eclipse-temurin-17 AS java-build
WORKDIR /build
COPY backend-java/pom.xml .
RUN mvn dependency:go-offline
COPY backend-java/src ./src
RUN mvn clean package -DskipTests

FROM python:3.12-slim
RUN apt-get update && apt-get install -y openjdk-21-jre socat && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=java-build /build/target/demo-0.0.1-SNAPSHOT.jar /app/java/app.jar
COPY backend-python/ /app/python/
RUN pip install --no-cache-dir -r /app/python/requirements.txt

COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 8089
CMD ["/app/start.sh"]