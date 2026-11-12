package cl.modeltoys.ms_carrito.dto;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.List;
public final class TiendaDto {
  private TiendaDto() {}
  public record ProductoResponse(String id, String nombre, String grade, String scale, long precio,
      String status, List<String> imagenes, String descripcion) {}
  public record PreventaResponse(String id, String nombre, String grade, String llegada,
      long precioTotal, long precioPie, String imagen, String descripcion) {}
  public record Cantidad(@Min(1) @Max(99) int cantidad) {}
  public record Actualizacion(
      @Positive long precio, @NotNull @Pattern(regexp = "in-stock|out-of-stock") String status) {}
  public record
      Linea(String id, String nombre, long precio, int cantidad, String imagen, String grade) {}
  public record Resumen(List<Linea> items, long subtotal, long envio, long total) {}
  public record Checkout(@NotBlank @Size(min = 3, max = 120) String nombre,
      @NotBlank @Size(max = 16) String rut, @NotBlank @Size(max = 240) String direccion,
      @NotBlank @Size(max = 120) String ciudad,
      @NotNull @Pattern(regexp = "webpay|credito|debito|transferencia") String metodoPago,
      @Min(1) @Max(12) int cuotas) {}
  public record OrdenResponse(String id, String usuarioEmail, String nombre, String rut,
      String direccion, String ciudad, String metodoPago, int cuotas, long subtotal, long envio,
      long total, String estado, Instant fecha, List<Linea> productos) {}
}
