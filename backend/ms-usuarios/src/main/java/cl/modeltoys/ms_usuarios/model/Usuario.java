package cl.modeltoys.ms_usuarios.model;
import jakarta.persistence.*;
@Entity
@Table(name = "usuarios")
public class Usuario {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(nullable = false, length = 120) private String nombre;
  @Column(nullable = false, unique = true, length = 254) private String correo;
  @Column(name = "password_hash", nullable = false, length = 100) private String passwordHash;
  @Column(nullable = false, length = 20) private String rol;
  @Column(nullable = false) private boolean activo = true;
  protected Usuario() {}
  public Usuario(String nombre, String correo, String hash, String rol) {
    this.nombre = nombre;
    this.correo = correo;
    this.passwordHash = hash;
    this.rol = rol;
  }
  public Long getId() {
    return id;
  }
  public String getNombre() {
    return nombre;
  }
  public String getCorreo() {
    return correo;
  }
  public String getPasswordHash() {
    return passwordHash;
  }
  public String getRol() {
    return rol;
  }
  public boolean isActivo() {
    return activo;
  }
  public void desactivar() {
    activo = false;
  }
}
