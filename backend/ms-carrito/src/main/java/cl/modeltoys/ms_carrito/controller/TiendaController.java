package cl.modeltoys.ms_carrito.controller;
import cl.modeltoys.ms_carrito.dto.TiendaDto.*;
import cl.modeltoys.ms_carrito.service.TiendaService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api")
public class TiendaController {
  private final TiendaService tienda;
  public TiendaController(TiendaService tienda) {
    this.tienda = tienda;
  }
  private String owner(Jwt jwt, String guest) {
    return tienda.owner(jwt == null ? null : jwt.getSubject(), guest);
  }
  @GetMapping("/productos")
  public List<ProductoResponse> productos(
      @RequestParam(required = false) String scale, @RequestParam(required = false) String status) {
    return tienda.catalogo(scale, status);
  }
  @PutMapping("/productos/{id}")
  public ProductoResponse actualizar(@PathVariable String id, @Valid @RequestBody Actualizacion r) {
    return tienda.actualizar(id, r);
  }
  @GetMapping("/preventas")
  public List<PreventaResponse> preventas() {
    return tienda.preventas();
  }
  @GetMapping("/carrito")
  public Resumen carrito(@AuthenticationPrincipal Jwt jwt,
      @RequestHeader(value = "X-Guest-Id", required = false) String guest) {
    return tienda.carrito(owner(jwt, guest));
  }
  @PostMapping("/carrito/items/{id}")
  public Resumen agregar(@AuthenticationPrincipal Jwt jwt,
      @RequestHeader(value = "X-Guest-Id", required = false) String guest, @PathVariable String id,
      @Valid @RequestBody Cantidad r) {
    return tienda.cambiar(owner(jwt, guest), id, r.cantidad(), true);
  }
  @PutMapping("/carrito/items/{id}")
  public Resumen cantidad(@AuthenticationPrincipal Jwt jwt,
      @RequestHeader(value = "X-Guest-Id", required = false) String guest, @PathVariable String id,
      @Valid @RequestBody Cantidad r) {
    return tienda.cambiar(owner(jwt, guest), id, r.cantidad(), false);
  }
  @DeleteMapping("/carrito/items/{id}")
  public Resumen eliminar(@AuthenticationPrincipal Jwt jwt,
      @RequestHeader(value = "X-Guest-Id", required = false) String guest,
      @PathVariable String id) {
    return tienda.eliminar(owner(jwt, guest), id);
  }
  @DeleteMapping("/carrito")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void vaciar(@AuthenticationPrincipal Jwt jwt,
      @RequestHeader(value = "X-Guest-Id", required = false) String guest) {
    tienda.vaciar(owner(jwt, guest));
  }
  @PostMapping("/ordenes")
  @ResponseStatus(HttpStatus.CREATED)
  public OrdenResponse comprar(@AuthenticationPrincipal Jwt jwt,
      @RequestHeader(value = "X-Guest-Id", required = false) String guest,
      @Valid @RequestBody Checkout r) {
    return tienda.checkout(owner(jwt, guest), jwt == null ? null : jwt.getSubject(), r);
  }
  @GetMapping("/ordenes")
  public List<OrdenResponse> ordenes(@AuthenticationPrincipal Jwt jwt) {
    return tienda.ordenes(jwt.getSubject(), false);
  }
  @GetMapping("/ordenes/admin")
  public List<OrdenResponse> todas() {
    return tienda.ordenes(null, true);
  }
}
