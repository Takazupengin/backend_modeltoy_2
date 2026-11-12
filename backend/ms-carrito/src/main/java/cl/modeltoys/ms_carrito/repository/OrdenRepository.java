package cl.modeltoys.ms_carrito.repository;
import cl.modeltoys.ms_carrito.model.Orden;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface OrdenRepository extends JpaRepository<Orden, String> {
  List<Orden> findAllByCorreoOrderByFechaDesc(String correo);
  List<Orden> findAllByOrderByFechaDesc();
}
