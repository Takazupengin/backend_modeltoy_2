package cl.modeltoys.ms_usuarios.controller;
import cl.modeltoys.ms_usuarios.dto.*;
import cl.modeltoys.ms_usuarios.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final UsuarioService usuarios;
  public AuthController(UsuarioService usuarios) {
    this.usuarios = usuarios;
  }
  @PostMapping("/register")
  @ResponseStatus(HttpStatus.CREATED)
  public AuthResponse registrar(@Valid @RequestBody RegistroRequest r) {
    return usuarios.registrar(r);
  }
  @PostMapping("/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest r) {
    return usuarios.login(r);
  }
}
