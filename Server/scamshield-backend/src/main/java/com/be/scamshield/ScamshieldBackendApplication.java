package com.be.scamshield;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import java.time.Clock;
import java.time.ZoneId;
import java.util.TimeZone;

@SpringBootApplication
public class ScamshieldBackendApplication {

	public static void main(String[] args) {
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));

		com.be.scamshield.config.EnvLoader.loadEnv();
		SpringApplication.run(ScamshieldBackendApplication.class, args);
	}

    @Bean
    public Clock applicationClock() {
        return Clock.system(ZoneId.of("Asia/Ho_Chi_Minh"));
    }
}

