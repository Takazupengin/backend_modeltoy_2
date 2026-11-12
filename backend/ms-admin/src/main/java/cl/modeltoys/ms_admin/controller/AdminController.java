package cl.modeltoys.ms_admin.controller;
import cl.modeltoys.ms_admin.client.BackendClient;
import cl.modeltoys.ms_admin.dto.ProductoRequest;
import cl.modeltoys.ms_admin.service.AdminService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;
@RestController
@RequestMapping("/api/admin")
public class AdminController {
  private final BackendClient client;
  private final AdminService admin;
  public AdminController(BackendClient client, AdminService admin) {
    this.client = client;
    this.admin = admin;
  }
  @GetMapping("/usuarios")
  public JsonNode usuarios(@RequestHeader("Authorization") String token) {
    return client.usuarios(token);
  }
  @GetMapping("/productos")
  public JsonNode productos(@RequestHeader("Authorization") String token) {
    return client.productos(token);
  }
  @GetMapping("/ordenes")
  public JsonNode ordenes(@RequestHeader("Authorization") String token) {
    return client.ordenes(token);
  }
  @GetMapping("/dashboard")
  public Map<String, Long> dashboard(@RequestHeader("Authorization") String token) {
    return admin.dashboard(token);
  }
  @DeleteMapping("/usuarios/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void baja(@RequestHeader("Authorization") String token, @PathVariable long id) {
    client.baja(token, id);
  }
  @PutMapping("/productos/{id}")
  public JsonNode actualizar(@RequestHeader("Authorization") String token, @PathVariable String id,
      @Valid @RequestBody ProductoRequest r) {
    return client.actualizar(token, id, r);
  }
}
