package br.com.cafeflow.service;

import br.com.cafeflow.domain.exception.RegraNegocioException;
import br.com.cafeflow.domain.model.Produto;
import br.com.cafeflow.repository.ProdutoRepository;
import br.com.cafeflow.web.dto.CriarPedidoRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class PedidoServiceTest {

    @Autowired PedidoService pedidoService;
    @Autowired ProdutoRepository produtoRepository;

    @Test
    void deveFalharQuandoEstoqueInsuficiente() {
        Produto p = new Produto("Teste", 10.0, 1);
        p = produtoRepository.save(p);

        CriarPedidoRequest req = new CriarPedidoRequest();
        CriarPedidoRequest.Item item = new CriarPedidoRequest.Item();
        item.produtoId = p.getId();
        item.quantidade = 2;
        req.itens = java.util.List.of(item);

        assertThrows(RegraNegocioException.class, () -> pedidoService.criar(req));
    }
}
