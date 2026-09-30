import type { NextConfig } from 'next';

// a árvore da casa fica na raiz, sem src, sem public e sem dist: o build sai na raiz.
// o diretório app/ na raiz é o que o Next aceita fora de src; quando o host recusar a
// raiz personalizada, vale o Next padrão com src (a conversão do workflow).
const config: NextConfig = {
  distDir: 'build',
};

export default config;
