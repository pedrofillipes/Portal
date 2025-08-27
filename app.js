// Importações do Firebase Auth
import { 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// Importações do Firestore
import { 
    getDocs, collection, addDoc, doc, 
    updateDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

export class EncomendaManager {
    constructor(db, auth) {
        this.db = db;
        this.auth = auth;
        this.encomendas = [];
        this.currentActionId = null;
        this.sortColumn = 'id';
        this.sortDirection = 'desc';
        this.currentPage = 1;
        this.rowsPerPage = 10;
        this.init();
    }

    init() {
        this.bindEvents();
        this.initAuth(); // Chama a lógica de autenticação
        this.initNavigation();
    }

    initAuth() {
        const loginContainer = document.getElementById('login-container');
        const mainContainer = document.querySelector('.container');
        const btnLogout = document.getElementById('btn-logout');
        const userEmailSpan = document.getElementById('user-email');

        onAuthStateChanged(this.auth, async (user) => {
            if (user) {
                // Usuário está logado
                loginContainer.style.display = 'none';
                mainContainer.classList.remove('logged-out');
                btnLogout.classList.remove('hidden');
                userEmailSpan.textContent = user.email;

                // Carrega os dados somente após o login
                await this.loadEncomendas();
                this.renderAll();
            } else {
                // Usuário está deslogado
                loginContainer.style.display = 'flex';
                mainContainer.classList.add('logged-out');
                btnLogout.classList.add('hidden');
                userEmailSpan.textContent = '';
                
                // Limpa a tabela para não mostrar dados antigos
                this.encomendas = [];
                this.renderEncomendas();
                this.updateStats();
            }
        });

        // Event listener para o formulário de login
        document.getElementById('form-login').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
            const errorMessage = document.getElementById('login-error-message');
            errorMessage.textContent = '';

            signInWithEmailAndPassword(this.auth, email, senha)
                .catch((error) => {
                    console.error("Erro de login:", error.code);
                    errorMessage.textContent = 'Email ou senha inválidos.';
                });
        });

        // Event listener para o botão de logout
        btnLogout.addEventListener('click', () => {
            signOut(this.auth);
        });
    }

    renderAll() {
        this.ordenarEncomendas();
        this.renderEncomendas();
        this.updateStats();
    }

    bindEvents() {
        document.getElementById('form-encomenda').addEventListener('submit', e => { e.preventDefault(); this.cadastrarEncomenda(); });
        document.getElementById('form-editar').addEventListener('submit', e => { e.preventDefault(); this.salvarEdicao(); });
        document.getElementById('form-baixa').addEventListener('submit', e => { e.preventDefault(); this.confirmarBaixa(); });
        document.getElementById('search-input').addEventListener('input', e => { this.currentPage = 1; this.renderEncomendas(e.target.value); });
        document.getElementById('btn-export-pdf').addEventListener('click', () => this.exportarParaPDF());
        document.getElementById('btn-add-encomenda').addEventListener('click', () => this.openModal('modal-cadastro'));
        document.getElementById('confirm-delete').addEventListener('click', () => this.excluirEncomenda());
        document.getElementById('btn-toggle-sidebar').addEventListener('click', () => document.querySelector('.container').classList.toggle('sidebar-collapsed'));

        document.querySelectorAll('.table th.sortable').forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.sort;
                this.sortDirection = (this.sortColumn === column && this.sortDirection === 'asc') ? 'desc' : 'asc';
                this.sortColumn = column;
                this.renderAll();
            });
        });

        document.querySelectorAll('.close-modal, .btn-cancel').forEach(btn => btn.addEventListener('click', () => this.closeModal(btn.dataset.modalId)));
        document.querySelectorAll('.modal').forEach(modal => modal.addEventListener('click', e => { if (e.target === modal) this.closeModal(modal.id); }));
        document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.modal.active').forEach(m => this.closeModal(m.id)); });
    }

    initNavigation() {
        const menuItems = document.querySelectorAll('.menu-item');
        const pages = document.querySelectorAll('.page');
        menuItems.forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                menuItems.forEach(mi => mi.classList.remove('active'));
                pages.forEach(p => p.classList.remove('active'));
                item.classList.add('active');
                document.getElementById(item.dataset.page).classList.add('active');
            });
        });
    }

    async loadEncomendas() {
        try {
            const encomendasCollection = collection(this.db, 'encomendas');
            const snapshot = await getDocs(encomendasCollection);
            this.encomendas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Erro ao carregar encomendas:", error);
            this.showToast('Falha ao carregar dados do servidor. Verifique as regras de segurança.', 'error');
        }
    }

    async cadastrarEncomenda() {
        const form = document.getElementById('form-encomenda');
        const novaEncomenda = {
            destinatario: form.destinatario.value.toUpperCase(),
            remetente: form.remetente.value.toUpperCase(),
            tipo: form.tipo.value,
            codigo: form.codigo.value.toUpperCase() || 'N/A',
            observacoes: form.observacoes.value,
            dataCadastro: new Date().toLocaleDateString('pt-BR'),
            status: 'pendente'
        };

        try {
            const encomendasCollection = collection(this.db, 'encomendas');
            const docRef = await addDoc(encomendasCollection, novaEncomenda);
            this.encomendas.push({ id: docRef.id, ...novaEncomenda });
            this.renderAll();
            this.closeModal('modal-cadastro');
            this.showToast('Encomenda cadastrada com sucesso!');
        } catch (error) {
            console.error("Erro ao cadastrar:", error);
            this.showToast('Erro ao cadastrar encomenda.', 'error');
        }
    }

    async salvarEdicao() {
        const form = document.getElementById('form-editar');
        const id = form.querySelector('#edit-id').value;
        const index = this.encomendas.findIndex(e => e.id === id);

        if (index > -1) {
            const dadosAtualizados = {
                destinatario: form.querySelector('#edit-destinatario').value.toUpperCase(),
                remetente: form.querySelector('#edit-remetente').value.toUpperCase(),
                tipo: form.querySelector('#edit-tipo').value,
                codigo: form.querySelector('#edit-codigo').value.toUpperCase() || 'N/A',
                observacoes: form.querySelector('#edit-observacoes').value
            };

            try {
                const docRef = doc(this.db, 'encomendas', id);
                await updateDoc(docRef, dadosAtualizados);
                this.encomendas[index] = { ...this.encomendas[index], ...dadosAtualizados };
                this.renderAll();
                this.closeModal('modal-editar');
                this.showToast('Encomenda atualizada com sucesso!');
            } catch (error) {
                console.error("Erro ao salvar edição:", error);
                this.showToast('Erro ao atualizar encomenda.', 'error');
            }
        }
    }

    async confirmarBaixa() {
        const id = this.currentActionId;
        const index = this.encomendas.findIndex(e => e.id === id);
        if (index > -1) {
            const agora = new Date();
            const dadosBaixa = {
                status: 'entregue',
                dataEntrega: agora.toLocaleDateString('pt-BR'),
                horaEntrega: agora.toLocaleTimeString('pt-BR'),
                nomeRecebedor: document.getElementById('nome-recebedor').value.toUpperCase(),
                documentoRecebedor: document.getElementById('documento-recebedor').value.toUpperCase()
            };
            
            try {
                const docRef = doc(this.db, 'encomendas', id);
                await updateDoc(docRef, dadosBaixa);
                this.encomendas[index] = { ...this.encomendas[index], ...dadosBaixa };
                this.renderAll();
                this.closeModal('modal-baixa');
                this.showToast('Baixa realizada com sucesso!');
            } catch (error) {
                console.error("Erro ao dar baixa:", error);
                this.showToast('Erro ao dar baixa na encomenda.', 'error');
            }
        }
    }

    async excluirEncomenda() {
        const id = this.currentActionId;
        try {
            const docRef = doc(this.db, 'encomendas', id);
            await deleteDoc(docRef);
            this.encomendas = this.encomendas.filter(e => e.id !== id);
            this.currentPage = 1;
            this.renderAll();
            this.closeModal('modal-confirm');
            this.showToast('Encomenda excluída com sucesso!', 'error');
        } catch (error) {
            console.error("Erro ao excluir:", error);
            this.showToast('Erro ao excluir encomenda.', 'error');
        }
    }
    
    abrirModalEdicao(id) {
        const encomenda = this.encomendas.find(e => e.id === id);
        if (encomenda) {
            const form = document.getElementById('form-editar');
            form.querySelector('#edit-id').value = encomenda.id;
            form.querySelector('#edit-destinatario').value = encomenda.destinatario;
            form.querySelector('#edit-remetente').value = encomenda.remetente;
            form.querySelector('#edit-tipo').value = encomenda.tipo;
            form.querySelector('#edit-codigo').value = encomenda.codigo;
            form.querySelector('#edit-observacoes').value = encomenda.observacoes;
            this.openModal('modal-editar');
        }
    }

    darBaixa(id) {
        this.currentActionId = id;
        this.openModal('modal-baixa');
    }

    confirmarExclusao(id) {
        this.currentActionId = id;
        this.openModal('modal-confirm');
    }
    
    mostrarInfoEntrega(id) {
        const encomenda = this.encomendas.find(e => e.id === id);
        if (encomenda?.status === 'entregue') {
            document.getElementById('info-details').innerHTML = `
                <div class="info-item"><span class="info-label">Data:</span><span class="info-value">${encomenda.dataEntrega}</span></div>
                <div class="info-item"><span class="info-label">Hora:</span><span class="info-value">${encomenda.horaEntrega}</span></div>
                <div class="info-item"><span class="info-label">Recebedor:</span><span class="info-value">${encomenda.nomeRecebedor}</span></div>
                <div class="info-item"><span class="info-label">Documento:</span><span class="info-value">${encomenda.documentoRecebedor}</span></div>`;
            this.openModal('modal-info');
        }
    }

    ordenarEncomendas() {
        this.encomendas.sort((a, b) => {
            let valA = a[this.sortColumn], valB = b[this.sortColumn];
            if (this.sortColumn !== 'id' && typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }
            if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        document.querySelectorAll('.table th.sortable').forEach(th => {
            th.classList.remove('asc', 'desc');
            if (th.dataset.sort === this.sortColumn) th.classList.add(this.sortDirection);
        });
    }

    renderEncomendas(searchTerm = '') {
        const searchLower = searchTerm.toLowerCase();
        const filtered = this.encomendas.filter(e => {
            const destinatarioMatch = e.destinatario && e.destinatario.toLowerCase().includes(searchLower);
            const remetenteMatch = e.remetente && e.remetente.toLowerCase().includes(searchLower);
            const codigoMatch = e.codigo && e.codigo.toLowerCase().includes(searchLower);
            return destinatarioMatch || remetenteMatch || codigoMatch;
        });
        
        const paginated = filtered.slice((this.currentPage - 1) * this.rowsPerPage, this.currentPage * this.rowsPerPage);
        
        document.getElementById('encomendas-table').innerHTML = paginated.map(encomenda => `
            <tr>
                <td>${encomenda.id.substring(0, 6)}...</td>
                <td>${encomenda.destinatario || 'N/A'}</td>
                <td>${encomenda.remetente || 'N/A'}</td>
                <td>${encomenda.codigo || 'N/A'}</td>
                <td>${encomenda.tipo || 'N/A'}</td>
                <td>${encomenda.dataCadastro || 'N/A'}</td>
                <td><span class="status-badge status-${encomenda.status}">${encomenda.status}</span></td>
                <td class="actions">
                    ${encomenda.status === 'pendente' ? `
                        <button class="btn btn-success" onclick="app.darBaixa('${encomenda.id}')" title="Dar Baixa"><span class="material-symbols-outlined">task_alt</span></button>
                        <button class="btn" style="background:#ffc107; color:white;" onclick="app.abrirModalEdicao('${encomenda.id}')" title="Editar"><span class="material-symbols-outlined">edit</span></button>
                    ` : `<button class="btn" style="background:#17a2b8; color:white;" onclick="app.mostrarInfoEntrega('${encomenda.id}')" title="Ver Info"><span class="material-symbols-outlined">info</span></button>`}
                    <button class="btn btn-danger" onclick="app.confirmarExclusao('${encomenda.id}')" title="Excluir"><span class="material-symbols-outlined">delete</span></button>
                </td>
            </tr>`).join('');
            
        this.renderPaginationControls(filtered.length);
    }

    renderPaginationControls(totalItems) {
        const container = document.getElementById('pagination-controls');
        const totalPages = Math.ceil(totalItems / this.rowsPerPage);
        if (totalPages <= 1) { container.innerHTML = ''; return; }
        container.innerHTML = `
            <span>Página ${this.currentPage} de ${totalPages}</span>
            <button id="prev-page" ${this.currentPage === 1 ? 'disabled' : ''}>Anterior</button>
            <button id="next-page" ${this.currentPage === totalPages ? 'disabled' : ''}>Próximo</button>`;
        container.querySelector('#prev-page').addEventListener('click', () => { this.currentPage--; this.renderEncomendas(document.getElementById('search-input').value); });
        container.querySelector('#next-page').addEventListener('click', () => { this.currentPage++; this.renderEncomendas(document.getElementById('search-input').value); });
    }

    updateStats() {
        document.getElementById('total-encomendas').textContent = this.encomendas.length;
        document.getElementById('pendentes').textContent = this.encomendas.filter(e => e.status === 'pendente').length;
        document.getElementById('entregues').textContent = this.encomendas.filter(e => e.status === 'entregue').length;
    }

    openModal(modalId) { document.getElementById(modalId)?.classList.add('active'); }
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) {
            modal.classList.remove('active');
            modal.querySelectorAll('form').forEach(form => form.reset());
        }
    }
    
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span class="material-symbols-outlined">${type === 'success' ? 'check_circle' : 'error'}</span> ${message}`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }
    
    exportarParaPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text("Relatório de Encomendas", 14, 16);
        doc.autoTable({
            head: [['ID', 'Destinatário', 'Remetente', 'Cód. Rastreio', 'Data', 'Status']],
            body: this.encomendas.map(e => [e.id.substring(0, 10), e.destinatario, e.remetente, e.codigo, e.dataCadastro, e.status]),
            startY: 20, styles: { fontSize: 8 }, headStyles: { fillColor: [102, 126, 234] }
        });
        doc.save('relatorio-encomendas.pdf');
        this.showToast('Relatório PDF gerado com sucesso!');
    }
}
