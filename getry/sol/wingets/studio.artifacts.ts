export interface ExtractedArtifact {
  id: string;
  kind: 'code' | 'image';
  title: string;
  tag: string;
  language: string;
  content: string;
  conversationId: string;
  conversationTitle: string;
  workspaceId: string;
  workspaceName: string;
  createdAt: number;
}

export interface WorkspaceTask {
  id: string;
  workspaceId: string;
  label: string;
  done: boolean;
  createdAt: number;
}

const LANG_EXTENSION_MAP: Record<string, string> = {
  typescript: 'ts',
  ts: 'ts',
  tsx: 'tsx',
  javascript: 'js',
  js: 'js',
  jsx: 'jsx',
  python: 'py',
  py: 'py',
  rust: 'rs',
  rs: 'rs',
  go: 'go',
  json: 'json',
  html: 'html',
  css: 'css',
  sql: 'sql',
  bash: 'sh',
  sh: 'sh',
  yaml: 'yml',
  yml: 'yml',
  svg: 'svg',
  markdown: 'md',
  md: 'md',
};

const LANG_TAG_MAP: Record<string, string> = {
  tsx: 'React UI',
  jsx: 'React UI',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  js: 'JavaScript',
  javascript: 'JavaScript',
  py: 'Python',
  python: 'Python',
  svg: 'Vector',
  html: 'HTML',
  css: 'Stylesheet',
  json: 'Config',
  sql: 'SQL',
  sh: 'Shell',
  bash: 'Shell',
  yml: 'YAML',
  yaml: 'YAML',
  md: 'Markdown',
  markdown: 'Markdown',
};

export function extractCodeFilename(
  code: string,
  lang: string,
  fallbackIndex: number
): string {
  const firstLine = (code.split('\n')[0] || '').trim();
  const commentFileMatch = firstLine.match(
    /^(?:\/\/|#|\/\*|<!--)\s*([a-zA-Z0-9_./-]+\.[a-zA-Z0-9]{1,6})\b/
  );
  if (commentFileMatch?.[1]) {
    const base = commentFileMatch[1].split('/').pop();
    if (base) return base;
  }

  const symbolMatch = code.match(
    /(?:export\s+(?:default\s+)?(?:function|const|class|interface|type)|def|class)\s+([A-Za-z_][A-Za-z0-9_]*)/
  );
  const normLang = (lang || 'txt').toLowerCase();
  const ext = LANG_EXTENSION_MAP[normLang] || (normLang.length <= 5 ? normLang : 'txt');
  if (symbolMatch?.[1]) {
    return `${symbolMatch[1]}.${ext}`;
  }
  return `snippet-${String(fallbackIndex).padStart(2, '0')}.${ext}`;
}

export function extractConversationArtifacts<
  W extends { id: string; name: string },
  C extends {
    id: string;
    title: string;
    workspaceId?: string;
    messages: ReadonlyArray<{
      id: string;
      role: string;
      content: string;
      generatedImages?: ReadonlyArray<string>;
      createdAt: number;
    }>;
  }
>(conversations: readonly C[], workspaces: readonly W[]): ExtractedArtifact[] {
  const wsMap = new Map(workspaces.map((w) => [w.id, w.name]));
  const defaultWs = workspaces[0];
  const artifacts: ExtractedArtifact[] = [];
  let snippetCounter = 1;

  for (const conv of conversations) {
    const workspaceId = conv.workspaceId || defaultWs?.id || 'ws_default';
    const workspaceName = wsMap.get(workspaceId) || defaultWs?.name || 'Workspace';

    for (const msg of conv.messages) {
      if (msg.generatedImages && msg.generatedImages.length > 0) {
        msg.generatedImages.forEach((src, imgIdx) => {
          artifacts.push({
            id: `${conv.id}_${msg.id}_img_${imgIdx}`,
            kind: 'image',
            title: `Image ${imgIdx + 1} · ${conv.title.slice(0, 22)}`,
            tag: 'Image',
            language: 'image',
            content: src,
            conversationId: conv.id,
            conversationTitle: conv.title,
            workspaceId,
            workspaceName,
            createdAt: msg.createdAt,
          });
        });
      }

      if (!msg.content || !msg.content.includes('```')) continue;
      const fenceRegex = /```([a-zA-Z0-9_-]*)\s*\n([\s\S]*?)```/g;
      let match: RegExpExecArray | null;
      let blockIdx = 0;
      while ((match = fenceRegex.exec(msg.content)) !== null) {
        const lang = (match[1] || 'text').trim() || 'text';
        const code = match[2].replace(/\n$/, '');
        if (!code.trim()) continue;
        const normLang = lang.toLowerCase();
        const title = extractCodeFilename(code, normLang, snippetCounter);
        const tag = LANG_TAG_MAP[normLang] || normLang.toUpperCase();
        artifacts.push({
          id: `${conv.id}_${msg.id}_code_${blockIdx}`,
          kind: 'code',
          title,
          tag,
          language: normLang,
          content: code,
          conversationId: conv.id,
          conversationTitle: conv.title,
          workspaceId,
          workspaceName,
          createdAt: msg.createdAt,
        });
        snippetCounter += 1;
        blockIdx += 1;
      }
    }
  }

  return artifacts.sort((a, b) => b.createdAt - a.createdAt);
}

function assertArtifacts(condition: unknown, message: string): void {
  if (!condition) throw new Error(`artifacts self-test failed: ${message}`);
}

export function runArtifactsSelfTests(): number {
  assertArtifacts(
    extractCodeFilename('// src/components/Button.tsx\nexport const Button = () => null;', 'tsx', 1) === 'Button.tsx',
    'comment filename'
  );
  assertArtifacts(
    extractCodeFilename('export function DevThinkPanel() { return null; }', 'tsx', 2) === 'DevThinkPanel.tsx',
    'symbol filename'
  );
  assertArtifacts(
    extractCodeFilename('const x = 1;', 'json', 3) === 'snippet-03.json',
    'numbered fallback'
  );

  const list = extractConversationArtifacts(
    [
      {
        id: 'conv_1',
        title: 'Landing Page',
        workspaceId: 'ws_2',
        messages: [
          { id: 'm1', role: 'user', content: 'Build hero', createdAt: 100 },
          {
            id: 'm2',
            role: 'assistant',
            content: 'Here it is:\n```tsx\nexport const HeroCard = () => <div />;\n```\nAnd styles:\n```css\n.hero { color: red; }\n```',
            generatedImages: ['data:image/png;base64,AAA'],
            createdAt: 200,
          },
        ],
      },
      {
        id: 'conv_2',
        title: 'Old Chat',
        messages: [
          {
            id: 'm3',
            role: 'assistant',
            content: '```python\ndef solve():\n  return 42\n```',
            createdAt: 50,
          },
        ],
      },
    ],
    [
      { id: 'ws_1', name: 'Principal' },
      { id: 'ws_2', name: 'Design Lab' },
    ]
  );

  assertArtifacts(list.length === 4, 'artifacts count');
  assertArtifacts(list[0].workspaceName === 'Design Lab' && list[0].kind === 'image', 'image artifact first');
  assertArtifacts(list[1].title === 'HeroCard.tsx' && list[1].tag === 'React UI', 'tsx artifact');
  assertArtifacts(list[2].tag === 'Stylesheet', 'css artifact');
  assertArtifacts(list[3].title === 'solve.py' && list[3].workspaceName === 'Principal', 'python fallback workspace');
  return 2;
}

if (
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1]?.endsWith('artifacts.ts')
) {
  const passed = runArtifactsSelfTests();
  console.log(`artifacts.ts embedded self-tests: ${passed} suites passed`);
}

