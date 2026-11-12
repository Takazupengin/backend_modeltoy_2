package cl.modeltoys.ms_admin;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import cl.modeltoys.ms_admin.client.BackendClient;
import java.security.*;
import java.util.Base64;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.*;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;
@SpringBootTest
@AutoConfigureMockMvc
class MsAdminApplicationTests {
  @Autowired MockMvc http;
  @MockitoBean BackendClient client;
  @MockitoBean org.springframework.security.oauth2.jwt.JwtDecoder decoder;
  @DynamicPropertySource
  static void properties(DynamicPropertyRegistry r) {
    r.add("app.jwt.public-key", () -> {
      try {
        var g = KeyPairGenerator.getInstance("RSA");
        g.initialize(2048);
        return Base64.getEncoder().encodeToString(g.generateKeyPair().getPublic().getEncoded());
      } catch (Exception e) {
        throw new IllegalStateException(e);
      }
    });
  }
  @Test
  void exigeAdmin() throws Exception {
    http.perform(get("/api/admin/usuarios")).andExpect(status().isUnauthorized());
    http.perform(get("/api/admin/usuarios").with(jwt())).andExpect(status().isForbidden());
    verifyNoInteractions(client);
  }
  @Test
  void propagaToken() throws Exception {
    when(decoder.decode("prueba"))
        .thenReturn(org.springframework.security.oauth2.jwt.Jwt.withTokenValue("prueba")
                .header("alg", "RS256")
                .subject("admin@example.cl")
                .claim("roles", java.util.List.of("ADMIN"))
                .build());
    when(client.usuarios("Bearer prueba")).thenReturn(new ObjectMapper().readTree("[]"));
    http.perform(get("/api/admin/usuarios")
                     .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
                     .header("Authorization", "Bearer prueba"))
        .andExpect(status().isOk())
        .andExpect(content().json("[]"));
    verify(client).usuarios("Bearer prueba");
  }
}
