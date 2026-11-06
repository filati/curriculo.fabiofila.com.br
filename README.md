# Fábio Fila — Desenvolvedor Back-End / Full Stack

> +25 anos construindo sistemas escaláveis, APIs e integrações (REST, OAuth, ERPs), e-commerce e soluções corporativas — do levantamento de requisitos à entrega. Foco em qualidade e desenvolvimento potencializado por IA.

🌐 **Site:** [curriculo.fabiofila.com.br](https://curriculo.fabiofila.com.br) · 📄 [Baixar CV (PDF)](assets/Fabio_Fila_CV.pdf) · [English CV (PDF)](assets/Fabio_Fila_CV_EN.pdf)

📍 Cotia – SP, Brasil · 🗣️ Português (nativo) / Inglês (avançado)

---

## Sobre

Desenvolvedor Back-End com mais de 25 anos de experiência em desenvolvimento web e vivência full stack, atuando no ciclo completo de projetos: do levantamento de requisitos à entrega e manutenção. Experiência sólida em sistemas escaláveis, integrações com APIs, e-commerce, sistemas corporativos e soluções customizadas, com atenção à acessibilidade e à conformidade com a LGPD.

Recentemente incorporei **IA generativa (Claude Code)** ao fluxo de trabalho para acelerar desenvolvimento, refatorar código legado e depurar com mais eficiência — sempre com critério técnico e revisão criteriosa.

## Competências

| Área | Tecnologias |
|---|---|
| **Back-end** | PHP 8 (OOP), Laravel, Symfony, Zend Expressive, CodeIgniter, CakePHP, Node.js, Python, Filas & Jobs, RabbitMQ |
| **Front-end & UX** | JavaScript, TypeScript, Vue.js, jQuery, HTML5, CSS3, Bootstrap, UX, Acessibilidade |
| **Bancos & Cache** | MySQL, PostgreSQL, SQL Server (T-SQL), MongoDB, Redis |
| **DevOps & Cloud** | Docker, AWS, Cloudflare, CI/CD (GitHub Actions), Linux, Nginx, Apache, Git, Scrum |
| **Qualidade & Segurança** | PHPUnit, Pest, testes automatizados, OWASP, LGPD |
| **Integrações** | APIs REST, OAuth, Webhooks, Bling, SAP, Adobe, Gateways de pagamento |
| **IA no Dev** | Claude Code, refatoração, debugging, testes, code review |

## Experiência

| Período | Empresa | Cargo |
|---|---|---|
| Jul/2019 – Atual | **Hands On** | Analista Desenvolvedor Sênior |
| Ago/2018 – Jul/2019 | **Vector** | Analista Desenvolvedor Sênior |
| Jun/2016 – Ago/2018 | **Primecomm** | Gerente de TI / Desenvolvedor Sênior |
| Out/2015 – Jun/2016 | **Autônomo** | Desenvolvedor Freelancer |
| Dez/2012 – Out/2015 | **IPDV Online** | Analista Programador PHP Sênior |
| Jul/2009 – Dez/2012 | **Primecomm** | Analista Desenvolvedor PHP |
| Desde 1999 | Outras empresas | Analista Desenvolvedor Web |

## Projetos relevantes

- **[idplugger](https://idplugger.com.br/)** — Plataforma multi-cliente (multi-tenant) de promoções e sorteios para marcas como Bunge Alimentos, Óticas Carol e SERASA. *(CakePHP · Laravel API · Redis · Python)*
- **[EpicSport](https://epicsport.com.br/)** — Plataforma de vendas B2B com integração ao ERP Bling. *(Vue.js · Laravel · Bling)*
- **Total Express** — Sistema logístico de controle de encomendas, refatorado em Zend Expressive. *(Zend Expressive · PHP)*
- **Sanofi No Ponto** — Gestão de PDV e pesquisas offline com integração SAP e suporte mobile. *(SAP · Mobile · Offline)*
- **Clubes de Desconto** — E-commerce do zero com pagamentos (MOIP) e marketplace (Via Varejo). *(CodeIgniter · Node.js · MySQL)*
- **Portal Atento** — Portal corporativo de funcionários. *(Symfony · MySQL)*

## Clientes atendidos

Sanofi · McDonald's · SERASA · Bunge · Santander · Vivo · Óticas Carol · Whirlpool · Yoki · Ajinomoto · Kellogg's · Atento · Avon · Total Express · Pearson · Abril · Anfarmag

## Formação

**Ciência da Computação** — Centro Universitário Uninove (concluído em 2007)

## Contato

- 📧 [contato@fabiofila.com.br](mailto:contato@fabiofila.com.br)
- 📱 WhatsApp: [(11) 97358-8835](https://wa.me/5511973588835)
- 💼 [linkedin.com/in/fabio-f](https://www.linkedin.com/in/fabio-f-2588968/)
- 🐙 [github.com/filati](https://github.com/filati)

---

## Sobre este repositório

Site estático (HTML · CSS · JS) do currículo, sem dependências ou build.

```
index.html          # página única
assets/css/         # estilos
assets/js/          # interações (tema, i18n PT/EN, animações)
assets/logos/       # logos de clientes
devtools/           # /devtools: ferramentas para devs (gerador de CPF e CNPJ)
assets/Fabio_Fila_CV.pdf     # gerado a partir de pdf/cv.html
assets/Fabio_Fila_CV_EN.pdf  # gerado a partir de pdf/cv-en.html
assets/og-image.png  # imagem de compartilhamento (og:image)
pdf/                # fontes dos PDFs (PT e EN) e da og:image
```

Para visualizar localmente, basta abrir o `index.html` no navegador.

**Deploy:** automático no Cloudflare Workers (projeto `curriculo`) a cada push na `main`, via `npx wrangler deploy` com a config em `wrangler.jsonc`. Arquivos que não devem ser publicados ficam em `.assetsignore`.

Para regerar os PDFs após editar `pdf/cv.html` / `pdf/cv-en.html`:

```bash
google-chrome --headless=new --no-pdf-header-footer --print-to-pdf=assets/Fabio_Fila_CV.pdf "file://$PWD/pdf/cv.html"
google-chrome --headless=new --no-pdf-header-footer --print-to-pdf=assets/Fabio_Fila_CV_EN.pdf "file://$PWD/pdf/cv-en.html"
```

Para regerar a og:image após editar `pdf/og-image.html`:

```bash
google-chrome --headless=new --hide-scrollbars --window-size=1200,630 --screenshot=assets/og-image.png "file://$PWD/pdf/og-image.html"
```

<sub>Feito com HTML, CSS, JS — e um toque de Claude Code 🤖</sub>
