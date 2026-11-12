package cl.modeltoys.ms_carrito.service;
import cl.modeltoys.ms_carrito.dto.TiendaDto.*;
import cl.modeltoys.ms_carrito.model.*;
import cl.modeltoys.ms_carrito.repository.*;
import java.time.Instant;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
@Service
public class TiendaService {
  private final ProductoRepository productos;
  private final CarritoRepository carritos;
  private final OrdenRepository ordenes;
  private final ObjectMapper json = new ObjectMapper();
  public TiendaService(
      ProductoRepository productos, CarritoRepository carritos, OrdenRepository ordenes) {
    this.productos = productos;
    this.carritos = carritos;
    this.ordenes = ordenes;
  }
  public String owner(String correo, String invitado) {
    if (correo != null)
      return "user:" + correo;
    try {
      return "guest:" + UUID.fromString(invitado);
    } catch (Exception e) {
      throw error(HttpStatus.BAD_REQUEST, "Identificador de invitado inválido");
    }
  }
  @Transactional(readOnly = true)
  public List<ProductoResponse> catalogo(String scale, String status) {
    return productos.findAll()
        .stream()
        .filter(p -> !p.preventa)
        .filter(p -> scale == null || scale.isBlank() || p.scale.equalsIgnoreCase(scale))
        .filter(p -> status == null || status.isBlank() || p.status.equals(status))
        .map(this::producto)
        .toList();
  }
  private ProductoResponse producto(Producto p) {
    return new ProductoResponse(
        p.id, p.nombre, p.grade, p.scale, p.precio, p.status, imagenes(p), p.descripcion);
  }
  private List<String> imagenes(Producto p) {
    return json.readValue(p.imagenes, new TypeReference<List<String>>() {});
  }
  @Transactional(readOnly = true)
  public List<PreventaResponse> preventas() {
    return productos.findAll()
        .stream()
        .filter(p -> p.preventa)
        .map(p
            -> new PreventaResponse(p.id, p.nombre, p.grade, p.llegada, p.precio, p.precioPie,
                imagenes(p).getFirst(), p.descripcion))
        .toList();
  }
  @Transactional
  public ProductoResponse actualizar(String id, Actualizacion r) {
    var p = productos.bloquear(id).orElseThrow(
        () -> error(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    p.precio = r.precio();
    p.status = r.status();
    return producto(p);
  }
  @Transactional
  public Resumen carrito(String owner) {
    return resumen(abrir(owner));
  }
  private Carrito abrir(String owner) {
    return carritos.bloquear(owner).orElseGet(() -> carritos.saveAndFlush(new Carrito(owner)));
  }
  private Map<String, Integer> items(Carrito c) {
    return json.readValue(c.items, new TypeReference<TreeMap<String, Integer>>() {});
  }
  @Transactional
  public Resumen cambiar(String owner, String id, int cantidad, boolean sumar) {
    var c = abrir(owner);
    var map = items(c);
    int nueva = sumar ? map.getOrDefault(id, 0) + cantidad : cantidad;
    if (nueva < 1 || nueva > 99)
      throw error(HttpStatus.BAD_REQUEST, "Cantidad entre 1 y 99");
    linea(id, nueva, true);
    map.put(id, nueva);
    c.items = json.writeValueAsString(map);
    return resumen(c);
  }
  @Transactional
  public Resumen eliminar(String owner, String id) {
    var c = abrir(owner);
    var map = items(c);
    map.remove(id);
    c.items = json.writeValueAsString(map);
    return resumen(c);
  }
  @Transactional
  public void vaciar(String owner) {
    abrir(owner).items = "{}";
  }
  private Resumen resumen(Carrito c) {
    var lines =
        items(c).entrySet().stream().map(e -> linea(e.getKey(), e.getValue(), false)).toList();
    long sub = lines.stream().mapToLong(l -> l.precio() * l.cantidad()).sum();
    long envio = lines.isEmpty() || sub >= 50000 ? 0 : 4990;
    return new Resumen(lines, sub, envio, sub + envio);
  }
  private Linea linea(String key, int cantidad, boolean disponible) {
    String id = key;
    String modalidad = "";
    if (key.endsWith("-pie")) {
      id = key.substring(0, key.length() - 4);
      modalidad = "pie";
    } else if (key.endsWith("-total")) {
      id = key.substring(0, key.length() - 6);
      modalidad = "total";
    }
    var p = productos.findById(id).orElseThrow(
        () -> error(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    if (p.preventa == modalidad.isEmpty())
      throw error(HttpStatus.BAD_REQUEST, "Modalidad de producto inválida");
    if (disponible && !"in-stock".equals(p.status))
      throw error(HttpStatus.CONFLICT, "Producto agotado: " + p.nombre);
    long precio = modalidad.equals("pie") ? p.precioPie : p.precio;
    String nombre = p.nombre
        + (modalidad.isEmpty()            ? ""
                : modalidad.equals("pie") ? " (Abono Pie)"
                                          : " (Total Preventa)");
    return new Linea(key, nombre, precio, cantidad, imagenes(p).getFirst(), p.grade);
  }
  @Transactional
  public OrdenResponse checkout(String owner, String correo, Checkout r) {
    var c = abrir(owner);
    var map = items(c);
    if (map.isEmpty())
      throw error(HttpStatus.CONFLICT, "El carrito está vacío o ya fue procesado");
    validarRut(r.rut());
    if (r.metodoPago().equals("credito") && !List.of(1, 3, 6, 12).contains(r.cuotas()))
      throw error(HttpStatus.BAD_REQUEST, "Cuotas inválidas");
    // Orden estable de locks evita interbloqueos entre compras de los mismos productos.
    map.keySet()
        .stream()
        .map(k -> k.replaceFirst("-(pie|total)$", ""))
        .distinct()
        .sorted()
        .forEach(id -> productos.bloquear(id).orElseThrow());
    map.forEach((id, cant) -> linea(id, cant, true));
    var total = resumen(c);
    var id = "MT-" + UUID.randomUUID();
    var now = Instant.now();
    var response = new OrdenResponse(id, correo == null ? "" : correo, r.nombre().trim(),
        r.rut().trim(), r.direccion().trim(), r.ciudad().trim(), r.metodoPago(),
        r.metodoPago().equals("credito") ? r.cuotas() : 1, total.subtotal(), total.envio(),
        total.total(), "Pendiente de pago", now, total.items());
    ordenes.save(new Orden(id, response.usuarioEmail(), now, json.writeValueAsString(response)));
    c.items = "{}";
    return response;
  }
  @Transactional(readOnly = true)
  public List<OrdenResponse> ordenes(String correo, boolean admin) {
    return (admin ? ordenes.findAllByOrderByFechaDesc()
                  : ordenes.findAllByCorreoOrderByFechaDesc(correo))
        .stream()
        .map(o -> json.readValue(o.datos, OrdenResponse.class))
        .toList();
  }
  private void validarRut(String rut) {
    var v = rut.replace(".", "").replace("-", "").trim().toUpperCase(Locale.ROOT);
    if (!v.matches("[0-9]{7,8}[0-9K]"))
      throw error(HttpStatus.BAD_REQUEST, "RUT inválido");
    int suma = 0, factor = 2;
    for (int i = v.length() - 2; i >= 0; i--) {
      suma += (v.charAt(i) - '0') * factor;
      factor = factor == 7 ? 2 : factor + 1;
    }
    int dv = 11 - suma % 11;
    String esperado = dv == 11 ? "0" : dv == 10 ? "K" : String.valueOf(dv);
    if (!v.endsWith(esperado))
      throw error(HttpStatus.BAD_REQUEST, "RUT inválido");
  }
  private ResponseStatusException error(HttpStatus status, String mensaje) {
    return new ResponseStatusException(status, mensaje);
  }
}
