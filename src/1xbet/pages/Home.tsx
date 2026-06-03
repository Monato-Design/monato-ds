import { motion } from 'framer-motion';
import Header1xbet from '../components/Header1xbet';
import HomeSidebarSports from '../components/HomeSidebarSports';
import HomeBanner from '../components/HomeBanner';
import HomeCasinoRow from '../components/HomeCasinoRow';
import HomeLiveMatches from '../components/HomeLiveMatches';
import HomeRegisterPanel from '../components/HomeRegisterPanel';

type Props = {
  onDeposit: () => void;
};

export default function Home({ onDeposit }: Props) {
  return (
    <div className="xbet-page xbet-page--home">
      <Header1xbet onDeposit={onDeposit} />
      <motion.div
        className="xbet-home-real"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <HomeSidebarSports />
        <main className="xbet-home-real__center">
          <HomeBanner onDeposit={onDeposit} />
          <HomeCasinoRow />
          <HomeLiveMatches />
        </main>
        <HomeRegisterPanel onDeposit={onDeposit} />
      </motion.div>
    </div>
  );
}
