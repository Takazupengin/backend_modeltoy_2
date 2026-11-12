package cl.modeltoys.ms_usuarios.controller;
import cl.modeltoys.ms_usuarios.dto.UsuarioResponse;
import cl.modeltoys.ms_usuarios.service.UsuarioService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
  private final UsuarioService usuarios;
  public UsuarioController(UsuarioService usuarios) {
    this.usuarios = usuarios;
  }
  @GetMapping("/me")
  public UsuarioResponse me(@AuthenticationPrincipal Jwt jwt) {
    return UsuarioResponse.desde(usuarios.actual(jwt.getSubject()));
  }
  @GetMapping
  public List<UsuarioResponse> listar() {
    return usuarios.listar();
  }
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void desactivar(@PathVariable Long id) {
    usuarios.desactivar(id);
  }
}
