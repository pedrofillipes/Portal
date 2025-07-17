function gerarTabela() {
  const torreSelecionada = document.getElementById('torre').value.trim();
  const isAdministracao = torreSelecionada === 'ADMINISTRACAO';

  const entrada = document.getElementById('entrada').value.trim();
  if (!entrada) {
    alert("Por favor, cole os dados brutos antes de continuar.");
    return;
  }

  const dados = entrada.split('\n');
  const registros = [];
  const jaAdicionados = new Set();

  dados.forEach((linha, index) => {
    const colunas = linha.trim().split(/\t+/);
    if (colunas.length < 7) {
      console.warn(`Linha ${index + 1} ignorada: colunas insuficientes.`);
      return;
    }

    const data = colunas[0].trim();
    const rastreio = colunas[3].trim();
    let unidadeBruta = colunas[4]
      .replace('APTO', '')
      .replace(/SALA/gi, '')
      .replace(' - ', '')
      .trim()
      .toUpperCase();

    const remetente = colunas[5].trim();
    const morador = colunas[6].trim();

    let unidade = unidadeBruta;
    let torre = '';

    if (unidadeBruta.includes(' - ')) {
      const partes = unidadeBruta.split(' - ');
      unidade = partes[0].trim();
      torre = partes[1].trim();
    } else {
      torre = unidadeBruta; // ADMINISTRACAO
    }

    const corresponde =
      (isAdministracao && torre === 'ADMINISTRACAO') ||
      (!isAdministracao && torre === torreSelecionada);

    if (corresponde) {
      const chave = `${data}|${unidade}|${morador}|${rastreio}`;
      if (!jaAdicionados.has(chave)) {
        jaAdicionados.add(chave);
        const numeroApto = isAdministracao ? 0 : parseInt(unidade) || 0;
        const unidadeFinal = isAdministracao ? 'ADM' : unidade;
        registros.push({ data, unidade: unidadeFinal, morador, rastreio, remetente, numeroApto });
      }
    }
  });

  if (registros.length === 0) {
    alert("Nenhum registro encontrado para a torre selecionada.");
    return;
  }

  registros.sort((a, b) => a.numeroApto - b.numeroApto);
  const isTorreAB = torreSelecionada === 'TORRE A' || torreSelecionada === 'TORRE B';

  const tabelaHTML = `
    <html>
    <head>
      <title>Folha de Assinaturas - ${isAdministracao ? 'ADMINISTRAÇÃO' : torreSelecionada}</title>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet">
      <style>
        body { font-family: "Montserrat", sans-serif; padding: 20px; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; table-layout: fixed; }
        th, td {
          border: 1px solid #000;
          padding: 8px;
          text-align: center;
          vertical-align: top;
          overflow-wrap: break-word;
        }
        th:nth-child(1), td:nth-child(1) { width: 10%; }
        th:nth-child(2), td:nth-child(2) { width: 16%; }
        th:nth-child(3), td:nth-child(3) { width: 7%; font-weight: bold; }
        th:nth-child(4), td:nth-child(4) { width: 15%; }
        th:nth-child(5), td:nth-child(5) { width: 20%; font-weight: bold; }
        th:nth-child(6), td:nth-child(6) { width: 32%; text-align: left; }
        @media print {
          .no-print { display: none; }
          tbody { break-inside: avoid; page-break-inside: avoid; }
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
        ${registros.map(reg => `
          <tbody>
            <tr>
              <td>${reg.data}</td>
              <td>${reg.rastreio}</td>
              <td>${reg.unidade}</td>
              <td>${reg.remetente}</td>
              <td>${reg.morador}</td>
              <td>
                <div style="display: flex; gap: 10px;">
                  <span style="flex: 2;">Nome:</span>
                  ${!isTorreAB && !isAdministracao ? '<span style="flex: 1;">Data:</span>' : ''}
                </div>
                <div style="display: flex; gap: 10px;">
                  <span style="flex: 2;">Doc:</span>
                  ${!isTorreAB && !isAdministracao ? '<span style="flex: 1;">Hora:</span>' : ''}
                </div>
              </td>
            </tr>
          </tbody>
        `).join('')}
      </table>
      <br>
      <button class="no-print" onclick="window.print()">Imprimir</button>
    </body>
    </html>
  `;

  const novaJanela = window.open('', '_blank');

  if (!novaJanela || novaJanela.closed || typeof novaJanela.closed === 'undefined') {
    // Fallback: inserir em <div id="fallbackArea"></div>
    const fallback = document.getElementById("fallbackArea") || document.createElement("div");
    fallback.id = "fallbackArea";
    fallback.innerHTML = tabelaHTML;
    document.body.appendChild(fallback);
    alert("Não foi possível abrir a nova janela. A tabela foi gerada dentro da própria página.");
  } else {
    novaJanela.document.open();
    novaJanela.document.write(tabelaHTML);
    novaJanela.document.close();
  }
}
