package cl.modeltoys.ms_carrito.model;
import jakarta.persistence.*;
import java.time.Instant;
@Entity
@Table(name = "ordenes")
public class Orden {
  @Id @Column(length = 40) public String id;
  @Column(nullable = false, length = 254) public String correo;
  @Column(nullable = false) public Instant fecha;
  @Column(nullable = false, columnDefinition = "TEXT") public String datos;
  protected Orden() {}
  public Orden(String id, String correo, Instant fecha, String datos) {
    this.id = id;
    this.correo = correo;
    this.fecha = fecha;
    this.datos = datos;
  }
}
