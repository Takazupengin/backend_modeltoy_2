package cl.modeltoys.ms_usuarios.dto;
import jakarta.validation.constraints.*;
public record LoginRequest(
    @NotBlank @Email @Size(max = 254) String correo, @NotBlank @Size(max = 72) String password) {}
