package cl.modeltoys.gateway;
import java.security.*;
import java.util.Base64;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.*;
@SpringBootTest
class GatewayApplicationTests {
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
  void contextLoads() {}
}
