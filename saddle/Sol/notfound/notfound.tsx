/**
 * notfound page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it imports the loose components beside it, mounts the page and re-exports
 * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes
 * this file. This anchor carries the former main component of the folder,
 * which now lives here as the page mount itself.
 */

// # NotFound — the 404 of the saddle theme: a route the static edge never mapped.
import { Link } from 'wouter';
import { label } from '../../labels.ts';

export default function NotFound() {
	return (
		<div className="site-frame notfound-page">
			<main>
				<section className="container notfound-frame">
					<p className="eyebrow">{label('notfound.eyebrow')}</p>
					<h1>{label('notfound.title')}</h1>
					<p>{label('notfound.body')}</p>
					<div className="notfound-actions">
						<Link href="/" className="button button-primary">
							{label('notfound.backHome')}
						</Link>
						<Link href="/agent-browser" className="button">
							{label('notfound.agentBrowser')}
						</Link>
					</div>
				</section>
			</main>
		</div>
	);
}
