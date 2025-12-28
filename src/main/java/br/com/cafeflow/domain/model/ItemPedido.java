package br.com.cafeflow.domain.model;

import jakarta.persistence.*;

@Entity
public class ItemPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Produto produto;

    private Integer quantidade;
    private Double subtotal;

    @ManyToOne(optional = false)
    private Pedido pedido;

    public Long getId() { return id; }
    public Produto getProduto() { return produto; }
    public Integer getQuantidade() { return quantidade; }
    public Double getSubtotal() { return subtotal; }
    public Pedido getPedido() { return pedido; }

    public void setProduto(Produto produto) { this.produto = produto; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }
    public void setPedido(Pedido pedido) { this.pedido = pedido; }
}
