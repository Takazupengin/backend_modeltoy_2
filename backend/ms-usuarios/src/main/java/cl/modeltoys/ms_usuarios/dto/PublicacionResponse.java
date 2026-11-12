package cl.modeltoys.ms_usuarios.dto;
import cl.modeltoys.ms_usuarios.model.Publicacion;
import java.time.Instant;
public record
    PublicacionResponse(Long id, String autor, String kit, String pregunta, Instant fecha) {
  public static PublicacionResponse desde(Publicacion p) {
    return new PublicacionResponse(
        p.getId(), p.getUsuario().getNombre(), p.getKit(), p.getPregunta(), p.getFecha());
  }
}
