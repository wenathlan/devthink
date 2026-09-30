// Home — sub-âncora da página: importa os componentes dela e monta o desenho (clone deployável de só armazenamento (o DB da rede): guarda os DBs de cada site e recebe os backups dos dados)
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
