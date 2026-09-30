// Home — page sub-anchor: same name as the folder, imports the sibling components
import { Entry } from './entry';
import { Tabs } from './tabs';
import type { HomeProps } from './types';

export function Home(props: HomeProps) {
  return (
    <main className="page">
      <h1>Home</h1>
      <p>{props.input}</p>
      <Entry />
      <Tabs />
    </main>
  );
}
