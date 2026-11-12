package cl.modeltoys.ms_usuarios.repository;
import cl.modeltoys.ms_usuarios.model.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
  Optional<Usuario> findByCorreo(String correo);
  boolean existsByCorreo(String correo);
}
