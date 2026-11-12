package cl.modeltoys.gateway.config;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.*;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.*;
@Configuration
public class GatewaySecurityConfiguration {
  @Bean
  ReactiveJwtDecoder decoder(@Value("${app.jwt.public-key}") String key,
      @Value("${app.jwt.issuer}") String issuer) throws Exception {
    var pub = (RSAPublicKey) KeyFactory.getInstance("RSA").generatePublic(
        new X509EncodedKeySpec(Base64.getDecoder().decode(key)));
    var d = NimbusReactiveJwtDecoder.withPublicKey(pub).build();
    d.setJwtValidator(JwtValidators.createDefaultWithIssuer(issuer));
    return d;
  }
  @Bean
  CorsConfigurationSource cors(@Value("${app.cors.origins}") String origins) {
    var c = new CorsConfiguration();
    c.setAllowedOrigins(Arrays.stream(origins.split(",")).map(String::trim).toList());
    c.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    c.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Guest-Id"));
    var source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", c);
    return source;
  }
  @Bean
  SecurityWebFilterChain security(ServerHttpSecurity http) {
    var roles = new JwtGrantedAuthoritiesConverter();
    roles.setAuthorityPrefix("ROLE_");
    roles.setAuthoritiesClaimName("roles");
    var converter = new JwtAuthenticationConverter();
    converter.setJwtGrantedAuthoritiesConverter(roles);
    return http.csrf(c -> c.disable())
        .cors(c -> {})
        .authorizeExchange(a
            -> a.pathMatchers(HttpMethod.OPTIONS, "/**")
                .permitAll()
                .pathMatchers("/actuator/health", "/actuator/health/**")
                .permitAll()
                .pathMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login")
                .permitAll()
                .pathMatchers(HttpMethod.GET, "/api/productos/**", "/api/preventas/**")
                .permitAll()
                .pathMatchers("/api/productos/**", "/api/admin/**", "/api/ordenes/admin")
                .hasRole("ADMIN")
                .pathMatchers("/api/carrito/**")
                .permitAll()
                .pathMatchers(HttpMethod.POST, "/api/ordenes")
                .permitAll()
                .pathMatchers("/api/usuarios/**", "/api/foro/**", "/api/ordenes/**")
                .authenticated()
                .anyExchange()
                .denyAll())
        .oauth2ResourceServer(o
            -> o.jwt(j
                -> j.jwtAuthenticationConverter(
                    new ReactiveJwtAuthenticationConverterAdapter(converter))))
        .build();
  }
}
