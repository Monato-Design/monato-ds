import Header1xbet from "../components/Header1xbet";
import HomeHero from "../components/HomeHero";
import HomeMatches from "../components/HomeMatches";

type Props = {
  onDeposit: () => void;
};

export default function Home({ onDeposit }: Props) {
  return (
    <div className="xbet-page xbet-page--home">
      <Header1xbet onDeposit={onDeposit} />
      <main className="xbet-home">
        <HomeHero onDeposit={onDeposit} />
        <HomeMatches />
      </main>
    </div>
  );
}
