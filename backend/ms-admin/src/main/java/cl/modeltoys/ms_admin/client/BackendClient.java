package cl.modeltoys.ms_admin.client;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;
@Component
public class BackendClient {
  private final RestClient http;
  private final String usuarios, carrito;
  public BackendClient(
      @Value("${app.usuarios-url}") String usuarios, @Value("${app.carrito-url}") String carrito) {
    this.usuarios = usuarios;
    this.carrito = carrito;
    var client =
        java.net.http.HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
    var factory = new JdkClientHttpRequestFactory(client);
    factory.setReadTimeout(Duration.ofSeconds(10));
    this.http = RestClient.builder().requestFactory(factory).build();
  }
  public JsonNode usuarios(String token) {
    return get(usuarios + "/api/usuarios", token);
  }
  public JsonNode productos(String token) {
    return get(carrito + "/api/productos", token);
  }
  public JsonNode ordenes(String token) {
    return get(carrito + "/api/ordenes/admin", token);
  }
  public void baja(String token, long id) {
    http.delete()
        .uri(usuarios + "/api/usuarios/{id}", id)
        .header("Authorization", token)
        .retrieve()
        .toBodilessEntity();
  }
  public JsonNode actualizar(String token, String id, Object datos) {
    return http.put()
        .uri(carrito + "/api/productos/{id}", id)
        .header("Authorization", token)
        .contentType(MediaType.APPLICATION_JSON)
        .body(datos)
        .retrieve()
        .body(JsonNode.class);
  }
  private JsonNode get(String url, String token) {
    return http.get().uri(url).header("Authorization", token).retrieve().body(JsonNode.class);
  }
}
