package cl.modeltoys.ms_usuarios.dto;
public record
    AuthResponse(String accessToken, String tokenType, long expiresIn, UsuarioResponse usuario) {}
