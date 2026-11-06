// Metadados de SEO de cada ferramenta de /devtools/ (uma página por ferramenta, em PT e EN).
// `id` casa com `<article id="tool-<id>">` em scripts/src/tools.html e com `data-tool` no menu.
// `title` vira o <title> (+ " — Fábio Fila"); `about` é o parágrafo de apoio exibido abaixo da ferramenta.

export const tools = [
  {
    id: "cpf", slug: "gerador-cpf", group: "docs",
    pt: {
      name: "Gerador de CPF",
      title: "Gerador de CPF válido online",
      desc: "Gere CPFs válidos e aleatórios, com ou sem pontuação e por estado de emissão. Grátis, roda no navegador e serve para testes de software.",
      about: "Os CPFs gerados seguem o algoritmo oficial dos dois dígitos verificadores (módulo 11) e o nono dígito indica a região fiscal de emissão. São números fictícios, úteis para popular bancos de teste, validar formulários e automatizar testes — nunca para fins fraudulentos."
    },
    en: {
      name: "CPF generator",
      title: "Valid CPF generator online",
      desc: "Generate valid random Brazilian CPF numbers, formatted or not, by issuing state. Free, runs in your browser and meant for software testing.",
      about: "Generated CPFs follow the official two-check-digit algorithm (modulo 11) and the ninth digit encodes the issuing fiscal region. They are fictitious numbers, handy to seed test databases, validate forms and automate tests — never for fraudulent use."
    }
  },
  {
    id: "cnpj", slug: "gerador-cnpj", group: "docs",
    pt: {
      name: "Gerador de CNPJ",
      title: "Gerador de CNPJ válido (numérico e alfanumérico)",
      desc: "Gere CNPJs válidos e aleatórios, no formato numérico tradicional ou no novo CNPJ alfanumérico. Grátis, no navegador, para testes de software.",
      about: "O novo CNPJ alfanumérico, emitido desde julho de 2026, aceita letras e números nas 12 primeiras posições, mantendo os dois dígitos verificadores calculados por módulo 11 (cada caractere vale o código ASCII menos 48). Este gerador cobre os dois formatos para você testar seus sistemas."
    },
    en: {
      name: "CNPJ generator",
      title: "Valid CNPJ generator (numeric and alphanumeric)",
      desc: "Generate valid random Brazilian CNPJ numbers, in the traditional numeric format or the new alphanumeric CNPJ. Free, in your browser, for software testing.",
      about: "The new alphanumeric CNPJ, issued since July 2026, accepts letters and digits in its first 12 positions, keeping the two modulo-11 check digits (each character is worth its ASCII code minus 48). This generator covers both formats so you can test your systems."
    }
  },
  {
    id: "validar", slug: "validador-cpf-cnpj", group: "docs",
    pt: {
      name: "Validador de CPF/CNPJ",
      title: "Validador de CPF e CNPJ online",
      desc: "Cole um CPF ou CNPJ (numérico ou alfanumérico) e confira na hora se os dígitos verificadores estão corretos. Grátis e sem enviar dados a servidor.",
      about: "A validação recalcula os dígitos verificadores e rejeita sequências repetidas (como 111.111.111-11), que passam no cálculo mas não são válidas. Funciona com CPF, CNPJ numérico e o novo CNPJ alfanumérico, com ou sem pontuação."
    },
    en: {
      name: "CPF/CNPJ validator",
      title: "CPF and CNPJ validator online",
      desc: "Paste a Brazilian CPF or CNPJ (numeric or alphanumeric) and instantly check that its check digits are correct. Free, nothing is sent to a server.",
      about: "Validation recomputes the check digits and rejects repeated sequences (such as 111.111.111-11), which pass the math but are not valid. It works with CPF, numeric CNPJ and the new alphanumeric CNPJ, formatted or not."
    }
  },
  {
    id: "uuid", slug: "gerador-uuid", group: "gen",
    pt: {
      name: "Gerador de UUID",
      title: "Gerador de UUID v4 e v7 online",
      desc: "Gere UUIDs v4 (aleatórios) e v7 (ordenados por tempo, ótimos para chaves primárias). Em lote, com ou sem hífens, direto no navegador.",
      about: "O UUID v4 é totalmente aleatório; o v7 começa com um timestamp em milissegundos, o que mantém os registros ordenados e reduz a fragmentação de índices em bancos de dados. Os valores usam a API criptográfica do navegador."
    },
    en: {
      name: "UUID generator",
      title: "UUID v4 and v7 generator online",
      desc: "Generate v4 (random) and v7 (time-ordered, great for primary keys) UUIDs. In bulk, with or without hyphens, right in your browser.",
      about: "UUID v4 is fully random; v7 starts with a millisecond timestamp, which keeps rows ordered and reduces index fragmentation in databases. Values come from the browser's cryptographic API."
    }
  },
  {
    id: "senha", slug: "gerador-senha", group: "gen",
    pt: {
      name: "Gerador de senhas",
      title: "Gerador de senhas seguras online",
      desc: "Crie senhas aleatórias e fortes escolhendo tamanho e tipos de caractere. Geradas com a API criptográfica do navegador, sem enviar nada a servidor.",
      about: "Senhas longas e aleatórias são a melhor defesa contra ataques de força bruta. A geração usa crypto.getRandomValues com sorteio sem viés, e nada sai do seu navegador. Use um gerenciador de senhas para guardá-las."
    },
    en: {
      name: "Password generator",
      title: "Secure password generator online",
      desc: "Create strong random passwords by choosing length and character types. Generated with the browser's cryptographic API, nothing is sent to a server.",
      about: "Long random passwords are the best defense against brute-force attacks. Generation uses crypto.getRandomValues with unbiased sampling, and nothing leaves your browser. Use a password manager to store them."
    }
  },
  {
    id: "json", slug: "formatador-json", group: "data",
    pt: {
      name: "Formatador de JSON",
      title: "Formatador e validador de JSON online",
      desc: "Valide, formate (beautify) e minifique JSON apontando onde está o erro. Ordena chaves, roda no navegador e não envia seus dados.",
      about: "Cole um JSON para validá-lo, indentá-lo com 2 ou 4 espaços ou tabs, ordenar as chaves alfabeticamente ou minificá-lo para reduzir o tamanho. Quando há erro de sintaxe, a mensagem indica a posição aproximada."
    },
    en: {
      name: "JSON formatter",
      title: "JSON formatter and validator online",
      desc: "Validate, beautify and minify JSON, pointing out where the error is. Sorts keys, runs in your browser and never uploads your data.",
      about: "Paste JSON to validate it, indent it with 2 or 4 spaces or tabs, sort keys alphabetically or minify it to shrink its size. On a syntax error, the message points to the approximate position."
    }
  },
  {
    id: "base64", slug: "base64-url", group: "data",
    pt: {
      name: "Base64 / URL",
      title: "Codificar e decodificar Base64 e URL online",
      desc: "Codifique e decodifique texto em Base64, Base64URL e URL (percent-encoding) com suporte a UTF-8 e acentos. Grátis e no navegador.",
      about: "Base64 representa bytes como texto ASCII; Base64URL troca + e / por - e _ para uso em URLs e JWTs; o percent-encoding escapa caracteres especiais em query strings. A conversão respeita UTF-8, então acentos e emojis funcionam."
    },
    en: {
      name: "Base64 / URL",
      title: "Base64 and URL encode / decode online",
      desc: "Encode and decode text as Base64, Base64URL and URL (percent-encoding) with UTF-8 support. Free and in your browser.",
      about: "Base64 represents bytes as ASCII text; Base64URL swaps + and / for - and _ for use in URLs and JWTs; percent-encoding escapes special characters in query strings. Conversion is UTF-8 aware, so accents and emojis work."
    }
  },
  {
    id: "regex", slug: "testador-regex", group: "data",
    pt: {
      name: "Testador de regex",
      title: "Testador de expressões regulares (regex) online",
      desc: "Teste expressões regulares JavaScript com destaque dos matches, grupos de captura e flags. Resultado em tempo real, direto no navegador.",
      about: "Digite o padrão e o texto de teste para ver cada correspondência destacada, com índices e grupos de captura (inclusive nomeados). Suporta as flags do JavaScript (g, i, m e outras)."
    },
    en: {
      name: "Regex tester",
      title: "Regular expression (regex) tester online",
      desc: "Test JavaScript regular expressions with highlighted matches, capture groups and flags. Live results, right in your browser.",
      about: "Type the pattern and test text to see every match highlighted, with indexes and capture groups (including named ones). Supports JavaScript flags (g, i, m and others)."
    }
  },
  {
    id: "jwt", slug: "decodificador-jwt", group: "debug",
    pt: {
      name: "Decodificador de JWT",
      title: "Decodificador de JWT online",
      desc: "Decodifique o header e o payload de um JSON Web Token e veja as datas de emissão e expiração. Tudo local: o token não sai do seu navegador.",
      about: "Um JWT tem três partes em Base64URL: header, payload e assinatura. Esta ferramenta lê as duas primeiras e converte exp, iat e nbf em datas legíveis. A assinatura não é verificada — nunca confie no conteúdo de um token sem validá-lo no servidor."
    },
    en: {
      name: "JWT decoder",
      title: "JWT decoder online",
      desc: "Decode the header and payload of a JSON Web Token and see issue and expiry dates. All local: the token never leaves your browser.",
      about: "A JWT has three Base64URL parts: header, payload and signature. This tool reads the first two and turns exp, iat and nbf into readable dates. The signature is not verified — never trust a token's contents without validating it on the server."
    }
  },
  {
    id: "hash", slug: "hash-md5-sha", group: "debug",
    pt: {
      name: "Hash MD5 / SHA",
      title: "Gerador de hash MD5, SHA-1, SHA-256 e SHA-512 online",
      desc: "Calcule MD5, SHA-1, SHA-256, SHA-384 e SHA-512 de qualquer texto (UTF-8). Grátis, instantâneo e sem enviar o texto a servidor.",
      about: "Funções de hash geram uma impressão digital de tamanho fixo para qualquer entrada, úteis em checksums e integridade. MD5 e SHA-1 estão quebrados para segurança: para senhas, use bcrypt ou Argon2 em vez de um hash simples."
    },
    en: {
      name: "MD5 / SHA hash",
      title: "MD5, SHA-1, SHA-256 and SHA-512 hash generator online",
      desc: "Compute MD5, SHA-1, SHA-256, SHA-384 and SHA-512 of any text (UTF-8). Free, instant and nothing is sent to a server.",
      about: "Hash functions produce a fixed-size fingerprint for any input, useful for checksums and integrity. MD5 and SHA-1 are broken for security: for passwords, use bcrypt or Argon2 instead of a plain hash."
    }
  },
  {
    id: "tempo", slug: "timestamp-unix", group: "debug",
    pt: {
      name: "Timestamp Unix",
      title: "Conversor de Timestamp Unix para data (e vice-versa)",
      desc: "Converta timestamp Unix (segundos ou milissegundos) em data legível e data em timestamp, com ISO 8601, UTC e horário local.",
      about: "O timestamp Unix conta os segundos desde 1º de janeiro de 1970 (UTC). APIs em JavaScript costumam usar milissegundos; a ferramenta detecta a unidade automaticamente e mostra a data em UTC, ISO 8601 e no seu fuso local."
    },
    en: {
      name: "Unix timestamp",
      title: "Unix timestamp to date converter (and back)",
      desc: "Convert Unix timestamps (seconds or milliseconds) to readable dates and dates back to timestamps, with ISO 8601, UTC and local time.",
      about: "A Unix timestamp counts the seconds since January 1, 1970 (UTC). JavaScript APIs often use milliseconds; the tool detects the unit automatically and shows the date in UTC, ISO 8601 and your local time zone."
    }
  }
];

export const groups = ["docs", "gen", "data", "debug"];
