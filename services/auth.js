// services/auth.js
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

/**
 * Observa o estado de autenticação do usuário.
 * @param {object} auth - A instância do Firebase Auth.
 * @param {function} onLogin - Callback para quando o usuário loga.
 * @param {function} onLogout - Callback para quando o usuário desloga.
 */
export function initAuth(auth, onLogin, onLogout) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            onLogin(user);
        } else {
            onLogout();
        }
    });
}

/**
 * Tenta fazer login de um usuário.
 * @param {object} auth - A instância do Firebase Auth.
 * @param {string} email - O email do usuário.
 * @param {string} password - A senha do usuário.
 */
export function login(auth, email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Desloga o usuário atual.
 * @param {object} auth - A instância do Firebase Auth.
 */
export function logout(auth) {
    return signOut(auth);
}
