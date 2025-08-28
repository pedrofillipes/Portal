# 📦 Sistema de Controle de Encomendas v2.0

Um sistema web de página única (SPA) para gerenciamento e controle de recebimento e entrega de encomendas. Ideal para condomínios, portarias ou escritórios, esta nova versão foi reconstruída com um backend seguro na nuvem usando **Firebase**, garantindo que os dados sejam centralizados, seguros e acessíveis de qualquer lugar.

---

## ✨ Funcionalidades

O sistema foi projetado para ser completo, seguro e fácil de usar, oferecendo as seguintes funcionalidades:

### 🔐 Segurança e Acesso

- **Login com E-mail/Senha**: Acesso restrito à aplicação através do Firebase Authentication.  
- **Banco de Dados Seguro**: Informações protegidas por *Security Rules* no Firestore, garantindo que apenas usuários autenticados possam ler ou modificar os dados.

### 📦 Gerenciamento de Encomendas (CRUD na Nuvem)

- **Cadastro**: Adicione novas encomendas com informações detalhadas (destinatário, remetente, etc.) através de um modal intuitivo.  
- **Visualização**: Liste todas as encomendas em uma tabela clara e organizada, com dados carregados em tempo real do Firestore.  
- **Edição**: Altere informações de encomendas que ainda estão com status **"Pendente"**.  
- **Exclusão**: Remova registros de encomendas de forma segura com confirmação.  
- **Baixa de Entrega**: Marque uma encomenda como **"Entregue"**, registrando o nome e documento de quem a recebeu, com data e hora.

### 📊 Dashboard e Relatórios

- **Dashboard Interativo**: Visualização rápida das estatísticas principais: total de encomendas, pendentes e entregues.  
- **Exportar para PDF**: Crie um relatório em PDF de todas as encomendas cadastradas com um único clique.  
- **Folha de Assinatura**: Gere uma folha de assinaturas para impressão a partir de dados colados, com filtragem por setor.

### 🧭 Interface e Usabilidade

- **Busca e Ordenação**: Filtre encomendas em tempo real e ordene a tabela clicando no cabeçalho das colunas.  
- **Paginação**: A tabela é dividida em páginas para garantir a performance e a usabilidade.  
- **Interface Moderna e Responsiva**: Design limpo que se adapta a diferentes tamanhos de tela, com menu recolhível e notificações modernas (*toasts*).

---

## 💻 Tecnologias Utilizadas

### Front-End
- HTML5  
- CSS3 (Flexbox e Grid)  
- JavaScript (ES6+ Vanilla)

### Back-End (BaaS - Backend as a Service)
- **Firebase Firestore**: Banco de dados NoSQL em tempo real.  
- **Firebase Authentication**: Sistema de autenticação para usuários.

### Bibliotecas
- `jsPDF` & `jsPDF-AutoTable`

### Hospedagem
- **GitHub Pages**

---

## 🚀 Como Executar o Projeto

Para executar este projeto localmente, você precisará configurar seu próprio ambiente Firebase.

### ✅ Pré-requisitos
- Conta no Firebase  
- Git instalado  
- Um servidor de desenvolvimento local (recomendada a extensão **Live Server** para VS Code)

### 🛠️ Passos

#### 1. Clone o repositório:
```bash
git clone https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git
cd NOME_DO_REPOSITORIO

2. Configure o Firebase:

Crie um novo projeto no Console do Firebase

Na seção Build, crie um Firestore Database (inicie em modo de teste)

Ative o Authentication e habilite o método de login "E-mail/senha"

Crie um novo Aplicativo da Web e copie o objeto de configuração firebaseConfig

3. Adicione suas credenciais:

Abra o arquivo main.js na raiz do projeto.

No topo do arquivo, você encontrará um bloco de exemplo const firebaseConfig. Substitua-o pelo objeto de configuração que
você copiou do console do Firebase.

4. Defina as Regras de Segurança:

No Firestore, vá até a aba "Regras" e substitua o conteúdo por:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}

Clique em Publicar.

5. Crie um Usuário de Teste:

Vá para Authentication > Users

Adicione um novo usuário com e-mail e senha

6. Execute o projeto localmente:

Abra a pasta do projeto no VS Code

Clique com o botão direito no index.html e selecione "Open with Live Server"

☁️ Publicação (Deploy)

O projeto está pronto para ser publicado no GitHub Pages:

Suba o código para o seu repositório no GitHub

Vá para as configurações do repositório e acesse a seção Pages

Selecione a branch main como fonte de deploy e salve

IMPORTANTE: Após a publicação, copie a URL do seu site (ex: https://seu-usuario.github.io) e adicione-a
 à lista de Domínios autorizados nas configurações do Firebase Authentication.
