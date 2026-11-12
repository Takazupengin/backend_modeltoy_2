package cl.modeltoys.ms_usuarios.service;
import cl.modeltoys.ms_usuarios.dto.*;
import cl.modeltoys.ms_usuarios.model.Usuario;
import cl.modeltoys.ms_usuarios.repository.UsuarioRepository;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
@Service
public class UsuarioService {
  private final UsuarioRepository repository;
  private final PasswordEncoder passwords;
  private final JwtEncoder encoder;
  private final String issuer;
  private final long seconds;
  public UsuarioService(UsuarioRepository repository, PasswordEncoder passwords, JwtEncoder encoder,
      @Value("${app.jwt.issuer}") String issuer,
      @Value("${app.jwt.ttl-seconds:1800}") long seconds) {
    this.repository = repository;
    this.passwords = passwords;
    this.encoder = encoder;
    this.issuer = issuer;
    this.seconds = seconds;
  }
  @Transactional
  public AuthResponse registrar(RegistroRequest r) {
    var correo = normalizar(r.correo());
    if (repository.existsByCorreo(correo))
      throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya está registrado");
    if (r.nombre().trim().length() < 3)
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nombre inválido");
    validarPassword(r.password());
    return autenticarRespuesta(repository.saveAndFlush(
        new Usuario(r.nombre().trim(), correo, passwords.encode(r.password()), "PILOTO")));
  }
  @Transactional(readOnly = true)
  public AuthResponse login(LoginRequest r) {
    validarPassword(r.password());
    var u = repository.findByCorreo(normalizar(r.correo()))
                .filter(Usuario::isActivo)
                .filter(user -> passwords.matches(r.password(), user.getPasswordHash()))
                .orElseThrow(()
                                 -> new ResponseStatusException(
                                     HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos"));
    return autenticarRespuesta(u);
  }
  @Transactional(readOnly = true)
  public Usuario actual(String correo) {
    return repository.findByCorreo(normalizar(correo))
        .filter(Usuario::isActivo)
        .orElseThrow(()
                         -> new ResponseStatusException(
                             HttpStatus.UNAUTHORIZED, "La cuenta no está disponible"));
  }
  @Transactional(readOnly = true)
  public List<UsuarioResponse> listar() {
    return repository.findAll().stream().map(UsuarioResponse::desde).toList();
  }
  @Transactional
  public void desactivar(Long id) {
    var u = repository.findById(id).orElseThrow(
        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    if ("ADMIN".equals(u.getRol()))
      throw new ResponseStatusException(
          HttpStatus.CONFLICT, "No se puede dar de baja a un administrador");
    u.desactivar();
  }
  private AuthResponse autenticarRespuesta(Usuario u) {
    var now = Instant.now();
    var claims = JwtClaimsSet.builder()
                     .issuer(issuer)
                     .subject(u.getCorreo())
                     .issuedAt(now)
                     .expiresAt(now.plusSeconds(seconds))
                     .claim("roles", List.of(u.getRol()))
                     .claim("uid", u.getId())
                     .build();
    var token = encoder
                    .encode(JwtEncoderParameters.from(
                        JwsHeader.with(SignatureAlgorithm.RS256).build(), claims))
                    .getTokenValue();
    return new AuthResponse(token, "Bearer", seconds, UsuarioResponse.desde(u));
  }
  private String normalizar(String correo) {
    return correo.trim().toLowerCase(Locale.ROOT);
  }
  private void validarPassword(String password) {
    if (password.getBytes(StandardCharsets.UTF_8).length > 72)
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "La contraseña supera el máximo de 72 bytes");
  }
}
