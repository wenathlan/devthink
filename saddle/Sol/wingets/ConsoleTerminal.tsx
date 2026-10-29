// Terminal: faithful absorption of the console.html terminal — animated boot
// output (rows appended by the console page), command history with the arrow
// keys, tab completion over the sandbox command list, the live prompt and
// the focus-on-click output pane.
import { useEffect, useRef, useState } from 'react';
import { label, type LabelKey } from '../../labels.ts';
import { commands } from '../../sandbox.ts';

/** one rendered output row; cls mirrors the static page row classes. */
export type TerminalRow = {
	id: number;
	text: string;
	cls: string;
};

/** the terminal lifecycle label shown in the bar. */
export type TerminalState = 'halted' | 'booting' | 'running' | 'stopped';

/** the lifecycle state tokens answer their store labels (data stays data,
 * the rendered words ride the label store). */
const statelabels: Record<TerminalState, LabelKey> = {
	halted: 'console.terminal.state.halted',
	booting: 'console.terminal.state.booting',
	running: 'console.terminal.state.running',
	stopped: 'console.terminal.state.stopped',
};

type TerminalProps = {
	rows: TerminalRow[];
	prompt: string;
	state: TerminalState;
	enabled: boolean;
	oncommand: (command: string) => void;
};

/**
 * the virtual container terminal: a dark log pane (role=log, polite
 * aria-live), a command input with history browsing and tab completion,
 * and the lifecycle label in the bar.
 */
export default function Terminal({ rows, prompt, state, enabled, oncommand }: TerminalProps) {
	const outref = useRef<HTMLPreElement>(null);
	const inputref = useRef<HTMLInputElement>(null);
	const [value, setValue] = useState('');
	const historyref = useRef<string[]>([]);
	const historyindex = useRef(-1);

	/** keep the output pinned to the newest row, like scrollterm(). */
	useEffect(() => {
		const out = outref.current;
		if (out) out.scrollTop = out.scrollHeight;
	}, []);

	/** focus the command input once the sandbox is running. */
	useEffect(() => {
		if (enabled) inputref.current?.focus();
	}, [enabled]);

	const onsubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!enabled) return;
		const trimmed = value.trim();
		setValue('');
		if (trimmed.length === 0) return;
		historyref.current.push(trimmed);
		historyindex.current = historyref.current.length;
		oncommand(trimmed);
	};

	const onkeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'ArrowUp') {
			event.preventDefault();
			if (historyref.current.length === 0) return;
			historyindex.current = Math.max(0, historyindex.current - 1);
			setValue(historyref.current[historyindex.current] ?? '');
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			if (historyref.current.length === 0) return;
			historyindex.current = Math.min(historyref.current.length, historyindex.current + 1);
			setValue(historyref.current[historyindex.current] ?? '');
		} else if (event.key === 'Tab') {
			event.preventDefault();
			const prefix = value.trim();
			if (prefix.length === 0) return;
			const match = commands.find((entry) => entry.startsWith(prefix));
			if (match !== undefined) setValue(match);
		}
	};

	return (
		<section className="term" data-state={state} aria-labelledby="termtitle">
			<div className="term-bar">
				<span id="termtitle">{label('console.terminal.title')}</span>
				<span className="term-state" aria-live="polite">
					{label(statelabels[state])}
				</span>
			</div>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: click-to-focus is a deliberate mouse-only convenience: the log region is intentionally not focusable and keyboard users reach the prompt input directly through the tab order, so a keyboard handler here would be dead code */}
			<pre
				className="term-out"
				role="log"
				aria-live="polite"
				aria-label={label('console.terminal.outputAria')}
				ref={outref}
				onClick={() => inputref.current?.focus()}
			>
				{rows.map((row) => (
					<span key={row.id} className={row.cls === '' ? undefined : row.cls}>
						{row.text}
						{'\n'}
					</span>
				))}
			</pre>
			<form className={enabled ? 'term-in' : 'term-in off'} onSubmit={onsubmit}>
				<label className="term-prompt" htmlFor="termin">
					{prompt}
				</label>
				<input
					id="termin"
					ref={inputref}
					className="term-input"
					autoComplete="off"
					spellCheck={false}
					aria-label={label('console.terminal.inputAria')}
					disabled={!enabled}
					value={value}
					onChange={(event) => setValue(event.target.value)}
					onKeyDown={onkeydown}
				/>
			</form>
		</section>
	);
}
