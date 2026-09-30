// Home — sub-âncora da página: importa os componentes dela e monta o desenho (clone deployável de só execução (a sandbox): roda qualquer binário com a engine Saddle e não guarda nada)
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
