package com.agri.dashboard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring Boot entry point.
 *
 * @SpringBootApplication is a meta-annotation that enables:
 *   @Configuration       — this class is a bean definition source
 *   @EnableAutoConfiguration — Spring Boot auto-wires everything it detects
 *   @ComponentScan       — scans com.agri.dashboard and all sub-packages
 */
@SpringBootApplication
public class AgriDashboardApplication {

    public static void main(String[] args) {
        SpringApplication.run(AgriDashboardApplication.class, args);
    }
}
