# forge

clone deployável de só execução (a sandbox): roda qualquer binário com a engine Saddle e não guarda nada

Estrutura no padrão da árvore oficial: uma pasta só por aplicativo, raiz sem src, lógicas .ts soltas na raiz e a pasta do tema (Web/) com o design inteiro — uma página por pasta, e cada página com o seu quadruple (.tsx, .styles.ts, .types.ts, .test.tsx). O zip completo e a conversão Next (feita pelo workflow, sem duplicar pasta) viajam nos assets do release.
