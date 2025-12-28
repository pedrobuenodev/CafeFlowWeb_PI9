package br.com.cafeflow.web.dto;

import java.util.List;

public class CriarPedidoRequest {
    public List<Item> itens;

    public static class Item {
        public Long produtoId;
        public Integer quantidade;
    }
}
