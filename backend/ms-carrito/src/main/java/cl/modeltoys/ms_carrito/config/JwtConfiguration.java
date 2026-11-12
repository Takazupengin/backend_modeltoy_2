package cl.modeltoys.ms_carrito.config;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.oauth2.jwt.*;
@Configuration
public class JwtConfiguration {
  @Bean
  JwtDecoder decoder(@Value("${app.jwt.public-key}") String key,
      @Value("${app.jwt.issuer}") String issuer) throws Exception {
    var pub = (RSAPublicKey) KeyFactory.getInstance("RSA").generatePublic(
        new X509EncodedKeySpec(Base64.getDecoder().decode(key)));
    var decoder = NimbusJwtDecoder.withPublicKey(pub).build();
    decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(issuer));
    return decoder;
  }
}
