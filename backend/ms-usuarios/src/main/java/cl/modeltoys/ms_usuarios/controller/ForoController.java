package cl.modeltoys.ms_usuarios.controller;
import cl.modeltoys.ms_usuarios.dto.*;
import cl.modeltoys.ms_usuarios.service.ForoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/foro")
public class ForoController {
  private final ForoService foro;
  public ForoController(ForoService foro) {
    this.foro = foro;
  }
  @GetMapping
  public List<PublicacionResponse> listar(@AuthenticationPrincipal Jwt jwt) {
    return foro.listar(jwt.getSubject());
  }
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public PublicacionResponse crear(
      @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody PublicacionRequest r) {
    return foro.crear(jwt.getSubject(), r);
  }
}
