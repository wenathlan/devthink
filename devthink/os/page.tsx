import { DevThinkOS } from "@/components/devthink/shell/devthink-os";

/**
 * DevThink OS — rota única "/" (gateway + 5 apps da família devthink.pro).
 * O OS é client-side: barra de URL limpa, tema sol, Aura no gateway.
 */
export default function Page() {
  return <DevThinkOS />;
}
