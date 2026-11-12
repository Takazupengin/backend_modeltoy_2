package cl.modeltoys.ms_carrito.model;
import jakarta.persistence.*;
@Entity
@Table(name = "carritos")
public class Carrito {
  @Id @Column(length = 320) public String owner;
  @Column(nullable = false, columnDefinition = "TEXT") public String items = "{}";
  protected Carrito() {}
  public Carrito(String owner) {
    this.owner = owner;
  }
}
