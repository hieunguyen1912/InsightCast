package com.hieunguyen.podcastai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
//@EnableScheduling
public class PodcastaiApplication {

	public static void main(String[] args) {
		SpringApplication.run(PodcastaiApplication.class, args);
	}

}
