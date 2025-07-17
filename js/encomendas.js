// === Links configurados ===
const csvURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQDrmqNR9BEgPo1hWtq5uEj6282P6zEBB3w2iIOXhwIIhFE1R5olVB_S1bP-3F_u3iGkSFjCchFolYr/pub?output=csv";
const formBaixaURL = "https://docs.google.com/forms/d/e/1FAIpQLSfnWApRVsslQZQ8tcJZuKi6pP0lAEVKe1eU__mixDTMf1OGYQ/viewform";

// Seletores
const filtroSelect = document.getElementById("filtro");
const filtrosDinamicos = document.getElementById("filtros-dinamicos");
const resultadosContainer = document.getElementById("resultados");

// Campos do filtro dinâmico
filtroSelect.addEventListener("change", () => {
  filtrosDinamicos.innerHTML = "";

  if (filtroSelect.value === "identificador") {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Digite o identificador";
    input.id = "campo-filtro";
    filtrosDinamicos.appendChild(input);
  }

  if (filtroSelect.value === "destinatario") {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Digite o destinatário";
    input.id = "campo-filtro";
    filtrosDinamicos.appendChild(input);
  }

  if (filtroSelect.value === "unidade") {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Digite a unidade";
    input.id = "campo-filtro";
    filtrosDinamicos.appendChild(input);
  }

  const btnBuscar = document.createElement("button");
  btnBuscar.textContent = "Buscar";
  btnBuscar.type = "button";
  btnBuscar.addEventListener("click", buscarDados);
  filtrosDinamicos.appendChild(btnBuscar);
});

// Buscar dados e filtrar
async function buscarDados() {
  resultadosContainer.innerHTML = "Carregando...";

  try {
    const response = await fetch(csvURL);
    const csvText = await response.text();
    const dados = parseCSV(csvText);

    const tipoFiltro = filtroSelect.value;
    const termo = document.getElementById("campo-filtro").value.trim().toUpperCase();
    let resultado = [];

    if (tipoFiltro === "identificador") {
      resultado = dados.filter(l => l["Identificador"].toUpperCase().includes(termo));
    }

    if (tipoFiltro === "destinatario") {
      resultado = dados.filter(l => l["Destinatário"].toUpperCase().includes(termo));
    }

    if (tipoFiltro === "unidade") {
      resultado = dados.filter(l => l["Unidade Condominial"].toUpperCase().includes(termo));
    }

    if (resultado.length === 0) {
      resultadosContainer.innerHTML = "Nenhum registro encontrado.";
    } else {
      resultadosContainer.innerHTML = gerarTabelaHTML(resultado);
    }

  } catch (error) {
    resultadosContainer.innerHTML = "Erro ao carregar dados.";
    console.error(error);
  }
}

// Conversor CSV em array de objetos
function parseCSV(csv) {
  const linhas = csv.trim().split("\n");
  const cabecalho = linhas.shift().split(",");

  return linhas.map(linha => {
    const valores = linha.split(",");
    const obj = {};
    cabecalho.forEach((col, i) => {
      obj[col.trim()] = valores[i]?.trim() || "";
    });
    return obj;
  });
}

// Gera tabela HTML com botão de baixa
function gerarTabelaHTML(dados) {
  let html = "<table><thead><tr>";

  const colunas = ["Data de cadastro", "Status", "Identificador", "Unidade Condominial", "Remetente", "Destinatário", "Ações"];
  colunas.forEach(col => html += `<th>${col}</th>`);

  html += "</tr></thead><tbody>";

  dados.forEach(linha => {
    html += "<tr>";
    html += `<td>${linha["Data de cadastro"]}</td>`;
    html += `<td>${linha["Status"]}</td>`;
    html += `<td>${linha["Identificador"]}</td>`;
    html += `<td>${linha["Unidade Condominial"]}</td>`;
    html += `<td>${linha["Remetente"]}</td>`;
    html += `<td>${linha["Destinatário"]}</td>`;
    html += `<td><button onclick="darBaixa('${linha["Identificador"]}')">Dar Baixa</button></td>`;
    html += "</tr>";
  });

  html += "</tbody></table>";
  return html;
}

// Função de botão "Dar Baixa"
function darBaixa(identificador) {
  const url = `${formBaixaURL}?usp=pp_url&entry.1752641806=${encodeURIComponent(identificador)}`;
  window.open(url, "_blank");
}


  const btn = document.getElementById("btnNovaEncomenda");
  const modal = document.getElementById("modalForm");
  const btnFechar = document.getElementById("btnFecharModal");
  const form = document.getElementById("formEncomenda");
  const msg = document.getElementById("msgSucesso");

  btn.addEventListener("click", () => {
    document.getElementById("dataCadastro").value = new Date().toLocaleString("pt-BR");
    modal.style.display = "flex";
  });

  btnFechar.addEventListener("click", () => {
    modal.style.display = "none";
    form.reset();
    msg.style.display = "none";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dados = new FormData(form);
    const json = Object.fromEntries(dados.entries());

    try {
      await fetch("https://script.google.com/macros/s/AKfycbw2qWQJV_juYMktVTSiaNy6N80f6JheNFUJ6P9b746cbzh-GIXsf67XTVHBRIpHGoQ/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json)
      });

      msg.style.display = "block";
      form.reset();
    } catch (err) {
      alert("Erro ao enviar. Verifique sua conexão ou fale com o administrador.");
      console.error(err);
    }
  });
