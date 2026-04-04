package com.agri.dashboard.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AgriController.
 * Boots the full Spring context with H2, no real Postgres needed.
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.flyway.enabled=false"
})
class AgriControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void healthEndpointReturns200() throws Exception {
        mockMvc.perform(get("/api/health"))
               .andExpect(status().isOk());
    }

    @Test
    void yieldsEndpointReturnsJsonArray() throws Exception {
        mockMvc.perform(get("/api/yields"))
               .andExpect(status().isOk())
               .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
               .andExpect(jsonPath("$").isArray());
    }

    @Test
    void consumptionEndpointReturnsJsonArray() throws Exception {
        mockMvc.perform(get("/api/consumption"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$").isArray());
    }

    @Test
    void ethanolTargetsEndpointReturnsJsonArray() throws Exception {
        mockMvc.perform(get("/api/ethanol-targets"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$").isArray());
    }

    @Test
    void yieldsFilterByCropReturnsArray() throws Exception {
        mockMvc.perform(get("/api/yields").param("crop", "Sugarcane"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$").isArray());
    }
}
