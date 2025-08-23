class EncomendaManager {
    constructor() {
        this.encomendas = this.loadEncomendas();
        this.currentId = this.getNextId();
        this.sortColumn = 'id';
        this.sortDirection = 'desc';
        this.currentPage = 1;
        this.rowsPerPage = 10;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderAll();
        this.initNavigation();
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

    cadastrarEncomenda() {
        const form = document.getElementById('form-encomenda');
        const encomenda = {
            id: this.currentId++,
            destinatario: form.destinatario.value,
            remetente: form.remetente.value,
            tipo: form.tipo.value,
            codigo: form.codigo.value || 'N/A',
            observacoes: form.observacoes.value,
            dataCadastro: new Date().toLocaleDateString('pt-BR'),
            status: 'pendente'
        };
        this.encomendas.push(encomenda);
        this.saveEncomendas();
        this.renderAll();
        this.closeModal('modal-cadastro');
        this.showToast('Encomenda cadastrada com sucesso!');
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

    salvarEdicao() {
        const form = document.getElementById('form-editar');
        const id = parseInt(form.querySelector('#edit-id').value);
        const encomenda = this.encomendas.find(e => e.id === id);
        if (encomenda) {
            encomenda.destinatario = form.querySelector('#edit-destinatario').value;
            encomenda.remetente = form.querySelector('#edit-remetente').value;
            encomenda.tipo = form.querySelector('#edit-tipo').value;
            encomenda.codigo = form.querySelector('#edit-codigo').value || 'N/A';
            encomenda.observacoes = form.querySelector('#edit-observacoes').value;
            this.saveEncomendas();
            this.renderAll();
            this.closeModal('modal-editar');
            this.showToast('Encomenda atualizada com sucesso!');
        }
    }

    darBaixa(id) {
        this.currentActionId = id;
        this.openModal('modal-baixa');
    }

    confirmarBaixa() {
        const encomenda = this.encomendas.find(e => e.id === this.currentActionId);
        if (encomenda) {
            const agora = new Date();
            encomenda.status = 'entregue';
            encomenda.dataEntrega = agora.toLocaleDateString('pt-BR');
            encomenda.horaEntrega = agora.toLocaleTimeString('pt-BR');
            encomenda.nomeRecebedor = document.getElementById('nome-recebedor').value;
            encomenda.documentoRecebedor = document.getElementById('documento-recebedor').value;
            this.saveEncomendas();
            this.renderAll();
            this.closeModal('modal-baixa');
            this.showToast('Baixa realizada com sucesso!');
        }
    }

    confirmarExclusao(id) {
        this.currentActionId = id;
        this.openModal('modal-confirm');
    }

    excluirEncomenda() {
        this.encomendas = this.encomendas.filter(e => e.id !== this.currentActionId);
        this.saveEncomendas();
        this.currentPage = 1;
        this.renderAll();
        this.closeModal('modal-confirm');
        this.showToast('Encomenda excluída com sucesso!', 'error');
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
            if (typeof valA === 'string') { valA = valA.toLowerCase(); valB = valB.toLowerCase(); }
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
        const filtered = this.encomendas.filter(e => 
            e.destinatario.toLowerCase().includes(searchLower) ||
            e.remetente.toLowerCase().includes(searchLower) ||
            (e.codigo && e.codigo.toLowerCase().includes(searchLower))
        );
        const paginated = filtered.slice((this.currentPage - 1) * this.rowsPerPage, this.currentPage * this.rowsPerPage);
        
        document.getElementById('encomendas-table').innerHTML = paginated.map(encomenda => `
            <tr>
                <td>${encomenda.id}</td>
                <td>${encomenda.destinatario}</td>
                <td>${encomenda.remetente}</td>
                <td>${encomenda.codigo}</td>
                <td>${encomenda.tipo}</td>
                <td>${encomenda.dataCadastro}</td>
                <td><span class="status-badge status-${encomenda.status}">${encomenda.status}</span></td>
                <td class="actions">
                    ${encomenda.status === 'pendente' ? `
                        <button class="btn btn-success" onclick="app.darBaixa(${encomenda.id})" title="Dar Baixa"><span class="material-symbols-outlined">task_alt</span></button>
                        <button class="btn" style="background:#ffc107; color:white;" onclick="app.abrirModalEdicao(${encomenda.id})" title="Editar"><span class="material-symbols-outlined">edit</span></button>
                    ` : `<button class="btn" style="background:#17a2b8; color:white;" onclick="app.mostrarInfoEntrega(${encomenda.id})" title="Ver Info"><span class="material-symbols-outlined">info</span></button>`}
                    <button class="btn btn-danger" onclick="app.confirmarExclusao(${encomenda.id})" title="Excluir"><span class="material-symbols-outlined">delete</span></button>
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

    getEncomendas() { return this.encomendas; }
    loadEncomendas() { return JSON.parse(localStorage.getItem('encomendas') || '[]'); }
    saveEncomendas() { localStorage.setItem('encomendas', JSON.stringify(this.encomendas)); }
    getNextId() { return this.encomendas.reduce((max, e) => Math.max(max, e.id), 0) + 1; }

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
            body: this.encomendas.map(e => [e.id, e.destinatario, e.remetente, e.codigo, e.dataCadastro, e.status]),
            startY: 20, styles: { fontSize: 8 }, headStyles: { fillColor: [102, 126, 234] }
        });
        doc.save('relatorio-encomendas.pdf');
        this.showToast('Relatório PDF gerado com sucesso!');
    }
}

const app = new EncomendaManager();
