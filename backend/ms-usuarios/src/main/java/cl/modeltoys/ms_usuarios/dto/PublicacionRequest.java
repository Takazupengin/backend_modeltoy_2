package cl.modeltoys.ms_usuarios.dto;
import jakarta.validation.constraints.*;
public record
    PublicacionRequest(@Size(max = 160) String kit, @NotBlank @Size(max = 2000) String pregunta) {}
