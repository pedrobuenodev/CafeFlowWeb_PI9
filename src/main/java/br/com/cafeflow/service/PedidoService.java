package br.com.cafeflow.service;

import br.com.cafeflow.domain.exception.RegraNegocioException;
import br.com.cafeflow.domain.model.ItemPedido;
import br.com.cafeflow.domain.model.Pedido;
import br.com.cafeflow.domain.model.Produto;
import br.com.cafeflow.repository.PedidoRepository;
import br.com.cafeflow.repository.ProdutoRepository;
import br.com.cafeflow.web.dto.CriarPedidoRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepo;
    private final ProdutoRepository produtoRepo;

    public PedidoService(PedidoRepository pedidoRepo, ProdutoRepository produtoRepo) {
        this.pedidoRepo = pedidoRepo;
        this.produtoRepo = produtoRepo;
    }

    public List<Pedido> listar() { return pedidoRepo.findAll(); }

    @Transactional
    public Pedido criar(CriarPedidoRequest req) {
        if (req == null || req.itens == null || req.itens.isEmpty()) {
            throw new RegraNegocioException("Pedido vazio.");
        }

        Pedido pedido = new Pedido();
        double total = 0.0;

        for (CriarPedidoRequest.Item i : req.itens) {
            Produto p = produtoRepo.findById(i.produtoId)
                    .orElseThrow(() -> new RegraNegocioException("Produto não existe: " + i.produtoId));

            if (i.quantidade == null || i.quantidade <= 0) {
                throw new RegraNegocioException("Quantidade inválida.");
            }
            if (p.getEstoque() < i.quantidade) {
                throw new RegraNegocioException("Estoque insuficiente para: " + p.getNome());
            }

            // baixa estoque
            p.setEstoque(p.getEstoque() - i.quantidade);
            produtoRepo.save(p);

            double subtotal = p.getPreco() * i.quantidade;

            ItemPedido item = new ItemPedido();
            item.setProduto(p);
            item.setQuantidade(i.quantidade);
            item.setSubtotal(subtotal);

            pedido.addItem(item);
            total += subtotal;
        }

        pedido.setTotal(total);
        return pedidoRepo.save(pedido);
    }
}
