package cl.modeltoys.ms_admin.exception;
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
  @ExceptionHandler(org.springframework.web.client.RestClientResponseException.class)
  ProblemDetail remoto(org.springframework.web.client.RestClientResponseException e) {
    return ProblemDetail.forStatusAndDetail(
        e.getStatusCode().is4xxClientError() ? e.getStatusCode() : HttpStatus.BAD_GATEWAY,
        "El servicio de negocio rechazó la operación");
  }
  @ExceptionHandler(org.springframework.web.client.ResourceAccessException.class)
  ProblemDetail noDisponible() {
    return ProblemDetail.forStatusAndDetail(
        HttpStatus.BAD_GATEWAY, "Servicio de negocio no disponible");
  }
}
