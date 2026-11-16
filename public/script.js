/**
 * SUPER LIVE COM PH - SORTEIO EXCLUSIVO
 * Form functionality, input masks, validation, and leads management
 */

// =========================================================================
// CONFIGURAÇÃO DO GOOGLE SHEETS
// Cole aqui a URL gerada na implantação do Google Apps Script (Web App).
// Exemplo: 'https://script.google.com/macros/s/AKfycb.../exec'
// Se deixar vazio, os dados serão salvos localmente e visualizados no botão inferior.
// =========================================================================
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbw8GLSTaVGt-0kGGMQy5OADlPBsXrm_flRiCiBuWe2FtHKu-QFlzBXFW2idX5TT378D4A/exec';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('leadForm');
  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  const emailInput = document.getElementById('email');
  const submitBtn = document.getElementById('submitBtn');

  // Modals
  const successModal = document.getElementById('successModal');
  const closeSuccessBtn = document.getElementById('closeSuccessBtn');
  const leadsModal = document.getElementById('leadsModal');
  const openLeadsBtn = document.getElementById('openLeadsBtn');
  const closeLeadsBtn = document.getElementById('closeLeadsBtn');
  const leadsCounter = document.getElementById('leadsCounter');
  const totalLeadsCount = document.getElementById('totalLeadsCount');
  const leadsTableBody = document.getElementById('leadsTableBody');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const clearLeadsBtn = document.getElementById('clearLeadsBtn');

  // Success modal elements
  const successName = document.getElementById('successName');
  const successPhone = document.getElementById('successPhone');
  const successEmail = document.getElementById('successEmail');

  const STORAGE_KEY = 'super_live_ph_leads';

  // ==========================================
  // Helper: Leads Storage
  // ==========================================
  function getLeads() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error reading localStorage:', e);
      return [];
    }
  }

  function saveLead(lead) {
    const leads = getLeads();
    leads.unshift(lead);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    } catch (e) {
      console.error('Error writing to localStorage:', e);
    }
    updateLeadsCount();
  }

  function updateLeadsCount() {
    const leads = getLeads();
    if (leadsCounter) leadsCounter.textContent = leads.length;
    if (totalLeadsCount) totalLeadsCount.textContent = leads.length;
  }

  // ==========================================
  // Phone Mask (Brazilian Mobile/Landline)
  // ==========================================
  function formatPhone(value) {
    if (!value) return '';
    // Strip non-digits
    const digits = value.replace(/\D/g, '').slice(0, 11);
    
    if (digits.length === 0) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    // 11 digits: (XX) XXXXX-XXXX
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }

  phoneInput.addEventListener('input', (e) => {
    const start = phoneInput.selectionStart;
    const oldLength = phoneInput.value.length;
    phoneInput.value = formatPhone(phoneInput.value);
    const newLength = phoneInput.value.length;

    // Adjust cursor position
    if (start && start < oldLength) {
      phoneInput.setSelectionRange(start + (newLength - oldLength), start + (newLength - oldLength));
    }
    clearError('phone');
  });

  nameInput.addEventListener('input', () => clearError('name'));
  emailInput.addEventListener('input', () => clearError('email'));

  // ==========================================
  // Validation
  // ==========================================
  function setError(fieldId, message) {
    const group = document.getElementById(`group-${fieldId}`);
    const errorEl = document.getElementById(`error-${fieldId}`);
    if (group && errorEl) {
      group.classList.add('has-error');
      errorEl.textContent = message;
    }
  }

  function clearError(fieldId) {
    const group = document.getElementById(`group-${fieldId}`);
    const errorEl = document.getElementById(`error-${fieldId}`);
    if (group && errorEl) {
      group.classList.remove('has-error');
      errorEl.textContent = '';
    }
  }

  function validateForm() {
    let isValid = true;

    // Name Validation
    const nameVal = nameInput.value.trim();
    if (!nameVal) {
      setError('name', 'Por favor, informe seu nome completo.');
      isValid = false;
    } else if (nameVal.length < 3) {
      setError('name', 'Digite um nome válido com no mínimo 3 caracteres.');
      isValid = false;
    } else {
      clearError('name');
    }

    // Phone Validation
    const digits = phoneInput.value.replace(/\D/g, '');
    if (!digits) {
      setError('phone', 'Por favor, informe seu WhatsApp.');
      isValid = false;
    } else if (digits.length < 10) {
      setError('phone', 'Número de WhatsApp incompleto com DDD.');
      isValid = false;
    } else {
      clearError('phone');
    }

    // Email Validation
    const emailVal = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailVal) {
      setError('email', 'Por favor, informe seu e-mail.');
      isValid = false;
    } else if (!emailRegex.test(emailVal)) {
      setError('email', 'Digite um endereço de e-mail válido.');
      isValid = false;
    } else {
      clearError('email');
    }

    return isValid;
  }

  // ==========================================
  // Form Submit Handler
  // ==========================================
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Focus first error field
      const firstError = form.querySelector('.has-error input');
      if (firstError) firstError.focus();
      return;
    }

    // Set loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    const leadData = {
      id: 'lead_' + Date.now(),
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      email: emailInput.value.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Enviar para Google Sheets (se a URL foi configurada)
      if (GOOGLE_SHEETS_URL && GOOGLE_SHEETS_URL.trim() !== '') {
        try {
          await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors', // Evita restrições de CORS do Google no navegador
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              date: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
              name: leadData.name,
              phone: leadData.phone,
              email: leadData.email
            })
          });
          console.info('Lead enviado para o Google Sheets com sucesso!');
        } catch (sheetErr) {
          console.warn('Aviso ao enviar para o Google Sheets:', sheetErr);
        }
      }

      // 2. Enviar para API local / backend (se disponível)
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      }).catch(err => {
        // Fallback silencioso para hospedagens estáticas (como Vercel)
        console.info('Servidor local offline ou hospedagem estática:', err);
      });

      // Save lead locally
      saveLead(leadData);

      // Populate & open success modal
      if (successName) successName.textContent = leadData.name.split(' ')[0] || leadData.name;
      if (successPhone) successPhone.textContent = leadData.phone;
      if (successEmail) successEmail.textContent = leadData.email;
      openModal(successModal);

      // Reset form
      form.reset();

    } catch (err) {
      console.error('Submission error:', err);
      alert('Houve um erro ao processar sua inscrição. Tente novamente.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  });

  // ==========================================
  // Modal Utilities
  // ==========================================
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Success Modal events
  closeSuccessBtn.addEventListener('click', () => closeModal(successModal));
  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) closeModal(successModal);
  });

  // Leads Modal events (admin shortcut: Shift + L)
  if (openLeadsBtn) {
    openLeadsBtn.addEventListener('click', () => {
      renderLeadsTable();
      openModal(leadsModal);
    });
  }
  if (closeLeadsBtn) closeLeadsBtn.addEventListener('click', () => closeModal(leadsModal));
  if (leadsModal) {
    leadsModal.addEventListener('click', (e) => {
      if (e.target === leadsModal) closeModal(leadsModal);
    });
  }

  // Keyboard escape & admin shortcut (Shift + L)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(successModal);
      closeModal(leadsModal);
    }
    if (e.shiftKey && (e.key === 'L' || e.key === 'l')) {
      renderLeadsTable();
      openModal(leadsModal);
    }
  });

  // ==========================================
  // Social Proof Toast Popups (Interval: 15s)
  // ==========================================
  const toast = document.getElementById('socialProofToast');
  const toastMessage = document.getElementById('toastMessage');
  const toastTime = document.getElementById('toastTime');
  const toastCloseBtn = document.getElementById('toastCloseBtn');

  const numbersList = [7, 13, 9, 14, 8, 16, 11, 15, 12, 18, 6, 21];
  const templates = [
    '<strong>{N} pessoas</strong> acabaram de concluir sua participação!',
    '<strong>{N} pessoas</strong> acabam de concluir sua participação!',
    '<strong>{N} traders</strong> acabaram de garantir vaga no sorteio!',
    '<strong>{N} pessoas</strong> acabaram de se cadastrar para a Superlive!'
  ];
  const timesList = ['agora mesmo', 'há 12 segundos', 'há 28 segundos', 'há 45 segundos'];

  let lastNumber = null;
  let toastHideTimer = null;

  function getRandomItem(arr, exclude) {
    let item;
    do {
      item = arr[Math.floor(Math.random() * arr.length)];
    } while (item === exclude && arr.length > 1);
    return item;
  }

  function showSocialProof() {
    if (!toast || !toastMessage) return;

    const num = getRandomItem(numbersList, lastNumber);
    lastNumber = num;

    const template = getRandomItem(templates);
    const timeText = getRandomItem(timesList);

    toastMessage.innerHTML = template.replace('{N}', num);
    if (toastTime) toastTime.textContent = timeText;

    toast.classList.add('is-visible');

    // Fica visível por 5 segundos
    if (toastHideTimer) clearTimeout(toastHideTimer);
    toastHideTimer = setTimeout(() => {
      hideSocialProof();
    }, 5000);
  }

  function hideSocialProof() {
    if (toast) toast.classList.remove('is-visible');
  }

  if (toastCloseBtn) {
    toastCloseBtn.addEventListener('click', hideSocialProof);
  }

  // Primeiro popup aos 3 segundos, e depois exatamente a cada 15 segundos
  setTimeout(() => {
    showSocialProof();
    setInterval(() => {
      showSocialProof();
    }, 15000);
  }, 3000);

  // ==========================================
  // Leads Management Table & Export
  // ==========================================
  function renderLeadsTable() {
    const leads = getLeads();
    updateLeadsCount();

    if (leads.length === 0) {
      leadsTableBody.innerHTML = `
        <tr>
          <td colspan="4" class="no-leads">Nenhum lead cadastrado ainda.</td>
        </tr>
      `;
      return;
    }

    leadsTableBody.innerHTML = leads.map(lead => {
      const date = new Date(lead.createdAt);
      const formattedDate = date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return `
        <tr>
          <td>${formattedDate}</td>
          <td><strong>${escapeHtml(lead.name)}</strong></td>
          <td>${escapeHtml(lead.phone)}</td>
          <td>${escapeHtml(lead.email)}</td>
        </tr>
      `;
    }).join('');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Export to CSV
  exportCsvBtn.addEventListener('click', () => {
    const leads = getLeads();
    if (leads.length === 0) {
      alert('Não há leads para exportar.');
      return;
    }

    const headers = ['Data', 'Nome', 'WhatsApp', 'Email'];
    const rows = leads.map(l => [
      new Date(l.createdAt).toLocaleString('pt-BR'),
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.email}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_super_live_ph_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Clear leads
  clearLeadsBtn.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja apagar todos os leads salvos?')) {
      localStorage.removeItem(STORAGE_KEY);
      renderLeadsTable();
      updateLeadsCount();
    }
  });

  // Initial count load
  updateLeadsCount();
});
