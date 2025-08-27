// main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { initAuth } from './services/auth.js';
import { escutarEncomendas } from './services/firestore.js';
import { UIManager } from './ui/manager.js';

// --- COLE SUAS CREDENCIAIS DO FIREBASE AQUI ---
const firebaseConfig = {
  apiKey: "AIzaSyCfZVOU8G15_vJrS-rGrRRKLoOYzP6vQL0",
  authDomain: "sistema-de-encomendas.firebaseapp.com",
  projectId: "sistema-de-encomendas",
  storageBucket: "sistema-de-encomendas.firebasestorage.app",
  messagingSenderId: "583785844860",
  appId: "1:583785844860:web:6b3cbcd4c2bb928358f9f9"
};

// --- INICIALIZAÇÃO DA APLICAÇÃO ---

// 1. Inicializa o Firebase e os serviços
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 2. Inicializa o Gerenciador da UI, passando as instâncias
const uiManager = new UIManager(db, auth);

// 3. Inicializa a Autenticação, passando a instância de auth
initAuth(
    auth,
    (user) => { // onLogin
        uiManager.mostrarAppUI(user);
        // Começa a escutar por encomendas, passando a instância de db
        escutarEncomendas(db, (encomendas) => {
            uiManager.atualizarTabela(encomendas);
        });
    },
    () => { // onLogout
        uiManager.mostrarLoginUI();
        uiManager.atualizarTabela([]);
    }
);

// Disponibiliza o objeto da UI globalmente para os `onclick` do HTML
window.ui = uiManager;
