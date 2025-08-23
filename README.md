# 📦 Sistema de Controle de Encomendas

![Badge](https://img.shields.io/badge/status-conclu%C3%ADdo-brightgreen)

Um sistema web de página única (SPA) para gerenciamento e controle de recebimento e entrega de encomendas, ideal para condomínios, portarias ou escritórios. A aplicação é construída com tecnologias web front-end puras (HTML, CSS e JavaScript), sem a necessidade de frameworks.

---

## ✨ Funcionalidades

O sistema foi projetado para ser completo e fácil de usar, oferecendo as seguintes funcionalidades:

* **📊 Dashboard Interativo:**
    * Visualização rápida das estatísticas principais: total de encomendas, pendentes e entregues.

* **📦 Gerenciamento Completo de Encomendas (CRUD):**
    * **Cadastro:** Adicione novas encomendas com informações detalhadas (destinatário, remetente, tipo, etc.) através de um modal intuitivo.
    * **Visualização:** Liste todas as encomendas em uma tabela clara e organizada.
    * **Edição:** Altere informações de encomendas que ainda estão com status "Pendente".
    * **Exclusão:** Remova registros de encomendas de forma segura com confirmação.
    * **Baixa de Entrega:** Marque uma encomenda como "Entregue", registrando o nome e documento de quem a recebeu, com data e hora.

* **💾 Persistência de Dados:**
    * As informações são salvas localmente no navegador (`localStorage`), garantindo que os dados não sejam perdidos ao fechar a aba ou reiniciar.

* **🔍 Busca e Ordenação:**
    * Filtre encomendas em tempo real pelo nome do destinatário, remetente ou código de rastreio.
    * Ordene a tabela clicando no cabeçalho de qualquer coluna (ID, Destinatário, Data, etc.).

* **📄 Paginação:**
    * Se a lista de encomendas for muito longa, a tabela é dividida em páginas para garantir a performance e a usabilidade.

* **📑 Geração de Relatórios e Folhas:**
    * **Exportar para PDF:** Crie um relatório em PDF de todas as encomendas cadastradas com um único clique.
    * **Folha de Assinatura:** Gere uma folha de assinaturas para impressão a partir de dados colados da tabela, com filtragem por "Torre" ou setor.

* **🎨 Interface Moderna e Responsiva:**
    * **Menu Recolhível:** O menu lateral pode ser escondido para maximizar o espaço de visualização do conteúdo.
    * **Notificações Modernas:** Feedbacks de ações (sucesso, erro) são exibidos através de "toasts", notificações não intrusivas.
    * Design limpo e responsivo que se adapta a diferentes tamanhos de tela.

---

## 💻 Tecnologias Utilizadas

Este projeto foi construído utilizando as seguintes tecnologias:

* **HTML5**
* **CSS3** (com Flexbox e Grid para layout)
* **JavaScript (ES6+ Vanilla)** - Toda a lógica é escrita em JavaScript puro, utilizando classes para organização.
* **jsPDF & jsPDF-AutoTable** - Bibliotecas para a funcionalidade de exportação para PDF.

---

## 🚀 Como Executar o Projeto

Como este é um projeto puramente front-end, você não precisa de um servidor complexo ou compilação.

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
    ```

2.  **Abra o arquivo `index.html`:**
    * Navegue até a pasta do projeto e abra o arquivo `index.html` diretamente no seu navegador de preferência (Google Chrome, Firefox, etc.).

    * **(Opcional, mas recomendado)** Para uma melhor experiência, você pode usar uma extensão como o "Live Server" no Visual Studio Code, que cria um pequeno servidor local e atualiza a página automaticamente quando você salva uma alteração.

---

## 📖 Como Utilizar

1.  **Cadastrar Encomendas:** Na página "Encomendas", clique no botão de `+` no canto superior direito para abrir o modal de cadastro.
2.  **Visualizar e Buscar:** Todas as encomendas são listadas na tabela. Utilize o campo de busca para filtrá-las.
3.  **Dar Baixa, Editar e Excluir:** Use os botões de ação na última coluna da tabela para gerenciar cada encomenda individualmente.
4.  **Gerar Folha de Assinatura:**
    * Na página "Encomendas", selecione e copie as linhas da tabela (`Ctrl+C`).
    * Navegue até "Folhas de Assinatura", cole os dados na caixa de texto (`Ctrl+V`), selecione a torre e clique em "Gerar Folha".

---
