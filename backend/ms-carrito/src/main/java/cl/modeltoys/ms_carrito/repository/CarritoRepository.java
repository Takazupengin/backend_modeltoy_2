package cl.modeltoys.ms_carrito.repository;
import cl.modeltoys.ms_carrito.model.Carrito;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
public interface CarritoRepository extends JpaRepository<Carrito, String> {
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select c from Carrito c where c.owner=:owner")
  Optional<Carrito> bloquear(String owner);
}
