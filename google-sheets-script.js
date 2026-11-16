/**
 * CÓDIGO PARA O GOOGLE APPS SCRIPT (GOOGLE PLANILHAS)
 * 
 * PASSO A PASSO PARA CONFIGURAR:
 * 1. Abra o Google Sheets (planilhas.google.com) e crie uma nova planilha.
 * 2. Na primeira linha (Linha 1), crie as colunas:
 *    A1: Data/Hora | B1: Nome | C1: WhatsApp | D1: E-mail
 * 3. No menu superior, clique em: Extensões > Apps Script.
 * 4. Apague todo o código que estiver lá e cole este código abaixo.
 * 5. Clique no ícone de Salvar (💾).
 * 6. Clique no botão azul "Implantar" (Deploy) > "Nova implantação" (New deployment).
 * 7. No ícone de engrenagem ⚙️ (Selecionar tipo), escolha: "App da Web" (Web app).
 * 8. Preencha as opções:
 *    - Descrição: Salvar Leads Sorteio
 *    - Executar como: "Eu" (seu e-mail)
 *    - Quem pode acessar: "Qualquer pessoa" (Anyone) -> [MUITO IMPORTANTE!]
 * 9. Clique em "Implantar" e autorize o acesso com sua conta Google.
 * 10. Copie o link do "App da Web" (termina com /exec) e cole na variável GOOGLE_SHEETS_URL no arquivo script.js!
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Linha a ser adicionada na planilha
    var row = [
      data.date || new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      data.name || '',
      data.phone || '',
      data.email || ''
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', row: row }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}
