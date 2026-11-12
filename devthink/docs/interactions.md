# Interações e microanimações — catálogo do devthink

Fontes: desingeer (569 sites clonados, 8,7 GB, 2.382 CSS, 557 index.html), zcode (DESIGN.md 655 linhas), t3code, synara, hyperframes, remotion (gsap/three), gsap/index.html, motionforge, pascalorg-editor, repos.case.md.

## Panorama quantitativo (desingeer, 569 pastas)

· Ubíquas (mais de metade do corpus): :hover 550, transition 551, transform 550, @keyframes 515, animation 509, cubic-bezier 502, requestAnimationFrame 510, mousemove 474, pointerdown 472, IntersectionObserver 470
· Vidro e profundidade: backdrop-filter 459, scrollbar custom 454, position sticky 394, will-change 379, clip-path 410, mask-image 331, translate3d 285
· Camada média: view-transition 287, mix-blend-mode 241, stroke-dasharray 234, shader 233, webgl 226, scroll-snap 180, perspective 197, conic-gradient 142, prefers-reduced-motion 404
· Raras e diferenciadoras: animation-timeline 61, scroll-timeline 8, GSAP 126, ScrollTrigger 44, SplitText 34, lottie 64, lenis 38, cursor magnético 113, cursor none 115, SplitText 34, CountUp 35

## Top 20 referências mais ricas em microinterações

Amplitude (22-21/24 sinais) e densidade de keyframes/hover/easing: cue (cuedesign.space, 3.894 keyframes, easing spring), lightswind-com, shadcnblocks-com, openai (989 cubic-bezier, scroll-driven), ui-aceternity-com (parallax 132, magnetic 29), daisyui-com, kibo-ui-com, zai (chat.z.ai), magicui-design, suno (waveform + animation-timeline), fly-io (terminal estética), 21st.dev (sonner/swipe-out), getlayers-ai (330 backdrop-filter), trylle (mousemove 72), aura-build, neuform-ai (stagger de sidebar), ray-so, raycast-com, unlimited-studio (máscaras gradient), smoothui-dev (accordion fd-*). Empatadas em amplitude: annnimate-com, remotion-dev, componentry-dev.

## Microinterações

· Easing por papel: entrada rápida com settle cubic-bezier(0.22,1,0.36,1) dominante no cue (68 usos), spring elástico 0.34,1.56,0.64,1 (cue), família Apple 0.16,1,0.3,1 / 0.23,1,0.32,1 / 0.165,0.84,0.44,1 (ray-so, raycast-com), trio Material 0,0,.2,1 / .4,0,1,1 / .05,0,0,1 (openai)
· Hover de card com lift: translateY negativo + sombra crescente, transição 150-200ms (raycast-com, shadcnblocks-com, kibo-ui-com)
· Glass real: blur(6px), blur(10px), blur(12px) e token --tw-glass-blur sobre superfície translúcida (getlayers-ai), backdrop var por região --sidebar-backdrop-filter (zai)
· Shimmer e skeleton: skeleton_loading, shimmer-slide, shiny-text (magicui-design), top-project-name-shimmer / stage-project-loading-shimmer (ui-camera), skeletonLoader (lightswind-com)
· Toast sonner com ciclo completo: sonner-fade-in, sonner-fade-out, sonner-spin (21st.dev, lightswind-com, aura-build)
· Command palette: animate-command-palette com backdrop fade (annnimate-com)
· Stagger de lista: animate-stagger-in com delay incremental (annnimate-com, 64 usos), viewerSidebarStaggerFade (neuform-ai)
· Cursor magnético e custom: mousemove + interpolação com deslocamento proporcional (ui-aceternity-com, trylle), cursor none + dot follower (custom-cursor, 115 pastas)
· Marquee infinito: marquee, marquee-vertical (magicui-design), marquee 17 usos (21st.dev), testimonial-marquee-left/right (componentry-dev)
· Pulso de status: kl-breathe, floatnav-pulse, cuering (cue), small-mic-pulse, pulse-slow (aura-build), pulse-ripple / orbit / meteor (magicui-design)
· Desenho de linha SVG: stroke-dasharray + dashoffset animado (234 pastas; vmbStrokeSpin em suno)
· Contador animado: CountUp 35 pastas, viewerProjectCountTickerFadeIn/Out (neuform-ai)
· máscara com gradiente para reveal e fade de borda: mask-image linear-gradient to top/bottom (unlimited-studio, 29 usos)

## Superfícies de chat e harness

· Escala tipográfica dedicada: text-ui-xl a 2xs derivadas de --ui-font-size (14px base), proibido text-base/text-sm cru; código/diff/terminal com fonte própria (zcode DESIGN.md)
· Raio por aninhamento: primeiro container rounded-xl, desce lg→md→sm; exceções 2xl explícitas: shell do input principal, painel flutuante de status, toast, backplate de ícone (zcode)
· Densidade antes de cor: hierarquia por peso e cor de texto (foreground-subtle/subtlest), nunca semântica success/warning decorativa (zcode)
· Diálogos empilhados: scale-98 + translate-y-8 proporcionais a --nested-dialogs, opacity calc, duration-200 ease-in-out, will-change-transform, data-starting/ending-style (t3code apps/web/src/components/ui/dialog-styles.ts)
· Composer rico: barra de anexos, banner stack, pending approval panel, activity status, command menu, code block language picker (t3code components/chat/ChatComposer*, ComposerPendingApprovalPanel)
· Terminal integrado: drawer de terminal sob a conversa, busca mod+F com terminalFocus, abas de terminal, ghostty (t3code apps/web/src/terminal, synara KEYBINDINGS.md)
· Keybindings com when: sidebar.toggle, space.jump.1-9, terminal.new com condições terminalFocus/composerFocus, gravador de atalho com detecção de conflito (synara KEYBINDINGS.md)
· Vibração nativa: WindowMaterial.m com NSVisualEffectView para painel desktop (synara apps/desktop/native/window-material)
· Drag and drop na conversa: ChatPaneDropOverlay com feedback de soltar (synara apps/web/src/components/chat-drop-overlay)
· Timeline de workflow: lâmpadas de status por cores semânticas, lâmpada oca para feedback de compilação, traço tracejado em --color-warning marchando sobre o rail, avatares de agente com paleta fixa de 9 HEX por índice (zcode DESIGN.md, seção workflow timeline)
· Mention nodes: fundo, hover e foreground acoplados por token para file/skill/command (zcode DESIGN.md)
· Diff semântico: --color-diff-added/removed próprios, nunca success/destructive genéricos (zcode, t3code components/diffs)
· Motion de chat: transições rápidas e low-drama, fade/zoom/slide direcional em overlay, proibido spring lúdico no workspace (zcode DESIGN.md, seção Motion); prática: transition-colors 81 + duration-150 25 + animate-spin 18 (synara), duration-150/200 + ease-out (t3code)
· Toast de app: bg-toast/60 com backdrop blur e rounded-2xl, sombra forte, posição centralizada no componente compartilhado (zcode DESIGN.md)

## Animação de entrada e saída

· Entrada de página boas-vindas: cue-welcome-in, cue-welcome-out, cue-welcome-back-in (cue, 304 usos cada)
· Pílulas e chips: v2-pill-in/out, v2-chip-in, v2-card-in, v2-pop-in (cue)
· Saída direcional de toast: swipe-out-up/down/left/right (21st.dev, lightswind-com, ui-camera)
· Modal: modalBackdrop + modalContent + sheetSlide (annnimate-com)
· View transitions de navegação: astroSlideToRight/Left, astroFadeInOut (shadcnblocks-com), view-transition 287 pastas
· Onboarding em cena: onboarding-card-in, onboarding-scene-in (fly-io)
· Slide de marca própria: remotion-slide-in/out (remotion-dev), drag-callout-scale (remotion-dev)
· Scroll-driven nativo: view-timeline-name --window-response + animation-timeline (openai), animation-timeline --queue-scroll (suno), animation-timeline 61 pastas — só 8 usam scroll-timeline, vantagem competitiva baixo custo
· Scroll-snap para seções: scroll-snap 180 pastas (type mandatory + proximity)
· Sticky com progresso: sticky 394 pastas, header persistente + rail de progresso (lightswind-com, ray-so)
· Parallax por mouse: mousemove + transform depth em cards (ui-aceternity-com 132 ocorrências, trylle 72)
· Acordeão: animate-accordion-up/down, fd-collapsible-up/down, fd-sidebar-out (smoothui-dev)
· Texto cinético: SplitText + ScrambleText (gsap/index.html), KineticTypography velocity, LiquidText, TextStack3D (motionforge)
· Canvas de áudio-visual: waveform, waveform-in, marquee, wiggle (suno)

## Shaders e 3D (three.js)

· Biblioteca de transições GLSL pronta: 13 shaders com u_progress, borda smoothstep e brilho accent: domain-warp, ridged-burn, whip-pan, sdf-iris, gravitational-lens, light-leak, ripple-waves, swirl-vortex, thermal-distortion, chromatic-split, cinematic-zoom, cross-warp-morph, flash-through-white (hyperframes packages/shader-transitions/src/shaders/registry.ts)
· Mesma família em uso no catálogo: gl-transitions (em neo.temp) como fonte de GLSL de transição por u_progress
· Galeria 3D com fog e DOF: DepthGallery3D, distância baseada em cena three.js (motionforge packages/motionforge/src/components/animations)
· Reveal por ruído: ShaderImageReveal com threshold Perlin; dithering estilizado ordered/Floyd-Steinberg (motionforge)
· FLIP e máscara: FlipImageReveal de thumb para fullscreen, CardExpansionMask com máscara circular SVG, StickyGridScroll (motionforge)
· Three determinístico: ThreeCanvas acopla frameloop a useCurrentFrame e trava render com delayRender/continueRender até cena criada (remotion packages/three/src/ThreeCanvas.tsx)
· Editor 3D com plugins: @react-three/fiber + drei, scene graph com builtinPlugin por tipo de nó, conversão IFC, geometry script compilado em worker (pascalorg-editor)
· 3D no corpus de sites: shader 233 pastas, webgl 226, gl_FragColor/fragmentShader 123, preserve-3d 134, perspective 197
· Hero com brilho dedicado: partícula e glow tokens isolados em stylesheet próprio para o composer Highspeed (zcode DESIGN.md) — isolamento evita vazamento para inputs comuns
· Direção: usar three só quando máscara/parallax CSS não cobre; base WebGL2 + fallback

## GSAP aplicável

· Presença: GSAP em 126 das 569 pastas, ScrollTrigger 44, SplitText 34
· Pipeline frame-driven: use-gsap-timeline cria timeline pausada em t=0 no useLayoutEffect, expõe scope + selector restrito ao ref, mapeia callbacks (onStart/onUpdate/onComplete) para frames via frameToSeconds, rebuild por dependencies (remotion packages/gsap/src/use-gsap-timeline.ts) — modelo para animação determinística em React
· gsap.com: ScrollTrigger + ScrollSmoother para showcase, Observer para gestos, SplitText por caractere, ScrambleText para labels, CustomEase para assinatura de easing, useGSAP como hook oficial (gsap/index.html)
· Registry de plugins como dependência: SplitText carregado via modulepreload (gsap/index.html)
· Regra do devthink: cobrir 90% com CSS (keyframes + cubic-bezier, como o cue que nem usa GSAP), reservar GSAP para stagger, texto e scroll-scrub; sempre com cleanup de timeline para não vazar referências DOM (padrão isWalkable do remotion gsap)

## Repos.case.md — a clonar depois (ausentes em neo.temp)

· Scroll: darkroomengineering/lenis (smooth scroll com raf integrado)
· Ecossistema pmndrs: react-three-fiber, drei, postprocessing, leva, rafz, lamina, meshline, cannon-es, three-stdlib
· Motion design: AriaMinaei/theatre (editor de timeline), formkit/auto-animate (entradas automáticas), @motionone/dom (WAAPI minimal)
· Raster e runtime: airbnb/lottie-web + LottieFiles/lottie-react, rive-app/rive-react
· 3D avançado: splinetool/spline, sparkjsdev/spark, mkkellogg/GaussianSplats3D (gaussian splatting), vasturiano/three-globe, FarazzShaikh/THREE-CustomShaderMaterial, gkjohnson/three-mesh-bvh
· Vidro: callstack/liquid-glass
· Física e raster 2D: liabru/matter-js, pixijs/pixijs + pixijs/filters
· Shaders de referência: paper-design/shaders (componentes WebGL), shadertoy.com (8 páginas no corpus)
· Já em neo.temp (não reclonar): gsap, motion, remotion, hyperframes, gl-transitions, playcanvas-engine, mobbin, navbar-gallery

## Regras-síntese para o redesign

· Duração 150-250ms para micro, 300-500ms para entrada; ease 0.22,1,0.36,1 como padrão, spring 0.34,1.56,0.64,1 para delícia
· Motion esclarece estado, nunca decora: sem spring lúdico em superfície operacional (zcode), marketing pode
· prefers-reduced-motion em 404 pastas: obrigatório gate em todo keyframe não essencial
· Vidro = blur + borda hairline + textura; nunca blur sem contraste de fundo garantido (getlayers-ai, zcode toast)
· Camada antes de sombra: fundo contrastado → borda → sombra md apenas em overlay (zcode DESIGN.md, Elevation)

## Pesquisa de internet (fundida pelo orquestrador)

· Dock magnification com GSAP: rastrear mousemove no dock, escala por queda gaussiana scale = 1 + maxScale × exp(−dist² / 2·spread²), atualização por ícone com gsap.quickTo() (nada de tween novo por frame), retorno com elastic.out no mouseleave, transform-origin bottom para crescer para cima, padrão do dock magnifying (guia da Fluidblocks e CodePen Dynamic GSAP Dock Navigation)
· Padrões de hover GSAP do catálogo atual: play/reverse por hover, efeito magnético com quickTo para posição, stagger com stagger.each em vez de delay manual (Made With GSAP, gsap.com)
· Vidro em three.js, dois caminhos: MeshPhysicalMaterial com transmission 1, ior, roughness e thickness para refração física embutida sem shader custom, ou shader próprio que amostra o render target do fundo com UV deslocado pela normal e ior para o efeito liquid glass mais barato e estilizado (breakdown do akella, thread de refração do r/webgl, demo Panoramic-Ray-Refractor)
· Hero WebGL do devthink: grade que deriva, globo de partículas e dither procedural de fundo (composição Aura), sempre com prefers-reduced-motion e cleanup da cena
· Microinteração 2026 por função: feedback de estado no botão, skeleton em carregamento, indicador de streaming em superfície de IA, loop de feedback que engaja sem decorar (NN/g, guias de micro-interação 2026)
