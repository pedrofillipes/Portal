// ui/manager.js
import { cadastrarEncomenda, salvarEdicao, excluirEncomenda } from '../services/firestore.js';
import { login, logout } from '../services/auth.js';

export class UIManager {
    constructor(db, auth) {
        this.db = db;
        this.auth = auth;
        this.encomendas = [];
        this.currentActionId = null;
        this.sortColumn = 'dataCadastro';
        this.sortDirection = 'desc';
        this.currentPage = 1;
        this.rowsPerPage = 10;
        this.searchTerm = '';
        this.statusFilter = 'todos';
        this.dateFilter = '';

        this.cacheDOM();
        this.bindAuthEvents();
        this.bindAppEvents();
        this.initNavigation();
    }

    cacheDOM() {
        this.loginContainer = document.getElementById('login-container');
        this.mainContainer = document.querySelector('.container');
        this.btnLogout = document.getElementById('btn-logout');
        this.userEmailSpan = document.getElementById('user-email');
        this.tableBody = document.getElementById('encomendas-table');
        this.searchInput = document.getElementById('search-input');
        this.avatarButton = document.getElementById('avatar-button');
        this.userDropdown = document.getElementById('user-dropdown');
        this.statusFilterEl = document.getElementById('status-filter');
        this.dateFilterEl = document.getElementById('date-filter');
        this.clearDateBtn = document.getElementById('clear-date-filter');
        this.toggleFiltersBtn = document.getElementById('btn-toggle-filters');
        this.filterContainer = document.querySelector('.filter-container');
    }

    bindAuthEvents() {
        document.getElementById('form-login').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
            const errorMessage = document.getElementById('login-error-message');
            errorMessage.textContent = '';
            login(this.auth, email, senha).catch((error) => {
                errorMessage.textContent = 'Email ou senha inválidos.';
            });
        });
        this.btnLogout.addEventListener('click', () => logout(this.auth));
    }

    bindAppEvents() {
        document.getElementById('form-encomenda').addEventListener('submit', async e => {
            e.preventDefault();
            const form = e.target;
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
                await cadastrarEncomenda(this.db, novaEncomenda);
                this.closeModal('modal-cadastro');
                this.showToast('Encomenda cadastrada com sucesso!');
            } catch (error) { this.showToast('Erro ao cadastrar encomenda.', 'error'); }
        });

        document.getElementById('form-editar').addEventListener('submit', async e => {
            e.preventDefault();
            const form = e.target;
            const id = form.querySelector('#edit-id').value;
            const dadosAtualizados = {
                destinatario: form.querySelector('#edit-destinatario').value.toUpperCase(),
                remetente: form.querySelector('#edit-remetente').value.toUpperCase(),
                tipo: form.querySelector('#edit-tipo').value,
                codigo: form.querySelector('#edit-codigo').value.toUpperCase() || 'N/A',
                observacoes: form.querySelector('#edit-observacoes').value
            };
            try {
                await salvarEdicao(this.db, id, dadosAtualizados);
                this.closeModal('modal-editar');
                this.showToast('Encomenda atualizada com sucesso!');
            } catch (error) { this.showToast('Erro ao atualizar encomenda.', 'error'); }
        });

        document.getElementById('form-baixa').addEventListener('submit', async e => {
            e.preventDefault();
            const id = this.currentActionId;
            const agora = new Date();
            const dadosBaixa = {
                status: 'entregue',
                dataEntrega: agora.toLocaleDateString('pt-BR'),
                horaEntrega: agora.toLocaleTimeString('pt-BR'),
                nomeRecebedor: document.getElementById('nome-recebedor').value.toUpperCase(),
                documentoRecebedor: document.getElementById('documento-recebedor').value.toUpperCase()
            };
            try {
                await salvarEdicao(this.db, id, dadosBaixa);
                this.closeModal('modal-baixa');
                this.showToast('Baixa realizada com sucesso!');
            } catch (error) { this.showToast('Erro ao dar baixa na encomenda.', 'error'); }
        });

        document.getElementById('confirm-delete').addEventListener('click', async () => {
            try {
                await excluirEncomenda(this.db, this.currentActionId);
                this.closeModal('modal-confirm');
                this.showToast('Encomenda excluída com sucesso!', 'error');
            } catch (error) { this.showToast('Erro ao excluir encomenda.', 'error'); }
        });

        document.getElementById('confirm-pdf').addEventListener('click', () => {
            this.exportarParaPDF();
            this.closeModal('modal-confirm-pdf');
        });

        this.searchInput.addEventListener('input', e => {
            this.currentPage = 1;
            this.searchTerm = e.target.value;
            this.renderAll();
        });

        document.getElementById('btn-export-pdf').addEventListener('click', () => this.openModal('modal-confirm-pdf'));
        document.getElementById('btn-add-encomenda').addEventListener('click', () => this.openModal('modal-cadastro'));
        document.getElementById('btn-toggle-sidebar').addEventListener('click', () => this.mainContainer.classList.toggle('sidebar-collapsed'));

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

        this.avatarButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.userDropdown.classList.toggle('active');
            this.filterContainer.classList.remove('active');
        });

        this.toggleFiltersBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.filterContainer.classList.toggle('active');
            this.userDropdown.classList.remove('active');
        });
        
        this.filterContainer.addEventListener('click', (e) => e.stopPropagation());

        this.tableBody.addEventListener('click', e => {
            const kebabButton = e.target.closest('.btn-kebab');
            
            document.querySelectorAll('.actions-dropdown.active').forEach(dropdown => {
                if (!kebabButton || dropdown.dataset.dropdownId !== kebabButton.dataset.id) {
                    dropdown.classList.remove('active');
                }
            });

            if (kebabButton) {
                e.stopPropagation();
                const id = kebabButton.dataset.id;
                const dropdown = document.querySelector(`.actions-dropdown[data-dropdown-id="${id}"]`);
                if (dropdown) {
                    dropdown.classList.toggle('active');
                }
            }
        });

        window.addEventListener('click', () => {
            document.querySelectorAll('.dropdown-menu.active, .filter-container.active, .actions-dropdown.active').forEach(d => {
                d.classList.remove('active');
            });
        });

        this.statusFilterEl.addEventListener('change', (e) => {
            this.currentPage = 1;
            this.statusFilter = e.target.value;
            this.renderAll();
        });

        this.dateFilterEl.addEventListener('change', (e) => {
            this.currentPage = 1;
            this.dateFilter = e.target.value;
            this.renderAll();
        });

        this.clearDateBtn.addEventListener('click', () => {
            this.currentPage = 1;
            this.dateFilter = '';
            this.dateFilterEl.value = '';
            this.renderAll();
        });
    }

    mostrarLoginUI() {
        this.loginContainer.style.display = 'flex';
        this.mainContainer.classList.add('logged-out');
        this.btnLogout.classList.add('hidden');
        this.userEmailSpan.textContent = '';
    }

    mostrarAppUI(user) {
        this.loginContainer.style.display = 'none';
        this.mainContainer.classList.remove('logged-out');
        this.btnLogout.classList.remove('hidden');
        this.userEmailSpan.textContent = user.email;
    }

    atualizarTabela(encomendas) {
        this.encomendas = encomendas;
        this.renderAll();
    }

    renderAll() {
        this.ordenarEncomendas();
        this.renderEncomendas();
        this.updateStats();
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

     ordenarEncomendas() {
        // Helper function para converter data DD/MM/AAAA para um formato comparável (AAAAMMDD)
        const converterDataParaComparacao = (dataStr) => {
            if (!dataStr || typeof dataStr !== 'string' || !dataStr.includes('/')) {
                return '0'; // Retorna um valor padrão para dados inválidos
            }
            const [dia, mes, ano] = dataStr.split('/');
            return `${ano}${mes}${dia}`;
        };

        this.encomendas.sort((a, b) => {
            let valA, valB;

            // Se a coluna for 'dataCadastro', usa a lógica de conversão de data
            if (this.sortColumn === 'dataCadastro') {
                valA = converterDataParaComparacao(a.dataCadastro);
                valB = converterDataParaComparacao(b.dataCadastro);
            } else {
                // Mantém a lógica original para as outras colunas
                valA = a[this.sortColumn];
                valB = b[this.sortColumn];
                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();
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

    renderEncomendas() {
        const searchLower = this.searchTerm.toLowerCase();
        let filtered = this.encomendas.filter(e => 
            (e.destinatario && e.destinatario.toLowerCase().includes(searchLower)) ||
            (e.remetente && e.remetente.toLowerCase().includes(searchLower)) ||
            (e.codigo && e.codigo.toLowerCase().includes(searchLower))
        );

        if (this.statusFilter !== 'todos') {
            filtered = filtered.filter(e => e.status === this.statusFilter);
        }

        if (this.dateFilter) {
            filtered = filtered.filter(e => {
                if (!e.dataCadastro) return false;
                const [dia, mes, ano] = e.dataCadastro.split('/');
                const dataFormatada = `${ano}-${mes}-${dia}`;
                return dataFormatada === this.dateFilter;
            });
        }
        
        const paginated = filtered.slice((this.currentPage - 1) * this.rowsPerPage, this.currentPage * this.rowsPerPage);
        
        this.tableBody.innerHTML = paginated.map((encomenda, index) => {
            const numeroLinha = (this.currentPage - 1) * this.rowsPerPage + index + 1;
            const statusPendente = encomenda.status === 'pendente';
            
            const desktopActions = statusPendente ? `
                <button class="btn btn-success" onclick="ui.darBaixa('${encomenda.id}')" title="Dar Baixa"><span class="material-symbols-outlined">task_alt</span></button>
                <button class="btn" style="background:#ffc107; color:white;" onclick="ui.abrirModalEdicao('${encomenda.id}')" title="Editar"><span class="material-symbols-outlined">edit</span></button>
                <button class="btn btn-danger" onclick="ui.confirmarExclusao('${encomenda.id}')" title="Excluir"><span class="material-symbols-outlined">delete</span></button>
            ` : `
                <button class="btn" style="background:#17a2b8; color:white;" onclick="ui.mostrarInfoEntrega('${encomenda.id}')" title="Ver Info"><span class="material-symbols-outlined">info</span></button>
                <button class="btn btn-danger" onclick="ui.confirmarExclusao('${encomenda.id}')" title="Excluir"><span class="material-symbols-outlined">delete</span></button>
            `;

            const mobileActions = statusPendente ? `
                <button class="btn" onclick="ui.darBaixa('${encomenda.id}')"><span class="material-symbols-outlined">task_alt</span>Dar Baixa</button>
                <button class="btn" onclick="ui.abrirModalEdicao('${encomenda.id}')"><span class="material-symbols-outlined">edit</span>Editar</button>
            ` : `
                <button class="btn" onclick="ui.mostrarInfoEntrega('${encomenda.id}')"><span class="material-symbols-outlined">info</span>Ver Info</button>
            `;

            return `
                <tr>
                    <td>${numeroLinha}</td>
                    <td>${encomenda.destinatario || 'N/A'}</td>
                    <td>${encomenda.remetente || 'N/A'}</td>
                    <td>${encomenda.codigo || 'N/A'}</td>
                    <td>${encomenda.tipo || 'N/A'}</td>
                    <td>${encomenda.dataCadastro || 'N/A'}</td>
                    <td><span class="status-badge status-${encomenda.status}">${encomenda.status}</span></td>
                    <td class="actions">
                        <div class="desktop-actions">
                            ${desktopActions}
                        </div>
                        <div class="mobile-actions">
                            <button class="btn-kebab" data-id="${encomenda.id}">
                                <span class="material-symbols-outlined">more_vert</span>
                            </button>
                            <div class="actions-dropdown" data-dropdown-id="${encomenda.id}" onclick="event.stopPropagation()">
                                ${mobileActions}
                                <button class="btn danger" onclick="ui.confirmarExclusao('${encomenda.id}')"><span class="material-symbols-outlined">delete</span>Excluir</button>
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
            
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
        container.querySelector('#prev-page').addEventListener('click', () => { this.currentPage--; this.renderEncomendas(); });
        container.querySelector('#next-page').addEventListener('click', () => { this.currentPage++; this.renderEncomendas(); });
    }

    updateStats() {
        const total = this.encomendas.length;
        const pendentes = this.encomendas.filter(e => e.status === 'pendente').length;
        const entregues = total - pendentes;

        document.getElementById('total-encomendas').textContent = total;
        document.getElementById('pendentes').textContent = pendentes;
        document.getElementById('entregues').textContent = entregues;
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
                <div class="info-item"><span class="info-label">Data:</span><span class="info-value">${encomenda.dataEntrega || ''}</span></div>
                <div class="info-item"><span class="info-label">Hora:</span><span class="info-value">${encomenda.horaEntrega || ''}</span></div>
                <div class="info-item"><span class="info-label">Recebedor:</span><span class="info-value">${encomenda.nomeRecebedor || ''}</span></div>
                <div class="info-item"><span class="info-label">Documento:</span><span class="info-value">${encomenda.documentoRecebedor || ''}</span></div>`;
            this.openModal('modal-info');
        }
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
            head: [['#', 'Destinatário', 'Remetente', 'Cód. Rastreio', 'Data', 'Status']],
            body: this.encomendas.map((e, i) => [i + 1, e.destinatario, e.remetente, e.codigo, e.dataCadastro, e.status]),
            startY: 20, styles: { fontSize: 8 }, headStyles: { fillColor: [102, 126, 234] }
        });
        doc.save('relatorio-encomendas.pdf');
        this.showToast('Relatório PDF gerado com sucesso!');
    }
}

