// Home — sub-âncora da página: importa os componentes dela e monta o desenho (clone deployável completo (sandbox + DB): roda, é sandbox e guarda os DBs da rede)
import { homebox } from './Home.styles';
import type { Homeprops } from './Home.types';

export function Home(props: Homeprops) {
  return (
    <main style={homebox}>
      <h1>Home</h1>
      <p>{props.entrada}</p>
    </main>
  );
}
