package cl.modeltoys.ms_usuarios;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import cl.modeltoys.ms_usuarios.model.Usuario;
import cl.modeltoys.ms_usuarios.repository.UsuarioRepository;
import com.jayway.jsonpath.JsonPath;
import java.security.*;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.test.context.*;
import org.springframework.test.web.servlet.MockMvc;
@SpringBootTest
@AutoConfigureMockMvc
class MsUsuariosApplicationTests {
  static final KeyPair KEYS = keys();
  @DynamicPropertySource
  static void properties(DynamicPropertyRegistry r) {
    r.add("app.jwt.public-key",
        () -> Base64.getEncoder().encodeToString(KEYS.getPublic().getEncoded()));
    r.add("app.jwt.private-key",
        () -> Base64.getEncoder().encodeToString(KEYS.getPrivate().getEncoded()));
    r.add("spring.datasource.url",
        ()
            -> System.getenv().getOrDefault(
                "TEST_MYSQL_URL", "jdbc:h2:mem:usuarios;MODE=MySQL;DB_CLOSE_DELAY=-1"));
    r.add(
        "spring.datasource.username", () -> System.getenv().getOrDefault("TEST_MYSQL_USER", "sa"));
    r.add("spring.datasource.password",
        () -> System.getenv().getOrDefault("TEST_MYSQL_PASSWORD", ""));
  }
  @Autowired MockMvc http;
  @Autowired UsuarioRepository users;
  @Autowired PasswordEncoder passwords;
  @Autowired JwtEncoder encoder;
  String email() {
    return UUID.randomUUID() + "@example.cl";
  }
  String registrar(String correo) throws Exception {
    var result =
        http.perform(post("/api/auth/register")
                         .contentType(MediaType.APPLICATION_JSON)
                         .content("{\"nombre\":\"Piloto Prueba\",\"correo\":\"" + correo
                             + "\",\"password\":\"clave-segura-123\",\"rol\":\"ADMIN\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.usuario.rol").value("PILOTO"))
            .andExpect(jsonPath("$.usuario.passwordHash").doesNotExist())
            .andReturn();
    return JsonPath.read(result.getResponse().getContentAsString(), "$.accessToken");
  }
  @Test
  void registroHashDuplicadoLoginYPerfil() throws Exception {
    String correo = email();
    String token = registrar(correo);
    assertTrue(passwords.matches(
        "clave-segura-123", users.findByCorreo(correo).orElseThrow().getPasswordHash()));
    http.perform(get("/api/usuarios/me").header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.correo").value(correo));
    http.perform(post("/api/auth/login")
                     .contentType(MediaType.APPLICATION_JSON)
                     .content("{\"correo\":\"" + correo.toUpperCase()
                         + "\",\"password\":\"clave-segura-123\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.accessToken").isNotEmpty());
    http.perform(post("/api/auth/register")
                     .contentType(MediaType.APPLICATION_JSON)
                     .content("{\"nombre\":\"Otro piloto\",\"correo\":\"" + correo
                         + "\",\"password\":\"12345678\"}"))
        .andExpect(status().isConflict());
  }
  @Test
  void rechazaCredencialesYValidacion() throws Exception {
    http.perform(post("/api/auth/login")
                     .contentType(MediaType.APPLICATION_JSON)
                     .content("{\"correo\":\"nadie@example.cl\",\"password\":\"incorrecta\"}"))
        .andExpect(status().isUnauthorized());
    http.perform(post("/api/auth/register")
                     .contentType(MediaType.APPLICATION_JSON)
                     .content("{\"nombre\":\"  \",\"correo\":\"invalido\",\"password\":\"123\"}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errores").isArray());
  }
  @Test
  void permisosYEmisor() throws Exception {
    String token = registrar(email());
    http.perform(get("/api/usuarios/me")).andExpect(status().isUnauthorized());
    http.perform(get("/api/usuarios").header("Authorization", "Bearer " + token))
        .andExpect(status().isForbidden());
    http.perform(delete("/api/usuarios/1").header("Authorization", "Bearer " + token))
        .andExpect(status().isForbidden());
    http.perform(get("/api/usuarios/me").header("Authorization", "Bearer invalido"))
        .andExpect(status().isUnauthorized());
    var claims = JwtClaimsSet.builder()
                     .issuer("emisor-ajeno")
                     .subject(email())
                     .issuedAt(Instant.now())
                     .expiresAt(Instant.now().plusSeconds(60))
                     .build();
    var wrong = encoder
                    .encode(JwtEncoderParameters.from(
                        JwsHeader.with(SignatureAlgorithm.RS256).build(), claims))
                    .getTokenValue();
    http.perform(get("/api/usuarios/me").header("Authorization", "Bearer " + wrong))
        .andExpect(status().isUnauthorized());
  }
  @Test
  void foroUsaAutorAutenticado() throws Exception {
    String token = registrar(email());
    http.perform(post("/api/foro")
                     .header("Authorization", "Bearer " + token)
                     .contentType(MediaType.APPLICATION_JSON)
                     .content("{\"kit\":\"RG Sazabi\",\"pregunta\":\"¿Qué lija "
                         + "uso?\",\"autor\":\"Administrador\"}"))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.autor").value("Piloto Prueba"));
    http.perform(get("/api/foro").header("Authorization", "Bearer " + token))
        .andExpect(status().isOk());
    http.perform(post("/api/foro")
                     .contentType(MediaType.APPLICATION_JSON)
                     .content("{\"pregunta\":\"hola\"}"))
        .andExpect(status().isUnauthorized());
  }
  @Test
  void bajaInvalidaPerfil() throws Exception {
    String correo = email();
    String token = registrar(correo);
    var admin = users.saveAndFlush(
        new Usuario("Admin Test", email(), passwords.encode("clave-segura-123"), "ADMIN"));
    var result = http.perform(post("/api/auth/login")
                                  .contentType(MediaType.APPLICATION_JSON)
                                  .content("{\"correo\":\"" + admin.getCorreo()
                                      + "\",\"password\":\"clave-segura-123\"}"))
                     .andExpect(status().isOk())
                     .andReturn();
    String adminToken = JsonPath.read(result.getResponse().getContentAsString(), "$.accessToken");
    http.perform(get("/api/usuarios").header("Authorization", "Bearer " + adminToken))
        .andExpect(status().isOk());
    http.perform(delete("/api/usuarios/" + users.findByCorreo(correo).orElseThrow().getId())
                     .header("Authorization", "Bearer " + adminToken))
        .andExpect(status().isNoContent());
    http.perform(get("/api/usuarios/me").header("Authorization", "Bearer " + token))
        .andExpect(status().isUnauthorized());
  }
  @Test
  void rechazaVencimientoYFirmaAjena() throws Exception {
    var expired = JwtClaimsSet.builder()
                      .issuer("modeltoys")
                      .subject(email())
                      .issuedAt(Instant.now().minusSeconds(600))
                      .expiresAt(Instant.now().minusSeconds(300))
                      .build();
    var token = encoder
                    .encode(JwtEncoderParameters.from(
                        JwsHeader.with(SignatureAlgorithm.RS256).build(), expired))
                    .getTokenValue();
    http.perform(get("/api/usuarios/me").header("Authorization", "Bearer " + token))
        .andExpect(status().isUnauthorized());
    var other = keys();
    var key = new com.nimbusds.jose.jwk.RSAKey
                  .Builder((java.security.interfaces.RSAPublicKey) other.getPublic())
                  .privateKey((java.security.interfaces.RSAPrivateKey) other.getPrivate())
                  .build();
    var otherEncoder = new NimbusJwtEncoder(
        new com.nimbusds.jose.jwk.source.ImmutableJWKSet<>(new com.nimbusds.jose.jwk.JWKSet(key)));
    var claims = JwtClaimsSet.builder()
                     .issuer("modeltoys")
                     .subject(email())
                     .issuedAt(Instant.now())
                     .expiresAt(Instant.now().plusSeconds(600))
                     .build();
    var foreign = otherEncoder
                      .encode(JwtEncoderParameters.from(
                          JwsHeader.with(SignatureAlgorithm.RS256).build(), claims))
                      .getTokenValue();
    http.perform(get("/api/usuarios/me").header("Authorization", "Bearer " + foreign))
        .andExpect(status().isUnauthorized());
  }
  @Test
  void rechazaPasswordQueExcedeLimiteUtf8() throws Exception {
    http.perform(post("/api/auth/register")
                     .contentType(MediaType.APPLICATION_JSON)
                     .content("{\"nombre\":\"Piloto Prueba\",\"correo\":\"" + email()
                         + "\",\"password\":\""
                         + "ñ".repeat(40) + "\"}"))
        .andExpect(status().isBadRequest());
  }
  static KeyPair keys() {
    try {
      var g = KeyPairGenerator.getInstance("RSA");
      g.initialize(2048);
      return g.generateKeyPair();
    } catch (Exception e) {
      throw new IllegalStateException(e);
    }
  }
}
