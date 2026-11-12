package cl.modeltoys.ms_usuarios.config;
import com.nimbusds.jose.jwk.*;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import java.security.*;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.*;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.oauth2.jwt.*;
@Configuration
public class JwtConfiguration {
  @Bean
  RSAPublicKey publicKey(@Value("${app.jwt.public-key}") String encoded) throws Exception {
    return (RSAPublicKey) KeyFactory.getInstance("RSA").generatePublic(
        new X509EncodedKeySpec(Base64.getDecoder().decode(encoded)));
  }
  @Bean
  JwtEncoder jwtEncoder(RSAPublicKey publicKey, @Value("${app.jwt.private-key}") String encoded)
      throws Exception {
    var privateKey = (RSAPrivateKey) KeyFactory.getInstance("RSA").generatePrivate(
        new PKCS8EncodedKeySpec(Base64.getDecoder().decode(encoded)));
    return new NimbusJwtEncoder(new ImmutableJWKSet<>(new JWKSet(
        new RSAKey.Builder(publicKey).privateKey(privateKey).keyID("modeltoys").build())));
  }
  @Bean
  JwtDecoder jwtDecoder(RSAPublicKey publicKey, @Value("${app.jwt.issuer}") String issuer) {
    var decoder = NimbusJwtDecoder.withPublicKey(publicKey).build();
    decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(issuer));
    return decoder;
  }
}
