// services/firestore.js
import { 
    collection, onSnapshot, addDoc, doc, 
    updateDoc, deleteDoc, orderBy, query 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/**
 * Escuta por atualizações em tempo real na coleção de encomendas.
 * @param {object} db - A instância do Firestore.
 * @param {function} callback - Função que recebe a lista de encomendas atualizada.
 */
export function escutarEncomendas(db, callback) {
    const encomendasCollectionRef = collection(db, 'encomendas');
    const q = query(encomendasCollectionRef, orderBy('dataCadastro', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const encomendas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(encomendas);
    }, (error) => {
        console.error("Erro ao escutar encomendas:", error);
    });
}

/**
 * Cadastra uma nova encomenda.
 * @param {object} db - A instância do Firestore.
 * @param {object} novaEncomenda - O objeto da nova encomenda.
 */
export function cadastrarEncomenda(db, novaEncomenda) {
    return addDoc(collection(db, 'encomendas'), novaEncomenda);
}

/**
 * Atualiza uma encomenda existente.
 * @param {object} db - A instância do Firestore.
 * @param {string} id - O ID do documento a ser atualizado.
 * @param {object} dadosAtualizados - Os novos dados.
 */
export function salvarEdicao(db, id, dadosAtualizados) {
    const docRef = doc(db, 'encomendas', id);
    return updateDoc(docRef, dadosAtualizados);
}

/**
 * Exclui uma encomenda.
 * @param {object} db - A instância do Firestore.
 * @param {string} id - O ID do documento a ser excluído.
 */
export function excluirEncomenda(db, id) {
    const docRef = doc(db, 'encomendas', id);
    return deleteDoc(docRef);
}
