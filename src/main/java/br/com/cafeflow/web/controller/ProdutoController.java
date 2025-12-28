package br.com.cafeflow.web.controller;

import br.com.cafeflow.domain.model.Produto;
import br.com.cafeflow.service.ProdutoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoService service;

    public ProdutoController(ProdutoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Produto> listar() { return service.listar(); }

    @GetMapping("/{id}")
    public Produto buscar(@PathVariable Long id) { return service.buscar(id); }

    @PostMapping
    public Produto criar(@RequestBody @Valid Produto p) { return service.criar(p); }

    @PutMapping("/{id}")
    public Produto atualizar(@PathVariable Long id, @RequestBody @Valid Produto p) {
        return service.atualizar(id, p);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) { service.deletar(id); }
}
