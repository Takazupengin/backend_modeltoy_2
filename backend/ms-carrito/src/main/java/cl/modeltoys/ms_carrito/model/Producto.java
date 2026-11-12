package cl.modeltoys.ms_carrito.model;
import jakarta.persistence.*;
@Entity
@Table(name = "productos")
public class Producto {
  @Id public String id;
  @Column(nullable = false, length = 220) public String nombre;
  @Column(nullable = false, length = 80) public String grade;
  @Column(nullable = false, length = 40) public String scale;
  @Column(nullable = false) public long precio;
  @Column(nullable = false, length = 20) public String status;
  @Column(nullable = false, columnDefinition = "TEXT") public String imagenes;
  @Column(nullable = false, length = 1200) public String descripcion;
  @Column(nullable = false) public boolean preventa;
  @Column(name = "precio_pie", nullable = false) public long precioPie;
  @Column(nullable = false, length = 80) public String llegada;
  protected Producto() {}
}
