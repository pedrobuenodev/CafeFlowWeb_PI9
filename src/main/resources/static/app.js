// CafeFlow Front-end (PI Etapa 8) — sem back-end: usa localStorage

const Store = {
  keyProducts: "cafeflow_products_v1",
  keyOrders: "cafeflow_orders_v1",

  read(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){ return fallback; }
  },
  write(key, value){
    localStorage.setItem(key, JSON.stringify(value));
  },

  products(){ return this.read(this.keyProducts, []); },
  saveProducts(list){ this.write(this.keyProducts, list); },

  orders(){ return this.read(this.keyOrders, []); },
  saveOrders(list){ this.write(this.keyOrders, list); },
};

function uid(prefix="id"){
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}
function moneyBRL(n){
  return Number(n).toLocaleString("pt-BR",{style:"currency", currency:"BRL"});
}
function byId(id){ return document.getElementById(id); }

function seedIfEmpty(){
  if(Store.products().length) return;
  Store.saveProducts([
    {id: uid("prd"), nome:"Café coado", preco: 6.50, estoque: 20},
    {id: uid("prd"), nome:"Pão de queijo", preco: 5.00, estoque: 15},
    {id: uid("prd"), nome:"Bolo de cenoura", preco: 8.00, estoque: 8},
  ]);
}

function kpi(){
  const p = Store.products();
  const o = Store.orders();
  const estoque = p.reduce((acc,x)=> acc + Number(x.estoque||0), 0);
  return {products: p.length, orders: o.length, totalStock: estoque};
}

function setActiveNav(){
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".link").forEach(a=>{
    if((a.getAttribute("href")||"").toLowerCase() === path) a.classList.add("active");
  });
}

document.addEventListener("DOMContentLoaded", ()=>{
  seedIfEmpty();
  setActiveNav();
});
