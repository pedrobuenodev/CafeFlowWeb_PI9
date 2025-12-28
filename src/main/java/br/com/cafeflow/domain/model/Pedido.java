package br.com.cafeflow.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime criadoEm = LocalDateTime.now();

    private Double total = 0.0;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemPedido> itens = new ArrayList<>();

    public Long getId() { return id; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public Double getTotal() { return total; }
    public List<ItemPedido> getItens() { return itens; }

    public void setTotal(Double total) { this.total = total; }

    public void addItem(ItemPedido item) {
        item.setPedido(this);
        itens.add(item);
    }
}
