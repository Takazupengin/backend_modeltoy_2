package cl.modeltoys.ms_usuarios.config;
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
            -> a.requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login")
                .permitAll()
                .requestMatchers("/actuator/health", "/actuator/health/**")
                .permitAll()
                .requestMatchers("/api/usuarios/me", "/api/foro", "/api/foro/**")
                .authenticated()
                .requestMatchers("/api/usuarios", "/api/usuarios/**")
                .hasRole("ADMIN")
                .anyRequest()
                .denyAll())
        .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(converter)))
        .build();
  }
}
