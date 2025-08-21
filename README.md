Sistema de Controle de Encomendas e Gerador de Folhas de Assinatura
Este é um sistema web simples e eficiente para gerenciar encomendas em condomínios ou empresas, com a funcionalidade adicional de gerar folhas de assinatura a partir de dados brutos. O projeto é construído com HTML, CSS e JavaScript puro, sem a necessidade de frameworks externos ou bibliotecas, o que o torna leve, rápido e fácil de implantar.

🚀 Funcionalidades
O sistema é dividido em duas seções principais:

Controle de Encomendas:

Dashboard: Visão geral com o total de encomendas, contagem de encomendas pendentes e entregues.

Cadastro: Adicione novas encomendas com informações como destinatário, remetente, tipo, código de rastreamento e observações.

Baixa de Encomendas: Marque uma encomenda como "entregue", registrando o nome e o documento do recebedor, data e hora da baixa.

Consulta: Busque encomendas por destinatário, remetente ou código de rastreamento.

Exclusão: Remova encomendas do sistema (requer confirmação).

Persistência de Dados: Os dados são salvos no sessionStorage do navegador, mantendo as informações durante a sessão.

Gerador de Folhas de Assinatura:

Entrada de Dados: Cole os dados brutos de um sistema externo. O script processa e filtra as informações.

Filtragem por Torre/Setor: Geração de folhas de assinatura para uma torre específica (A, B, C, D, E) ou para a Administração.

Geração de Tabela: Formata os dados em uma tabela limpa e pronta para impressão, com campos para nome e assinatura do recebedor.

Impressão: Abra a folha em uma nova janela ou aba para uma impressão rápida e sem distrações.

🛠️ Tecnologias
HTML5: Estrutura e marcação da página.

CSS3: Estilização e layout responsivo.

JavaScript (ES6+): Lógica de negócios, manipulação do DOM e gestão de dados.

Google Material Symbols: Ícones utilizados na interface para melhorar a usabilidade.

📁 Estrutura do Projeto
O projeto é organizado de forma simples e modular:

├── index.html          # Estrutura principal da página e código CSS embutido.
├── folhas.js           # Lógica para o Gerador de Folhas de Assinatura.
├── app.js              # Lógica para o Sistema de Controle de Encomendas (dashboard, CRUD, etc.).
└── README.md           # Documentação do projeto (este arquivo).
Nota: O código CSS foi mantido no arquivo index.html para simplificar o projeto e reduzir o número de arquivos.

⚙️ Como Usar
Este projeto não requer servidor backend. Você pode executá-lo diretamente no seu navegador.

Clone ou baixe o repositório:

Bash

git clone https://github.com/seu-usuario/nome-do-repositorio.git
Abra o arquivo index.html:

Navegue até o diretório do projeto e dê um duplo clique no arquivo index.html.

Alternativamente, arraste e solte o arquivo em uma aba do seu navegador preferido.

Utilizando o Gerador de Folhas de Assinatura
Navegue até a seção "Folhas de Assinatura" no menu lateral.

Copie os dados brutos de uma planilha ou outro sistema (normalmente colunas separadas por tabulação).

Cole os dados na caixa de texto.

Selecione a torre desejada no menu suspenso.

Clique no botão "Gerar Folha" para visualizar e imprimir a tabela formatada.

🤝 Contribuições
Contribuições são bem-vindas! Se você tiver ideias para melhorias, novas funcionalidades ou correções de bugs, sinta-se à vontade para abrir uma issue ou enviar um pull request.


👤 Autor
Pedro Oliveira/ @pedrofillipes
