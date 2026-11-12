package cl.modeltoys.ms_usuarios.dto;
import cl.modeltoys.ms_usuarios.model.Usuario;
public record UsuarioResponse(Long id, String nombre, String correo, String rol, boolean activo) {
  public static UsuarioResponse desde(Usuario u) {
    return new UsuarioResponse(u.getId(), u.getNombre(), u.getCorreo(), u.getRol(), u.isActivo());
  }
}
