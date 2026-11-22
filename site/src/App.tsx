import { Cursor, Curtain, FitaMetrica, Loader, SkipLink } from './components';
import { site } from './content/site';
import { MotionProvider } from './motion';
import { HeroHome } from './sections/HeroHome';

/** Sem rotas ainda: só a seção hero, montada como no index do Overview. */
export function App() {
  return (
    <MotionProvider>
      <SkipLink />
      <FitaMetrica />
      <Curtain rotulo={site.cortina} loader={<Loader />} />
      <main id="conteudo" tabIndex={-1}>
        <HeroHome />
        {/* TEMPORÁRIO: espaço para rolar e testar a paralaxe, a pausa fora da viewport e a saída do hero. */}
        <div style={{ height: '100vh' }} aria-hidden="true" />
      </main>
      <Cursor />
    </MotionProvider>
  );
}
