import dynamic from 'next/dynamic';

// a âncora global do app vive na raiz (sem src); o Next personalizado monta ela direto da raiz
const App = dynamic(() => import('../App'), { ssr: false });

export default function Page() {
  return <App />;
}
