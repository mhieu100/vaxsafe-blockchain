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

		Dotenv dotenv = null;
		

		if (new File(".env").exists()) {
			dotenv = Dotenv.configure().directory("./").load();
		}

		else if (new File("backend/.env").exists()) {
			dotenv = Dotenv.configure().directory("./backend").load();
		}

		else if (new File("../.env").exists()) {
			dotenv = Dotenv.configure().directory("../").load();
		}
		else {
			dotenv = Dotenv.configure().ignoreIfMissing().load();
		}


		if (dotenv != null) {
			dotenv.entries().forEach(entry -> {
				System.setProperty(entry.getKey(), entry.getValue());
			});
		}

		SpringApplication.run(BackendApplication.class, args);
	}

}
