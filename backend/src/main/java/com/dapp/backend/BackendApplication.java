package com.dapp.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.File;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class BackendApplication {

	public static void main(String[] args) {
		// Try multiple paths to find .env file
		Dotenv dotenv = null;
		
		// Path 1: Current directory
		if (new File(".env").exists()) {
			dotenv = Dotenv.configure().directory("./").load();
		}
		// Path 2: Backend directory (when running from root)
		else if (new File("backend/.env").exists()) {
			dotenv = Dotenv.configure().directory("./backend").load();
		}
		// Path 3: Parent directory (when running from backend)
		else if (new File("../.env").exists()) {
			dotenv = Dotenv.configure().directory("../").load();
		}
		else {
			dotenv = Dotenv.configure().ignoreIfMissing().load();
		}

		// Set environment variables for Spring Boot
		if (dotenv != null) {
			dotenv.entries().forEach(entry -> {
				System.setProperty(entry.getKey(), entry.getValue());
			});
		}

		SpringApplication.run(BackendApplication.class, args);
	}

}
