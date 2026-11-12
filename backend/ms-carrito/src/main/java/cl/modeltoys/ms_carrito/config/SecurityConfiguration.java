package cl.modeltoys.ms_carrito.config;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.*;
import org.springframework.security.web.SecurityFilterChain;
@Configuration
@EnableMethodSecurity
public class SecurityConfiguration {
  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
  }
  @Bean
  SecurityFilterChain security(HttpSecurity http) throws Exception {
    var roles = new JwtGrantedAuthoritiesConverter();
    roles.setAuthoritiesClaimName("roles");
    roles.setAuthorityPrefix("ROLE_");
    var converter = new JwtAuthenticationConverter();
    converter.setJwtGrantedAuthoritiesConverter(roles);
    return http.csrf(c -> c.disable())
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(a
            -> a.requestMatchers("/actuator/health", "/actuator/health/**")
                .permitAll()
                .requestMatchers(HttpMethod.GET, "/api/productos/**", "/api/preventas/**")
                .permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/productos/**")
                .hasRole("ADMIN")
                .requestMatchers("/api/carrito/**")
                .permitAll()
                .requestMatchers(HttpMethod.POST, "/api/ordenes")
                .permitAll()
                .requestMatchers("/api/ordenes/admin")
                .hasRole("ADMIN")
                .requestMatchers("/api/ordenes")
                .authenticated()
                .anyRequest()
                .denyAll())
        .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(converter)))
        .build();
  }
}
