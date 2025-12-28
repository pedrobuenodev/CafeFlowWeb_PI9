document.addEventListener("DOMContentLoaded", ()=>{
  renderProductOptions();
  renderCart();
  renderOrdersKpi();

  byId("addItem").addEventListener("click", async ()=>{
    clearMsg();

    const productId = Number(byId("produto").value);
    const qtd = Number(byId("quantidade").value);

    if(!productsCache.length) await refreshProducts();
    const product = productsCache.find(p=>Number(p.id)===productId);

    const errors = [];
    if(!product) errors.push("Selecione um produto.");
    if(!Number.isInteger(qtd) || qtd <= 0) errors.push("Quantidade deve ser inteiro > 0.");
    if(product && qtd > Number(product.estoque)) errors.push("Quantidade maior que o estoque disponível.");

    if(errors.length) return showMsg(errors.join(" "), true);

    const cart = readCart();
    const existing = cart.find(i=>i.productId===productId);

    if(existing){
      if(existing.qtd + qtd > Number(product.estoque)){
        return showMsg("Somando ao carrinho, ultrapassa o estoque.", true);
      }
      existing.qtd += qtd;
    }else{
      cart.push({productId, qtd});
    }

    writeCart(cart);
    renderCart();
  });

  byId("limparCarrinho").addEventListener("click", ()=>{
    writeCart([]);
    renderCart();
    clearMsg();
  });

  byId("confirmarPedido").addEventListener("click", async ()=>{
    clearMsg();
    const cart = readCart();
    if(!cart.length) return showMsg("Carrinho vazio. Adicione ao menos 1 item.", true);

    await refreshProducts();

    for(const item of cart){
      const p = productsCache.find(x=>Number(x.id)===Number(item.productId));
      if(!p) return showMsg("Produto do carrinho não existe mais.", true);
      if(item.qtd > Number(p.estoque)) return showMsg(`Estoque insuficiente para ${p.nome}.`, true);
    }

    try{
      const payload = {
        itens: cart.map(i=>({produtoId: i.productId, quantidade: i.qtd}))
      };
      const order = await apiJson("/api/pedidos", {method: "POST", body: JSON.stringify(payload)});

      writeCart([]);
      await renderProductOptions();
      renderCart();
      renderOrdersKpi();
      showMsg(`Pedido confirmado! Total: ${moneyBRL(order.total)}`);
    }catch(err){
      showMsg(err.message || "Erro ao confirmar pedido.", true);
    }
  });

  byId("btnSeed2").addEventListener("click", async ()=>{
    try{
      const products = await apiJson("/api/produtos");
      for(const p of products){
        await fetch(`/api/produtos/${p.id}`, {method: "DELETE"});
      }
      const samples = [
        {nome:"Café coado", preco: 6.50, estoque: 20},
        {nome:"Pão de queijo", preco: 5.00, estoque: 15},
        {nome:"Bolo de cenoura", preco: 8.00, estoque: 8},
      ];
      for(const s of samples){
        await apiJson("/api/produtos", {method: "POST", body: JSON.stringify(s)});
      }
      writeCart([]);
      await renderProductOptions();
      renderCart();
      renderOrdersKpi();
      showMsg("Dados de exemplo recarregados.");
    }catch(err){
      showMsg(err.message || "Erro ao recarregar exemplos.", true);
    }
  });
});

let productsCache = [];

function cartKey(){ return "cafeflow_cart_v1"; }
function readCart(){
  try{
    const raw = localStorage.getItem(cartKey());
    return raw ? JSON.parse(raw) : [];
  }catch(e){ return []; }
}
function writeCart(list){
  localStorage.setItem(cartKey(), JSON.stringify(list));
}

async function refreshProducts(){
  productsCache = await apiJson("/api/produtos");
}

async function renderOrdersKpi(){
  try{
    const orders = await apiJson("/api/pedidos");
    byId("kpiPedidos").textContent = orders.length;
  }catch(e){
    byId("kpiPedidos").textContent = "—";
  }
}

async function renderProductOptions(){
  const select = byId("produto");
  select.innerHTML = `<option value="">Carregando...</option>`;

  try{
    await refreshProducts();
    select.innerHTML =
      `<option value="">Selecione...</option>` +
      productsCache.map(p=>`<option value="${p.id}">${escapeHtml(p.nome)} — ${moneyBRL(p.preco)} (estoque: ${p.estoque})</option>`).join("");
  }catch(e){
    select.innerHTML = `<option value="">Erro ao carregar produtos</option>`;
  }
}

async function renderCart(){
  if(!productsCache.length){
    try{ await refreshProducts(); }catch(e){}
  }
  const cart = readCart();
  const tbody = byId("tbodyCarrinho");
  tbody.innerHTML = "";

  let total = 0;

  if(!cart.length){
    tbody.innerHTML = `<tr><td colspan="5" class="mono">Carrinho vazio.</td></tr>`;
    byId("totalCarrinho").textContent = moneyBRL(0);
    return;
  }

  for(const item of cart){
    const p = productsCache.find(x=>Number(x.id)===Number(item.productId));
    if(!p) continue;
    const sub = Number(p.preco) * Number(item.qtd);
    total += sub;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${escapeHtml(p.nome)}</strong><div class="small mono">${p.id}</div></td>
      <td class="mono right">${moneyBRL(p.preco)}</td>
      <td class="mono right">${item.qtd}</td>
      <td class="mono right">${moneyBRL(sub)}</td>
      <td class="right"><button class="btn danger" data-del="${p.id}">Remover</button></td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll("button[data-del]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = Number(btn.getAttribute("data-del"));
      writeCart(readCart().filter(i=>Number(i.productId)!==id));
      renderCart();
    });
  });

  byId("totalCarrinho").textContent = moneyBRL(total);
}

async function apiJson(url, options={}){
  const res = await fetch(url, {
    headers: {"Content-Type":"application/json"},
    ...options,
  });

  if(!res.ok){
    let msg = "Erro na requisição.";
    try{
      const data = await res.json();
      if(data && data.message) msg = data.message;
    }catch(e){}
    throw new Error(msg);
  }

  if(res.status === 204) return null;
  return res.json();
}

function showMsg(text,isError=false){
  const box = byId("msgBox");
  box.className = isError ? "alert" : "ok";
  box.textContent = text;
  box.hidden = false;
}
function clearMsg(){
  const box = byId("msgBox");
  box.hidden = true;
  box.textContent = "";
  box.className = "";
}
function escapeHtml(s){
  return (s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}
