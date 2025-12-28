document.addEventListener("DOMContentLoaded", ()=>{
  renderProducts();

  byId("formProduto").addEventListener("submit", async (e)=>{
    e.preventDefault();
    clearMsg();

    const nome = byId("nome").value.trim();
    const preco = Number(byId("preco").value);
    const estoque = Number(byId("estoque").value);

    const errors = [];
    if(!nome) errors.push("Nome é obrigatório.");
    if(!Number.isFinite(preco) || preco <= 0) errors.push("Preço deve ser > 0.");
    if(!Number.isInteger(estoque) || estoque < 0) errors.push("Estoque deve ser inteiro ≥ 0.");

    if(errors.length) return showMsg(errors.join(" "), true);

    const editId = byId("editId").value.trim();

    try{
      if(editId){
        await apiJson(`/api/produtos/${editId}`, {
          method: "PUT",
          body: JSON.stringify({nome, preco, estoque})
        });
        showMsg("Produto atualizado!");
      }else{
        await apiJson("/api/produtos", {
          method: "POST",
          body: JSON.stringify({nome, preco, estoque})
        });
        showMsg("Produto cadastrado!");
      }

      byId("formProduto").reset();
      byId("editId").value = "";
      byId("btnSubmit").textContent = "Cadastrar";
      renderProducts();
    }catch(err){
      showMsg(err.message || "Erro ao salvar produto.", true);
    }
  });

  byId("btnReset").addEventListener("click", ()=>{
    byId("formProduto").reset();
    byId("editId").value = "";
    byId("btnSubmit").textContent = "Cadastrar";
    clearMsg();
  });

  byId("btnSeed").addEventListener("click", async ()=>{
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
      renderProducts();
      showMsg("Dados de exemplo recarregados.");
    }catch(err){
      showMsg(err.message || "Erro ao recarregar exemplos.", true);
    }
  });
});

let currentProducts = [];

async function renderProducts(){
  const tbody = byId("tbodyProdutos");
  tbody.innerHTML = "";

  try{
    currentProducts = await apiJson("/api/produtos");
  }catch(err){
    tbody.innerHTML = `<tr><td colspan="5" class="mono">Erro ao carregar produtos.</td></tr>`;
    return;
  }

  if(!currentProducts.length){
    tbody.innerHTML = `<tr><td colspan="5" class="mono">Nenhum produto cadastrado.</td></tr>`;
    return;
  }

  for(const p of currentProducts){
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="mono">${p.id}</td>
      <td><strong>${escapeHtml(p.nome)}</strong><div class="small">${moneyBRL(p.preco)}</div></td>
      <td class="mono">${p.estoque}</td>
      <td class="mono right">${moneyBRL(p.preco)}</td>
      <td class="right">
        <button class="btn" data-edit="${p.id}">Editar</button>
        <button class="btn danger" data-del="${p.id}">Excluir</button>
      </td>`;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll("[data-edit]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const id = Number(b.getAttribute("data-edit"));
      const p = currentProducts.find(x=>Number(x.id)===id);
      if(!p) return;
      byId("editId").value = p.id;
      byId("nome").value = p.nome;
      byId("preco").value = p.preco;
      byId("estoque").value = p.estoque;
      byId("btnSubmit").textContent = "Salvar";
      window.scrollTo({top:0, behavior:"smooth"});
    });
  });

  tbody.querySelectorAll("[data-del]").forEach(b=>{
    b.addEventListener("click", async ()=>{
      const id = b.getAttribute("data-del");
      if(confirm("Excluir produto?")){
        try{
          await fetch(`/api/produtos/${id}`, {method: "DELETE"});
          renderProducts();
          showMsg("Produto removido.");
        }catch(err){
          showMsg("Erro ao remover produto.", true);
        }
      }
    });
  });
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
