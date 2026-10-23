"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const MIN_PASSWORD_LENGTH = 6;

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();
    if (!/^[^\s@]+@gmail\.com$/i.test(normalizedEmail)) {
      setError("Please enter a valid Gmail address ending in @gmail.com.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Your password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    try {
      sessionStorage.setItem("notely-user", normalizedEmail);
    } catch {
      setError("Your browser couldn’t start a session. Please enable browser storage and try again.");
      return;
    }
    router.push("/notes");
  }

  function fillDemoCredentials() {
    setEmail("test@gmail.com");
    setPassword("starlight6");
    setError("");
  }

  return (
    <main className="login-page">
      <div className="login-shell">
        <section className="login-feature" aria-label="My Notes App">
          <div className="feature-brand">
            <span className="feature-brand-mark" aria-hidden="true">✦</span>
            <span>MY NOTES APP</span>
          </div>
          <div className="feature-copy">
            <span className="feature-eyebrow">A little space for your thoughts</span>
            <h2>
              Get it out
              <br />
              of your <em>head.</em>
            </h2>
            <p>
              Keep your ideas, plans, and reminders together in one calm place.
            </p>
          </div>
          <div className="feature-art" aria-hidden="true">
            <span className="feature-orbit feature-orbit-one" />
            <span className="feature-orbit feature-orbit-two" />
            <span className="feature-star feature-star-one">✦</span>
            <span className="feature-star feature-star-two">✧</span>
            <span className="feature-star feature-star-three">·</span>
            <div className="feature-oracle">
              <div className="oracle-header">
            <div className="oracle-moon-row" aria-hidden="true">
              <span>☾</span>
              <span className="oracle-sun">☼</span>
              <span>☾</span>
            </div>
            <p className="oracle-wordmark">✦ MY NOTES APP ✦</p>
          </div>
              <div className="feature-oracle-paper">
                <span>✧</span>
                <span className="feature-paper-line" />
                <span className="feature-paper-line feature-paper-line-short" />
                <span className="feature-paper-note">remember this</span>
              </div>
            </div>
          </div>
          <p className="feature-footer"><span>☾</span> A PLACE TO THINK CLEARLY <span>☽</span></p>
        </section>

        <section className="login-panel" aria-labelledby="login-title">
          <div className="login-panel-top">
            <span className="login-panel-label">YOUR PERSONAL NOTES</span>
            <span className="login-panel-sigil" aria-hidden="true">✧</span>
          </div>
          <section className="login-card" aria-labelledby="login-title">
            <div className="login-frame">
          <div className="login-form-frame">
            <span className="frame-screw screw-form-left" />
            <span className="frame-screw screw-form-right" />
            <h1 id="login-title" className="login-title">
              <span>—</span> SIGN IN <span>—</span>
            </h1>
            <form className="oracle-form" onSubmit={handleSubmit} noValidate>
              <label className="visually-hidden" htmlFor="email">Email address</label>
              <div className="oracle-input">
                <input
                  autoComplete="email"
                  id="email"
                  name="email"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  placeholder="Email (@gmail.com)"
                  type="email"
                  value={email}
                  aria-describedby={error ? "login-error" : undefined}
                />
                <span aria-hidden="true">★</span>
              </div>

              <label className="visually-hidden" htmlFor="password">Password</label>
              <div className="oracle-input">
                <input
                  autoComplete="current-password"
                  id="password"
                  name="password"
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder={`Password (> ${MIN_PASSWORD_LENGTH - 1} chars)`}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  aria-describedby={error ? "login-error" : undefined}
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  type="button"
                >
                  {showPassword ? "◉" : "◎"}
                </button>
              </div>

              <button className="oracle-login-button" type="submit">LOGIN</button>
              <p
                className={`login-error${error ? " is-visible" : ""}`}
                id="login-error"
                role="alert"
              >
                {error || "\u00a0"}
              </p>
              <button className="demo-credentials" onClick={fillDemoCredentials} type="button">
                <span aria-hidden="true">✧</span> Fill demo credentials
              </button>
            </form>
            <span className="frame-screw screw-form-bottom-left" />
            <span className="frame-screw screw-form-bottom-right" />
          </div>
          <span className="frame-screw screw-bottom-left" />
          <span className="frame-screw screw-bottom-right" />
            </div>
          </section>
          <p className="login-caption">A simple place to keep track of what matters.</p>
        </section>
      </div>
    </main>
  );
}
