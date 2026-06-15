import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header1xbet from "../components/Header1xbet";
import Sidebar1xbet from "../components/Sidebar1xbet";
import PaymentMethodCard from "../components/PaymentMethodCard";
import MonatoMethodCard from "../components/MonatoMethodCard";
import MonatoCombinedCard from "../components/MonatoCombinedCard";
import MonatoPayModal from "../components/MonatoPayModal";
import SpeiNativeModal from "../components/SpeiNativeModal";

import monatoSymbol from "../../assets/Symbol.png";
import spei from "../assets/spei.png";
import bbva from "../assets/bbva_logo_2025.png";
import oxxo from "../assets/oxxo_pay.png";
import codi from "../assets/codi.png";
import mercadopago from "../assets/mercadopago.png";
import banamex from "../assets/banamex.png";
import visa from "../assets/visa.png";
import mastercard from "../assets/mastercard.png";
import cardsVisaMc from "../assets/cards_visa_mc.png";
import binance from "../assets/binancecoinbsc.png";
import bitcoin from "../assets/bitcoin.png";
import ethereum from "../assets/ethereum.png";
import litecoin from "../assets/litecoin.png";
import ripple from "../assets/ripple.png";
import tron from "../assets/tron.png";
import usdc from "../assets/usdc.png";
import usdtbsc from "../assets/usdtbsc.png";
import usdttrx from "../assets/usdttrx.png";

export type ViewMode = 'pay' | 'plus' | 'spei';

const recommended = [
  { logo: spei, name: "SPEI" },
  { logo: bbva, name: "BBVA" },
  { logo: oxxo, name: "Oxxo Pay" },
  { logo: codi, name: "CoDi" },
  { logo: mercadopago, name: "Mercado Pago" },
  { logo: banamex, name: "Banamex" },
  { logo: visa, name: "Visa" },
  { logo: mastercard, name: "MasterCard" },
];

const cards = [
  { logo: visa, name: "Visa" },
  { logo: mastercard, name: "MasterCard" },
  { logo: cardsVisaMc, name: "Tarjetas locales" },
];

const cash = [{ logo: oxxo, name: "Oxxo Pay" }];

const transfer = [
  { logo: spei, name: "SPEI" },
  { logo: bbva, name: "BBVA" },
  { logo: codi, name: "CoDi" },
  { logo: mercadopago, name: "Mercado Pago" },
  { logo: banamex, name: "Banamex" },
];

const crypto = [
  { logo: binance, name: "Binance Coin BSC" },
  { logo: bitcoin, name: "Bitcoin" },
  { logo: ethereum, name: "Ethereum" },
  { logo: litecoin, name: "Litecoin" },
  { logo: ripple, name: "XRP" },
  { logo: tron, name: "TRON" },
  { logo: usdc, name: "USDC (Ethereum / ERC20)" },
  { logo: usdc, name: "USDT (Ethereum / ERC20)" },
  { logo: usdtbsc, name: "USDT (BSC / BEP20)" },
  { logo: usdttrx, name: "USDT (TRON / TRC20)" },
];

const tabs = [
  { label: "RECOMENDADOS", count: 9, active: false },
  { label: "TODOS LOS MÉTODOS", count: 27, active: true },
  { label: "TARJETAS BANCARIAS", count: 3, active: false },
  { label: "EN EFECTIVO", count: 1, active: false },
  { label: "TRANSFERENCIA BANCARIA", count: 5, active: false },
  { label: "CRIPTOMONEDA", count: 10, active: false },
];

type Props = {
  onNavigateHome: () => void;
  viewMode: ViewMode;
};

export default function Recharge({ onNavigateHome, viewMode }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'spei' | 'crypto' | undefined>(undefined);
  const [speiNativeOpen, setSpeiNativeOpen] = useState(false);

  function openModal(tab?: 'spei' | 'crypto') {
    setModalTab(tab);
    setModalOpen(true);
  }

  const showMonatoBrand = viewMode === 'pay' || viewMode === 'plus';
  const showProminent = viewMode === 'plus';
  const speiMode = viewMode === 'spei';

  return (
    <div className="xbet-page xbet-page--recharge">
      <Header1xbet onDeposit={() => {}} onLogoClick={onNavigateHome} />

      <div className="xbet-recharge">
        <Sidebar1xbet />

        <main className="xbet-recharge__main">

          <div className="xbet-recharge__alert">
            <span className="xbet-recharge__alert-icon">$</span>
            <span>Para descubrir el mundo de los juegos y ganar, ¡recargue su cuenta utilizando cualquier método de pago!</span>
            <button className="xbet-recharge__alert-close">×</button>
          </div>

          <h1 className="xbet-recharge__title">
            DEPÓSITO 1688885881 <span className="xbet-recharge__copy">📋</span>
          </h1>
          <p className="xbet-recharge__subtitle">Seleccione el método de pago para recargar su cuenta:</p>

          <div className="xbet-recharge__banner">
            Conviértete en agente y gana dinero con 1xBet! Para obtener más información, <a>contáctanos!</a>
          </div>

          <div className="xbet-recharge__layout">
            <aside className="xbet-recharge__tabs">
              {tabs.map((t) => (
                <button key={t.label} className={`xbet-rtab ${t.active ? "xbet-rtab--active" : ""}`}>
                  <span>{t.label}</span>
                  <span className="xbet-rtab__count">{t.count}</span>
                </button>
              ))}
            </aside>

            <div className="xbet-recharge__content">

              {/* ── RECOMENDADOS ─────────────────────────────── */}
              <section>
                <div className="xbet-recharge__section-title">RECOMENDADOS</div>

                {/* Grupo prominente — solo en modo Plus */}
                <AnimatePresence>
                  {showProminent && (
                    <motion.div
                      className="monato-group"
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                    >
                      <div className="monato-group__header">
                        <img src={monatoSymbol} alt="Monato" className="monato-group__logo" />
                        <span className="monato-group__name">Monato</span>
                        <span className="monato-group__desc">La opción más inteligente para depositar en 1xBet</span>
                      </div>
                      <div className="monato-group__cards">
                        <MonatoMethodCard type="pay"    index={0} onClick={() => openModal()} />
                        <MonatoMethodCard type="spei"   index={1} onClick={() => openModal('spei')} />
                        <MonatoMethodCard type="crypto" index={2} onClick={() => openModal('crypto')} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Grid de recomendados */}
                <div className="xbet-recharge__grid">
                  {/* En modo Pay/Plus: combined cards de marca Monato */}
                  {showMonatoBrand && (
                    <>
                      <MonatoCombinedCard type="pay"  onClick={() => openModal()} />
                      <MonatoCombinedCard type="spei" onClick={() => openModal('spei')} />
                    </>
                  )}
                  {recommended.map((m) => {
                    // En modo SPEI, la card SPEI abre el flujo nativo (con Fincopay por detrás)
                    const isSpei = m.name === "SPEI";
                    return (
                      <PaymentMethodCard
                        key={m.name}
                        logo={m.logo}
                        name={m.name}
                        onClick={speiMode && isSpei ? () => setSpeiNativeOpen(true) : undefined}
                      />
                    );
                  })}
                </div>
              </section>

              {/* ── TARJETAS BANCARIAS ───────────────────────── */}
              <section>
                <div className="xbet-recharge__section-title">TARJETAS BANCARIAS</div>
                <div className="xbet-recharge__grid">
                  {cards.map((m) => <PaymentMethodCard key={m.name} logo={m.logo} name={m.name} />)}
                </div>
              </section>

              {/* ── EN EFECTIVO ──────────────────────────────── */}
              <section>
                <div className="xbet-recharge__section-title">EN EFECTIVO</div>
                <div className="xbet-recharge__grid">
                  {cash.map((m) => <PaymentMethodCard key={m.name} logo={m.logo} name={m.name} />)}
                </div>
              </section>

              {/* ── TRANSFERENCIA BANCARIA ───────────────────── */}
              <section>
                <div className="xbet-recharge__section-title">TRANSFERENCIA BANCARIA</div>
                <div className="xbet-recharge__grid">
                  {transfer.map((m) => {
                    const isSpei = m.name === "SPEI";
                    return (
                      <PaymentMethodCard
                        key={m.name}
                        logo={m.logo}
                        name={m.name}
                        onClick={speiMode && isSpei ? () => setSpeiNativeOpen(true) : undefined}
                      />
                    );
                  })}
                </div>
              </section>

              {/* ── CRIPTOMONEDA ─────────────────────────────── */}
              <section>
                <div className="xbet-recharge__section-title">CRIPTOMONEDA</div>
                <div className="xbet-recharge__grid">
                  {showMonatoBrand && (
                    <MonatoCombinedCard type="crypto" onClick={() => openModal('crypto')} />
                  )}
                  {crypto.map((m, i) => (
                    <PaymentMethodCard key={`${m.name}-${i}`} logo={m.logo} name={m.name} />
                  ))}
                </div>
              </section>

            </div>
          </div>
        </main>
      </div>

      <MonatoPayModal open={modalOpen} onClose={() => setModalOpen(false)} defaultTab={modalTab} />
      <SpeiNativeModal open={speiNativeOpen} onClose={() => setSpeiNativeOpen(false)} />
    </div>
  );
}
