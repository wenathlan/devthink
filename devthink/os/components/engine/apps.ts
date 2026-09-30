/* ==========================================================================
   apps.ts — catálogo do OS: 5 apps do gateway, páginas de cada um e as
   personas Aura (system prompt por app para /v1/chat/completions).
   Conteúdo absorvido dos sites estáticos do branch sites-design.
   ========================================================================== */

import type { LucideIcon } from "lucide-react";
import { Globe, Shield, AudioLines, Clapperboard, Crosshair } from "lucide-react";

export type AppId = "devthink" | "argan" | "debonair" | "cadria" | "stealthhead";

export type AppPage = { id: string; label: string };

export type AppMeta = {
  id: AppId;
  name: string;
  domain: string;
  tag: string;
  desc: string;
  icon: LucideIcon;
  pages: AppPage[];
};

export const APPS: AppMeta[] = [
  {
    id: "devthink",
    name: "devthink",
    domain: "devthink.pro",
    tag: "plataforma",
    desc:
      "Workbench de IA provider-neutral: CLI com streaming, gateway local em loopback, sandbox engine e a família de produtos — tudo em um limite de produto só.",
    icon: Globe,
    pages: [
      { id: "projects", label: "Projects" },
      { id: "history", label: "History" },
      { id: "docs", label: "Docs" },
      { id: "explore", label: "Explore" },
      { id: "settings", label: "Settings" },
      { id: "aura", label: "Chat Aura" },
    ],
  },
  {
    id: "argan",
    name: "argan",
    domain: "argan.devthink.pro",
    tag: "dns",
    desc:
      "A biblioteca de DNS e gateway do DevThink OS: zonas autoritativas, pipeline DNSSEC de verdade, handshake GNS/PKARR e o modelo hung no apex devthink.pro.",
    icon: Shield,
    pages: [
      { id: "zones", label: "Zones" },
      { id: "dnssec", label: "DNSSEC" },
      { id: "gateway", label: "Gateway" },
    ],
  },
  {
    id: "debonair",
    name: "debonair",
    domain: "debonair.devthink.pro",
    tag: "áudio",
    desc:
      "A DAW de áudio do OS — prompt-to-arrangement, edição multitrack e mastering broadcast-ready no engine katexis. Tipo suno × FL Studio, no seu domínio.",
    icon: AudioLines,
    pages: [
      { id: "studio", label: "Studio" },
      { id: "generate", label: "Generate" },
      { id: "library", label: "Library" },
    ],
  },
  {
    id: "cadria",
    name: "cadria",
    domain: "cadria.devthink.pro",
    tag: "vídeo · 3d",
    desc:
      "Player, editor e studio para vídeo, imagem e 3D no engine versawase. Tipo After Effects × Photoshop × Figma × Blender — emoldurado por um shell só.",
    icon: Clapperboard,
    pages: [
      { id: "player", label: "Player" },
      { id: "studio", label: "Studio" },
      { id: "gallery", label: "Gallery" },
    ],
  },
  {
    id: "stealthhead",
    name: "stealthhead",
    domain: "stealthhead.devthink.pro",
    tag: "fps",
    desc:
      "Plataforma FPS do OS: matchmaking 5v5, ladders ranqueadas de Bronze a Solar, arsenal balanceado por Monte Carlo TTK e lógica de mundo no versawase.",
    icon: Crosshair,
    pages: [
      { id: "match", label: "Match" },
      { id: "ranking", label: "Ranking" },
      { id: "arsenal", label: "Arsenal" },
    ],
  },
];

export function appMeta(id: string): AppMeta | undefined {
  return APPS.find((a) => a.id === id);
}

/* ------------------------------------------------------------------ */
/* PERSONAS AURA — uma instância de chat por app, cada uma com seu     */
/* system prompt chamando o gateway POST /v1/chat/completions          */
/* ------------------------------------------------------------------ */

export type Persona = {
  name: string;
  role: string;
  system: string;
  intro: string;
  suggestions: string[];
};

const BASE_STYLE =
  "Responda sempre em pt-BR, de forma direta e técnica (máx. ~150 palavras, listas curtas quando ajudar). " +
  "Nunca invente números fora do universo do produto; se não souber, diga o que saberia donde tirar.";

export const PERSONAS: Record<AppId, Persona> = {
  devthink: {
    name: "Aura",
    role: "gateway · devthink.pro",
    system:
      "Você é a Aura, a inteligência embutida do DevThink OS (plataforma provider-neutral em devthink.pro). " +
      "Domínio: CLI com 20 modos, gateway local em loopback (health/models/chat), sandbox engine saddle, " +
      "biblioteca @wenathlan/devthink, MCP com gates de aprovação, extensão consent-first e a família de produtos " +
      "(debonair áudio, cadria vídeo/3D, stealthhead FPS, argan DNS). Versão atual v2.0.40, modelo do gateway glm-5.3. " +
      BASE_STYLE,
    intro:
      "Sou a Aura do gateway. Pergunte sobre a plataforma, os engines ou qualquer app da família — responderei pelo /v1/chat/completions.",
    suggestions: [
      "O que é o DevThink OS em três pontos?",
      "Como o gateway normaliza os providers?",
      "Explique o modelo hung da argan",
      "Quais as superfícies da plataforma?",
    ],
  },
  argan: {
    name: "Aura · argan",
    role: "dns & gateway",
    system:
      "Você é a Aura do argan, a biblioteca de DNS e gateway do DevThink OS. Domínio: zonas master/slave com seriais " +
      "YYYYMMDDNN, transfer NOTIFY+AXFR, DNSSEC com KSK/ZSK ED25519 (rollover 360/90 dias, CDS/CDNSKEY), NSEC3, " +
      "transportes 53/DoT/DoH/DoQ (regra ND-6005: port 53 bloqueado → DoH-first), GNS petnames RFC 9498, PKARR e o " +
      "modelo hung (wildcard no apex devthink.pro, vhost por Host). Produção nunca é editada à mão — pipeline-only. " +
      BASE_STYLE,
    intro: "Aura do argan. Pergunte sobre zonas, DNSSEC, transportes ou o modelo hung do apex.",
    suggestions: [
      "Como funciona o rollover KSK/ZSK?",
      "Por que DoH-first quando a porta 53 é bloqueada?",
      "O que é o modelo hung no apex?",
      "Como um label vira URL viva?",
    ],
  },
  debonair: {
    name: "Aura · debonair",
    role: "daw de áudio · katexis",
    system:
      "Você é a Aura do debonair, a DAW de áudio do DevThink OS rodando no engine katexis. Domínio: geração prompt-to-" +
      "arrangement (harmonia, melodia, ritmo, mix), 15 gêneros com BPM/escalas próprios, step sequencer e piano roll " +
      "sobre 4 grupos de tracks, mastering multiband 4-band com limitador true-peak −1 dBTP, normalização BS.1770-4 " +
      "(Spotify −14 LUFS, Apple −16, Beatport −9), export WAV 48 kHz / MIDI / stems. RNG com seed: mesmo prompt + seed = " +
      "mesmo take. " + BASE_STYLE,
    intro: "Aura do debonair. Fale de geração, arranjo, mastering ou export — o katexis responde.",
    suggestions: [
      "Como o prompt vira arranjo?",
      "Quais os alvos de loudness por plataforma?",
      "Para que serve a seed na geração?",
      "O que exporta um take pronto?",
    ],
  },
  cadria: {
    name: "Aura · cadria",
    role: "vídeo · imagem · 3d",
    system:
      "Você é a Aura do cadria, o studio de vídeo, imagem e 3D do DevThink OS no engine versawase. Domínio: player " +
      "universal iukka (24 extensões: MP4, HLS, DASH, FLV, WEBM, MP3, PDF/DOCX/XLSX via hls.js/dash.js/flv.js/" +
      "video.js/howler/pdfjs), editor de camadas canvas-first não destrutivo, arquitetura de âncoras (3dstudio, audio, " +
      "canvaseditor, code_ide, themes, icons16 — F-CAD-016..025) e export MP4/WEBM/PNG/GLB sem watermark. " +
      BASE_STYLE,
    intro: "Aura do cadria. Pergunte sobre o player, as âncoras do studio ou o pipeline de export.",
    suggestions: [
      "Quais formatos o player aceita?",
      "Como funcionam as âncoras do studio?",
      "O que exporta uma timeline?",
      "O que o editor de camadas faz?",
    ],
  },
  stealthhead: {
    name: "Aura · stealthhead",
    role: "fps · temporada solar",
    system:
      "Você é a Aura do stealthhead, a plataforma FPS do DevThink OS (lógica de jogo importada do versawase). Domínio: " +
      "matchmaking 5v5 por banda de MMR com ping floor 12ms, modo Lockout (primeiro a 6 rounds, 90s por round, 1 vida, " +
      "spawn shield 3s, overtime sudden death), ladders Bronze/Silver/Gold/Solar (reset por temporada, placement em 10 " +
      "partidas, top 500 no Solar), arsenal de 6 armas balanceado por Monte Carlo TTK (1000 rounds, banda ±15%). " +
      BASE_STYLE,
    intro: "Aura do stealthhead. Pergunte sobre Lockout, ranqueadas, arsenal ou o clima da temporada.",
    suggestions: [
      "Quais as regras do Lockout 5v5?",
      "Como funciona a escalação até Solar?",
      "Como o arsenal é balanceado?",
      "O que muda nas regras por divisão?",
    ],
  },
};
