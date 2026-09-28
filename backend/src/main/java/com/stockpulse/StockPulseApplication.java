package com.stockpulse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.nio.charset.StandardCharsets;

@SpringBootApplication
@EnableAsync
public class StockPulseApplication {

    private static final Logger log = LoggerFactory.getLogger(StockPulseApplication.class);

    static {
        loadDotenv();
    }

    public static void main(String[] args) {
        SpringApplication.run(StockPulseApplication.class, args);
    }

    private static void loadDotenv() {
        File[] candidates = new File[] {
                new File(".env"),
                new File("../.env"),
                new File("backend/.env")
        };

        for (File envFile : candidates) {
            if (envFile.exists() && envFile.isFile()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(envFile, StandardCharsets.UTF_8))) {
                    String line;
                    int loadedCount = 0;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                                loadedCount++;
                            }
                        }
                    }
                    log.info("Loaded {} environment properties from {}", loadedCount, envFile.getAbsolutePath());
                    break;
                } catch (Exception e) {
                    log.warn("Could not read .env file at {}: {}", envFile.getAbsolutePath(), e.getMessage());
                }
            }
        }
    }
}
