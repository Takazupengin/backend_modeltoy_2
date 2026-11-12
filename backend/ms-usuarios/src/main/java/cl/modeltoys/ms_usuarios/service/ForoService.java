package cl.modeltoys.ms_usuarios.service;
import cl.modeltoys.ms_usuarios.dto.*;
import cl.modeltoys.ms_usuarios.model.Publicacion;
import cl.modeltoys.ms_usuarios.repository.PublicacionRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
public class ForoService {
  private final PublicacionRepository posts;
  private final UsuarioService usuarios;
  public ForoService(PublicacionRepository posts, UsuarioService usuarios) {
    this.posts = posts;
    this.usuarios = usuarios;
  }
  @Transactional(readOnly = true)
  public List<PublicacionResponse> listar(String correo) {
    usuarios.actual(correo);
    return posts.findAllByOrderByFechaDesc().stream().map(PublicacionResponse::desde).toList();
  }
  @Transactional
  public PublicacionResponse crear(String correo, PublicacionRequest r) {
    var u = usuarios.actual(correo);
    var kit = r.kit() == null || r.kit().isBlank() ? "General" : r.kit().trim();
    return PublicacionResponse.desde(posts.save(new Publicacion(u, kit, r.pregunta().trim())));
  }
}
