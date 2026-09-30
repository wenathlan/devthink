// Home — sub-âncora da página: importa os componentes dela e monta o desenho (template Next personalizado: a árvore da casa em formato Next tentando a raiz sem src)
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
