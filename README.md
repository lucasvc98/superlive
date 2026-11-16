# Super Live com PH - Sorteio Exclusivo 🔥

Landing page de alta conversão para captura de leads e sorteio ao vivo, com layout escuro, efeitos de iluminação neon em laranja e design responsivo otimizado para celulares e desktops.

## 🚀 Tecnologias

- **HTML5** semântico e acessível
- **CSS3 Moderno**: Glassmorphism, variáveis CSS, sombras e iluminação neon, `clamp()` responsivo
- **JavaScript Puro**: Validação de campos, máscara de WhatsApp em tempo real, integração com Google Sheets e persistência local (`localStorage`)
- **Vercel**: Configuração otimizada para deploy estático imediato

## 📊 Integração com Google Sheets

Para salvar os inscritos automaticamente em uma planilha do Google Sheets:

1. Crie uma nova planilha no [Google Sheets](https://sheets.new).
2. Na Linha 1, crie as colunas: `Data/Hora | Nome | WhatsApp | E-mail`.
3. Acesse **Extensões > Apps Script** e cole o código do arquivo `google-sheets-script.js`.
4. Clique em **Implantar > Nova Implantação > App da Web**:
   - Executar como: `Eu`
   - Quem pode acessar: `Qualquer pessoa`
5. Copie a URL do Web App gerada e cole na linha 10 do arquivo `script.js` em `GOOGLE_SHEETS_URL`.

## 📦 Deploy na Vercel

### Opção 1: Via Vercel CLI
```bash
npx vercel
```

### Opção 2: Conectando com GitHub
1. Suba este repositório no seu GitHub.
2. Acesse [vercel.com](https://vercel.com) e clique em **Add New Project**.
3. Selecione este repositório e clique em **Deploy**.
