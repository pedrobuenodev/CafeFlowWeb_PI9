package br.com.cafeflow.web.controller;

import br.com.cafeflow.domain.model.Pedido;
import br.com.cafeflow.service.PedidoService;
import br.com.cafeflow.web.dto.CriarPedidoRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService service;

    public PedidoController(PedidoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Pedido> listar() { return service.listar(); }

    @PostMapping
    public Pedido criar(@RequestBody CriarPedidoRequest req) {
        return service.criar(req);
    }
}
