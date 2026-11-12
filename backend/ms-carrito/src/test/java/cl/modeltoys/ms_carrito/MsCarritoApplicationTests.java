package cl.modeltoys.ms_carrito;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.security.*;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.*;
import org.springframework.test.web.servlet.MockMvc;
@SpringBootTest
@AutoConfigureMockMvc
class MsCarritoApplicationTests {
  @Autowired MockMvc http;
  @DynamicPropertySource
  static void properties(DynamicPropertyRegistry r) {
    r.add("spring.datasource.url",
        ()
            -> System.getenv().getOrDefault(
                "TEST_MYSQL_URL", "jdbc:h2:mem:tienda;MODE=MySQL;DB_CLOSE_DELAY=-1"));
    r.add(
        "spring.datasource.username", () -> System.getenv().getOrDefault("TEST_MYSQL_USER", "sa"));
    r.add("spring.datasource.password",
        () -> System.getenv().getOrDefault("TEST_MYSQL_PASSWORD", ""));
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
  void catalogoYSeguridad() throws Exception {
    http.perform(get("/api/productos"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(16));
    http.perform(get("/api/preventas"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(4));
    http.perform(put("/api/productos/RX-78-2")
                     .contentType(MediaType.APPLICATION_JSON)
                     .content("{\"precio\":1,\"status\":\"in-stock\"}"))
        .andExpect(status().isUnauthorized());
    http.perform(get("/api/ordenes/admin").with(jwt())).andExpect(status().isForbidden());
  }
  @Test
  void checkoutCalculaServidorYAislaCarritos() throws Exception {
    String guest = UUID.randomUUID().toString();
    http.perform(post("/api/carrito/items/RX-78-2")
                     .header("X-Guest-Id", guest)
                     .contentType(MediaType.APPLICATION_JSON)
                     .content("{\"cantidad\":1,\"precio\":1}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.subtotal").value(42990));
    http.perform(get("/api/carrito").header("X-Guest-Id", UUID.randomUUID().toString()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items.length()").value(0));
    String checkout = "{\"nombre\":\"Piloto Test\",\"rut\":\"12.345.678-5\",\"direccion\":\"Calle "
                      + "123\",\"ciudad\":\"Viña del Mar\",\"metodoPago\":\"webpay\",\"cuotas\":1}";
    http.perform(post("/api/ordenes")
                     .header("X-Guest-Id", guest)
                     .contentType(MediaType.APPLICATION_JSON)
                     .content(checkout))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.total").value(47980))
        .andExpect(jsonPath("$.estado").value("Pendiente de pago"));
    http.perform(post("/api/ordenes")
                     .header("X-Guest-Id", guest)
                     .contentType(MediaType.APPLICATION_JSON)
                     .content(checkout))
        .andExpect(status().isConflict());
    http.perform(get("/api/ordenes").with(jwt().jwt(j -> j.subject("otro@example.cl"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(0));
  }
}
