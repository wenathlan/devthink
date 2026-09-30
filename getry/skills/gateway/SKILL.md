---
name: gateway
description: Publicar o gateway Getry e os clones deployáveis da família em qualquer sandbox, a partir do zip dos assets do release
---

# Skill do gateway

Esta skill publica o aplicativo gateway (Getry) e serve igual aos três clones deployáveis (vault, forge, foundry). O fluxo é determinístico: as mesmas etapas, na mesma ordem, em toda publicação.

## Modelos

| Modelo | Onde roda | Como nasce |
| --- | --- | --- |
| Getry (padrão) | dentro da sandbox da Z.AI | o zip do asset, já em formato Next com src |
| Getry Next bypass | fora da Z.AI (Vercel, Netlify, GitHub Pages, Caddy ou qualquer host) | a conversão Next do workflow sobre a pasta única do Getry — sem SDK de sandbox, sem captcha, sem sessão e sem chat ID, sem pasta dist, sem pasta public e sem as pastas que a plataforma costuma criar; não é app novo e não duplica pasta |

## Os quatro passos

1. Baixar o zip do asset — o release do repositório carrega as duas formas de cada site: o zip completo no padrão da casa e o zip Next. Para a sandbox da Z.AI, use o zip Next do gateway; para as demais plataformas, o mesmo zip Next serve, pois a conversão já deixa o projeto em src.
2. Descompactar o zip na raiz da sandbox — nenhuma pasta deve ficar aninhada: o package.json precisa ficar na raiz.
3. Fazer o push no DB — com o schema do Prisma em mãos, rode a migração (por exemplo, `bunx prisma db push`) e confirme as tabelas; os builds e os dados da pessoa ficam gravados nesse DB, e os backups sobem para os sites DBs e para o DB+sandbox.
4. Fazer o build do Next — instale as dependências travadas no lockfile e rode o build; o botão de publicar da plataforma finaliza com o nome escolhido pela pessoa.

## Regras do fluxo

- Nada é hardcodado: nenhum host, nenhuma credencial, nenhuma chave no código; toda configuração vem de variáveis de ambiente (arquivo .dev.vars no wrangler dev, e as variáveis do host no deploy).
- A pasta src é a única exceção aceita à raiz sem src, e ela existe porque o Next a exige; a árvore da casa (lógicas correlatas, pasta do tema com um CSS único, páginas com o quadruple de arquivos) continua valendo dentro dela.
- Cada sandbox publica do próprio jeito, e a comunicação entre os sites usa mime-types e HTTPS.
