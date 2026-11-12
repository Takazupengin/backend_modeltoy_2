package cl.modeltoys.ms_carrito.repository;
import cl.modeltoys.ms_carrito.model.Producto;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
public interface ProductoRepository extends JpaRepository<Producto, String> {
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select p from Producto p where p.id=:id")
  Optional<Producto> bloquear(String id);
}
