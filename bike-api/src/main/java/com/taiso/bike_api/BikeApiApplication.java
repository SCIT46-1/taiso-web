package com.taiso.bike_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BikeApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(BikeApiApplication.class, args);
	}

}
