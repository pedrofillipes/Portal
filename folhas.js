// folhas.js - Gerador de Folha de Assinaturas (Método de Colar)
function gerarTabela() {
    const torreSelecionada = document.getElementById('torre').value.trim();
    const isAdministracao = torreSelecionada === 'ADMINISTRACAO';

    const entrada = document.getElementById('entrada').value.trim();
    if (!entrada) {
        alert("Por favor, cole os dados da tabela antes de continuar.");
        return;
    }

    const linhas = entrada.split('\n');
    const registros = [];

    linhas.forEach(linha => {
        // Divide por tabulação, que é o separador ao copiar de uma tabela
        const colunas = linha.trim().split(/\t+/);
        
        // Espera-se que os dados copiados tenham a estrutura da tabela
        // ID, Destinatário, Remetente, Cód. Rastreio, Tipo, Data, Status, Ações
        if (colunas.length >= 7) {
            const id = colunas[0];
            const destinatario = colunas[1];
            const remetente = colunas[2];
            const codRastreio = colunas[3];
            const tipo = colunas[4];
            const dataCadastro = colunas[5];
            const status = colunas[6];
            
            // Lógica para filtrar pela torre (baseado no nome do destinatário)
            const textoBusca = destinatario.toUpperCase();
            const corresponde = (isAdministracao && textoBusca.includes('ADM')) || 
                                (!isAdministracao && textoBusca.includes(torreSelecionada));

            if (corresponde) {
                registros.push({
                    data: dataCadastro,
                    destinatario: destinatario,
                    remetente: remetente,
                    rastreio: codRastreio,
                });
            }
        }
    });

    if (registros.length === 0) {
        alert("Nenhum registro encontrado para a torre selecionada nos dados colados.");
        return;
    }

    const tabelaHTML = `
      <html>
      <head>
        <title>Folha de Assinaturas - ${torreSelecionada}</title>
        <style>
          body { font-family: "Segoe UI", sans-serif; padding: 20px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: center; vertical-align: top; font-size: 0.9rem; word-break: break-word; }
          .assinatura { height: 60px; text-align: left; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <h1>Folha de Assinaturas - ${torreSelecionada}</h1>
        <table>
          <thead>
            <tr>
              <th style="width:10%">Data</th>
              <th style="width:15%">Remetente</th>
              <th style="width:25%">Destinatário</th>
              <th style="width:50%">Assinatura do Recebedor (Nome, Documento, Data)</th>
            </tr>
          </thead>
          <tbody>
          ${registros.map(reg => `
              <tr>
                <td>${reg.data}</td>
                <td>${reg.remetente}</td>
                <td>${reg.destinatario}</td>
                <td class="assinatura"></td>
              </tr>
          `).join('')}
          </tbody>
        </table>
        <br>
        <button class="no-print" onclick="window.print()">Imprimir</button>
      </body>
      </html>`;

    const novaJanela = window.open('', '_blank');
    if (novaJanela) {
        novaJanela.document.write(tabelaHTML);
        novaJanela.document.close();
    } else {
        alert("Não foi possível abrir a nova janela. Verifique se o seu navegador está bloqueando pop-ups.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn-gerar-folha");
    if (btn) {
        btn.addEventListener("click", gerarTabela);
    }
});
