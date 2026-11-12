package cl.modeltoys.ms_usuarios.model;
import jakarta.persistence.*;
import java.time.Instant;
@Entity
@Table(name = "foro_publicaciones")
public class Publicacion {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "usuario_id")
  private Usuario usuario;
  @Column(nullable = false, length = 160) private String kit;
  @Column(nullable = false, length = 2000) private String pregunta;
  @Column(name = "creado_en", nullable = false) private Instant fecha;
  protected Publicacion() {}
  public Publicacion(Usuario usuario, String kit, String pregunta) {
    this.usuario = usuario;
    this.kit = kit;
    this.pregunta = pregunta;
    this.fecha = Instant.now();
  }
  public Long getId() {
    return id;
  }
  public Usuario getUsuario() {
    return usuario;
  }
  public String getKit() {
    return kit;
  }
  public String getPregunta() {
    return pregunta;
  }
  public Instant getFecha() {
    return fecha;
  }
}
