# Doutrina de design — shell Windows 11 replicável

Extraída de win11React, windows-11-os, win11web, daedalos, fluentacrylic, acrylicmica e trylle.
Vírgula separa contextos, barra agrupa o mesmo contexto, bullets com ·.

## Taskbar / dock
· Altura 48px, largura total, bottom 0, z-index 10000
· Background light rgba(243,243,243,0,85) / dark rgba(32,32,32,0,75)
· Acrylic backdrop-filter saturate(3) blur(20px)
· Botão de ícone 38x38px, margem 3px horizontal, radius 4px, fundo transparente
· Hover / ativo fundo var(--bg2) light rgba(255,255,255,0,67) / dark rgba(255,255,255,0,1)
· Indicador inferior 3px de altura radius 4px: fechado 0px, aberto 6px cinza #858585, ativo 12px accent
· Intro dos ícones: popintro 800ms ease-in-out, scale 0 → 1,125 (40%) → 0,725 (70%) → 1
· Relógio 11px duas linhas, padding 0 8px
· Alternativa tailwind: h-12 icons, botão h-10, hover bg-white/10 backdrop-blur-3xl
· daedalos: barra hsla(0,0%,10%,70%), blur 5px, painéis blur 12px, botão 36px, indicador 2px

## Start menu
· Largura 640px, altura min(100%−24px, 720px), bottom 12px
· Alinhamento center (margin auto) ou left 8px
· Radius 8px, overflow hidden, z-index 9999
· Background light rgba(242,242,242,0,9) / dark rgba(36,36,36,0,8)
· Acrylic blur(20px) sem saturate
· Entrada/saída: all 0,2s cubic-bezier(0,79, 0,14, 0,15, 0,86); oculto translateY(100px) + opacity 0 + pointer-events none
· Página pinned ↔ all apps: translateX(±640px), 300ms cubic-bezier(0, 0,58, 0,42, 1)
· Painéis laterais (quick settings, widget): 250ms cubic-bezier(0,62, 0, 32, 1), saída translateX(120%) / translateY(110%)
· Widget central 760px max-width 50vw, blur 20px, 300ms cubic-bezier(0,77, 0, 18, 1)
· Rodapé 64px, fundo rgba(0,0,0,0,033) light / rgba(0,0,0,0,15) dark, borda superior 1px #aaa / #444, padding 0 48px
· Tiles fixados 96x84px, recomendados 56px, lista all apps 42px, hover fundo var(--bg2), radius 4px
· Hover geral de linha rgba(136,136,136,0,24)

## Janela (chrome, drag, z-order, snap)
· Container floatTab radius 6px, transição all cubic-bezier(0,85, 0,14, 0,14, 0,85) 250ms
· Estados: maximizado radius 0, oculto scale(0,8) opacity 0, minimizado top 100%+10px scale(0,6) origin bottom opacity 0
· Sombra dpShad 0 0 6px rgba(0,0,0,0,25), alternativa 0 0 8px 2px rgba(0,0,0,0,25)
· Título (toolbar) 28px, radius 6px 6px 0 0, fundo #fefefe light / #181818 dark, ícone 14px + nome 0,64em
· Botões de ação altura total, padding 0 18px, hover rgba(136,136,136,0,2), fechar hover rgba(255,0,0,0,8) com ícone invertido, 60ms
· Drag no título: classe notrans + z-index 9900 durante o gesto, top/left por delta, commit no mouseup
· Resize: 8 handles de 8px deslocados −8px (bordas e cantos), vetores (−1,−1)…(1,1), mínimo 320x320
· daedalos: handles de borda 6px, canto 12px, offset −3px, mínimo 166x30
· Snap flyout: grid 3x2 de 260x130px, gap 8px, fundo #f9f9f9 / #222, snapper hover accent #0067c0 / #4cc2ff
· Z-order: contador hz, foco incrementa e atribui z, minimizar z=−1, fechar z=−1
· Cascata de abertura: offset 26px entre janelas (daedalos)
· Janela inativa (win11web): filter brightness(0,9) contrast(0,9), sombra base; ativa brightness(1) sombra dark-lg
· Abertura animada: initial opacity 0,33 scale 0,75, tween 0,2s circOut (framer motion)
· Borda de foco: outline 1px hsla(0,0%,25%,75%) ativa / 30% inativa (daedalos)
· Sombra daedalos: ativa 0 0 14px rgba(0,0,0,50%), inativa 0 0 10px rgba(0,0,0,45%)

## Mica / Acrylic
· Mica fake light: #f3f3f3 radial-gradient(#eff4f9 75%, #f3f3f3 100%) no-repeat fixed
· Mica fake dark: #202020 radial-gradient(#1a1f35 25%, #202020 100%) no-repeat fixed
· Acrylic camada 1: backdrop-filter blur(40px) + tinta rgba(252,252,252,0,658) light / rgba(24,24,24,0,658) dark
· Acrylic camada 2: textura de ruído em repeat (tile 128px), grayscale, opacity 0,035
· Acrylic caixa: radius 8px, borda 1px #e5e5e5 / #1a1a1a1a, sombra 0 25,6px 57,6px rgb(0 0 0/14%) + 0 0 16,4px rgb(0 0 0/12%)
· Mica de caixa: blur(40px), fundo #f7f9fcdb light / #232734db dark, mesma sombra
· Acrylic de shell (taskbar): saturate(3) blur(20px)
· Lock screen: blur 25px + véu rgba(0,0,0,0,1) no clique

## Cores (tokens)
· Texto light: primário #000, corpo #222, médio #3c3c3c, gray #555, sat #777
· Texto dark: primário #fff, corpo #ddd, médio #c3c3c3, gray #aaa, sat #999
· Componente comp-clr: #e6e6e6 light / #191919 dark
· Accent: #0067c0 light / #4cc2ff dark
· Base de fundo: #f3f3f3 light / #202020 dark, wintheme dark #1e1e26
· Seleção de input: fundo #0074ff, texto #fefefe; link #0080e1
· Explorer: hover rgba(0,178,255,0,16), foco rgba(0,183,255,0,25)
· daedalos dark: texto rgba(255,255,255,90%), título preto/1a/2b, fechar rgb(232,17,35)
· Seleção de arquivos: hsla(207,100%,45%,90%) sobre fundo 30% (daedalos)

## Tipografia e ícones
· Stack: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif
· Mono: source-code-pro, Menlo, Monaco, Consolas; terminal consolas 0,84em
· Escala: relógio 11px, nomes de app 12px, navegação 12,5px, títulos de janela 0,64–0,72em, título 12px (daedalos)
· Ícones de sistema: SVG inline 16–24px fill currentColor (paths estilo Fluent)
· Ícones de app: PNG/SVG via img, largura 12–16px no chrome
· Tema dark: filter invert(1) em ícones monocromáticos
· Press do ícone: scale(0,7) em 100ms

## Animações do shell
· Janela: 250ms cubic-bezier(0,85, 0,14, 0,14, 0,85)
· Start menu: 200ms cubic-bezier(0,79, 0,14, 0,15, 0,86)
· Painéis: 250ms cubic-bezier(0,62, 0, 32, 1)
· Widget: 300ms cubic-bezier(0,77, 0, 18, 1)
· Página interna: 300ms cubic-bezier(0, 0,58, 0,42, 1)
· Hovers: 60–100ms ease-in-out, ícones 400ms ease-in-out
· popintro: bounce de ícones 800ms (scale 0/1,125/0,725/1)
· popup do snap flyout: opacity 0→1 com pausa em 90% e scale 0,8→1
· fadein: opacity retida até 99% e salto a 100%; slowfadein com pausa em 25%
· Progress ring do boot: stroke 2px round, spin-infinite 2s linear infinite, dasharray 0,01/43,97 ↔ 21,99/21,99, rotação 0→1080°
· Entrada de conteúdo do lock: 400ms translateY(60px→0) + opacity

## Boot / lock screen
· Boot: fullscreen #010001, grid place-items center, logo 180px + anel 48px, blackout após 4s, boot automático em 5s
· Lock: wallpaper cover, splash com hora text-6xl font-semibold + data text-lg font-medium em cinza 100/200
· Clique: splash sobe translateY(−200px) 200ms, painel de entrada sobe (top 25%, avatar 200px, nome text-2xl)
· Botão sign in: fundo rgba(255,255,255,0,2), padding 4px 36px 6px, borda 2px transparente, hover borda rgba(255,255,255,0,33), ativo fundo 0,33
· Unlock: opacity 0 em 1s; status inferior (wifi, bateria) a 24px da borda

## Explorador de arquivos
· Estrutura: ribbon (topo), barra de endereço, sidebar 180px, grade de conteúdo, barra de status
· Ribbon: padding 1em 1em 0,6em 0, borda inferior 1px, seções separadas por borda direita 1px, padding 0,4em 0,8em, fonte 0,8em
· Endereço: breadcrumb com chevrons (hover rgba(136,136,136,0,3)), campo de busca 20% de largura, borda 1px
· Sidebar: largura 180px, árvore expansível com chevrons, scroll-y, borda direita 1px
· Grade: repeat(auto-fill, 8,6em), gap 1em, rótulo central com clamp de 2 linhas, ícone 48px (daedalos)
· Tokens msfiles light: bg1 #ffffff, bg2 #f5f5f5, gray1 #bbb, gray2 #ddd
· Tokens msfiles dark: bg1 #191919, bg2 #1c1c1c, gray1 #444, gray2 #222
· Status bar: fundo var(--bg2), contagem de itens + alternador de visão, padding 2px 4px 2px 8px
· daedalos: navbar 35px, status 23px, linha de detalhes 22px, entrada de grade 74x70px, fonte 12px

## Refinamento visual (trylle)
· Navegação fixa 56px, rolagem muda para fundo 75% + blur + ring 1px
· Container max-w 5xl (1024px) com padding 24px
· Títulos 30–40px, leading 1,15, tracking −0,015em, peso normal
· Cartões: fundo card 50%, ring 1px, radius 16px (2xl), sombra suave preta 5%
· Botões pílula radius full, ativo invertido (fundo foreground, texto background)
· Separadores pontilhados: gradiente 1px repetido a cada 4–6px, opacity 20–25%
· Números monetários em mono tabular-nums, verde esmeralda para valores
· Status pill: pílula com ponto verde pulsante (animação pulse)
· Ícones lucide stroke 2, tamanhos 16/20px

## Aplicação ao devthink
· panel → taskbar/dock: 48px, acrylic saturate(3) blur(20px), ícones 38px radius 4px, indicador 3px com 6px aberto/12px ativo accent
· intro → boot screen: fundo #010001, marca central, anel de progresso spin-infinite, entrada por fadein
· auth → lock screen: splash hora/data → avatar + pílula de entrada translúcida, blur 25px no clique, saída opacity 1s
· chat → start menu + janela: painel 640px radius 8px blur(20px), entrada translateY(100px)+opacity 200ms cubic-bezier(0,79, 0,14, 0,15, 0,86), rodapé 64px com borda superior
· files → explorer: sidebar 180px + grade auto-fill 8,6em + status bar, tokens msfiles, hover rgba(0,178,255,0,16)
· settings → wnapp: toolbar 28px radius 6px, actbtns hover cinza/vermelho, fundo mica fake radial, corpo radius 0 0 6px 6px
· gateway → window manager: z-order por contador, cascata 26px, handles 8px offset −8px, mínimo 320x320, snap flyout grid 3x2, foco outline 1px
· explore → painel lateral: 360px radius 8px blur 20px, saída translateX(120%) 250ms cubic-bezier(0,62, 0, 32, 1)
· console → terminal: consolas 0,84em, fundo rgb(16,16,16), texto 0,72em na toolbar
· Global → tokens: texto #222/#ddd, accent #0067c0/#4cc2ff, base #f3f3f3/#202020, mica radial #eff4f9/#1a1f35, transições do shell nas curvas listadas
