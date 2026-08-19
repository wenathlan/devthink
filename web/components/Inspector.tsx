/** Style: DevThink Terminal Atelier — the inspector makes embedded gateway evidence legible without overwhelming the canvas. */
import { Activity, ChevronDown, ExternalLink, ShieldCheck, Waypoints, X } from "lucide-react";
import { toast } from "sonner";
import type { DevThinkProvider } from "./devthink-types";

type InspectorProps = {
  provider: DevThinkProvider;
  onClose: () => void;
};

export function Inspector({ provider, onClose }: InspectorProps) {
  return (
    <aside className="inspector" aria-label="Inspector de rota">
      <div className="inspector__header"><div><span className="eyebrow">Route inspector</span><h2>Evidence, not guesswork.</h2></div><button onClick={onClose} aria-label="Fechar inspector"><X size={17} /></button></div>
      <section className="inspector-card inspector-card--route">
        <div className="inspector-card__title"><Waypoints size={16} /><span>Selected path</span><span className="route-ok">healthy</span></div>
        <div className="route-map"><img src="/manus-storage/relayze-route-atlas_529d27c6.jpg" alt="Mapa abstrato da rota do provider" /></div>
        <div className="route-chain"><span>devthink</span><i>→</i><span>embedded gateway</span><i>→</i><strong>{provider.label}</strong></div>
        <button className="inspector-link" onClick={() => toast("O endpoint será configurado no arquivo devthink.json do usuário.")}>inspect provider endpoint <ExternalLink size={13} /></button>
      </section>
      <section className="inspector-card">
        <div className="inspector-card__title"><Activity size={16} /><span>Stream health</span><ChevronDown size={15} /></div>
        <div className="metric-grid"><div><small>first event</small><strong>186 <em>ms</em></strong></div><div><small>event flow</small><strong>steady</strong></div><div><small>decoder</small><strong>SSE v1</strong></div><div><small>retries</small><strong>0</strong></div></div>
        <img className="stream-detail" src="/manus-storage/relayze-stream-detail_9a46a914.jpg" alt="Visual abstrato de eventos em streaming" />
      </section>
      <section className="inspector-card inspector-card--policy">
        <div className="inspector-card__title"><ShieldCheck size={16} /><span>Local policy</span></div>
        <p>Credentials stay within the gateway boundary. The browser receives normalized events and redacted route state.</p>
        <button className="inspector-link" onClick={() => toast("A política de segurança será lida do DevThink Core.")}>open local policy <ExternalLink size={13} /></button>
      </section>
      <div className="theme-swatch"><img src="/manus-storage/relayze-theme-material_82ba9e6c.jpg" alt="Material do tema Copper Browser Atelier" /><div><span>theme</span><strong>copper atelier</strong></div></div>
    </aside>
  );
}
