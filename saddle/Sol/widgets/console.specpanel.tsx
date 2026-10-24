// Spec panel: faithful absorption of the console.html spec controls — cpu
// model, workspace quota, vcpus slider, ram slider + exact numeric field,
// gpu model and mig profile, each with the live catalog hints.
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { label, type LabelKey, labelfill } from '../../labels.ts';
import { cpudata, gpudata } from '../../sandbox.ts';

/** the sandbox specification selection held by the console page. */
export type SandboxSpecSelection = {
	model: string;
	quotamb: number;
	vcpus: number;
	ramgb: number;
	gpu: string;
	mig: string;
};

type SpecPanelProps = {
	spec: SandboxSpecSelection;
	onChange: (patch: Partial<SandboxSpecSelection>) => void;
	disabled: boolean;
};

/** workspace quota options in MiB (16 selected by default). */
const quotaoptions = [4, 16, 64, 256];

/** the mig slicing profile values of the 96 gb-class virtual device. */
const migvalues = ['off', '1g.24gb', '2g.48gb', '4g.96gb'] as const;

/** the mig profile labels of the store, keyed by the profile value. */
const miglabels: Record<(typeof migvalues)[number], LabelKey> = {
	off: 'console.spec.migOff',
	'1g.24gb': 'console.spec.mig1g',
	'2g.48gb': 'console.spec.mig2g',
	'4g.96gb': 'console.spec.mig4g',
};

/** the mig profile options: the value stays data, the label rides the store. */
function migoptions(): { value: string; label: string }[] {
	return migvalues.map((value) => ({ value, label: label(miglabels[value]) }));
}

/** ram ceiling shared by the slider and the exact numeric field. */
const ramceiling = 18432;

/**
 * the sandbox specification panel: every control keeps the 44px touch
 * target of the absorbed static page and disables while a sandbox is
 * booting or running.
 */
export default function SpecPanel({ spec, onChange, disabled }: SpecPanelProps) {
	const ramnumref = useRef<HTMLInputElement>(null);
	const [ramdraft, setRamdraft] = useState(String(spec.ramgb));

	/** the numeric field follows the slider unless the operator is typing. */
	useEffect(() => {
		if (document.activeElement !== ramnumref.current) {
			setRamdraft(String(spec.ramgb));
		}
	}, [spec.ramgb]);

	/** the exact ram field clamps to the 1..18432 gb plan range. */
	const onramnuminput = (raw: string) => {
		setRamdraft(raw);
		const clamped = Math.max(1, Math.min(ramceiling, Number(raw) || 1));
		onChange({ ramgb: clamped });
	};

	const cpu = cpudata.find((entry) => entry.model === spec.model);
	const gpu = gpudata.find((entry) => entry.id === spec.gpu);
	const cpuhint = cpu
		? labelfill('console.spec.cpuHint', {
				arch: cpu.microarch,
				memory: cpu.memorytype,
				max: String(cpu.maxmemorygb),
				watts: String(cpu.tdpwatts),
			})
		: '';
	const gpuhint = gpu
		? labelfill('console.spec.gpuHint', {
				arch: gpu.arch,
				bandwidth: String(gpu.bandwidthgbs),
				mig: gpu.mig ? label('console.spec.migSupported') : label('console.spec.migEmulated'),
			})
		: '';

	return (
		<>
			<div className="spec-field">
				<label htmlFor="cpusel">{label('console.spec.cpuLabel')}</label>
				<select
					className="spec-select"
					id="cpusel"
					disabled={disabled}
					aria-label={label('console.spec.cpuAria')}
					value={spec.model}
					onChange={(event) => onChange({ model: event.target.value })}
				>
					{cpudata.map((entry) => (
						<option key={entry.model} value={entry.model}>
							{labelfill('console.spec.cpuOption', {
								model: entry.model,
								cores: String(entry.cores),
								threads: String(entry.threads),
							})}
						</option>
					))}
				</select>
				<div className="spec-field">
					<label htmlFor="quotasel">{label('console.spec.quotaLabel')}</label>
					<select
						className="spec-select"
						id="quotasel"
						disabled={disabled}
						aria-label={label('console.spec.quotaAria')}
						value={String(spec.quotamb)}
						onChange={(event) => onChange({ quotamb: Number(event.target.value) })}
					>
						{quotaoptions.map((quota) => (
							<option key={quota} value={String(quota)}>
								{labelfill('console.spec.quotaOption', { quota: String(quota) })}
							</option>
						))}
					</select>
				</div>
				<p className="spec-hint">{cpuhint}</p>
			</div>
			<div className="spec-field">
				<label htmlFor="vcpurange">
					{label('console.spec.vcpusLabel')} <span className="spec-val">{spec.vcpus}</span>
				</label>
				<input
					className="spec-range"
					id="vcpurange"
					type="range"
					min={1}
					max={192}
					value={spec.vcpus}
					disabled={disabled}
					aria-label={label('console.spec.vcpusAria')}
					style={
						{
							'--r3-meter': `${Math.max(2, Math.min(100, (spec.vcpus / 192) * 100))}%`,
						} as CSSProperties
					}
					onChange={(event) => onChange({ vcpus: Number(event.target.value) })}
				/>
			</div>
			<div className="spec-field">
				<label htmlFor="ramrange">
					{label('console.spec.ramLabel')} <span className="spec-val">{spec.ramgb}</span>
				</label>
				<input
					className="spec-range"
					id="ramrange"
					type="range"
					min={1}
					max={ramceiling}
					value={spec.ramgb}
					disabled={disabled}
					aria-label={label('console.spec.ramAria')}
					style={
						{
							'--r3-meter': `${Math.max(2, Math.min(100, (spec.ramgb / ramceiling) * 100))}%`,
						} as CSSProperties
					}
					onChange={(event) => onChange({ ramgb: Number(event.target.value) })}
				/>
				<label htmlFor="ramnum">{label('console.spec.ramExactLabel')}</label>
				<input
					ref={ramnumref}
					className="spec-select spec-number"
					id="ramnum"
					type="number"
					min={1}
					max={ramceiling}
					value={ramdraft}
					disabled={disabled}
					aria-label={label('console.spec.ramExactAria')}
					onChange={(event) => onramnuminput(event.target.value)}
				/>
			</div>
			<div className="spec-field">
				<label htmlFor="gpusel">{label('console.spec.gpuLabel')}</label>
				<select
					className="spec-select"
					id="gpusel"
					disabled={disabled}
					aria-label={label('console.spec.gpuAria')}
					value={spec.gpu}
					onChange={(event) => onChange({ gpu: event.target.value })}
				>
					{gpudata.map((entry) => (
						<option key={entry.id} value={entry.id}>
							{labelfill('console.spec.gpuOption', {
								name: entry.name,
								memtype: entry.memtype,
								gb: String(entry.vrammib / 1024),
							})}
						</option>
					))}
				</select>
				<p className="spec-hint">{gpuhint}</p>
			</div>
			<div className="spec-field">
				<label htmlFor="migsel">{label('console.spec.migLabel')}</label>
				<select
					className="spec-select"
					id="migsel"
					disabled={disabled}
					aria-label={label('console.spec.migAria')}
					value={spec.mig}
					onChange={(event) => onChange({ mig: event.target.value })}
				>
					{migoptions().map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</div>
		</>
	);
}
