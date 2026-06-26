import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import Symbol from '../../assets/Symbol.png';
import './styles.css';

interface LoginProps {
  onSuccess: () => void;
}

// ─── Animation variants ──────────────────────────────────────────────────────
// Typed explicitly to avoid framer-motion AnimationGeneratorType inference errors

/**
 * Header group: starts visually in the form's area (translateY +220px),
 * then slides up to its final position at the top.
 *
 * Why translateY: it offsets visually without moving in flow.
 * The form below keeps its slot (with opacity 0) so when the header
 * arrives at y:0, the form area is ready to fade in.
 */
const headerVariants: Variants = {
  hidden: { y: 220 },
  visible: {
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.32, 0.72, 0, 1], // ease-out with subtle overshoot feel
      delay: 1.2, // wait for children (symbol, title, subtitle) to fade in
    },
  },
};

const symbolVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' }, // 0.0 – 0.4s
  },
};

const titleVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut', delay: 0.4 }, // 0.4 – 0.75s
  },
};

const subtitleVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: 'easeOut', delay: 0.8 }, // 0.8 – 1.15s
  },
};

// Form: starts AFTER the header has slid up (~2.0s)
const formContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 2.0,
      staggerChildren: 0.07,
    },
  },
};

const formItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

// Tail (divider + socials + sign-up): appears last
const tailVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut', delay: 2.5 },
  },
};

// Loading overlay
const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

// ─── Helper ──────────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Component ───────────────────────────────────────────────────────────────

export function Login({ onSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const [res] = await Promise.all([
        fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ password }),
        }),
        sleep(1200), // min perceived feedback
      ]);

      if (res.ok) {
        await sleep(200);
        onSuccess();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Error al iniciar sesión');
        setLoading(false);
      }
    } catch {
      setError('Error de conexión');
      setLoading(false);
    }
  };

  return (
    <div className="monato-login-screen">
      <div className="monato-login-glow" aria-hidden="true" />

      <motion.div
        className="monato-login-content"
        initial="hidden"
        animate="visible"
      >
        {/* Header — starts in form area, slides up */}
        <motion.header className="monato-login-header" variants={headerVariants}>
          <motion.img
            src={Symbol}
            alt="Monato"
            className="monato-login-symbol"
            variants={symbolVariants}
          />
          <motion.h1
            className="monato-login-title"
            variants={titleVariants}
          >
            Welcome back
          </motion.h1>
          <motion.p
            className="monato-login-subtitle"
            variants={subtitleVariants}
          >
            Login to continue your journey with us.
          </motion.p>
        </motion.header>

        <div className="monato-login-form-wrap">
          {/* Email form — staggered cascade */}
          <motion.form
            className="monato-login-form"
            onSubmit={handleSubmit}
            variants={formContainerVariants}
          >
            <motion.label className="monato-login-field" variants={formItemVariants}>
              <span className="monato-login-label">Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="monato-login-input"
              />
            </motion.label>

            <motion.label className="monato-login-field" variants={formItemVariants}>
              <span className="monato-login-label">Password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="monato-login-input"
                required
                autoFocus
              />
            </motion.label>

            <motion.div className="monato-login-row" variants={formItemVariants}>
              <label className="monato-login-remember">
                <input
                  type="checkbox"
                  className="monato-login-checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <a
                href="#"
                onClick={e => e.preventDefault()}
                className="monato-login-forgot"
              >
                Forgot password?
              </a>
            </motion.div>

            {error && (
              <motion.div
                className="monato-login-error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading || !password}
              className="monato-login-button"
              variants={formItemVariants}
              whileTap={!loading && password ? { scale: 0.98 } : undefined}
            >
              Sign in
            </motion.button>
          </motion.form>

          {/* Tail — divider + socials + sign-up */}
          <motion.div
            className="monato-login-tail"
            variants={tailVariants}
          >
            <div className="monato-login-divider">
              <span className="monato-login-divider-line" />
              <span className="monato-login-divider-text">Or sign in with your accounts</span>
              <span className="monato-login-divider-line" />
            </div>

            <div className="monato-login-socials">
              <button
                type="button"
                className="monato-login-social-btn"
                disabled
                title="Coming soon"
                aria-label="Sign in with Google — coming soon"
              >
                <GoogleIcon />
                <span className="monato-login-social-label">Sign in with Google</span>
                <span className="monato-login-soon-badge">Soon</span>
              </button>
              <button
                type="button"
                className="monato-login-social-btn"
                disabled
                title="Coming soon"
                aria-label="Sign in with Facebook — coming soon"
              >
                <FacebookIcon />
                <span className="monato-login-social-label">Sign in with Facebook</span>
                <span className="monato-login-soon-badge">Soon</span>
              </button>
            </div>

            <p className="monato-login-signup">
              Don't have an account?{' '}
              <a
                href="#"
                onClick={e => e.preventDefault()}
                className="monato-login-signup-link"
              >
                Sign Up
              </a>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* ─── Loading overlay ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="monato-login-loading-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="status"
            aria-live="polite"
          >
            <motion.div
              className="monato-login-spinner"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <motion.p
              className="monato-login-loading-text"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              Iniciando sesión...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Icons (inline SVG, no external deps) ────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.469H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.313 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.875V12h3.328l-.532 3.469h-2.796v8.385C19.612 22.954 24 17.99 24 12z" fill="#1877F2"/>
    </svg>
  );
}
