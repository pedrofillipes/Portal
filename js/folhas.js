document.addEventListener('DOMContentLoaded', function() {
  // === Elementos DOM ===
  const elementos = {
    torreSelect: document.getElementById('torre'),
    entradaTextarea: document.getElementById('entrada'),
    textareaInfo: document.getElementById('textareaInfo'),
    statusDot: document.getElementById('statusDot'),
    statusText: document.getElementById('statusText'),
    generateBtn: document.getElementById('generateBtn'),
    menuToggle: document.getElementById("menuToggle"),
    sidebar: document.getElementById("sidebar"),
    fallbackArea: document.getElementById("fallbackArea") // Adicionado fallback area
  };

  // === Inicialização de Eventos ===
  function inicializarEventos() {
    // Menu mobile
    elementos.menuToggle.addEventListener('click', () => {
      elementos.sidebar.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 &&
          !elementos.sidebar.contains(e.target) &&
          !elementos.menuToggle.contains(e.target)) {
        elementos.sidebar.classList.remove('active');
      }
    });

    // Monitorar textarea para atualizar status
    elementos.entradaTextarea.addEventListener('input', updateStatus);
    elementos.entradaTextarea.addEventListener('paste', () => {
      setTimeout(updateStatus, 100); // Dar um pequeno atraso para o conteúdo colar antes de atualizar
    });

    // Botão Gerar Tabela
    elementos.generateBtn.addEventListener('click', gerarTabela);

    // Responsividade da sidebar
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        elementos.sidebar.classList.remove('active');
      }
    });

    // Inicializar status ao carregar a página
    updateStatus();
  }

  // === Funções Auxiliares ===

  /**
   * Atualiza o status da textarea com base no número de linhas.
   */
  function updateStatus() {
    const content = elementos.entradaTextarea.value.trim();
    // Filtra linhas vazias para uma contagem mais precisa
    const lines = content ? content.split('\n').filter(line => line.trim()) : [];

    elementos.textareaInfo.textContent = `${lines.length} linhas`;

    if (lines.length > 0) {
      elementos.statusDot.classList.add('ready');
      elementos.statusText.textContent = `${lines.length} registros prontos para processamento`;
      elementos.generateBtn.disabled = false;
    } else {
      elementos.statusDot.classList.remove('ready');
      elementos.statusText.textContent = 'Aguardando dados...';
      elementos.generateBtn.disabled = true;
    }
  }

  /**
   * Gera e exibe a folha de assinaturas em uma nova janela ou como fallback.
   */
  function gerarTabela() {
    const torreSelecionada = elementos.torreSelect.value.trim();
    const isAdministracao = torreSelecionada === 'ADMINISTRACAO';

    const entrada = elementos.entradaTextarea.value.trim();
    if (!entrada) {
      alert("Por favor, cole os dados brutos antes de continuar.");
      return;
    }

    const dados = entrada.split('\n');
    const registros = [];
    const jaAdicionados = new Set(); // Para evitar duplicatas

    dados.forEach((linha, index) => {
      const colunas = linha.trim().split(/\t+/); // Divide por uma ou mais tabulações
      if (colunas.length < 7) {
        console.warn(`Linha ${index + 1} ignorada: colunas insuficientes (${linha}).`);
        return;
      }

      const data = colunas[0]?.trim() || '';
      const rastreio = colunas[3]?.trim() || '';
      let unidadeBruta = (colunas[4] || '')
        .replace(/APTO/gi, '') // Case-insensitive
        .replace(/SALA/gi, '')
        .replace(/ - /g, '') // Remove espaços em torno do hífen para padronizar
        .trim()
        .toUpperCase();

      const remetente = colunas[5]?.trim() || '';
      const morador = colunas[6]?.trim() || '';

      let unidade = unidadeBruta;
      let torre = '';

      // Tenta extrair torre se houver um padrão "UNIDADE - TORRE"
      const partesUnidade = unidadeBruta.split(/ - /);
      if (partesUnidade.length > 1) {
          unidade = partesUnidade[0].trim();
          torre = partesUnidade[1].trim();
      } else {
          // Se não tiver hífen, a unidade bruta pode ser a própria torre (ex: "ADMINISTRACAO")
          torre = unidadeBruta;
      }

      // Verifica se o registro corresponde à torre selecionada
      const corresponde =
        (isAdministracao && torre === 'ADMINISTRACAO') ||
        (!isAdministracao && torre === torreSelecionada);

      if (corresponde) {
        const chave = `${data}|${unidade}|${morador}|${rastreio}`;
        if (!jaAdicionados.has(chave)) {
          jaAdicionados.add(chave);
          // Converte para número para ordenação, 0 para ADM ou inválidos
          const numeroApto = isAdministracao ? 0 : parseInt(unidade, 10) || 0;
          const unidadeFinal = isAdministracao ? 'ADM' : unidade;
          registros.push({ data, unidade: unidadeFinal, morador, rastreio, remetente, numeroApto });
        }
      }
    });

    if (registros.length === 0) {
      alert("Nenhum registro encontrado para a torre selecionada ou dados inválidos.");
      return;
    }

    // Ordena os registros por número de apartamento
    registros.sort((a, b) => a.numeroApto - b.numeroApto);

    const isTorreAB = torreSelecionada === 'TORRE A' || torreSelecionada === 'TORRE B';

    const tabelaHTML = `
      <html>
      <head>
        <title>Folha de Assinaturas - ${isAdministracao ? 'ADMINISTRAÇÃO' : torreSelecionada}</title>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap" rel="stylesheet">
        <style>
          body { font-family: "Montserrat", sans-serif; padding: 20px; color: #333; }
          h1 { color: #0ea5e9; text-align: center; margin-bottom: 25px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; table-layout: fixed; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: center;
            vertical-align: top;
            overflow-wrap: break-word;
          }
          th {
            background-color: #e0f2fe; /* Light blue background from vars.css --color-primary-bg */
            color: #1e293b; /* Dark text from vars.css --color-text-primary */
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.9em;
          }
          /* Larguras das colunas aprimoradas */
          th:nth-child(1), td:nth-child(1) { width: 10%; } /* Data */
          th:nth-child(2), td:nth-child(2) { width: 16%; } /* Código/Rastreio */
          th:nth-child(3), td:nth-child(3) { width: 7%; font-weight: bold; } /* Unid */
          th:nth-child(4), td:nth-child(4) { width: 15%; } /* Remetente */
          th:nth-child(5), td:nth-child(5) { width: 20%; font-weight: bold; } /* Destinatário */
          th:nth-child(6), td:nth-child(6) { width: 32%; text-align: left; } /* Retirada */

          td { font-size: 0.95em; }
          tbody:nth-child(odd) { background-color: #f9f9f9; } /* Levemente mais escuro para linhas ímpares */
          
          .retirada-info {
            display: flex;
            flex-direction: column; /* Organiza em coluna para nomes/datas */
            gap: 5px; /* Espaçamento entre os itens */
          }
          .retirada-line {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .retirada-label {
            font-weight: 600;
            min-width: 50px; /* Garante alinhamento dos labels */
            text-align: right; /* Alinha labels à direita */
            padding-right: 5px;
          }
          .retirada-value {
            flex-grow: 1; /* Ocupa o restante do espaço */
            text-align: left;
            border-bottom: 1px dashed #ccc; /* Linha para assinatura */
          }

          .no-print {
            display: block;
            margin: 20px auto;
            padding: 10px 20px;
            background-color: #0ea5e9; /* --color-primary */
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
            font-weight: 600;
            transition: background-color 0.2s ease;
          }
          .no-print:hover {
            background-color: #0284c7; /* --color-primary-dark */
          }
          @media print {
            .no-print { display: none; }
            /* Quebra de página para tabelas longas */
            table { page-break-after: auto; }
            tr    { page-break-inside: avoid; page-break-after: auto; }
            thead { display: table-header-group; } /* Repete o cabeçalho em cada nova página */
            tfoot { display: table-footer-group; }
          }
        </style>
      </head>
      <body>
        <h1>Folha de Assinaturas - ${isAdministracao ? 'ADMINISTRAÇÃO' : torreSelecionada}</h1>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Código</th>
              <th>Unid</th>
              <th>Remetente</th>
              <th>Destinatário</th>
              <th>Retirada</th>
            </tr>
          </thead>
          <tbody>
            ${registros.map(reg => `
              <tr>
                <td>${reg.data}</td>
                <td>${reg.rastreio}</td>
                <td>${reg.unidade}</td>
                <td>${reg.remetente}</td>
                <td>${reg.morador}</td>
                <td>
                  <div class="retirada-info">
                    <div class="retirada-line">
                      <span class="retirada-label">Nome:</span>
                      <span class="retirada-value"></span>
                    </div>
                    <div class="retirada-line">
                      <span class="retirada-label">Data:</span>
                      <span class="retirada-value"></span>
                    </div>
                    <div class="retirada-line">
                      <span class="retirada-label">Hora:</span>
                      <span class="retirada-value"></span>
                    </div>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <br>
        <button class="no-print" onclick="window.print()">Imprimir</button>
      </body>
      </html>
    `;

    const novaJanela = window.open('', '_blank');

    if (!novaJanela || novaJanela.closed || typeof novaJanela.closed === 'undefined') {
      // Fallback: inserir em <div id="fallbackArea"></div> se a abertura da janela falhar
      if (elementos.fallbackArea) {
        elementos.fallbackArea.innerHTML = tabelaHTML;
        alert("Não foi possível abrir a nova janela. A tabela foi gerada dentro da própria página (no final).");
      } else {
        // Se nem mesmo a área de fallback existe, crie uma e adicione
        const tempFallback = document.createElement("div");
        tempFallback.id = "fallbackArea";
        tempFallback.innerHTML = tabelaHTML;
        document.body.appendChild(tempFallback);
        alert("Não foi possível abrir a nova janela. A tabela foi gerada no final da página.");
      }
    } else {
      novaJanela.document.open();
      novaJanela.document.write(tabelaHTML);
      novaJanela.document.close();
    }
  }

  // Iniciar a aplicação
  inicializarEventos();
});
