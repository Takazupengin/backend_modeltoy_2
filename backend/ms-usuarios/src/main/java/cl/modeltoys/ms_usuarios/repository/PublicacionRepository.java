package cl.modeltoys.ms_usuarios.repository;
import cl.modeltoys.ms_usuarios.model.Publicacion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PublicacionRepository extends JpaRepository<Publicacion, Long> {
  List<Publicacion> findAllByOrderByFechaDesc();
}
