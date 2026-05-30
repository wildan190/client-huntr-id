import React from "react";

type FeatureVariant = "indigo" | "purple";

interface AuthLayoutProps {
  variant?: "login" | "register";
  visualTitle: string;
  visualText: string;
  features: string[];
  featureVariant?: FeatureVariant;
  children: React.ReactNode;
}

export default function AuthLayout({
  variant = "login",
  visualTitle,
  visualText,
  features,
  featureVariant = "indigo",
  children,
}: AuthLayoutProps) {
  const blob1Class =
    variant === "register" ? "auth-blob--register-1" : "auth-blob--login-1";
  const blob2Class =
    variant === "register" ? "auth-blob--register-2" : "auth-blob--login-2";

  return (
    <div className="auth-page">
      <div className={`auth-blob auth-blob--1 ${blob1Class}`} aria-hidden />
      <div className={`auth-blob auth-blob--2 ${blob2Class}`} aria-hidden />

      <div className={`glass-panel auth-card auth-card--${variant}`}>
        <section className="auth-visual" aria-hidden="true">
          <img
            src="/assets/img/auth-assets/enterprise-building.jpg"
            alt=""
            className="auth-visual__img"
          />
          <div className="auth-visual__overlay">
            <div className="auth-visual__content">
              <h2 className="auth-visual__title">{visualTitle}</h2>
              <p className="auth-visual__text">{visualText}</p>
              <div className="auth-visual__features">
                {features.map((feature) => (
                  <span
                    key={feature}
                    className={`auth-feature-tag auth-feature-tag--${featureVariant}`}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="auth-form-section">{children}</div>
      </div>
    </div>
  );
}
