package br.com.cafeflow.service;

import br.com.cafeflow.domain.model.Produto;
import br.com.cafeflow.repository.ProdutoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProdutoService {

    private final ProdutoRepository repo;

    public ProdutoService(ProdutoRepository repo) {
        this.repo = repo;
    }

    public List<Produto> listar() { return repo.findAll(); }

    public Produto buscar(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Produto não encontrado: " + id));
    }

    public Produto criar(Produto p) { return repo.save(p); }

    public Produto atualizar(Long id, Produto dados) {
        Produto p = buscar(id);
        p.setNome(dados.getNome());
        p.setPreco(dados.getPreco());
        p.setEstoque(dados.getEstoque());
        return repo.save(p);
    }

    public void deletar(Long id) { repo.deleteById(id); }
}
