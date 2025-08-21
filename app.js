// app.js - Sistema de Controle de Encomendas
class EncomendaManager {
    constructor() {
        this.encomendas = this.loadEncomendas();
        this.currentId = this.getNextId();
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderEncomendas();
        this.updateStats();
        this.initNavigation();
    }

    bindEvents() {
        // Formulário de cadastro
        document.getElementById('form-encomenda').addEventListener('submit', (e) => {
            e.preventDefault();
            this.cadastrarEncomenda();
        });

        // Busca
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.filterEncomendas(e.target.value);
        });

        // Modal events
        document.getElementById('btn-add-encomenda').addEventListener('click', () => {
            this.openModal();
        });

        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancel-form').addEventListener('click', () => {
            this.closeModal();
        });

        // Modal de baixa events
        document.getElementById('form-baixa').addEventListener('submit', (e) => {
            e.preventDefault();
            this.confirmarBaixa();
        });

        document.getElementById('close-modal-baixa').addEventListener('click', () => {
            this.closeBaixaModal();
        });

        document.getElementById('cancel-baixa').addEventListener('click', () => {
            this.closeBaixaModal();
        });

        // Modal de info events
        document.getElementById('close-modal-info').addEventListener('click', () => {
            this.closeInfoModal();
        });

        document.getElementById('close-info').addEventListener('click', () => {
            this.closeInfoModal();
        });

        // Modal de confirmação events
        document.getElementById('close-modal-confirm').addEventListener('click', () => {
            this.closeConfirmModal();
        });

        document.getElementById('cancel-delete').addEventListener('click', () => {
            this.closeConfirmModal();
        });

        document.getElementById('confirm-delete').addEventListener('click', () => {
            this.excluirEncomenda();
        });

        // Close modals when clicking outside
        document.getElementById('modal-cadastro').addEventListener('click', (e) => {
            if (e.target.id === 'modal-cadastro') {
                this.closeModal();
            }
        });

        document.getElementById('modal-baixa').addEventListener('click', (e) => {
            if (e.target.id === 'modal-baixa') {
                this.closeBaixaModal();
            }
        });

        document.getElementById('modal-info').addEventListener('click', (e) => {
            if (e.target.id === 'modal-info') {
                this.closeInfoModal();
            }
        });

        document.getElementById('modal-confirm').addEventListener('click', (e) => {
            if (e.target.id === 'modal-confirm') {
                this.closeConfirmModal();
            }
        });

        // Close modals with ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeBaixaModal();
                this.closeInfoModal();
                this.closeConfirmModal();
            }
        });
    }

    initNavigation() {
        const menuItems = document.querySelectorAll('.menu-item');
        const pages = document.querySelectorAll('.page');

        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all items
                menuItems.forEach(mi => mi.classList.remove('active'));
                pages.forEach(page => page.classList.remove('active'));
                
                // Add active class to clicked item
                item.classList.add('active');
                
                // Show corresponding page
                const targetPage = item.getAttribute('data-page');
                document.getElementById(targetPage).classList.add('active');
            });
        });
    }

    cadastrarEncomenda() {
        const form = document.getElementById('form-encomenda');
        const formData = new FormData(form);
        
        const encomenda = {
            id: this.currentId++,
            destinatario: formData.get('destinatario'),
            remetente: formData.get('remetente'),
            endereco: formData.get('endereco'),
            tipo: formData.get('tipo'),
            codigo: formData.get('codigo'),
            observacoes: formData.get('observacoes'),
            dataCadastro: new Date().toLocaleDateString('pt-BR'),
            status: 'pendente'
        };

        this.encomendas.push(encomenda);
        this.saveEncomendas();
        this.renderEncomendas();
        this.updateStats();
        
        form.reset();
        this.closeModal();
        alert('Encomenda cadastrada com sucesso!');
    }

    darBaixa(id) {
        this.currentBaixaId = id;
        this.openBaixaModal();
    }

    confirmarBaixa() {
        const form = document.getElementById('form-baixa');
        const formData = new FormData(form);
        const id = this.currentBaixaId;
        
        const encomenda = this.encomendas.find(e => e.id === id);
        if (encomenda) {
            const agora = new Date();
            encomenda.status = 'entregue';
            encomenda.dataEntrega = agora.toLocaleDateString('pt-BR');
            encomenda.horaEntrega = agora.toLocaleTimeString('pt-BR');
            encomenda.nomeRecebedor = formData.get('nome-recebedor');
            encomenda.documentoRecebedor = formData.get('documento-recebedor');
            
            this.saveEncomendas();
            this.renderEncomendas();
            this.updateStats();
            this.closeBaixaModal();
            alert(`Baixa realizada com sucesso!\nRecebedor: ${encomenda.nomeRecebedor}\nData/Hora: ${encomenda.dataEntrega} às ${encomenda.horaEntrega}`);
        }
    }

    excluirEncomenda() {
        const id = this.currentDeleteId;
        this.encomendas = this.encomendas.filter(e => e.id !== id);
        this.saveEncomendas();
        this.renderEncomendas();
        this.updateStats();
        this.closeConfirmModal();
        alert('Encomenda excluída com sucesso!');
    }

    confirmarExclusao(id) {
        this.currentDeleteId = id;
        this.openConfirmModal();
    }

    mostrarInfoEntrega(id) {
        const encomenda = this.encomendas.find(e => e.id === id);
        if (encomenda && encomenda.status === 'entregue') {
            const infoDetails = document.getElementById('info-details');
            infoDetails.innerHTML = `
                <div class="info-item">
                    <span class="material-symbols-outlined" style="color: #666; margin-right: 0.5rem;">event</span>
                    <span class="info-label">Data:</span>
                    <span class="info-value">${encomenda.dataEntrega}</span>
                </div>
                <div class="info-item">
                    <span class="material-symbols-outlined" style="color: #666; margin-right: 0.5rem;">schedule</span>
                    <span class="info-label">Hora:</span>
                    <span class="info-value">${encomenda.horaEntrega}</span>
                </div>
                <div class="info-item">
                    <span class="material-symbols-outlined" style="color: #666; margin-right: 0.5rem;">person</span>
                    <span class="info-label">Recebedor:</span>
                    <span class="info-value">${encomenda.nomeRecebedor}</span>
                </div>
                <div class="info-item">
                    <span class="material-symbols-outlined" style="color: #666; margin-right: 0.5rem;">badge</span>
                    <span class="info-label">Documento:</span>
                    <span class="info-value">${encomenda.documentoRecebedor}</span>
                </div>
            `;
            this.openInfoModal();
        }
    }

    renderEncomendas(filteredEncomendas = null) {
        const tbody = document.getElementById('encomendas-table');
        const encomendas = filteredEncomendas || this.encomendas;
        
        tbody.innerHTML = '';
        
        encomendas.forEach(encomenda => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${encomenda.id}</td>
                <td>${encomenda.destinatario}</td>
                <td>${encomenda.remetente}</td>
                <td>${encomenda.tipo}</td>
                <td>${encomenda.dataCadastro}</td>
                <td>
                    <span class="status-badge status-${encomenda.status}">
                        <span class="material-symbols-outlined">${encomenda.status === 'pendente' ? 'schedule' : 'check_circle'}</span>
                        ${encomenda.status === 'pendente' ? 'Pendente' : 'Entregue'}
                    </span>
                </td>
                <td>
                    ${encomenda.status === 'pendente' ? 
                        `<button class="btn btn-success" onclick="app.darBaixa(${encomenda.id})" style="margin-right: 0.5rem; padding: 0.5rem 1rem; font-size: 0.875rem;">
                            <span class="material-symbols-outlined">task_alt</span>
                            Dar Baixa
                        </button>` : 
                        `<button class="btn-info" onclick="app.mostrarInfoEntrega(${encomenda.id})" title="Ver informações da entrega">
                            <span class="material-symbols-outlined">info</span>
                        </button>`
                    }
                    <button class="btn btn-danger" onclick="app.confirmarExclusao(${encomenda.id})" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                        <span class="material-symbols-outlined">delete</span>
                        Excluir
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    filterEncomendas(searchTerm) {
        if (!searchTerm) {
            this.renderEncomendas();
            return;
        }

        const filtered = this.encomendas.filter(encomenda => 
            encomenda.destinatario.toLowerCase().includes(searchTerm.toLowerCase()) ||
            encomenda.remetente.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (encomenda.codigo && encomenda.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        this.renderEncomendas(filtered);
    }

    updateStats() {
        const total = this.encomendas.length;
        const pendentes = this.encomendas.filter(e => e.status === 'pendente').length;
        const entregues = this.encomendas.filter(e => e.status === 'entregue').length;

        document.getElementById('total-encomendas').textContent = total;
        document.getElementById('pendentes').textContent = pendentes;
        document.getElementById('entregues').textContent = entregues;
    }

    loadEncomendas() {
        const saved = JSON.parse(sessionStorage.getItem('encomendas') || '[]');
        return saved;
    }

    saveEncomendas() {
        sessionStorage.setItem('encomendas', JSON.stringify(this.encomendas));
    }

    getNextId() {
        const maxId = this.encomendas.reduce((max, e) => Math.max(max, e.id), 0);
        return maxId + 1;
    }

    openModal() {
        document.getElementById('modal-cadastro').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('modal-cadastro').classList.remove('active');
        document.body.style.overflow = 'auto';
        document.getElementById('form-encomenda').reset();
    }

    openBaixaModal() {
        document.getElementById('modal-baixa').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeBaixaModal() {
        document.getElementById('modal-baixa').classList.remove('active');
        document.body.style.overflow = 'auto';
        document.getElementById('form-baixa').reset();
    }

    openInfoModal() {
        document.getElementById('modal-info').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeInfoModal() {
        document.getElementById('modal-info').classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    openConfirmModal() {
        document.getElementById('modal-confirm').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeConfirmModal() {
        document.getElementById('modal-confirm').classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Inicializar aplicação
const app = new EncomendaManager();
