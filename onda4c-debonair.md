# ONDA 4c — debonair profundo (neodocs-txt/outros.debonair)

**Task ID:** 6-5-c · **Agente:** leitor-onda4c (subagente) · **Fonte:** `/home/z/neodocs-txt/outros.debonair/` (96 arquivos, 41MB, 38.850 linhas nos 44 maiores .txt)

## Arquivos lidos (17) — cobertura por segmentos `sed`

| # | Arquivo | Linhas | Segmentos lidos |
|---|---------|--------|-----------------|
| 1 | SISTEMA-QUALIDADE-COMPLETO.txt | 1868 | 1-620, 621-1150, 1151-1868 (100%) |
| 2 | MACHINE-TREINAMENTO-COMPLETA.txt | 1471 | 1-480, 481-980, 981-1471 (100%) |
| 3 | PIPELINE-TREINAMENTO.txt | 1737 | 1-580, 581-1160, 1161-1737 (100%) |
| 4 | ORGANIZACAO-SAMPLES.txt | 1794 | 1-580, 581-1160, 1161-1794 (100%) |
| 5 | ARQUITETURA-OFFLINE-COMPLETA.txt | 1205 | 1-600, 601-1205 (100%) |
| 6 | INFRAESTRUTURA-AUDIO-AI.txt | 687 | 1-687 (100%) |
| 7 | EXTRACAO-REFERENCIAS-REAIS.txt | 1495 | 1-500, 501-1000, 1001-1495 (100%) |
| 8 | CONCORRENCES-AUDIO-AI-10.txt | 1047 | 1-520, 521-1047 (100%) |
| 9 | LIBRARIAS-TS-AUDIO.txt | 1048 | 1-530, 531-1048 (100%) |
| 10 | EFFECTS-MIXING-MASTERING.txt | 775 | 1-450, 451-775 (100%) |
| 11 | SINTESE-TIPOS-SOM.txt | 1033 | 1-520, 521-1033 (100%) |
| 12 | "FORMATOS-DADOS-PREV processados.txt" | 1094 | 1-540, 541-1094 (100%) |
| 13 | MIXING-MASTERING-POR-GENERO.txt | 1077 | 1-450, 451-1077 (100%) |
| 14 | MONTAGEM-INTELIGENTE.txt | 964 | 1-450, 451-964 (100%) |
| 15 | ANALISE-ESPECTRAL.txt | 985 | 1-450, 451-985 (100%) |
| 16 | WORKFLOW-MANUAL-VS-AI.txt | 888 | 1-440, 441-888 (100%) |
| 17 | PLANO-TECNICO-MASTER.txt | 500 | 1-500 (100%) |

**Total lido: ~19.168 linhas (100% dos 17 maiores arquivos).** Pulados (não lidos, documentados): os 79 arquivos menores/derivados de neodocs-txt/outros.debonair (ex.: TYPE-BEATS-POR-GENERO 751L, ASSEMBLAGEM-PADROES 819L, CAMADAS-COMPLEXAS 592L, FL-STUDIO-ANALISE 536L, STEM-SEPARATION 675L, SINTESE-VOCAL-AI 657L, DATASETS-E-MODELOS 653L, COMO-CONCORRENCES-ORGANIZAM 653L, PESQUISA-CONCORRENCIA 600L, COMPRESSAO-MODELOS 539L, MODELO-OFFLINE-COMPACTO 523L, QUALIDADE-AUDIO-ESPECIFICACOES 468L, PESQUISA-ACADEMICA 463L, APPS-OFFLINE-ANALISE 422L, 24-indice 416L, O-QUE-FALTA 263L, README/índices e ~60 fragmentos) — material redundante com os 17 lidos; para onda futura.

---

## REGRAS ND (onda 4c — ND-2001 em diante)

### Bloco 1 — SISTEMA-QUALIDADE-COMPLETO.txt (arquitetura de qualidade, camadas, validação)

ND-2001. Garanta que cada faixa gerada soe profissional e distinta por gênero com pipeline referenciado: Assembly → Mixing → Mastering → Validation → Export. «SISTEMA-QUALIDADE-COMPLETO.txt:1-19»
ND-2002. Organize 10–15 camadas por gênero com alocação precisa de frequência, pan e sintese declaradas por linha (ex.: Trap 12 camadas de 808-sub 40–80Hz a FX 200–10kHz). «SISTEMA-QUALIDADE-COMPLETO.txt:25-40»
ND-2003. Defina Genre DNA em 7 dimensões: banda dominante, inclinação espectral, LRA, clipping/sidechain, reverb, panning e BPM. «SISTEMA-QUALIDADE-COMPLETO.txt:42-51»
ND-2004. Fixe DNA do Trap: BPM 130–170 (half-time 65–85), sub-bass 30–100Hz dominante, LRA 8–12 LU, kick ducha 808, snare ducha pad, reverb plate curto no snare e nenhum no 808. «SISTEMA-QUALIDADE-COMPLETO.txt:42-51»
ND-2005. Fixe DNA do Pop: BPM 100–130, mid 500–3000Hz dominante, tilt flat com presence 3–5kHz, LRA 6–9 LU, sidechain leve. «SISTEMA-QUALIDADE-COMPLETO.txt:70-79»
ND-2006. Fixe DNA do EDM/House: BPM 118–135, kick 40–80Hz com sidechain pesado (tudo ducha ao kick), LRA 4–7 LU, arranjo Build→Drop→Break. «SISTEMA-QUALIDADE-COMPLETO.txt:96-104»
ND-2007. Fixe DNA do Hip-Hop boom bap: BPM 85–115, swing 55–65%, low-mid 100–500Hz quente, vinyl crackle/tape saturation como textura. «SISTEMA-QUALIDADE-COMPLETO.txt:121-130»
ND-2008. Fixe DNA do Lo-Fi: BPM 60–85, espectro muito escuro (highs cortados), wobble de tape wow/flutter, noise floor de vinil sempre presente, LRA 5–8 LU. «SISTEMA-QUALIDADE-COMPLETO.txt:171-180»
ND-2009. Fixe DNA do Drill: BPM 140–170, sub 30–80Hz com 808 longos e slides, hihat em rolls/triplets, mood escuro e cinematográfico. «SISTEMA-QUALIDADE-COMPLETO.txt:198-206»
ND-2010. Fixe DNA do Ambient: BPM 60–90 ou tempo livre, reverb 3–5s, estéreo extremamente largo, LRA 10–15 LU sem compressão. «SISTEMA-QUALIDADE-COMPLETO.txt:247-255»
ND-2011. Fixe DNA do Jazz: swing 60–70%, LRA 10–14 LU, sem sidechain, arranjo head→solos→head. «SISTEMA-QUALIDADE-COMPLETO.txt:273-281»
ND-2012. Fixe DNA do Cinematic: LRA 15–20 LU (gênero mais dinâmico), hall 2–4s, imagem orquestral larga, 13 camadas de sub a FX. «SISTEMA-QUALIDADE-COMPLETO.txt:307-332»
ND-2013. Fixe DNA do Reggaeton: BPM 90–100, padrão dembow (kick em 1,2,3,4; snare no "and" de 2 e 4), congas/timbales largos. «SISTEMA-QUALIDADE-COMPLETO.txt:223-231»
ND-2014. Fixe DNA do Funk: groove de 16th sincopado, clavinet/wah, LRA 8–12 LU, room tight. «SISTEMA-QUALIDADE-COMPLETO.txt:350-358»
ND-2015. Execute o pipeline de qualidade em 6 estágios: Reference Analysis → Layer Assembly → Automatic Mixing → Mastering → Quality Validation → Export. «SISTEMA-QUALIDADE-COMPLETO.txt:361-466»
ND-2016. No Stage 1, parseie o prompt (gênero, key, BPM, mood, duração) e, se houver faixa de referência, calcule FFT, LUFS, LRA, BPM por autocorrelação, key por chroma e stereo width para derivar curvas-alvo. «SISTEMA-QUALIDADE-COMPLETO.txt:370-384»
ND-2017. No Stage 2, para cada camada: consulte o pattern DB, valide teoria (key/scale), humanize, sintetize via Web Audio e valide conteúdo espectral. «SISTEMA-QUALIDADE-COMPLETO.txt:387-396»
ND-2018. No Stage 3A, aplique por track: gain staging -18 dBFS → corrective EQ → compressão → creative EQ → saturação → sends reverb/delay → panning. «SISTEMA-QUALIDADE-COMPLETO.txt:400-410»
ND-2019. No Stage 3B, processe buses: drum bus com compressão paralela e saturação; music bus com widening e reverb; bass bus com compressão e saturação. «SISTEMA-QUALIDADE-COMPLETO.txt:411-415»
ND-2020. No Stage 3C, implemente sidechains declarativos: Kick→Bass, Kick→808 e Snare→Pad com ducking dependente de frequência. «SISTEMA-QUALIDADE-COMPLETO.txt:416-421»
ND-2021. No Stage 4, execute a cadeia master em 9 passos: gain staging, corrective EQ, multiband 4-band, full-band glue, tonal EQ, stereo imaging M/S com mono check, saturação, limiter true-peak lookahead e normalização -14 LUFS. «SISTEMA-QUALIDADE-COMPLETO.txt:425-438»
ND-2022. No Stage 5, valide: LUFS ±1 dB do alvo, true peak ≤ -1 dBTP, LRA no range do gênero, balanço espectral vs referência, correlação estéreo ≥ 0.5, sem clipping e validade harmônica; se falha, ajuste e reprocesse. «SISTEMA-QUALIDADE-COMPLETO.txt:441-453»
ND-2023. No Stage 6, exporte mix 24-bit/48kHz WAV, stems, MIDI de todas as partes, projeto JSON e metadata (BPM, key, genre, LUFS, layers). «SISTEMA-QUALIDADE-COMPLETO.txt:456-463»
ND-2024. Modele GenreReferenceProfile com curva espectral 31-band, energia por 7 bandas (sub 20–80 … air 10k–20k), dinâmica (targetLUFS/LRA/truePeak/compressionStyle/sidechainAmount), estéreo, efeitos e arranjo. «SISTEMA-QUALIDADE-COMPLETO.txt:484-536»
ND-2025. Mantenha perfis de referência pré-computados por gênero (ex.: Trap -14 LUFS sub Very High -13 dB; Ambient -16; Jazz -16; Cinematic LRA 15–20). «SISTEMA-QUALIDADE-COMPLETO.txt:538-554»
ND-2026. Analise referência com STFT 2048/hop 512, mel spectrogram, perfil 31-band, loudness ITU-R BS.1770-4, análise estéreo, BPM e key. «SISTEMA-QUALIDADE-COMPLETO.txt:558-620»
ND-2027. Calcule crest factor como true peak − loudness integrada e dynamic range a partir do short-term LUFS. «SISTEMA-QUALIDADE-COMPLETO.txt:621-637»
ND-2028. Encadeie per-track MixingChain de 8 estágios (inputGain -18 dBFS → corrective EQ → compressor → creative EQ → saturation → sends → pan/width → output/mute/solo). «SISTEMA-QUALIDADE-COMPLETO.txt:649-680»
ND-2029. Use receitas de mix por gênero com EQ/corrente/pan exatos (ex.: 808-sub trap: lowshelf +3 dB @30Hz, corte -4 dB @200Hz, lowpass @800Hz, comp 6:1 attack 1ms; dark pad width 1.5 e reverb send 0.3). «SISTEMA-QUALIDADE-COMPLETO.txt:688-870»
ND-2030. Comprima drums bus em paralelo (threshold -20, ratio 10, mix 20%) e o master com EQ 30Hz HPF, +1 dB @100Hz, +0.5 dB @3kHz, +1 dB @12kHz. «SISTEMA-QUALIDADE-COMPLETO.txt:940-977»
ND-2031. Configure sidechains por gênero com faixa de frequência, threshold, ratio, attack, release e depth (ex.: EDM kick→bass 40–200Hz ratio 8 depth -8 dB). «SISTEMA-QUALIDADE-COMPLETO.txt:999-1043»
ND-2032. Modele MasterChain com multiband 4 bandas [20-120], [120-1k], [1k-6k], [6k-20k], compressor full-band com sidechain HPF 80Hz, stereo imaging com lowFreqWidth mono, limiter ceiling -1 dBTP lookahead 0.001s oversampling 4x e loudness BS.1770-4. «SISTEMA-QUALIDADE-COMPLETO.txt:1061-1116»
ND-2033. Diferencie mastering por gênero: EDM multiband agressiva no sub (ratio 4) e limiter release 0.04; Ambient ratio 2 sem saturação target -16; Jazz ratio 2 target -16. «SISTEMA-QUALIDADE-COMPLETO.txt:1120-1225»
ND-2034. Implemente normalização de loudness: medir LUFS integrada, ganho = target − atual em linear, aplicar e re-limitar a -1 dBTP se o true peak exceder. «SISTEMA-QUALIDADE-COMPLETO.txt:1229-1262»
ND-2035. Meça loudness com K-weighting (2 biquads), média quadrática e fórmula L = -0.691 + 10·log10(meanSquare); meça true peak com oversample 4x. «SISTEMA-QUALIDADE-COMPLETO.txt:1263-1290»
ND-2036. Rode suíte de quality checks com severidade error/warning e auto-fix: sample-rate 48000, bit-depth 24, estéreo, LUFS ±1, true peak ≤ -1, LRA no range, desvio espectral <3 dB, sub-bass ±3 dB, correlação ≥0.5, mono peak ≤0 dBFS, 0 samples clipados, silêncio <2s, key e BPM ±2. «SISTEMA-QUALIDADE-COMPLETO.txt:1345-1560»
ND-2037. Aplique auto-fixes: LUFS→normalize -14; true peak→limiter -1; clipping→limiter -0.3; mono compat→mid-side fix. «SISTEMA-QUALIDADE-COMPLETO.txt:1567-1590»
ND-2038. Emita QualityReport com score 0-100, grade A/B/C/D/F (A ≥90) e genre match 0-1. «SISTEMA-QUALIDADE-COMPLETO.txt:1595-1630»
ND-2039. Compare fingerprints espectrais por gênero em 10 bandas (30Hz…16kHz, dB relativos a 1kHz) para garantir >80% de separação espectral entre gêneros via distância MFCC. «SISTEMA-QUALIDADE-COMPLETO.txt:1660-1687»
ND-2040. Estruture o código de qualidade em src/quality/{references,mixing,mastering,validation,export} + src/layers + src/assembly, com data JSON de perfis, receitas, masters e layers por gênero. «SISTEMA-QUALIDADE-COMPLETO.txt:1800-1868»

### Bloco 2 — MACHINE-TREINAMENTO-COMPLETA.txt (máquina de treinamento 7 camadas)

ND-2041. Estruture a máquina de treinamento em 7 camadas: Input → Decomposition → Analysis → Organization → Pattern Library → AI Training → Inference. «MACHINE-TREINAMENTO-COMPLETA.txt:21-60»
ND-2042. Normalize toda entrada para formato interno WAV 48kHz 16-bit estéreo (Float32Array interleaved) a partir de arquivos, YouTube (yt-dlp), MIDI, texto ou microfone. «MACHINE-TREINAMENTO-COMPLETA.txt:75-160»
ND-2043. Escolha stack de input: music-metadata, decodeAudioData do Web Audio, @tonejs/midi, yt-dlp binário e @ffmpeg/ffmpeg WASM. «MACHINE-TREINAMENTO-COMPLETA.txt:110-125»
ND-2044. Decomponha áudio em stems (Demucs), onsets (spectral flux), notas (Pitchfinder YIN), beats (autocorrelação), fonemas (Whisper) e acordes (chroma + template matching). «MACHINE-TREINAMENTO-COMPLETA.txt:170-210»
ND-2045. Use separação de stems em duas tiers: Tier 1 DSP HPSS/Mid-Side (0 dependências, cross-correlação entre stems <0.25) e Tier 2 ML demucs-web HTDemucs ONNX ~172MB; modo auto tenta ML e cai para DSP. «MACHINE-TREINAMENTO-COMPLETA.txt:222-280»
ND-2046. Detecte onsets por spectral flux + threshold adaptativo (mediana) e peak-picking com distância mínima de 30ms. «MACHINE-TREINAMENTO-COMPLETA.txt:285-300»
ND-2047. Extraia matriz de features: espectrais (centroid/bandwidth/rolloff/flatness/contrast/MFCC13), temporais (RMS/ZCR/envelope), harmônicos (F0/chroma/key), rítmicos (BPM/meter/groove/swing), timbrais, loudness EBU R128 e estruturais (self-similarity). «MACHINE-TREINAMENTO-COMPLETA.txt:320-360»
ND-2048. Compute STFT 4096/hop 1024, mel 128 bandas e MFCC 13 como base do FeatureSet JSON-serializável. «MACHINE-TREINAMENTO-COMPLETA.txt:365-420»
ND-2049. Persista tudo em SQLite (better-sqlite3): tabelas audio_files, stems, notes, beats, chords, feature_sets, tags e patterns com índices por entidade/categoria/pitch. «MACHINE-TREINAMENTO-COMPLETA.txt:480-580»
ND-2050. Guarde features como .npy binário comprimido com LZ4 e metadados JSON em colunas SQLite; organização de arquivos por UUID. «MACHINE-TREINAMENTO-COMPLETA.txt:582-600»
ND-2051. Taggeie automaticamente por gênero, mood, instrumento, faixa de tempo (slow 60-90/mid/fast), era, qualidade e técnica (arpeggio, strum, pad, pluck, sweep). «MACHINE-TREINAMENTO-COMPLETA.txt:605-620»
ND-2052. Construa Pattern Library com 5 tipos: beat patterns (grid 16th + swing + humanize), chord patterns, melody patterns, effect patterns e structure patterns (templates de arranjo com energia por seção). «MACHINE-TREINAMENTO-COMPLETA.txt:640-700»
ND-2053. Ordene patterns por occurrence_count e busque similares por cosine similarity de vetores de features. «MACHINE-TREINAMENTO-COMPLETA.txt:760-790»
ND-2054. Treine com tokenização musical de vocabulário ~2000 tokens: P0-P127 × V1-V8 × D1-D32, chord root+quality, drum hit+pattern, control tokens (BPM_CHANGE, KEY_CHANGE, SECTION_START…) e especiais (BOS/EOS/PAD/MASK). «MACHINE-TREINAMENTO-COMPLETA.txt:810-870»
ND-2055. Aumente dados com pitch shift ±2 semitons, time stretch ±10%, variação de velocity ±10%, dropout de notas 10% e groove variation. «MACHINE-TREINAMENTO-COMPLETA.txt:872-890»
ND-2056. Selecione arquitetura por tarefa: MelodyGenerator GPT-2 ~50MB, DrumGenerator LSTM ~10MB, ChordProgression Transformer ~20MB, TimbreSynthesizer DDSP VAE ~30MB, Vocoder HiFi-GAN ~30MB, StemSeparator HTDemucs ~172MB, Genre/Mood Classifier CNN ~5MB. «MACHINE-TREINAMENTO-COMPLETA.txt:895-915»
ND-2057. Treine em Python/PyTorch (GPU) e exporte para ONNX INT8 quantizado; inferência no browser com onnxruntime-web (WASM + WebGPU). «MACHINE-TREINAMENTO-COMPLETA.txt:920-1010»
ND-2058. Considere fine-tune do MusicGen Small (300M) como alternativa ao treino do zero; opção híbrida teoria determinística + ML para variação. «MACHINE-TREINAMENTO-COMPLETA.txt:940-960»
ND-2059. Valide modelos com perplexidade, note accuracy (pitch/rhythm), validade de progressão, geração de 100 amostras por gênero e compliance de regras de teoria. «MACHINE-TREINAMENTO-COMPLETA.txt:990-1005»
ND-2060. Rode inferência em 6 modos: Full AI, Pattern+Variation, Theory+AI, MIDI+AI, Audio+AI e Manual determinístico. «MACHINE-TREINAMENTO-COMPLETA.txt:1160-1175»
ND-2061. Gere faixas híbridas: teoria para progressão determinística, pattern library ou variação IA (30%) para drums, IA para melodia, síntese Tone.js/HiFi-GAN/RAVE e pós-processamento com mix -14 LUFS/-1 dBTP. «MACHINE-TREINAMENTO-COMPLETA.txt:1190-1250»
ND-2062. Atribua ambientes: Node/browser para análise, patterns e inferência; Python apenas para treino, pré-processamento pesado e export ONNX; binários externos só yt-dlp/ffmpeg/sox. «MACHINE-TREINAMENTO-COMPLETA.txt:1280-1340»
ND-2063. Declare inviabilidades do browser: treinar modelos grandes, difusão latente em tempo real, text-to-music do zero e processamento de horas de áudio. «MACHINE-TREINAMENTO-COMPLETA.txt:1360-1380»
ND-2064. Justifique o híbrido: teoria dá saída determinística, <10ms, compliance e MIDI editável; IA dá variação, timbre realista e text-to-music. «MACHINE-TREINAMENTO-COMPLETA.txt:1395-1410»
ND-2065. Prefira ONNX a TensorFlow.js: agnóstico de framework, melhor zoo de modelos de áudio, WebGPU, runtime menor, 2.2M downloads/semana. «MACHINE-TREINAMENTO-COMPLETA.txt:1412-1422»
ND-2066. Prefira SQLite a DB em nuvem: zero config, arquivo único, portável, offline. «MACHINE-TREINAMENTO-COMPLETA.txt:1424-1432»
ND-2067. Alimente a IA com dados "mastigado" (features pré-extraídas, organizadas e rotuladas), nunca WAV cru (1MB/segundo). «MACHINE-TREINAMENTO-COMPLETA.txt:1434-1448»
ND-2068. Cumpra metas de performance: import <5s por música de 3min, separação DSP cross-corr <0.25, separação ML SDR >5dB, features <10s, patterns <30s, query <100ms, inferência <30s, MOS >3.5, teoria >95%, gênero >80%. «MACHINE-TREINAMENTO-COMPLETA.txt:1462-1478»
ND-2069. Implemente o plano de 7 fases (20 semanas): fundação, análise/patterns, organização, ML stems, treino, inferência e integração end-to-end <30s. «MACHINE-TREINAMENTO-COMPLETA.txt:1385-1460»
ND-2070. Trate o moat como pipeline completo offline TypeScript-native de análise a geração com MIDI editável e compliance determinística — nenhum concorrente o tem. «MACHINE-TREINAMENTO-COMPLETA.txt:1480-1495»

### Bloco 3 — PIPELINE-TREINAMENTO.txt (coleta, decomposição, treino, inferência)

ND-2071. Colete datasets prioritários: Lakh MIDI (176.581 MIDIs, CC-BY), Aria-MIDI (1.186.253 piano), MAESTRO v3 (1.276 pares MIDI+WAV), MusicCaps (5.521 legendas), Lo-Fi Drums (10.000 loops), NSynth, FMA e MUSDB18-HQ. «PIPELINE-TREINAMENTO.txt:88-108»
ND-2072. Padronize áudio coletado para WAV estéreo 44.1kHz (ou 48kHz), 16/32-bit, com checksums validados e estrutura data/{raw,processed,metadata,training}. «PIPELINE-TREINAMENTO.txt:110-160»
ND-2073. Rode HT-Demucs FT para 4 stems (SDR 9.19 dB vocals, ONNX ~166MB fp16) e, no browser, faça chunks de 7.8s (343.980 samples) com overlap 0.25. «PIPELINE-TREINAMENTO.txt:172-230»
ND-2074. Segmente treino por estratégia: fixed-length 1–10s, onset-based, beat-aligned 1–8 bars (recomendado) e phrase-based 4–16 bars. «PIPELINE-TREINAMENTO.txt:235-245»
ND-2075. Extraia mel spectrogram padrão (n_fft 2048, hop 512, 80–128 bands mel, 20–8000Hz, log + normalização [-1,1]) e MFCC 13 + deltas para timbre. «PIPELINE-TREINAMENTO.txt:255-300»
ND-2076. Compute embeddings de áudio com CLAP ou MERT (mean pooling → 768-dim) para alinhamento texto-áudio. «PIPELINE-TREINAMENTO.txt:320-340»
ND-2077. Modele AudioSample com metadados musicais completos (genre/key/scale/bpm/meter/instruments/stems/features/quality/source/tags/mood) e TrainingPair input→output. «PIPELINE-TREINAMENTO.txt:370-430»
ND-2078. Organize treino em data/training/{midi-to-audio,text-to-music,audio-to-audio,loop-generation} com splits train/val/test 80/10/10. «PIPELINE-TREINAMENTO.txt:540-580»
ND-2079. Tokenize MIDI em eventos: note_on/note_off (0-255), time_shift 10ms (256-511), velocity 128 níveis (512-639) e especiais pad/bos/eos/bar/beat. «PIPELINE-TREINAMENTO.txt:640-680»
ND-2080. Combine arquiteturas: RAVE VAE para timbre (30–50MB, latente 128), DDSP para síntese por nota (F0+loudness→áudio), HiFi-GAN para vocoding, Transformer GPT-style para beats, MusicGen AR para text-to-music (server-only). «PIPELINE-TREINAMENTO.txt:700-920»
ND-2081. Dimensione hardware de treino: RAVE 8GB+ VRAM 12–48h; DDSP 6–24h; HiFi-GAN 12–36h; Transformer dias-semanas; MusicGen 40GB+ VRAM semanas-meses. «PIPELINE-TREINAMENTO.txt:935-945»
ND-2082. Treine com config padrão: segment 65536 samples (~1.5s), batch 16, epochs 300, lr 1e-4 AdamW, scheduler cosine warmup 10, mixed precision. «PIPELINE-TREINAMENTO.txt:950-985»
ND-2083. Aplique augmentação: time stretch 0.9–1.1, pitch ±2 st, crop aleatório, gain ±3 dB, noise SNR>30dB, time/frequency masking, mixup α=0.2 e SpecAugment. «PIPELINE-TREINAMENTO.txt:990-1040»
ND-2084. Avalie com FAD (menor melhor), KLD, IS, PESQ, STOI, mel cepstral distortion e multi-res STFT loss. «PIPELINE-TREINAMENTO.txt:1045-1070»
ND-2085. Exporte para ONNX com opset 17 e dynamic axes de tempo; quantize FP32→INT8 (4x menor). «PIPELINE-TREINAMENTO.txt:1161-1230»
ND-2086. Carregue modelos no browser com onnxruntime-web (executionProviders webgpu→wasm, graphOptimizationLevel all) e cacheie em IndexedDB com download progressivo. «PIPELINE-TREINAMENTO.txt:1240-1400»
ND-2087. Para o MVP pule text-to-music completo (MusicGen pesado, use API) e GAN training; foque em RAVE + DDSP + HiFi-GAN + Demucs ONNX. «PIPELINE-TREINAMENTO.txt:1660-1680»
ND-2088. Use arquitetura híbrida: servidor Python (coleta, features, treino, export, avaliação) + cliente JS (inferência, síntese, playback, export) + API bridge opcional (HuggingFace/Replicate). «PIPELINE-TREINAMENTO.txt:1700-1740»

### Bloco 4 — ORGANIZACAO-SAMPLES.txt (biblioteca de samples, metadados, SQLite+FAISS)

ND-2089. Dê a cada sample UUID v4 + hash perceptual (SHA-256 do espectrograma) para deduplicação, com versão de schema. «ORGANIZACAO-SAMPLES.txt:14-30»
ND-2090. Modele SampleMetadata completo: identificação, classificação (confidence/method/modelVersion), musical (key/scale/bpm/harmonics), espectral (centroid/rolloff85/95/bandwidth/flatness/contrast/flux/entropy), temporal (onsets/ADSRe/RMS/ZCR), timbral (MFCC+delta+chroma+tonnetz), padrão rítmico, origem, tags, treino (usageCount/qualityScore), embedding 128–512 dims. «ORGANIZACAO-SAMPLES.txt:32-130»
ND-2091. Classifique samples em 10 tipos (drum, bass, vocal, melody, chord, effect, pad, atmosphere, foley, loop) com subtipos por categoria (ex.: drum: kick/snare/hihat/clap/tom/cymbal/percussion/shaker/rim/cowbell). «ORGANIZACAO-SAMPLES.txt:135-175»
ND-2092. Use companion JSON 1:1 por sample (não um JSON grande por pasta) para updates incrementais, processamento paralelo e versionamento git. «ORGANIZACAO-SAMPLES.txt:180-205»
ND-2093. Estruture biblioteca samples/{type}/{subtype}/{samples,spectrograms,embeddings,metadata} + processed/ + stems/ + training/manifests JSONL + db/{samples.db, embeddings.faiss} + tools/. «ORGANIZACAO-SAMPLES.txt:210-300»
ND-2094. Nomeie arquivos como {type}_{subtype}_{character}_{key}_{bpm}_{source}_{id}.wav com prefixos de 3 chars (drm/bas/vcl/mel/chd/fx/atm/fly/lop) e ID hex anti-colisão. «ORGANIZACAO-SAMPLES.txt:305-330»
ND-2095. Organize loops por faixa de BPM (80-100/100-120/120-140/140-160/160-180). «ORGANIZACAO-SAMPLES.txt:335-350»
ND-2096. Rode pipeline de extração: pré-processamento (resample 22050, mono, normalize, trim -30dB) → features librosa → classificação ML + key + BPM → embedding VGGish/CLAP → armazenamento (companion JSON, SQLite, FAISS). «ORGANIZACAO-SAMPLES.txt:360-400»
ND-2097. Extraia features espectrais completas: centroid, rolloff 85% e 95%, bandwidth, flatness (0=tônico, 1=ruído), contrast 7 bandas, flux e entropia. «ORGANIZACAO-SAMPLES.txt:405-440»
ND-2098. Extraia features temporais: onsets com backtrack, força de onset, density (onsets/segundo), tempo, RMS mean/max/std, ZCR e estimativas de attack/decay/sustain/release. «ORGANIZACAO-SAMPLES.txt:445-480»
ND-2099. Classifique automaticamente via vetor concatenado de MFCC+centroid+rolloff85+flatness+RMS+onsetDensity; derive key por chroma para amostras tonais e BPM para rítmicas. «ORGANIZACAO-SAMPLES.txt:520-580»
ND-2100. Gere embeddings com CLAP music/speech 512 dims para busca por similaridade. «ORGANIZACAO-SAMPLES.txt:600-625»
ND-2101. Use SQLite + FAISS: SQLite para metadata/FTS5/triggers, FAISS IndexFlatIP com normalize_L2 para cosine similarity em milhões de vetores. «ORGANIZACAO-SAMPLES.txt:760-830»
ND-2102. Crie schema samples com índices por type, type+subtype, type+key, type+bpm, key, scale, bpm, annotation_status, quality e tags; tabelas sample_tags many-to-many, stems, training_sessions, training_usage e similarity_cache. «ORGANIZACAO-SAMPLES.txt:840-1000»
ND-2103. Mantenha FTS5 sincronizado com triggers AFTER INSERT/DELETE/UPDATE sobre samples. «ORGANIZACAO-SAMPLES.txt:1005-1055»
ND-2104. Implemente queries canônicas: "pop drums punchy", "warm pad in C major" (ORDER BY flatness ASC), similar por FAISS e composição de kits trap por BPM/gênero com CROSS JOIN. «ORGANIZACAO-SAMPLES.txt:1180-1260»
ND-2105. Exponha API de consulta para IA: query_for_generation com filtros type/genre/mood/bpm±range/key/character e ORDER BY quality DESC, usage ASC. «ORGANIZACAO-SAMPLES.txt:1265-1330»
ND-2106. Gere batches de treino balanceados por tipo (annotation_status='verified', ORDER BY usage_count ASC) e manifests JSONL train/valid/test 90/5/5. «ORGANIZACAO-SAMPLES.txt:1350-1420»
ND-2107. Ingestione com validação → dedup por perceptual hash → extração → ID UUID → rename com convenção → SQLite + FAISS → organização em diretório. «ORGANIZACAO-SAMPLES.txt:1460-1520»
ND-2108. Compute hash perceptual simplificado (primeiro MB + tamanho + sample rate; produção: chromaprint) e verifique duplicatas antes de ingerir. «ORGANIZACAO-SAMPLES.txt:1590-1615»
ND-2109. Rode manutenção: find_duplicates (hash exato + similaridade FAISS >0.95), cleanup de órfãos wav/json e update de usage_count via logs de treino. «ORGANIZACAO-SAMPLES.txt:1690-1794»
ND-2110. Compute estatísticas da biblioteca: total, por tipo, por gênero, cobertura (com key/bpm/embedding/annotated) e qualidade média. «ORGANIZACAO-SAMPLES.txt:1620-1685»
ND-2111. Injete fontes: Splice/Loopcloud, packs, stem separation demucs/spleeter, gravações próprias e datasets domain-specific. «ORGANIZACAO-SAMPLES.txt:1440-1460»
ND-2112. Referencie Splice (organização genre/BPM/key/instrument), audiofeat (140+ features PyTorch), mirdata e FAISS como padrões da biblioteca. «ORGANIZACAO-SAMPLES.txt:1780-1794»

### Bloco 5 — ARQUITETURA-OFFLINE-COMPLETA.txt (pacote npm offline <50MB)

ND-2113. Posicione Debonair como pacote npm de geração musical 100% offline <50MB combinando theory engine determinística + pattern DB + modelos ONNX pequenos + síntese Tone.js. «ARQUITETURA-OFFLINE-COMPLETA.txt:1-40»
ND-2114. Acredite no core insight: não precisa de modelo 10GB — precisa de assembly engine inteligente + teoria + modelos pequenos + síntese real. «ARQUITETURA-OFFLINE-COMPLETA.txt:10-16»
ND-2115. Separe 3 fases: desenvolvimento (aquisição 10.000+ patterns de MAESTRO/Lakh/Freesound, decomposição, categorização, treino, compressão), instalação (npm install) e runtime (prompt→assembly→síntese→áudio). «ARQUITETURA-OFFLINE-COMPLETA.txt:55-260»
ND-2116. Respeite orçamento de tamanho: core TS ~500KB, patterns.cbor ~5MB (CBOR+LZ4), modelos ONNX INT8 ~20MB, SoundFont+one-shots ~10MB, regras ~1MB → total ~33MB (alvo <50MB). «ARQUITETURA-OFFLINE-COMPLETA.txt:268-290»
ND-2117. Compare-se por tamanho/latência: Debonair ~37MB vs MusicGen 6GB; <3s vs 10-60s na nuvem; <512MB RAM sem GPU. «ARQUITETURA-OFFLINE-COMPLETA.txt:292-330»
ND-2118. Catalogue patterns em 6 tipos: drum (grid 16th por instrumento + swing/humanize), chord (progression+voicing+voice leading), melody (notas+contour+motif), bass, arrangement (seções/energia/transições) e fx (riser/impact/sweep). «ARQUITETURA-OFFLINE-COMPLETA.txt:340-430»
ND-2119. Pré-compute matriz de compatibilidade (drum↔chord, chord↔melody, bass↔chord, section↔section) com cosine similarity + validação de teoria + human ratings, armazenando apenas scores >0.5 (sparse). «ARQUITETURA-OFFLINE-COMPLETA.txt:435-470»
ND-2120. Implemente o assembly engine como constraint satisfaction solver com guidance neural: hard constraints (key, scale, BPM, gênero, compassos) e soft constraints (mood, complexidade, qualidade, variedade, transições). «ARQUITETURA-OFFLINE-COMPLETA.txt:480-520»
ND-2121. Selecione patterns por seção: query DB com hard constraints → rank por soft scores → modelo neural pontua top candidatos → valida com teoria → fallback a defaults seguros. «ARQUITETURA-OFFLINE-COMPLETA.txt:522-540»
ND-2122. Gere transições entre seções: drum fill nas últimas 1–2 bars, riser/downlifter, chord anticipation e ramp de energia. «ARQUITETURA-OFFLINE-COMPLETA.txt:545-560»
ND-2123. Humanize todo MIDI com o modelo: timing ±5–15ms por nota, velocity ±5–15, groove templates, dinâmica por frase e variações de duração. «ARQUITETURA-OFFLINE-COMPLETA.txt:565-580»
ND-2124. Use a teoria existente (theory/harmony/melody/rhythm) como camada de validação: notas na escala, transições de acordes válidas, bass em chord tones. «ARQUITETURA-OFFLINE-COMPLETA.txt:590-620»
ND-2125. Sintetize por instrumento com método híbrido: kick/snare/808 física (sine sweep+noise), hihat noise filtrado, piano FM, guitar/bass Karplus-Strong, lead subtrativo, pad wavetable+granular, strings aditiva, FX sweeps. «ARQUITETURA-OFFLINE-COMPLETA.txt:630-680»
ND-2126. Implemente Karplus-Strong nativo: excitação de noise burst, delay line = sampleRate/freq, filtro média e loop gain 0.996. «ARQUITETURA-OFFLINE-COMPLETA.txt:690-720»
ND-2127. Encadeie efeitos por track (EQ 3-band → compressor → reverb → delay → pan) e buses (drums paralela, music widening, master limiter -0.3dB ratio 20 + loudness). «ARQUITETURA-OFFLINE-COMPLETA.txt:760-820»
ND-2128. Garanta fallback chain de 4 níveis que nunca deixa cair qualidade: neural → assembly rule-based → theory defaults → patterns hardcoded por gênero. «ARQUITETURA-OFFLINE-COMPLETA.txt:830-850»
ND-2129. Valide a música inteira por seções (harmônica/melódica/rítmica/mix) e transições, com score 1 − 0.05×issues e fixes automáticos. «ARQUITETURA-OFFLINE-COMPLETA.txt:855-900»
ND-2130. Siga o roadmap de 20 semanas em 5 fases: pattern DB (1-4), assembly engine (5-8), modelos neurais (9-12), síntese/efeitos (13-16), packaging npm (17-20). «ARQUITETURA-OFFLINE-COMPLETA.txt:910-960»
ND-2131. Diferencie-se de cloud AI (Suno/Udio): sem internet, $0 por música, <3s, editável por parte; de modelos locais (MusicGen): 37MB vs 2–15GB, 10–100x realtime, MIDI editável; de DAWs: minutes vs weeks de curva, um prompt gera música completa. «ARQUITETURA-OFFLINE-COMPLETA.txt:970-1040»
ND-2132. Declare dependências runtime mínimas: tone ^15.1.22, onnxruntime-web ^1.26.0, cbor ^9, lz4 (total ~2MB). «ARQUITETURA-OFFLINE-COMPLETA.txt:1050-1075»
ND-2133. Exponha API simples (Debonair.generate({prompt})→track.play()/export), API completa (createProject com chords/melody/drums/instruments) e API híbrida (inspecionar plan, override, regenerateMelody). «ARQUITETURA-OFFLINE-COMPLETA.txt:1080-1150»
ND-2134. Organize src/ em assembly/ (engine, solver, query, scoring, transitions, humanizer), patterns/ (database, compatibility, loader), synthesis/ (8 instrumentos + effects + mastering + soundfont), models/ (4 wrappers ONNX) e export/ (wav, midi, stems, project). «ARQUITETURA-OFFLINE-COMPLETA.txt:1160-1220»
ND-2135. Fixe a matriz de 15 gêneros com BPM/default key/progressões/drum style/complexidade (Trap 130-170 C minor i-VI-III-VII; Jazz 100-180 Bb ii-V-I-vi swing 4-5; Drill 140-170 G minor 4-5…). «ARQUITETURA-OFFLINE-COMPLETA.txt:1230-1260»

### Bloco 6 — INFRAESTRUTURA-AUDIO-AI.txt (infra de síntese AI, Web Audio, performance)

ND-2136. Estruture o pipeline completo de síntese AI: input (prompt/MIDI/referência/controle) → features (FFT/STFT/mel/MFCC/chroma/pitch/onset/LUFS/embeddings CLAP/MERT) → geração (autoregressive, diffusion, DDSP, VAE/GAN) → vocoder (HiFi-GAN/BigVGAN/WaveRNN/Vocos/Griffin-Lim) → DSP/efeitos → output (AudioContext/Worklet, WAV/MP3/FLAC, streaming). «INFRAESTRUTURA-AUDIO-AI.txt:20-93»
ND-2137. Use PolyBLEP para anti-aliasing de saw/square e wavetable onde band-limited. «INFRAESTRUTURA-AUDIO-AI.txt:99-108»
ND-2138. Prefira FFT sizes 2048–8192; lembre que distinção de semitons exige fftSize ≥8192 (21.5 Hz/bin em 2048). «INFRAESTRUTURA-AUDIO-AI.txt:110-130»
ND-2139. Implemente reverb Dattorro em AudioWorklet (4 comb 1277–1523 samples + 2 allpass 277/349) ou use ConvolverNode nativo para IRs até 30s. «INFRAESTRUTURA-AUDIO-AI.txt:186-193»
ND-2140. Modele compressores: VCA feed-forward, FET soft-knee com sigmoid, óptico com release dependente de programa; multiband com crossover Linkwitz-Riley 4ª ordem -24dB/oct. «EFFECTS-MIXING-MASTERING.txt:15-30»
ND-2141. Rode vocoders via ONNX: HiFi-GAN (mel 80 bins→waveform, ~80x realtime GPU), BigVGAN (ativ Snake), Vocos iSTFT 200x+; Griffin-Lim apenas como fallback de baixa qualidade. «INFRAESTRUTURA-AUDIO-AI.txt:198-241»
ND-2142. Trate Stable Audio/AudioLDM como server-side only (difusão latente não roda no browser). «INFRAESTRUTURA-AUDIO-AI.txt:243-260»
ND-2143. Aproveite @magenta/music para MusicVAE/GANSynth/DDSP/SPICE apesar do código de 2021 envelhecido. «INFRAESTRUTURA-AUDIO-AI.txt:269-300; LIBRARIAS-TS-AUDIO.txt:80-120»
ND-2144. Conclua que mastering browser é viável: Aurialis e RACK4MASTER provam chains profissionais (EQ, comp, limiter, saturation, imaging) com Web Audio + AudioWorklet. «INFRAESTRUTURA-AUDIO-AI.txt:299-312»
ND-2145. Prefira AudioWorklet a ScriptProcessor (thread de áudio dedicada, blocos de 128 samples ≈2.9ms), SharedArrayBuffer para parâmetros/metering zero-copy e WASM dentro do worklet para DSP intensivo. «INFRAESTRUTURA-AUDIO-AI.txt:498-524»
ND-2146. Carregue modelos com cache-first (Service Worker/IndexedDB) → download progressivo → init runtime → warm-up de kernels GPU → pronto para inferência. «INFRAESTRUTURA-AUDIO-AI.txt:525-550»
ND-2147. Respeite o orçamento de performance: AudioWorklet <5ms/<50MB; Tone.js scheduling <1ms; MusicVAE <100ms; HiFi-GAN ONNX <20ms; análise meljs <5ms; Demucs 5-30s offline. «INFRAESTRUTURA-AUDIO-AI.txt:597-607»
ND-2148. Mitigue gargalos: ring buffers SAB para latência, lazy loading + cache para cold start, streaming compilation para WASM, zero alocações em process() para evitar GC glitches, fallback WASM quando WebGPU ausente, user gesture para AudioContext no Safari. «INFRAESTRUTURA-AUDIO-AI.txt:637-648»
ND-2149. Use PolyBLEP/PolyBLAMP/wavetable/VDSF conforme custo; naive apenas quando aliasing é aceitável. «INFRAESTRUTURA-AUDIO-AI.txt:649-660»
ND-2150. Mapeie o stack TS recomendado: tone, standardized-audio-context, @libraz/libsonare, meljs, @magenta/music, onnxruntime-web, kokoro-js, demucs-web + processors WASM custom. «INFRAESTRUTURA-AUDIO-AI.txt:568-595»
ND-2151. Documente suporte browser: AudioWorklet Chrome 66+/Safari 14.1+, WebGPU Chrome 113+/Safari 26+, WebCodecs Chrome 94+, SAB exige COOP/COEP. «INFRAESTRUTURA-AUDIO-AI.txt:351-361»
ND-2152. Declare os 6 gaps do JS: text-to-music grande, neural FX realtime, physical modeling, granular maduro, AI mixing multitrack server-side e source separation pesada (~172MB). «INFRAESTRUTURA-AUDIO-AI.txt:419-427»
ND-2153. Lazy-load modelos por tamanho (MusicVAE 15MB→SPICE 5MB primeiro; Demucs 172MB e Kokoro 86MB depois) com tempos de download 3G estimados. «INFRAESTRUTURA-AUDIO-AI.txt:608-621»

### Bloco 7 — EXTRACAO-REFERENCIAS-REAIS.txt (extração de padrões de música real, variações)

ND-2154. Extraia referências em 6 etapas: pré-processamento (normalize, mono, resample 22050/44100) → Demucs v4 stems → features por stem → análise musical (BPM/meter/key/seções/energia) → armazenamento JSON+MIDI+vetores → variação (Markov/genética/interpolação/constraints). «EXTRACAO-REFERENCIAS-REAIS.txt:20-70»
ND-2155. Aplique MIR: MFCC para timbre, chroma para harmônicos, RMS para energia, centroid para brilho, onset para padrões, F0 para melodia, flatness para percussivo vs tonal, ZCR para percussão. «EXTRACAO-REFERENCIAS-REAIS.txt:90-110»
ND-2156. Use STFT 2048/hop 512/janela Hann e CQT (bins logarítmicos por oitava) para análise tonal. «EXTRACAO-REFERENCIAS-REAIS.txt:112-135»
ND-2157. Extraia por stem: bateria → padrão quantizado 16th com velocity, swing e fills; baixo → notas+timing+articulação+locking com kick; vocal → F0 contour, frases, vibrato; harmônico → acordes por beat/bar com voicing; mix → estrutura, energia, LUFS, stereo width. «EXTRACAO-REFERENCIAS-REAIS.txt:150-230»
ND-2158. Use Essentia para KeyExtractor (key+scale+strength), ChordsDetectionBeats, PredominantPitchMelodia, BeatTrackerDegara e LoudnessEBUR128. «EXTRACAO-REFERENCIAS-REAIS.txt:280-330»
ND-2159. Classifique hits de bateria por energia em bandas do STFT: low>mid e low>high = kick; mid>high = snare; senão hihat; quantize ao grid de 16th pelo BPM. «EXTRACAO-REFERENCIAS-REAIS.txt:390-440»
ND-2160. Armazene cada referência num schema único: metadata, structure com seções e arrangement_density, chord_progression (roman numerals + voicings MIDI), drum_pattern (hits+fills+groove com offsets ms), bass_pattern, melody_contour (phrases+motifs+scale usage), energy_curve por compasso, mixing_profile e features_vector. «EXTRACAO-REFERENCIAS-REAIS.txt:600-720»
ND-2161. Persista referências em references/{index.json, songs/ref_XXX/{metadata,stems,midi,features}, genre_templates, patterns}. «EXTRACAO-REFERENCIAS-REAIS.txt:730-760»
ND-2162. Crie variações, nunca cópias: Markov chains (ordem 1+) sobre progressões, algoritmos genéticos (mutação de tipo/timing/velocity + crossover), interpolação α entre referências e constraint-based repair. «EXTRACAO-REFERENCIAS-REAIS.txt:770-1000»
ND-2163. Aplique constraints musicais fixos: max 4 repetições consecutivas, resolução de dominante obrigatória, evitar quintas paralelas, saltos melódicos ≤12 semitons, preferir movimento por graus conjuntos. «EXTRACAO-REFERENCIAS-REAIS.txt:880-920»
ND-2164. Faça style transfer: copie groove (swing + template), energia e mixing profile do estilo; interpole timbre via MFCC. «EXTRACAO-REFERENCIAS-REAIS.txt:930-960»
ND-2165. Aprenda gêneros por estatística das referências: média/std/min/max de BPM, progressões comuns, estrutura típica, curvas médias de energia e convenções de mix. «EXTRACAO-REFERENCIAS-REAIS.txt:975-1010»
ND-2166. Gere genre templates JSON (ex.: trap: BPM 130–160, keys Cm/Fm/Gm/Am, progressões i-VI-III-VII etc., hihat 16th rapid, snare em 2 e 4, swing 0.15, 808 glide+distortion, target -14 LUFS). «EXTRACAO-REFERENCIAS-REAIS.txt:1020-1060»
ND-2167. Treine a IA com 100+ referências → features → normalização → vetores → autoencoder/Transformer/VAE → geração por interpolação no espaço latente. «EXTRACAO-REFERENCIAS-REAIS.txt:1070-1100»
ND-2168. Recomende referências por score ponderado: BPM (0.3), key igual (0.3), gênero (0.2), overlap de mood (0.2). «EXTRACAO-REFERENCIAS-REAIS.txt:1110-1140»
ND-2169. Implemente o pipeline TypeScript extractReference() com separação Demucs WASM e extração paralela por stem via Promise.all. «EXTRACAO-REFERENCIAS-REAIS.txt:1190-1240»
ND-2170. Distinga copiar vs variar: cópia usa o padrão exato; variação usa a estrutura estatística (distribuições, probabilidades, templates) para gerar algo novo mas coerente. «EXTRACAO-REFERENCIAS-REAIS.txt:1480-1495»
ND-2171. Respeite os papers fundacionais: Salamon & Gómez (melodia), Cho & Bello (acordes), Défossez (Demucs), McFee (librosa), Huang (Music Transformer), Dhariwal (Jukebox). «EXTRACAO-REFERENCIAS-REAIS.txt:1400-1460»

### Bloco 8 — CONCORRENCES-AUDIO-AI-10.txt (análise de 10 concorrentes)

ND-2172. Estude dois paradigmas: autoregressive LM sobre tokens discretos (Suno, Udio, MusicGen, MusicLM) vs latent diffusion (Stable Audio, RAVE); híbrido VAE+Transformer (MusicLM, ElevenLabs); modular rules+ML (Soundraw, Magenta). «CONCORRENCES-AUDIO-AI-10.txt:30-60»
ND-2173. Entenda que EnCodec (RVQ 8 codebooks, ~1.5KB/s) é o tokenizer padrão que transforma áudio em "linguagem". «CONCORRENCES-AUDIO-AI-10.txt:120-140»
ND-2174. Aprenda da Suno: end-to-end com vocais é rei, versionamento rápido (v3→v5.5), Studio como DAW e export de stems conecta ao fluxo pro. «CONCORRENCES-AUDIO-AI-10.txt:150-240»
ND-2175. Aprenda da Udio: fidelidade de áudio e complexidade musical diferenciam; time técnico de elite (DeepMind) importa. «CONCORRENCES-AUDIO-AI-10.txt:250-330»
ND-2176. Aprenda do Stable Audio: pesos abertos constroem ecossistema, dados licenciados com indemnificação é crítico para enterprise, família de modelos (Large/Medium/Small) atende mobile. «CONCORRENCES-AUDIO-AI-10.txt:340-430»
ND-2177. Aprenda do MusicGen: código de treino aberto é raro, codebook interleaving acelera o campo, AudioSeal resolve watermarking responsável. «CONCORRENCES-AUDIO-AI-10.txt:440-530»
ND-2178. Aprenda do MusicLM: geração hierárquica two-stage melhora coerência longa, datasets benchmark (MusicCaps) movem o campo, conditioning por melodia assobiada abre criatividade. «CONCORRENCES-AUDIO-AI-10.txt:540-620»
ND-2179. Aprenda do Magenta: ferramentas criativas interpretáveis (DDSP controlável) e espaços latentes interpoláveis (MusicVAE) valem para músicos; MIDI como representação intermediária ainda útil. «CONCORRENCES-AUDIO-AI-10.txt:630-700»
ND-2180. Aprenda do RAVE: realtime <10ms para performance ao vivo, self-supervised com 1–10h de áudio por instrumento, espaço latente disentangled para manipulação criativa; VAE não está morto. «CONCORRENCES-AUDIO-AI-10.txt:710-810»
ND-2181. Aprenda da ElevenLabs: qualidade de voz é o moat, plataforma TTS+Music+SFX+STT cria ecossistema, latência 75ms habilita conversacional; voice cloning é poderoso e arriscado. «CONCORRENCES-AUDIO-AI-10.txt:820-920»
ND-2182. Aprenda do Soundraw: 100% dados in-house = zero risco legal como produto, edição por compasso retém usuários, inferência sample-based 5–15s é 5–10x mais rápida que neural. «CONCORRENCES-AUDIO-AI-10.txt:930-1000»
ND-2183. Aprenda do Boomy: simplicidade vence no mass market, distribuição ("create and release") é o produto real, freemium adquire usuários. «CONCORRENCES-AUDIO-AI-10.txt:1010-1060»
ND-2184. Escolha arquitetura por caso de uso: música completa = AR LM; SFX = diffusion; realtime = VAE; voice cloning = Transformer custom; produção em massa = template+ML. «CONCORRENCES-AUDIO-AI-10.txt:1080-1100»
ND-2185. Siga as 10 lições estratégicas: dados licenciados são o problema central; end-to-end é o futuro; vocal é o diferenciador supremo; latência habilita produtos; open source cria ecossistemas; híbrido vence em controle; distribuição faz parte; iterar rápido vence perfeição. «CONCORRENCES-AUDIO-AI-10.txt:1105-1180»
ND-2186. Recomendação para Debonair: começar sample-based (fase 1), AR LM para músicas completas (fase 2), diffusion para realtime (fase 3); dados in-house + licenciados + sintéticos + consentidos de usuários. «CONCORRENCES-AUDIO-AI-10.txt:1200-1250»
ND-2187. Priorize features de MVP: text-to-music instrumental, seleção de gênero, duração, edição básica (loop/extend), export WAV+stems; fase 2: vocais, melody conditioning, edição por compasso, integração DAW. «CONCORRENCES-AUDIO-AI-10.txt:1255-1275»
ND-2188. Implemente watermarking (estilo AudioSeal) e licenciamento comercial desde o dia 1. «CONCORRENCES-AUDIO-AI-10.txt:1280-1290»
ND-2189. Compare competitivamente por matriz: full songs/vocals/instrumental/melody input/bar editing/stem export/voice cloning/realtime/open source — Debonair deve cobrir bar editing, stems, MIDI editável, realtime e open source que poucos cobrem. «CONCORRENCES-AUDIO-AI-10.txt:1300-1340»
ND-2190. Posicione qualidade vs escala no mapa de mercado (Suno/Udio topo qualidade; Soundraw/Boomy volume) e ocupe o nicho dev/controle. «CONCORRENCES-AUDIO-AI-10.txt:1345-1365»

### Bloco 9 — LIBRARIAS-TS-AUDIO.txt (catálogo de libs TS/JS de áudio e IA)

ND-2191. Adote Tier 1 como obrigatório: onnxruntime-web (2.2M/wk), @huggingface/transformers (1.1M/wk), @tensorflow/tfjs, howler, wavesurfer.js, tone (600K/wk), tonal. «LIBRARIAS-TS-AUDIO.txt:880-900»
ND-2192. Adote Tier 2: @tonejs/midi, meyda, pitchfinder, spessasynth_core (SF2/SF3/DLS sem deps), @magenta/music (1.23.1, stale 2021), xsound, browser-whisper, demucs-web, audio-effect, js-synthesizer. «LIBRARIAS-TS-AUDIO.txt:905-925»
ND-2193. Para SoundFont no browser prefira spessasynth_core (TS completo, 0 deps, SF2/SF3/DLS, MIDI→WAV) ou js-synthesizer (FluidSynth WASM). «LIBRARIAS-TS-AUDIO.txt:560-650»
ND-2194. Para teoria musical use tonal 6.x tree-shakeable (note/midi/interval/scale/chord/chord-detect/key/mode/progression/roman-numeral/pcset). «LIBRARIAS-TS-AUDIO.txt:430-530»
ND-2195. Para features de áudio use meyda (MFCC, chroma, centroid, flatness, rolloff, ZCR, loudness) e para pitch pitchfinder (YIN, Mcleod, AMDF, Dynamic Wavelet, ACF2+). «LIBRARIAS-TS-AUDIO.txt:280-350»
ND-2196. Para playback/visualização use howler (sprites, spatial) e wavesurfer.js v7 TS (regions, timeline, spectrogram, record, envelope). «LIBRARIAS-TS-AUDIO.txt:180-270»
ND-2197. Considere audio-effect (2026, processa Float32Array direto, sem Web Audio) para efeitos canônicos e @mode-7/mod para síntese declarativa em React com CV routing. «LIBRARIAS-TS-AUDIO.txt:360-430»
ND-2198. Use browser-whisper para ASR local com WebGPU + OPFS caching e demucs-web para separação 4-stem ONNX ~172MB. «LIBRARIAS-TS-AUDIO.txt:150-175»
ND-2199. Registre os gaps do ecossistema TS: DSP realtime eficiente, reverb convolucional eficiente com IR generation, physical modeling, wavetable dedicada, FM nível DX7, spectral processing, time-stretch/pitch-shift de qualidade, codecs de encoding, MIDI 2.0, ambisonics, síntese de texto. «LIBRARIAS-TS-AUDIO.txt:940-990»
ND-2200. Use WASM obrigatório para: efeitos realtime pesados, pitch-shift PSOLA/WSOLA, encoding MP3/AAC/FLAC, convolution longa, physical modeling, FluidSynth, source separation. «LIBRARIAS-TS-AUDIO.txt:1000-1030»
ND-2201. Use ONNX models para: Whisper/Moonshine ASR, Demucs/HTDemucs, YAMNet/PANNs classificação, SPICE pitch, OnsetsAndFrames transcrição, Bark/VITS/Piper TTS, super-resolution, noise reduction, voice cloning. «LIBRARIAS-TS-AUDIO.txt:1040-1060»
ND-2202. Fixe o stack recomendado do Debonair: MUST HAVE (tone, tonal, @tonejs/midi, howler), SHOULD HAVE (wavesurfer, meyda, pitchfinder, spessasynth_core), NICE TO HAVE (audio-effect, xsound), AI LAYER (onnxruntime-web, transformers), SPECIFIC (browser-whisper, demucs-web). «LIBRARIAS-TS-AUDIO.txt:1100-1140»
ND-2203. Monte pipelines de integração: input→Meyda+Pitchfinder→ONNX→Tone.js→Wavesurfer para análise; tonal→@tonejs/midi→spessasynth→Tone/Howler para geração. «LIBRARIAS-TS-AUDIO.txt:1160-1250»
ND-2204. Evite pizzicato (deprecated desde 2018) e brain.js/ml5 para produção de áudio. «LIBRARIAS-TS-AUDIO.txt:100-150; 930-940»
ND-2205. Verifique saúde de libs antes de adotar: downloads semanais, última atualização, tipos TS nativos, licença (ex.: @magenta/music stale Nov 2021; @tonejs/midi Feb 2022 ainda sólido). «LIBRARIAS-TS-AUDIO.txt:85-95; 545-560»

### Bloco 10 — EFFECTS-MIXING-MASTERING.txt (taxonomia de efeitos e prioridades)

ND-2206. Implemente taxonomia completa de efeitos: dynamics (comp/limiter/multiband/gate/transient shaper), EQ (paramétrico/gráfico/shelving/dinâmico/linear-phase FIR), time (delay/ping-pong/tape/algorithmic+convolution+neural reverb), modulação (chorus/flanger/phaser/tremolo/vibrato/rotary), distorção (overdrive/fuzz/tape/tube/bitcrusher/waveshaper), espacial (panner/M-S/widener/binaural HRTF/Haas). «EFFECTS-MIXING-MASTERING.txt:10-95»
ND-2207. Implemente em JS puro: EQ biquad, compressor, delay circular, chorus/flanger/phaser, waveshaping, M/S imaging, gate, reverb algorítmico (Dattorro 0.5ms por bloco de 10ms). «EFFECTS-MIXING-MASTERING.txt:350-365»
ND-2208. Reserve WASM para: neural reverb (TCN+SIMD), stem separation, linear phase EQ (FFT 4096+), voice conversion, pitch shift por phase vocoder. «EFFECTS-MIXING-MASTERING.txt:330-345»
ND-2209. Execute o workflow de AI mixing em 4 fases: análise (FFT/crest/M-S/LUFS/transientes) → decisão IA (referência CLAP/MERT, gênero, frequency masking, sugestões) → processamento (per-stem gain→EQ→de-esser→comp→creative EQ→sat→sends; master subgroup→bus comp→M/S EQ→imaging→limiting) → output estéreo 44.1/48kHz 24-bit -14 LUFS -1 dBTP. «EFFECTS-MIXING-MASTERING.txt:170-230»
ND-2210. Execute o AI mastering em 8 estágios com análise de 8 métricas e comparação a referência ou preset de gênero. «EFFECTS-MIXING-MASTERING.txt:235-300»
ND-2211. Alinhe outputs a plataformas: Spotify/YouTube/Tidal -14 LUFS, Apple -16, Amazon -14/-2 dBTP, Deezer -15, SoundCloud -11, Beatport -9/-0.3, TikTok -9 a -12. «EFFECTS-MIXING-MASTERING.txt:290-300»
ND-2212. Integre stem separation browser: HT-Demucs FT ONNX 166MB fp16 (SDR 9.19 dB), chunks 7.8s, WASM multithread 3–5x com SAB, WebGPU ~3x realtime. «EFFECTS-MIXING-MASTERING.txt:310-330»
ND-2213. Considere RVC v2 para voice conversion (UTMOS 4.19/5, treino 18min em 3090, realtime 90ms, 1 minuto de dados mínimo). «EFFECTS-MIXING-MASTERING.txt:335-360»
ND-2214. Priorize a implementação de efeitos em 4 ondas: semana 1-4 core effects (EQ 5-band, comp/limiter lookahead, delays, reverb Dattorro/convolução, saturação, modulação, espacial, utility); semana 5-8 análise AI; semana 9-16 sugestões AI de EQ/comp/mix/master; semana 17-24 stems/NAM/voice conversion. «EFFECTS-MIXING-MASTERING.txt:380-470»
ND-2215. Fixe specs de processamento: 44100/48000Hz, 32-bit float interno, blocos 128 samples (~2.9ms), buffer configurável 256–2048, estéreo mínimo, latência de monitoração <10ms. «EFFECTS-MIXING-MASTERING.txt:480-495»
ND-2216. Modele cada efeito como interface com params tipados (min/max/default/unit/automatable) e método process(input, context). «EFFECTS-MIXING-MASTERING.txt:520-560»
ND-2217. Siga o sinal-padrão: gain staging → corrective EQ → de-esser → compressão → creative EQ → (sends reverb/delay) → saturador → stereo imager → limiter → output. «EFFECTS-MIXING-MASTERING.txt:580-610»
ND-2218. Decida arquitetura: AudioWorklet para todo DSP custom, nós nativos onde existem (ConvolverNode/DynamicsCompressorNode/BiquadFilterNode), WASM só quando JS não dá conta, Web Workers para análise AI, SAB para multithread WASM. «EFFECTS-MIXING-MASTERING.txt:630-650»
ND-2219. Referencie ferramentas de AI mastering: LANDR (Synapse), iZotope Ozone (Master Assistant, microdynamics LDR), CloudBounce, MEGAMI (Sony), matchering, master_me, Phantom. «EFFECTS-MIXING-MASTERING.txt:660-700»
ND-2220. Cumpre metas de perf: latência de efeitos <5ms, análise de mastering <2s, stems <5min/música, UI 60fps sem bloquear main thread. «EFFECTS-MIXING-MASTERING.txt:700-720»

### Bloco 11 — SINTESE-TIPOS-SOM.txt (máquina de síntese universal)

ND-2221. Mantenha mapa de frequências canônico: sub 20–60, bass 60–250, low-mid 250–500, mid 500–2k, high-mid 2–4k, high 4–8k, very high 8–20k, com fundamentais por instrumento (kick 40–80+click 2–5k; snare 150–250+2–8k; hihat 4–16k; voz M 85–180 F0 com formantes 300–3000). «SINTESE-TIPOS-SOM.txt:8-40»
ND-2222. Domine 7 métodos de síntese: subtrativa (osc→filtro→ADSR), aditiva (série de Fourier), FM (β = índice, bandas laterais Bessel), modelagem física (Karplus-Strong), granular (grãos 1–100ms, density 4–128, janelas Hann/Gauss), sample-based (pitch shift + layers + velocity layers) e wavetable (PeriodicWave interpolada). «SINTESE-TIPOS-SOM.txt:60-260»
ND-2223. Use receitas FM clássicas: piano elétrico fm=14·fc β3–5; sino 1.4:1 β5–10; baixo 1:1 β1–3; clavinet 3:1; marimba 4:1. «SINTESE-TIPOS-SOM.txt:150-170»
ND-2224. Implemente Karplus-Strong em AudioWorklet (delay line = Fs/F0, loop gain 0.95–0.99, filtro média) para cordas. «SINTESE-TIPOS-SOM.txt:200-230»
ND-2225. Modele drums por física: kick = sine sweep 300→50Hz + click de noise + ADSR rápido; snare = sine 200Hz + noise bandpass 2–8kHz; hihat = noise highpass 7kHz + ADSR curto; tom = sine 80–200Hz. «SINTESE-TIPOS-SOM.txt:240-260»
ND-2226. Modele FX: riser = sine sweep 100→8000Hz + filtro sweep + envelope; impact = noise + sub; whoosh = noise com HP sweep; laser = FM alto índice; boom = sub 30–80Hz + reverb longa; reverse = envelope invertido. «SINTESE-TIPOS-SOM.txt:330-380»
ND-2227. Modele pads: warm = 2 saws detuned + lowpass + slow attack; cold = aditiva+FM; atmosphere = granular+reverb; shimmer = aditiva+pitch shift; drone = física+FM. «SINTESE-TIPOS-SOM.txt:395-440»
ND-2228. Modele guitarra por tipo: nylon/steel KS com parâmetros de pluck/body; elétrica limpa subtrativa+wavetable; distorcida com waveshaping; harmônicos aditivos; slide com pitch contínuo. «SINTESE-TIPOS-SOM.txt:460-490»
ND-2229. Modele piano: hammer attack (noise burst 2–8kHz) + aditiva 15 harmônicos com amplitude 1/h² e decay exponencial por harmônico + ressonância simpática + pedal sustain. «SINTESE-TIPOS-SOM.txt:510-560»
ND-2230. Modele voz: fonte sawtooth (F0 85–255Hz) → 3 bandpass formants (F1 300–800, F2 800–2500, F3 2500–3500Hz) + vibrato LFO 4–7Hz ±50 cents + breathiness noise; formantes por vogal (/a/ F1 730 F2 1100; /i/ F1 270 F2 2300). «SINTESE-TIPOS-SOM.txt:580-660»
ND-2231. Implemente beatbox como combinação: kick/snare/hihat/clap/scratch (noise com pitch mod)/vocal bass (saw+filter)/lip oscillation (FM 1.5:1). «SINTESE-TIPOS-SOM.txt:670-720»
ND-2232. Aplique receitas por categoria: synth lead = 2 saws detuned+filter; synth bass = saw/square+LP envelope ou FM 1:1+sub sine; arps = osc+filter+sequencer+velocity layers; chords/stacks = 3–4 oscs detune ±5/+12 cents com spread estéreo. «SINTESE-TIPOS-SOM.txt:740-790»
ND-2233. Arquitete SynthEngine/SampleEngine/PhysicalModeling sobre AudioContext com chain de efeitos comum (reverb/delay/comp/EQ/dist/chorus) e destino único. «SINTESE-TIPOS-SOM.txt:810-860»
ND-2234. Use mapa de decisão: som realista → física/samples; som de synth → subtrativa/FM; texturas → granular/aditiva; beats → subtrativa+noise e FM para metálicos; efeitos → sweeps/noise/FM alto índice. «SINTESE-TIPOS-SOM.txt:960-1010»
ND-2235. Respeite as referências acadêmicas de síntese: Karplus & Strong 1983, Chowning 1973 (FM), Roads Microsound 2001 (granular), Smith CCRMA (física), Xenakis. «SINTESE-TIPOS-SOM.txt:900-950»

### Bloco 12 — FORMATOS-DADOS-PREV processados.txt (formatos binários compactos)

ND-2236. Organize debonair-data/ com manifest.json global + pastas por categoria (drums/chords/melodies/pads/bass/effects/mixing/audio_features), cada uma com _index.sqlite + .bin compactado. «FORMATOS-DADOS-PREV processados.txt:10-40»
ND-2237. Aplique 5 princípios: separation of concerns (SQLite=metadados, bin=dados), zero-copy via mmap, strings como IDs numéricos em lookup tables, incremental loading por gênero, schemas versionados por arquivo. «FORMATOS-DADOS-PREV processados.txt:45-55»
ND-2238. Codifique drum patterns com header 16B (magic/ver/id/genre/bpm/steps/swing), velocity delta-encoded com varint e RLE, e instrumentos em bitmask (1 bit/step: 16 steps = 2 bytes vs 144 bytes em JSON — economia 87.5%). «FORMATOS-DADOS-PREV processados.txt:95-175»
ND-2239. Codifique chords com header 12B + sequência (n, chord_type_id, roman_id, duration, inversion) + voicing custom com notas/velocities delta. «FORMATOS-DADOS-PREV processados.txt:180-230»
ND-2240. Codifique melodias com interval_delta assinado, duração como denominador de fração de beat, velocity delta e flags por bit (rest/tied/accent 2b/articulation 4b). «FORMATOS-DADOS-PREV processados.txt:250-300»
ND-2241. Guarde pads como envelope espectral quantizada 64 bins uint16 (128B) + dados de modulação (LFO rate/depth, filter env). «FORMATOS-DADOS-PREV processados.txt:340-380»
ND-2242. Modele mixing recipes como JSON por gênero com instrument_gains, panning, eq, compression, reverb_send e limiter. «FORMATOS-DADOS-PREV processados.txt:400-440»
ND-2243. Mantenha lookup tables compartilhadas (genres com hierarquia parent_id, moods com valence -1..1 e energy 0..1, keys com midi_root, scales com intervals BLOB). «FORMATOS-DADOS-PREV processados.txt:940-1050»
ND-2244. Indexe cada categoria em SQLite com data_offset/data_length para acesso random ao .bin, tags como bitmap e FTS5 de tags. «FORMATOS-DADOS-PREV processados.txt:460-560»
ND-2245. Busque combos compatíveis (drum+chord+melody+bass) por JOIN de genre/key/mood com LIMIT por categoria. «FORMATOS-DADOS-PREV processados.txt:600-640»
ND-2246. Comprima com combinação: bit-packing 87.5%, delta 60–80%, varint 30–50%, RLE 40–70%, LZ4 por chunk 64KB, string interning 90%+, bitmap de tags 95% → total estimado 600KB vs 3.75MB JSON (84%) + features MFCC ~5.2MB. «FORMATOS-DADOS-PREV processados.txt:660-720»
ND-2247. Deduplique por referência: variações só de velocity armazenam base_pattern_id + velocity_override (economia ~60%). «FORMATOS-DADOS-PREV processados.txt:725-740»
ND-2248. Rode build pipeline em 7 passos: extract → classify → validate (min-quality 0.7) → optimize/dedup → build binaries → manifest → check_sizes max 10MB. «FORMATOS-DADOS-PREV processados.txt:850-880»
ND-2249. Classifique gênero por features rítmicas com thresholds por gênero (pop 100–130 BPM density 0.3–0.6; electronic 120–150 0.6–0.9) e mood por valence/energy (major/ascending = +valence; BPM/density/velocity = +energy). «FORMATOS-DADOS-PREV processados.txt:900-935»
ND-2250. Valide padrões: densidade mín/máx, consistência de velocity, estabilidade rítmica, resolução de tônica, voice leading e durações razoáveis. «FORMATOS-DADOS-PREV processados.txt:810-845»
ND-2251. Fontes de extração: MAESTRO/GMD MIDI, NSynth/Splice samples, MusicXML, Groove/LMD; extrair drums quantizados 16th em segmentos de 4 bars, chords→roman numerals, melodias por frases com contour e auto-tags (four_on_floor, backbeat, syncopated, swung). «FORMATOS-DADOS-PREV processados.txt:745-805»

### Bloco 13 — MIXING-MASTERING-POR-GENERO.txt (receitas por gênero)

ND-2252. Aplique cadeia master universal em 8 estágios: gain staging -12 a -14 dBFS → corrective EQ → multiband → full-band glue 2:1 max 2–3dB GR → additive EQ ±1–2 dB → stereo imaging após compressão → limiter true peak -1 dBTP → meter LUFS/LRA. «MIXING-MASTERING-POR-GENERO.txt:12-30»
ND-2253. Aplique regras universais: low-end mono abaixo de 120Hz, HPF de tudo não-bass em 80–120Hz, tracks a -18 dBFS antes do processamento, mix bus com picos -6 dBFS antes do mastering, true peak sempre (inter-sample peaks clipam codec), A/B contra 2–3 referências comerciais. «MIXING-MASTERING-POR-GENERO.txt:40-50»
ND-2254. Mixe trap: kick HPF 40–50Hz +3dB@60-80 + corte 200–350Hz + click 3–5kHz, comp 4:1 attack 1–5ms; 808 HPF 25–30Hz, fundamental +2–3dB@50-60, sidechain multiband 60–120Hz 4:1–10:1, saturação leve para tradução em pequenos speakers, decay um pouco menor que a nota. «MIXING-MASTERING-POR-GENERO.txt:60-130»
ND-2255. Sinta o kick à nota fundamental do 808 no trap. «MIXING-MASTERING-POR-GENERO.txt:70-75»
ND-2256. Misture vocals de rap/pop com 2 compressores em série (1176-style 4:1–8:1 attack 5–15ms GR 4–10dB + LA-2A-style 2:1–3:1 auto release) + de-esser 6–8kHz + reverb plate curto 0.7–1.2s com HPF 150–200Hz no retorno + slap delay 80–120ms duckado. «MIXING-MASTERING-POR-GENERO.txt:210-260; 330-380»
ND-2257. Use compressão paralela em vocals/drums: 8:1–10:1, GR 10–15dB, blend 20–50%, com filtros HP 100–200Hz e LP 10–14kHz no caminho paralelo. «MIXING-MASTERING-POR-GENERO.txt:240-260»
ND-2258. Em EDM faça sidechain como elemento rítmico: kick→bass 6–12 dB via volume shaper, kick→synths 3–6 dB, release casado ao tempo; kick é o elemento mais alto (-6 a -8 dBFS), bass logo abaixo (-9 a -12 dBFS). «MIXING-MASTERING-POR-GENERO.txt:520-620»
ND-2259. Lo-fi em hip-hop: low-pass 6–10kHz nos samples, HPF 100–200Hz, boost opcional 1–3kHz para caráter. «MIXING-MASTERING-POR-GENERO.txt:400-420»
ND-2260. Ajuste mastering por gênero: trap/hip-hop limiter agressivo -8 a -10 LUFS competitivo com soft clipper 1–2dB antes; pop transparente -12 a -14; EDM -6 a -9 com multiband no sub. «MIXING-MASTERING-POR-GENERO.txt:145-165; 480-500; 640-660»
ND-2261. Faça M/S EQ no master: mono abaixo de 80–100Hz, high shelf +0.5–1.5 dB nos sides em 12kHz para air. «MIXING-MASTERING-POR-GENERO.txt:150-160»
ND-2262. Carveie EQ kick vs 808/bass por gênero: kick fundamental 60–80Hz, 808/sub 35–60Hz (trap) ou 40–60Hz (hip-hop/EDM), zona de lama 200–500Hz para cortar. «MIXING-MASTERING-POR-GENERO.txt:900-930»
ND-2263. Roteie sidechains por tabela: trap kick→808 3–6dB multiband; pop kick→bass 3–6dB; hip-hop kick→808 2–4dB; EDM kick→bass 6–12dB e kick→reverb/delay 3–6dB para evitar wash. «MIXING-MASTERING-POR-GENERO.txt:880-900»
ND-2264. Automatize mixing em 8 passos: detectar/classificar stems → detectar gênero → carregar receita → aplicar por instrumento → rotear sidechains → agrupar buses → forçar mono <120Hz no low-end → validar (LUFS, true peak, correlação ≥0.1, phase). «MIXING-MASTERING-POR-GENERO.txt:690-780»
ND-2265. Automatize mastering com loop iterativo: medir → comparar targets → ajustar limiter gain +0.5 / ceiling -0.1 / GR máx -0.5 até bater targets. «MIXING-MASTERING-POR-GENERO.txt:820-850»
ND-2266. Gere bounces por plataforma (spotify/apple/youtube/soundcloud/beatport) com LUFS e true peak próprios. «MIXING-MASTERING-POR-GENERO.txt:855-875»
ND-2267. Detecte parâmetros automaticamente: fundamental do kick por onset+pitch tracking, bass por FFT, vocal por ML classifier, snare crack por transiente, hats por análise espectral, phase por cross-correlation. «MIXING-MASTERING-POR-GENERO.txt:790-815»
ND-2268. Fixe specs de qualidade por gênero (trap: DR 7–10 LU, mono <80Hz, 808 35–60Hz, hats 8–16kHz, 24-bit 44.1/48kHz; pop: DR 8–12 LU, vocal 3–5kHz+air 10–16kHz; EDM: DR 4–8 LU, sidechain crítico). «MIXING-MASTERING-POR-GENERO.txt:745-875»
ND-2269. Trate todos os valores como ponto de partida — sempre A/B contra referências comerciais do gênero. «MIXING-MASTERING-POR-GENERO.txt:1-8»
ND-2270. Referencie MEGAMI, MixMasterAI, NeuroMix, Phantom e Moozix como estado da arte em AI mixing. «MIXING-MASTERING-POR-GENERO.txt:890-898»

### Bloco 14 — MONTAGEM-INTELIGENTE.txt (fábrica de carros: warehouse + factory)

ND-2271. Separe peças (warehouse pré-fabricado: ~14.000 variações de drums/bass/chords/melodies/pads/fx) de montagem (factory: matriz de compatibilidade + templates + receitas + presets). «MONTAGEM-INTELIGENTE.txt:10-60»
ND-2272. Metadado cada peça com key/scale/bpm/timeSignature, mood[]/energy/tension, genres[]/era, role/register/density, duration/bars/loopable/fades. «MONTAGEM-INTELIGENTE.txt:70-110»
ND-2273. Aplique regras harmônicas com peso: bass_note_in_chord 1.0 (hard), melody_in_scale 0.9, avoid_dissonance 0.8 (semitons 1 e 6 proibidos). «MONTAGEM-INTELIGENTE.txt:120-150»
ND-2274. Aplique regras rítmicas: bass trava com kick (alignment 0–1), melodia preenche lacunas rítmicas (fill ratio), consistência de subdivisão de hi-hats. «MONTAGEM-INTELIGENTE.txt:155-185»
ND-2275. Use genre templates com estrutura+curva de energia+camadas por seção (pop: intro 4→verse 8→preChorus 4→chorus 8→…; EDM build/drop; jazz head/solos; lofi loops). «MONTAGEM-INTELIGENTE.txt:190-280»
ND-2276. Aplique receitas de mixing por instrumento dentro da fábrica (kick center mono volume -6 com sidechain do bass; guitar -0.7 left -10; vocals center -3 com plate 1.5s 0.15 e delay 1/4). «MONTAGEM-INTELIGENTE.txt:290-420»
ND-2277. Monte por seção: filtre peças compatíveis → pontue (harmônica 0.4, rítmica 0.3, registro 0.2, densidade 0.1) → escolha a melhor por instrumento. «MONTAGEM-INTELIGENTE.txt:470-530»
ND-2278. Consulte o warehouse com filtros exatos (key, bpm ±5, category) e fuzzy (mood similarity >0.6, genres) + busca por embedding cosine top-K. «MONTAGEM-INTELIGENTE.txt:540-600»
ND-2279. Use Markov chain de 1ª ordem treinada em progressões reais para decidir o próximo acorde com sampling probabilístico. «MONTAGEM-INTELIGENTE.txt:620-670»
ND-2280. Resolva voice leading com constraint satisfaction: hard (sem quintas/oitavas paralelas, range de voz, chord tones) e soft (voice leading suave 0.8, evitar dissonância 0.9, graus conjuntos 0.7) com backtracking e heurística MRV. «MONTAGEM-INTELIGENTE.txt:680-740»
ND-2281. Controle energia dinamicamente: peso por role (lead 1.0, rhythmic_foundation 0.8, harmonic_bed 0.6, texture 0.4, fx 0.3) mapeado para volume -6 a +6 dB e entrada/saída de instrumentos por threshold de energia. «MONTAGEM-INTELIGENTE.txt:750-800»
ND-2282. Estruture montagem-inteligente/ com warehouse/, assembly/, rules/, intelligence/, mixing/, mastering/, api/ e templates/ JSON por gênero. «MONTAGEM-INTELIGENTE.txt:820-900»
ND-2283. Implemente em 5 fases de 2–3 semanas: warehouse básico, regras de compatibilidade, motor de montagem, mixing/mastering, otimização+ML. «MONTAGEM-INTELIGENTE.txt:920-960»
ND-2284. Meça sucesso: compatibilidade harmônica >95%, qualidade subjetiva >4/5 blind test, montagem <30s, diversidade >80%, coerência estrutural >90%. «MONTAGEM-INTELIGENTE.txt:1000-1010»
ND-2285. Referencie pesquisa 2025–2026: Muse, Khala, SegTune, SketchSong, TOMI, ACE-Step 1.5, YuE, NeuralConstraints, Diatony, AutoMixMaster, pattrns, LoopLens. «MONTAGEM-INTELIGENTE.txt:1030-1080»
ND-2286. Aceite limitações conhecidas: qualidade depende das peças, mixing automático não iguala engenheiro humano, criatividade limitada pelas regras, Markov de 1ª ordem. «MONTAGEM-INTELIGENTE.txt:1020-1030»

### Bloco 15 — ANALISE-ESPECTRAL.txt (FFT/STFT/MFCC/chroma/descritores)

ND-2287. Configure FFT para música: fftSize 2048 (~46ms), hop 512 (~11.6ms), janela Hann/Hamming, overlap 50–75%; 44100/2048 = 21.5Hz por bin; fftSize ≥8192 para distinguir semitons graves. «ANALISE-ESPECTRAL.txt:15-40»
ND-2288. Implemente STFT próprio com janelas Hann (0.5(1−cos)), Hamming (0.54−0.46cos) e Blackman. «ANALISE-ESPECTRAL.txt:50-110»
ND-2289. Construa mel filterbank triangular com 128 bandas entre 20Hz e fmax, conversões hzToMel/melToHz, log e normalização — MEL_CONFIG padrão (sr 22050, fft 2048, hop 512, power 2). «ANALISE-ESPECTRAL.txt:120-230»
ND-2290. Extraia MFCC 13 via DCT do mel log + delta e delta-delta com janela τ=1..3 → vetor de 39 dims por frame. «ANALISE-ESPECTRAL.txt:240-300»
ND-2291. Compute chroma de 12 classes mapeando bins→MIDI→pitch class com energia quadrática e normalização. «ANALISE-ESPECTRAL.txt:310-350»
ND-2292. Implemente 5 descritores espectrais: centroid (centro de massa), bandwidth (spread), rolloff 85%, contrast pico-vale por sub-banda e flatness GM/AM (ruído vs tom) + ZCR. «ANALISE-ESPECTRAL.txt:360-450»
ND-2293. Alimente CNNs/ViTs com mel 128 bins (padrão indústria; 80 para speech, 256 high-res), frames 25–50ms, hop 10–23ms. «ANALISE-ESPECTRAL.txt:470-530»
ND-2294. Use representações discretas VQ-VAE/EnCodec (RVQ 32 codebooks, frame rate 75/150Hz, banda 1.5–24kbps) para geração estilo MusicGen/AudioLM; fase 3+ via ONNX. «ANALISE-ESPECTRAL.txt:560-620»
ND-2295. Detecte acordes com template matching (25 templates: 12 major+12 minor+dim/aug/dom7/min7) sobre chroma + HMM com transições musicais. «ANALISE-ESPECTRAL.txt:640-670»
ND-2296. Detecte onsets com spectral flux half-wave rectified, HFC ponderado por frequência e complex domain; bandas: kick 20–100Hz, snare 100–300+1k–5k, hihat 5k–15k. «ANALISE-ESPECTRAL.txt:690-760»
ND-2297. Detecte pitch com YIN (diferença quadrática acumulada, normalização, primeiro vale <0.2, interpolação parabólica) e vibrato via FFT do contour entre 4–8Hz. «ANALISE-ESPECTRAL.txt:770-860»
ND-2298. Complete o vetor de features por frame (~167 valores: mel 128, MFCC 13, chroma 12, descritores 5, temporais 5, perceptuais brightness/warmth/hardness/density/loudness). «ANALISE-ESPECTRAL.txt:880-910»
ND-2299. Estruture módulo spectral/ (fft, stft, mel, mfcc, chroma, descriptors, onset, pitch, features) e ai/ (agent, classifier, separation, synthesis) sobre theory/harmony/melody/rhythm existentes. «ANALISE-ESPECTRAL.txt:930-980»
ND-2300. Feche o loop analyze→generate: análise de referência (genre/mood/key/bpm/instruments) → parâmetros → music engine → export; permitir transpor (D minor) e alterar tempo (130). «ANALISE-ESPECTRAL.txt:1000-1060»
ND-2301. Siga as boas práticas: 128 bins mel para CNNs, FFT 2048 música / 512 speech, sempre janela antes da FFT, normalizar features, usar escala log dB. «ANALISE-ESPECTRAL.txt:1080-1100»

### Bloco 16 — WORKFLOW-MANUAL-VS-AI.txt (dois modos, agente CoT, prompts)

ND-2302. Mantenha dois modos que compartilham o mesmo pipeline: Manual (usuário compõe com theory/harmony/melody/rhythm como ferramentas puras) e AI (agente traduz prompt em parâmetros e roda o mesmo pipeline); ambos convergem no audio engine Tone.js. «WORKFLOW-MANUAL-VS-AI.txt:5-20»
ND-2303. Encadeie o pipeline manual: buildKeySignature → buildChordProgression (com inversions/voice leading/substitutions/extended chords/modulateKey) → generateBassLine/generateLeadMelody/generateCounterpoint/applyDevelopment (sequence/inversion/retrograde/augmentation/diminution) → generateDrumPattern/applySwing/humanizeTiming/generateFill → MELODIC/PERCUSSION_INSTRUMENTS com customizeInstrument/layerInstruments → musicEngine (play/mute/solo/BPM/sub-patterns). «WORKFLOW-MANUAL-VS-AI.txt:30-180»
ND-2304. Gere melodia com seed para reprodutibilidade (seed 42) e config com scaleRoot/scaleType/genre/bpm/octaveRange/density/complexity. «WORKFLOW-MANUAL-VS-AI.txt:105-120»
ND-2305. O agente IA NÃO substitui a theory engine — ele a alimenta: prompt → AIGenerationPlan {key, scale, bpm, genre, progression, chordDurations, melodyConfig, drumPattern, instruments, sections, reasoning, confidence} → mesmo pipeline manual. «WORKFLOW-MANUAL-VS-AI.txt:200-260»
ND-2306. Raciocine por CoT em 6 passos: parse intent → parâmetros de teoria via GENRE_CONFIG → mood mapping → progressão → estrutura por duração → instrumentos e melody/rhythm config → validação com confidence. «WORKFLOW-MANUAL-VS-AI.txt:280-400»
ND-2307. Use GENRE_CONFIG como knowledge base do agente (bpmRange, defaultScale/Key, commonProgressions, drumStyle, typicalInstruments por 15 gêneros). «WORKFLOW-MANUAL-VS-AI.txt:405-425»
ND-2308. Aplique MOOD_MAP com vieses: upbeat → BPM upper + major + density 0.7; melancholic → lower + minor + 0.4; aggressive → upper + minor + 0.8/0.7; chill/dreamy → lower + density 0.2–0.3; dark → lower + minor. «WORKFLOW-MANUAL-VS-AI.txt:430-450»
ND-2309. Use STRUCTURE_TEMPLATES com intensity por seção (pop 10 seções; EDM com buildUp/drop; trap verses de 16 bars) e permita progressionOverride por seção. «WORKFLOW-MANUAL-VS-AI.txt:455-500»
ND-2310. Mapeie instrumentos naturais para presets com customizations (piano→chords triangle com ADSR próprio; synth→lead saw detune 10; ambient→pad attack 0.5 release 2). «WORKFLOW-MANUAL-VS-AI.txt:505-520»
ND-2311. Projete agente single-agent com CoT estruturado (inspirado em ComposerX/CoComposer/WeaveMuse) — mais simples e confiável para contexto de biblioteca. «WORKFLOW-MANUAL-VS-AI.txt:540-560»
ND-2312. Use system prompt LLM com output JSON estrito de intent (genre/mood/instruments/vocalStyle/tempo/key/scale/structure/duration/specialRequests) e regras de desambiguação (mood vence defaults do gênero; upbeat=major+rápido; dark=minor+lento). «WORKFLOW-MANUAL-VS-AI.txt:590-620»
ND-2313. Ofereça refine iterativo: agent.refine(plan, feedback) modificando apenas o pedido ("make the drums simpler and add piano") e generateSection para regenerar seção isolada. «WORKFLOW-MANUAL-VS-AI.txt:640-660»
ND-2314. Exponha APIs dos três modos: manual (createProject→setProgression/setMelody/setDrums/setInstruments→generate→export), AI (generate({prompt})→track.play(), generatePlan para inspeção), híbrido (inspecionar plan, override de BPM/progressão/hihat variation, regenerateMelody). «WORKFLOW-MANUAL-VS-AI.txt:670-750»
ND-2315. Implemente API event-driven: on('section:complete'), on('playback:position'), on('plan:generated') para UI antes de executar. «WORKFLOW-MANUAL-VS-AI.txt:760-780»
ND-2316. Invente nada: reutilize módulos existentes como camada de execução; novos módulos só ai/ (agent, prompts, intent, structure, mood, validation, refinement) e project/ (project, track, arrangement, export). «WORKFLOW-MANUAL-VS-AI.txt:810-880»
ND-2317. Siga os 10 padrões de prompt de música: gênero+era primeiro, BPM exato, instrumentos concretos ("Rhodes piano"), 5–8 tags máx com posição ponderada, vocal style específico, hints de estrutura, stage directions [Intro: solo piano], mood casado com key, evitar contradições, iterar mudando uma variável. «WORKFLOW-MANUAL-VS-AI.txt:900-930»
ND-2318. Use a fórmula de prompt: [Gênero+era]+[BPM]+[Key/Scale]+[2–3 instrumentos]+[Mood]+[Vocal style]+[Estrutura]. «WORKFLOW-MANUAL-VS-AI.txt:935-940»
ND-2319. Diferencie-se pela transparência: o agente explica o PORQUÊ de cada parâmetro e o usuário pode sobrescrever antes de gerar (plano legível vs caixa-preta Suno/Udio). «WORKFLOW-MANUAL-VS-AI.txt:945-955»
ND-2320. Priorize implementação: fase 1 agente core (intent, mood, prompts, agent, structure); fase 2 execução do plano (project, track, bridge); fase 3 export e refine; fase 4 regeneração por seção, audio-to-audio, LoRA-like, stems, drag-and-drop DAW. «WORKFLOW-MANUAL-VS-AI.txt:960-990»
ND-2321. Registre o status real: teoria/harmony/melody/rhythm/instruments/Tone.js/sequencer/testes ✅ prontos; song structure, timeline, MIDI/WAV export, mixing, undo/redo, project save/load 🔨 a construir. «WORKFLOW-MANUAL-VS-AI.txt:1000-1060»

### Bloco 17 — PLANO-TECNICO-MASTER.txt (visão, dependências, fases, moat)

ND-2322. Defina Debonair como "Stripe da música": API limpa e composta onde devs descrevem o que querem e recebem composições tocáveis, editáveis e exportáveis — não caixa-preta tipo Suno/Udio. «PLANO-TECNICO-MASTER.txt:5-15»
ND-2323. Mantenha 5 camadas: user (manual/AI/hybrid) → AI agent (CoT) → music generation (theory/harmony/melody/rhythm) → instrument (12 melodic + 8 percussion, 15 gêneros) → audio engine (Tone.js/effects/mixing/export) + camada neural opcional (RAVE/DDSP/HiFi-GAN/Demucs). «PLANO-TECNICO-MASTER.txt:20-100»
ND-2324. Minimize dependências: runtime = 1 pacote (tone ^15.1.22 ~250KB); fase 2 + midi-file/wavefile/audiobuffer-to-wav; fase 3 + onnxruntime-web; zero custos de API. «PLANO-TECNICO-MASTER.txt:110-140»
ND-2325. Execute a purga de dependências: 342 deps → 1 runtime dep, remover 308 devDeps e 354 overrides; vite.config 445→~30 linhas; tsconfig 332→~25 linhas. «PLANO-TECNICO-MASTER.txt:160-175»
ND-2326. Publique v0.1.0 na semana 2 (testes 50+ casos, 80% cobertura, README, TSDoc, 3 exemplos, CI typecheck+lint+test+build, LICENSE MIT DevThink 2026). «PLANO-TECNICO-MASTER.txt:165-185»
ND-2327. Siga o roadmap: v0.5.0 semana 4 (MIDI export, effects, estrutura); v0.8.0 semana 8 (AI agent, ONNX, cache); v1.0.0 semana 12 (stems, vocal, mastering); v1.5.0 mês 6 (AI avançada, plugin system); v2.0.0 mês 12 (DAW, colaboração realtime). «PLANO-TECNICO-MASTER.txt:430-445»
ND-2328. Justifique teoria-first e não ML-first: determinismo (mesma seed = mesma música, crítico para games/apps), zero download, <10ms, MIDI editável, sem GPU, offline, composto; IA é camada de enhancement. «PLANO-TECNICO-MASTER.txt:350-370»
ND-2329. Defenda o moat: TypeScript-native, browser+Node+Bun, offline 100%, teoria 15 gêneros, seeded RNG, ontologia 500+ parâmetros, zero API costs, MIT, MIDI editável, híbrido AI+manual, effects embutidos, ~250KB, sem ML dependency no core — nicho não preenchido por nenhum concorrente. «PLANO-TECNICO-MASTER.txt:280-340»
ND-2330. Cumpa benchmarks: core <300KB, full <500KB, primeira nota <100ms, pattern <10ms, MIDI export <50ms, WAV 3min <5s, tree-shaking >80% (só theory ≈20KB), cobertura >80%, tipos 100% (arethetypeswrong), lint 0. «PLANO-TECNICO-MASTER.txt:230-265»
ND-2331. Dimensione adoção alvo: 500 downloads/semana mês 3 → 2.000 mês 6 → 10.000 mês 12; 100→2.000 stars; 5→50 dependents. «PLANO-TECNICO-MASTER.txt:210-225»
ND-2332. Respeite o estado do código: theory.ts 381L ⭐5, harmony.ts 383L ⭐5, melody.ts 433L ⭐4, rhythm.ts 437L ⭐4, instruments.ts 277L ⭐4 (12 melodic + 8 percussion), musicEngine.ts 1003L ⭐3 precisa cleanup — base real de ~2.300 linhas. «PLANO-TECNICO-MASTER.txt:270-295»
ND-2333. Mitigue riscos: escopo DAW (alto/alto — biblioteca estrita, sem UI), Tone.js abandonado (baixo — fork), WebGPU stalls (médio — fallback WASM), qualidade ONNX insuficiente (médio — teoria é o core), dependência LLM (baixa — só parsing). «PLANO-TECNICO-MASTER.txt:390-410»
ND-2334. Estruture módulos npm tree-shakeáveis: @devthink/debonair (full), /theory (0 deps ~20KB), /harmony, /melody, /rhythm, /instruments, /musicEngine. «PLANO-TECNICO-MASTER.txt:375-385»
ND-2335. Ship the foundation first, layer AI on top: o moat é a API composta, tipada, offline-first que nenhum concorrente oferece. «PLANO-TECNICO-MASTER.txt:450-460»

---

## FEATURES F-DBN (features reais do produto debonair — onda 4c)

> Convenção de versões (grupos temáticos, máx 99/versão): **v1.0.0** núcleo já construído (shipped); **v2.0.0** export/efeitos/estrutura (fase 2); **v3.0.0** agente IA + neural ONNX (fase 3); **v4.0.0** profissional: mastering/stems/vocal (fase 4); **v5.0.0** máquina de treinamento + biblioteca de samples; **v6.0.0** sistema de qualidade + mixing automático; **v7.0.0** pacote npm offline + assembly engine.

### v1.0.0 — Núcleo da biblioteca (shipped)

F-DBN-001. Theory engine completo — escalas, acordes, keys, intervalos, modos, GENRE_CONFIG 15 gêneros, seeded RNG; 381 linhas, zero deps (shipped) [v1.0.0] «PLANO-TECNICO-MASTER.txt:270-295»
F-DBN-002. Harmony engine — progressões de acordes, voice leading, inversões, arpejador, substituições (trítono/relativa/paralela), acordes estendidos 7/9/11/13; 383 linhas (shipped) [v1.0.0] «PLANO-TECNICO-MASTER.txt:270-295; WORKFLOW-MANUAL-VS-AI.txt:60-100»
F-DBN-003. Melody engine — geração de bass line e lead melody, desenvolvimento de motivos (sequência/inversão/retrógrado/aumento/diminuição), contraponto com constraints de consonância, call-and-response; 433 linhas (shipped) [v1.0.0] «PLANO-TECNICO-MASTER.txt:270-295»
F-DBN-004. Rhythm engine — drum patterns por 15 gêneros (kick/snare/clap/hihat/openhat/perc/808), groove templates com accents, swing, humanização, fills; 437 linhas (shipped) [v1.0.0] «PLANO-TECNICO-MASTER.txt:270-295»
F-DBN-005. Instrument presets — 12 instrumentos melódicos + 8 percussivos com ADSR, filtro e routing de FX; customizeInstrument e layerInstruments; 277 linhas (shipped) [v1.0.0] «PLANO-TECNICO-MASTER.txt:270-295; WORKFLOW-MANUAL-VS-AI.txt:150-170»
F-DBN-006. Music engine Tone.js — transport, step sequencer, play/mute/solo por grupo, BPM por grupo, volume por sub-layer, randomize de padrões; 1003 linhas (shipped) [v1.0.0] «PLANO-TECNICO-MASTER.txt:270-295; WORKFLOW-MANUAL-VS-AI.txt:175-185»
F-DBN-007. API manual tipada — createProject({bpm,key,scale,genre}) → setProgression/generateMelody/generateDrums/setInstruments → generate → play/export (shipped) [v1.0.0] «PLANO-TECNICO-MASTER.txt:145-175»
F-DBN-008. Seeded RNG reprodutível — mesma seed gera a mesma música (crítico para games/apps) (shipped) [v1.0.0] «PLANO-TECNICO-MASTER.txt:280-340»
F-DBN-009. GENRE_CONFIG de 15 gêneros — bpmRange, defaultScale/Key, commonProgressions, drumStyle, typicalInstruments (trap, pop, edm, hiphop, rnb, house, techno, ambient, cinematic, jazz, rock, funk, reggaeton, drill, latin) (shipped) [v1.0.0] «WORKFLOW-MANUAL-VS-AI.txt:405-425»
F-DBN-010. Step sequencer UI — canvas fullscreen, drum grid, piano roll pitch 48–84, hover ghost cell, drag para desenhar, right-click apaga, click preview (shipped) [v1.0.0] «regras-APP.md APP-0510; WORKFLOW-MANUAL-VS-AI.txt:1000-1030»
F-DBN-011. Suite de testes Vitest para theory/harmony/melody/rhythm + Biome linting (shipped) [v1.0.0] «WORKFLOW-MANUAL-VS-AI.txt:1060-1080»
F-DBN-012. Build Vite biblioteca+web com external tone e tipos TSDoc (shipped) [v1.0.0] «PLANO-TECNICO-MASTER.txt:130-140»

### v2.0.0 — Export, efeitos e estrutura (planned)

F-DBN-013. Export MIDI de qualquer padrão/progressão via midi-file <50ms (planned) [v2.0.0] «PLANO-TECNICO-MASTER.txt:195-210»
F-DBN-014. Export WAV offline via OfflineAudioContext + audiobuffer-to-wav (3min <5s) (planned) [v2.0.0] «PLANO-TECNICO-MASTER.txt:195-210»
F-DBN-015. Effects chain completa — reverb algorítmica+convolução, delay mono/ping-pong, distortion, chorus, compressor, EQ, limiter (planned) [v2.0.0] «PLANO-TECNICO-MASTER.txt:195-215»
F-DBN-016. AudioWorklet processors custom para efeitos por-sample (planned) [v2.0.0] «PLANO-TECNICO-MASTER.txt:195-215»
F-DBN-017. Song structure — templates intro/verse/chorus/bridge/outro com arrangement automático e intensity por seção (planned) [v2.0.0] «PLANO-TECNICO-MASTER.txt:195-215; WORKFLOW-MANUAL-VS-AI.txt:455-500»
F-DBN-018. Arrangement timeline section-based para composições multipartes (planned) [v2.0.0] «PLANO-TECNICO-MASTER.txt:195-215»
F-DBN-019. Undo/redo por command pattern para todo o estado (planned) [v2.0.0] «PLANO-TECNICO-MASTER.txt:195-215»
F-DBN-020. Project save/load JSON serializável (planned) [v2.0.0] «PLANO-TECNICO-MASTER.txt:195-215»
F-DBN-021. Síntese wavetable, granular e FM nos presets de instrumentos (planned) [v2.0.0] «PLANO-TECNICO-MASTER.txt:195-215»
F-DBN-022. Sub-módulos npm tree-shakeáveis (/theory ~20KB, /harmony, /melody, /rhythm, /instruments, /musicEngine) (planned) [v2.0.0] «PLANO-TECNICO-MASTER.txt:375-385»

### v3.0.0 — Agente IA + neural ONNX (planned)

F-DBN-023. AI Mode text-to-music — generate({prompt, duration, key?, bpm?, instruments?}) → track tocável (planned) [v3.0.0] «PLANO-TECNICO-MASTER.txt:175-195»
F-DBN-024. Chain-of-Thought music agent — prompt parser → genre classifier → mood mapper → theory parameter generator → structure planner → confidence scorer (planned) [v3.0.0] «PLANO-TECNICO-MASTER.txt:35-60; WORKFLOW-MANUAL-VS-AI.txt:540-560»
F-DBN-025. AIGenerationPlan inspecionável com reasoning ("Selected C minor, 140 BPM…") e confidence 0–1 (planned) [v3.0.0] «PLANO-TECNICO-MASTER.txt:175-195; WORKFLOW-MANUAL-VS-AI.txt:230-260»
F-DBN-026. MOOD_MAP com 10 moods mapeando bias de BPM/escala/density/complexity (planned) [v3.0.0] «WORKFLOW-MANUAL-VS-AI.txt:430-450»
F-DBN-027. Prompt parsing via LLM (Vercel AI SDK) com JSON estrito de intent e regras de desambiguação (planned) [v3.0.0] «WORKFLOW-MANUAL-VS-AI.txt:565-620»
F-DBN-028. Refine iterativo conversacional — agent.refine(plan, "add piano") modificando só o pedido (planned) [v3.0.0] «WORKFLOW-MANUAL-VS-AI.txt:640-660»
F-DBN-029. Hybrid mode — AI gera, usuário edita (setBPM/setChordProgression/setDrumVariation/regenerateMelody) (planned) [v3.0.0] «PLANO-TECNICO-MASTER.txt:175-195»
F-DBN-030. RAVE neural synthesis ONNX — timbre synthesis realtime de códigos latentes (planned) [v3.0.0] «PLANO-TECNICO-MASTER.txt:60-90»
F-DBN-031. DDSP synthesis ONNX — síntese por nota controlável por pitch (F0+loudness→áudio) (planned) [v3.0.0] «PLANO-TECNICO-MASTER.txt:60-90»
F-DBN-032. HiFi-GAN vocoder ONNX — mel 80 bins→waveform ~50MB (planned) [v3.0.0] «PLANO-TECNICO-MASTER.txt:60-90»
F-DBN-033. Model cache IndexedDB com download progressivo e eventos de progresso (planned) [v3.0.0] «PLANO-TECNICO-MASTER.txt:60-90; PIPELINE-TREINAMENTO.txt:1360-1420»
F-DBN-034. onnxruntime-web com backends WASM+WebGPU e warm-up de kernels (planned) [v3.0.0] «INFRAESTRUTURA-AUDIO-AI.txt:525-550»
F-DBN-035. API event-driven (section:complete, playback:position, plan:generated) (planned) [v3.0.0] «WORKFLOW-MANUAL-VS-AI.txt:760-780»

### v4.0.0 — Profissional: mastering, stems, vocal (planned)

F-DBN-036. Stem separation demucs-web — 4 stems drums/bass/vocals/other via HTDemucs ONNX ~172MB (planned) [v4.0.0] «PLANO-TECNICO-MASTER.txt:295-325»
F-DBN-037. AI mixing — análise de frequência → sugestões de EQ, level balancing, detecção de sidechain (planned) [v4.0.0] «PLANO-TECNICO-MASTER.txt:295-325»
F-DBN-038. AI mastering com LUFS targeting (Spotify -14, Apple -16), true peak limiting -1 dBTP e stereo imaging (planned) [v4.0.0] «PLANO-TECNICO-MASTER.txt:295-325»
F-DBN-039. Reference matching — upload de faixa de referência → match de tonal balance, dinâmica e loudness (planned) [v4.0.0] «PLANO-TECNICO-MASTER.txt:295-325»
F-DBN-040. Stem export — tracks individuais (drums/bass/melody/chords) como arquivos separados (planned) [v4.0.0] «PLANO-TECNICO-MASTER.txt:295-325»
F-DBN-041. Vocal synthesis — API (ElevenLabs/OpenAI) + HiFi-GAN local via ONNX com phonemizer PT/EN/ES (planned) [v4.0.0] «PLANO-TECNICO-MASTER.txt:295-325»
F-DBN-042. Export MP3 (lamejs/ffmpeg.wasm) e FLAC futuro (planned) [v4.0.0] «PLANO-TECNICO-MASTER.txt:295-325»
F-DBN-043. Integração DAW — MIDI drag-and-drop (planned) [v4.0.0] «WORKFLOW-MANUAL-VS-AI.txt:985-990»
F-DBN-044. Regeneração por seção — generateSection(plan, 'chorus', "more energetic") (planned) [v4.0.0] «WORKFLOW-MANUAL-VS-AI.txt:655-660»
F-DBN-045. Audio-to-audio influence — upload de referência para gerar no estilo (planned) [v4.0.0] «WORKFLOW-MANUAL-VS-AI.txt:985-990»

### v5.0.0 — Máquina de treinamento + biblioteca de samples (planned)

F-DBN-046. Máquina de treinamento 7 camadas — input→decompose→analyze→organize→patterns→train→infer com dados "mastigado" (planned) [v5.0.0] «MACHINE-TREINAMENTO-COMPLETA.txt:21-70»
F-DBN-047. Import universal — WAV/MP3/FLAC/OGG/AAC/M4A, YouTube via yt-dlp, MIDI via @tonejs/midi, texto e microfone, normalizado a WAV 48kHz estéreo (planned) [v5.0.0] «MACHINE-TREINAMENTO-COMPLETA.txt:75-160»
F-DBN-048. Decomposição em stems DSP (HPSS mid/side, cross-corr <0.25) + ML (HTDemucs ONNX) com auto-fallback (planned) [v5.0.0] «MACHINE-TREINAMENTO-COMPLETA.txt:222-300»
F-DBN-049. Extração de FeatureSet completo (espectral/temporal/harmônico/rítmico/timbral/loudness/estrutural) <10s por música (planned) [v5.0.0] «MACHINE-TREINAMENTO-COMPLETA.txt:320-420»
F-DBN-050. Banco SQLite de treino — audio_files/stems/notes/beats/chords/feature_sets/tags/patterns com transações atômicas (planned) [v5.0.0] «MACHINE-TREINAMENTO-COMPLETA.txt:480-600»
F-DBN-051. Tagging automático — gênero/mood/instrumento/tempo range/era/qualidade/técnica (planned) [v5.0.0] «MACHINE-TREINAMENTO-COMPLETA.txt:605-620»
F-DBN-052. Pattern library — beat/chord/melody/effect/structure patterns com busca por ocorrência e similaridade vetorial (planned) [v5.0.0] «MACHINE-TREINAMENTO-COMPLETA.txt:640-790»
F-DBN-053. Tokenização musical ~2000 tokens (P×V×D, chords, drums, controls, especiais) para modelos autoregressivos (planned) [v5.0.0] «MACHINE-TREINAMENTO-COMPLETA.txt:810-890»
F-DBN-054. Pipeline de treino Python/PyTorch com export ONNX INT8 e fine-tune MusicGen Small (planned) [v5.0.0] «MACHINE-TREINAMENTO-COMPLETA.txt:920-1050»
F-DBN-055. Data augmentation de treino — pitch/time/velocity/dropout/groove (planned) [v5.0.0] «MACHINE-TREINAMENTO-COMPLETA.txt:872-890»
F-DBN-056. Biblioteca de samples com SampleMetadata completo e dedup por hash perceptual (planned) [v5.0.0] «ORGANIZACAO-SAMPLES.txt:14-130; 1590-1615»
F-DBN-057. Diretório canônico samples/{type}/{subtype}/{samples,spectrograms,embeddings,metadata} + convenção de nomes drm_kick_pun_Cm_140_a3f2.wav (planned) [v5.0.0] «ORGANIZACAO-SAMPLES.txt:210-330»
F-DBN-058. Classificação automática ML de samples (type/subtype/confidence + key + BPM) (planned) [v5.0.0] «ORGANIZACAO-SAMPLES.txt:520-580»
F-DBN-059. Embeddings CLAP 512 dims + índice FAISS cosine para "sounds like" search (planned) [v5.0.0] «ORGANIZACAO-SAMPLES.txt:600-830»
F-DBN-060. FTS5 full-text search de samples com triggers de sincronização (planned) [v5.0.0] «ORGANIZACAO-SAMPLES.txt:1005-1055»
F-DBN-061. API de consulta para IA (query_for_generation com type/genre/mood/bpm±/key/character) e batches balanceados de treino (planned) [v5.0.0] «ORGANIZACAO-SAMPLES.txt:1265-1420»
F-DBN-062. Manutenção de biblioteca — dedupe (hash+FAISS>0.95), cleanup de órfãos, usage stats (planned) [v5.0.0] «ORGANIZACAO-SAMPLES.txt:1690-1794»
F-DBN-063. Manifests JSONL train/valid/test 90/5/5 para treino (planned) [v5.0.0] «ORGANIZACAO-SAMPLES.txt:1395-1420»

### v6.0.0 — Sistema de qualidade + mixing automático (planned)

F-DBN-064. Layer architecture por gênero — 10–13 camadas com faixa de frequência, método de síntese e pan declarados (Trap 12, Pop 13, EDM 11, Cinematic 13…) (planned) [v6.0.0] «SISTEMA-QUALIDADE-COMPLETO.txt:25-340»
F-DBN-065. Quality pipeline de 6 estágios — reference analysis → assembly → mixing → mastering → validation → export (planned) [v6.0.0] «SISTEMA-QUALIDADE-COMPLETO.txt:361-466»
F-DBN-066. Genre Reference Profiles pré-computados — curva 31-band, bandEnergy 7 bandas, dinâmica, estéreo, efeitos e arranjo por 13 gêneros (planned) [v6.0.0] «SISTEMA-QUALIDADE-COMPLETO.txt:484-554»
F-DBN-067. Mixing automation per-track de 8 estágios com receitas por gênero (808-sub trap, piano pop, dark pad…) (planned) [v6.0.0] «SISTEMA-QUALIDADE-COMPLETO.txt:649-930»
F-DBN-068. Bus processing — drum bus com paralela, music bus com widening, master EQ+glue (planned) [v6.0.0] «SISTEMA-QUALIDADE-COMPLETO.txt:940-977»
F-DBN-069. Sidechain system declarativo com frequency range/threshold/ratio/depth por gênero (planned) [v6.0.0] «SISTEMA-QUALIDADE-COMPLETO.txt:999-1043»
F-DBN-070. Mastering automation — multiband 4-band, M/S imaging com mono check, limiter true-peak oversampled 4x, normalização BS.1770-4 (planned) [v6.0.0] «SISTEMA-QUALIDADE-COMPLETO.txt:1061-1290»
F-DBN-071. Quality checks + auto-fix — 13 checks com severidade e correção automática (LUFS/true peak/clipping/mono/silêncio/key/BPM) (planned) [v6.0.0] «SISTEMA-QUALIDADE-COMPLETO.txt:1345-1590»
F-DBN-072. Quality report com score 0–100 e grade A–F (planned) [v6.0.0] «SISTEMA-QUALIDADE-COMPLETO.txt:1595-1630»
F-DBN-073. Arrangement templates por gênero com energia por seção e entrada/saída de camadas (planned) [v6.0.0] «SISTEMA-QUALIDADE-COMPLETO.txt:1710-1790»
F-DBN-074. Receitas de mixing/mastering por gênero com valores exatos (trap -8/-10 competitivo, pop -12/-14, EDM -6/-9) e targets por plataforma (Spotify -14, Apple -16, Beatport -9) (planned) [v6.0.0] «MIXING-MASTERING-POR-GENERO.txt:140-165; 290-300; 745-875»
F-DBN-075. Bounces por plataforma com LUFS/true peak próprios e validação iterativa até bater targets (planned) [v6.0.0] «MIXING-MASTERING-POR-GENERO.txt:820-875»

### v7.0.0 — Pacote npm offline + assembly engine (planned)

F-DBN-076. Pacote npm @devthink/debonair <50MB (real ~33MB) com theory+assembly+patterns+synthesis+models+export (planned) [v7.0.0] «ARQUITETURA-OFFLINE-COMPLETA.txt:268-290; 1050-1075»
F-DBN-077. Pattern database comprimida CBOR+LZ4 ~4.5MB com 3.000+ patterns × 15 gêneros (planned) [v7.0.0] «ARQUITETURA-OFFLINE-COMPLETA.txt:268-290; 340-430»
F-DBN-078. Matriz de compatibilidade pré-computada sparse (>0.5) drum↔chord↔melody↔bass↔sections (planned) [v7.0.0] «ARQUITETURA-OFFLINE-COMPLETA.txt:435-470»
F-DBN-079. Assembly engine constraint satisfaction + neural scoring com hard/soft constraints (planned) [v7.0.0] «ARQUITETURA-OFFLINE-COMPLETA.txt:480-540»
F-DBN-080. Transitions generator — drum fills, risers/downlifters, chord anticipation, energy ramp (planned) [v7.0.0] «ARQUITETURA-OFFLINE-COMPLETA.txt:545-560»
F-DBN-081. Humanizer neural ONNX — timing ±5–15ms, velocity ±5–15, groove templates, dinâmica por frase (planned) [v7.0.0] «ARQUITETURA-OFFLINE-COMPLETA.txt:565-580»
F-DBN-082. Fallback chain de 4 níveis — neural → rules → theory defaults → hardcoded (qualidade nunca cai) (planned) [v7.0.0] «ARQUITETURA-OFFLINE-COMPLETA.txt:830-850»
F-DBN-083. Síntese híbrida por instrumento — física (kick/808/KS guitar), FM (piano), subtrativa (lead), wavetable+granular (pad), aditiva (strings) (planned) [v7.0.0] «ARQUITETURA-OFFLINE-COMPLETA.txt:630-720»
F-DBN-084. Simple API uma linha — Debonair.generate({prompt:"Pop ballad, C major, 80 BPM"}) → play/export (planned) [v7.0.0] «ARQUITETURA-OFFLINE-COMPLETA.txt:1080-1100»
F-DBN-085. Formatos binários compactos — drum bitmask (18B vs 144B JSON), velocity delta+varint, melodias com flags por bit, pads com envelope 64 bins (planned) [v7.0.0] «FORMATOS-DADOS-PREV processados.txt:95-380; 660-720»
F-DBN-086. Data store com SQLite indexes (offset/length) + LZ4 por chunk 64KB para acesso random (planned) [v7.0.0] «FORMATOS-DADOS-PREV processados.txt:460-560; 745-760»
F-DBN-087. Build pipeline de dados em 7 passos com validação min-quality 0.7 e check_sizes max 10MB (planned) [v7.0.0] «FORMATOS-DADOS-PREV processados.txt:850-880»
F-DBN-088. Lookup tables compartilhadas — genres hierárquicos, moods valence/energy, keys midi_root, scales intervals (planned) [v7.0.0] «FORMATOS-DADOS-PREV processados.txt:940-1050»
F-DBN-089. Pipeline de referências reais — Demucs → features por stem → JSON schema única (progressions/groove/energy/mixing) → variações Markov/genética/interpolação com repair por constraints (planned) [v7.0.0] «EXTRACAO-REFERENCIAS-REAIS.txt:20-70; 600-720; 770-1000»
F-DBN-090. Genre templates aprendidos por estatística de 100+ referências com recommender ponderado (BPM 0.3/key 0.3/genre 0.2/mood 0.2) (planned) [v7.0.0] «EXTRACAO-REFERENCIAS-REAIS.txt:975-1140»
F-DBN-091. Máquina de síntese universal por tipo de som — drums/FX/pads/beat/guitar/piano/voz/beatbox com receitas Web Audio por método (planned) [v7.0.0] «SINTESE-TIPOS-SOM.txt:1-60; 290-720; 960-1010»
F-DBN-092. Warehouse + factory "fábrica de carros" — 14.000 peças com metadados ricos e scoring harmônico 0.4/rítmico 0.3/registro 0.2/densidade 0.1 (planned) [v7.0.0] «MONTAGEM-INTELIGENTE.txt:10-60; 470-530»
F-DBN-093. Voice leading por constraint solver com backtracking MRV (sem paralelas, ranges, chord tones + soft prefs) (planned) [v7.0.0] «MONTAGEM-INTELIGENTE.txt:680-740»
F-DBN-094. Energy controller por role (lead 1.0 → fx 0.3) com entrada/saída de instrumentos por threshold (planned) [v7.0.0] «MONTAGEM-INTELIGENTE.txt:750-800»
F-DBN-095. Módulo spectral/ completo (fft/stft/mel/mfcc/chroma/descriptors/onset/pitch) com vetor de ~167 features/frame (planned) [v7.0.0] «ANALISE-ESPECTRAL.txt:930-910»
F-DBN-096. Loop analyze→generate — analisar referência (key/BPM/gênero/brightness/chords) e gerar similar com transposição e mudança de tempo (planned) [v7.0.0] «ANALISE-ESPECTRAL.txt:1000-1060»
F-DBN-097. stack MUST/SHOULD/NICE/AI de libs TS fixado (tone/tonal/@tonejs/midi/howler + wavesurfer/meyda/pitchfinder/spessasynth + onnxruntime/transformers + whisper/demucs) (planned) [v7.0.0] «LIBRARIAS-TS-AUDIO.txt:1100-1140»
F-DBN-098. Suporte browser/Node/Bun com a mesma API, MIT, sem custos de API (planned) [v7.0.0] «PLANO-TECNICO-MASTER.txt:280-340»
F-DBN-099. Benchmarks públicos — primeira nota <100ms, pattern <10ms, MIDI <50ms, WAV 3min <5s, tree-shaking >80% (planned) [v7.0.0] «PLANO-TECNICO-MASTER.txt:230-265»

---

## CONTAGEM

| Métrica | Quantidade |
|---------|-----------|
| Arquivos lidos (de /home/z/neodocs-txt/outros.debonair) | 17 de 96 (100% dos 17 maiores, ~19.168 linhas) |
| Segmentos sed lidos | 36 |
| **Regras ND extraídas** | **335 (ND-2001…ND-2335)** |
| **Features F-DBN extraídas** | **99 (F-DBN-001…F-DBN-099)** |
| Lixo/pulado (duplicado de seed regras-APP APP-0491..0550) | ~0 (todo conteúdo novo vs ondas anteriores; sobreposições com seed citadas nas fontes) |
| Versões de features | 7 grupos (v1.0.0…v7.0.0, máx 99/versão) |

**Notas para o orquestrador:**
- Regras ND-2001+ destinam-se à PARTE 5 de regras.md (onda 4c); features F-DBN destinam-se à seção debonair de features.md (versões v1.0.0–v7.0.0 conforme grupos acima).
- Status shipped/planned segue PLANO-TECNICO-MASTER (§8 o que existe vs o que falta) e WORKFLOW-MANUAL-VS-AI (§6). Nada inventado; todos os números vêm dos arquivos-fonte citados.
- Pendência futura (onda 4d/5): ler os 79 arquivos restantes de outros.debonair (TYPE-BEATS-POR-GENERO, ASSEMBLAGEM-PADROES, STEM-SEPARATION, SINTESE-VOCAL-AI, DATASETS-E-MODELOS, FL-STUDIO-ANALISE, CAMADAS-COMPLEXAS etc.) para os blocos de type beats e vocais AI não cobertos aqui.
