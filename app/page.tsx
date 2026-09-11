import Link from 'next/link';
import { Anchor, ArrowRight, Gamepad2 } from 'lucide-react';
export default function Library() {
  return (
    <main className="game-library">
      <header>
        <Link href="/" className="brand">
          ANEMKAI
        </Link>
        <span>Games for curious minds</span>
      </header>
      <section className="library-intro">
        <p className="eyebrow">THE GAME ROOM</p>
        <h1>
          A little ingenuity.
          <br />A lot of play.
        </h1>
        <p>Choose a game, try an idea, and see what happens.</p>
      </section>
      <div className="game-tiles">
        <Link className="game-tile turboat-tile" href="/turboat/">
          <div className="tile-art">
            <Anchor size={88} />
            <span>BUILD / TEST / RACE</span>
          </div>
          <div>
            <p className="eyebrow">ENGINEERING / RACING</p>
            <h2>Turboat Engineer</h2>
            <p>
              Shape a hull, tune an engine, and put your creation to the test on
              the water.
            </p>
            <strong className="tile-action">
              Enter the boatyard <ArrowRight size={20} />
            </strong>
          </div>
        </Link>
        <article className="game-tile coming-soon">
          <Gamepad2 size={48} />
          <h2>More games ahead</h2>
          <p>
            New experiments will find a home here. For now, there are boats to
            build.
          </p>
        </article>
      </div>
      <footer>ANEMKAI / A place to build, discover, and play.</footer>
    </main>
  );
}
