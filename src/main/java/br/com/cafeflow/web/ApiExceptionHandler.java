package br.com.cafeflow.web;

import br.com.cafeflow.domain.exception.RegraNegocioException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

  @ExceptionHandler(RegraNegocioException.class)
  public ResponseEntity<Map<String, Object>> handleRegraNegocio(RegraNegocioException ex) {
    return ResponseEntity.status(HttpStatus.CONFLICT).body(
        Map.of(
            "status", 409,
            "error", "Regra de negócio",
            "message", ex.getMessage()
        )
    );
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
        Map.of(
            "status", 400,
            "error", "Requisição inválida",
            "message", ex.getMessage()
        )
    );
  }
}
