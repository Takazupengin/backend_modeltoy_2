package cl.modeltoys.ms_usuarios.config;
import cl.modeltoys.ms_usuarios.model.Usuario;
import cl.modeltoys.ms_usuarios.repository.UsuarioRepository;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
@Component
public class AdminBootstrap implements ApplicationRunner {
  private final UsuarioRepository users;
  private final PasswordEncoder encoder;
  private final String email, password, nombre;
  public AdminBootstrap(UsuarioRepository users, PasswordEncoder encoder,
      @Value("${ADMIN_BOOTSTRAP_EMAIL:}") String email,
      @Value("${ADMIN_BOOTSTRAP_PASSWORD:}") String password,
      @Value("${ADMIN_BOOTSTRAP_NAME:Administrador}") String nombre) {
    this.users = users;
    this.encoder = encoder;
    this.email = email;
    this.password = password;
    this.nombre = nombre;
  }
  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    if (email.isBlank() && password.isBlank())
      return;
    if (email.isBlank() || password.length() < 12
        || password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72)
      throw new IllegalStateException(
          "Configura correo y contraseña de administrador entre 12 caracteres y 72 bytes");
    var normalized = email.trim().toLowerCase(Locale.ROOT);
    if (!users.existsByCorreo(normalized))
      users.save(new Usuario(nombre, normalized, encoder.encode(password), "ADMIN"));
  }
}
