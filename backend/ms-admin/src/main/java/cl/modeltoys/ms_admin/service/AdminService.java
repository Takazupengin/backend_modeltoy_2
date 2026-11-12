package cl.modeltoys.ms_admin.service;
import cl.modeltoys.ms_admin.client.BackendClient;
import java.util.Map;
import org.springframework.stereotype.Service;
@Service
public class AdminService {
  private final BackendClient client;
  public AdminService(BackendClient client) {
    this.client = client;
  }
  public Map<String, Long> dashboard(String token) {
    var users = client.usuarios(token);
    var orders = client.ordenes(token);
    var products = client.productos(token);
    long pilotos = 0, total = 0;
    for (var u : users)
      if (u.path("activo").asBoolean() && u.path("rol").asText().equals("PILOTO"))
        pilotos++;
    for (var o : orders) total += o.path("total").asLong();
    return Map.of("pilotos", pilotos, "ordenes", (long) orders.size(), "montoOrdenado", total,
        "productos", (long) products.size());
  }
}
