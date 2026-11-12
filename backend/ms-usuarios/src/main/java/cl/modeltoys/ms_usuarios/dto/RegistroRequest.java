package cl.modeltoys.ms_usuarios.dto;
import jakarta.validation.constraints.*;
public record RegistroRequest(@NotBlank @Size(min = 3, max = 120) String nombre,
    @NotBlank @Email @Size(max = 254) String correo,
    @NotBlank @Size(min = 6, max = 72) String password) {}
