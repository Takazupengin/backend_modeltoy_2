package cl.modeltoys.ms_admin.dto;
import jakarta.validation.constraints.*;
public record ProductoRequest(
    @Positive long precio, @NotNull @Pattern(regexp = "in-stock|out-of-stock") String status) {}
