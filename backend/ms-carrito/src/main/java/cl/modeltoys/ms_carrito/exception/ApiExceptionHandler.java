package cl.modeltoys.ms_carrito.exception;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
@RestControllerAdvice
public class ApiExceptionHandler {
  @ExceptionHandler(ResponseStatusException.class)
  ProblemDetail negocio(ResponseStatusException e) {
    return ProblemDetail.forStatusAndDetail(
        e.getStatusCode(), e.getReason() == null ? "Solicitud rechazada" : e.getReason());
  }
  @ExceptionHandler(MethodArgumentNotValidException.class)
  ProblemDetail validacion(MethodArgumentNotValidException e) {
    var p = ProblemDetail.forStatusAndDetail(
        HttpStatus.BAD_REQUEST, "Revisa los campos del formulario");
    p.setProperty("errores",
        e.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(f -> f.getField() + ": " + f.getDefaultMessage())
            .toList());
    return p;
  }
  @ExceptionHandler(DataIntegrityViolationException.class)
  ProblemDetail conflicto() {
    return ProblemDetail.forStatusAndDetail(
        HttpStatus.CONFLICT, "El registro entra en conflicto con los datos existentes");
  }
}
