import React from "react";
import { FileText, Building2, ClipboardList, FileCheck2, User } from "lucide-react";

type FeatureVariant = "orange" | "amber" | "indigo" | "purple";

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
  featureVariant = "orange",
  children,
}: AuthLayoutProps) {
  const blob1Class =
    variant === "register" ? "auth-blob--register-1" : "auth-blob--login-1";
  const blob2Class =
    variant === "register" ? "auth-blob--register-2" : "auth-blob--login-2";

  const isRegister = variant === "register";

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
            <div className="auth-visual__logo-container">
              <img
                src="/assets/img/logo/sidebar.png"
                alt="HUNTR Logo"
                className="auth-visual__logo"
              />
            </div>
            <div className="auth-visual__content">
              {/* Hanya tampilkan title, text, dan features untuk login */}
              {!isRegister ? (
                <>
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
                </>
              ) : (
                /* Hanya tampilkan dokumen untuk register (hidden di mobile) */
                <div className="auth-visual__documents-only">
                  <div className="auth-documents auth-documents--desktop-only">
                    <h3 className="auth-documents__title">Dokumen yang Perlu Disiapkan</h3>
                    <ul className="auth-documents__list">
                      <li className="auth-document-item" data-tooltip="Wajib untuk perusahaan terdaftar">
                        <span className="auth-document-item__icon">
                          <FileText size={16} />
                        </span>
                        <span className="auth-document-item__text">NIB (Nomor Induk Berusaha)</span>
                      </li>
                      <li className="auth-document-item" data-tooltip="Untuk transaksi pajak dan keuangan">
                        <span className="auth-document-item__icon">
                          <Building2 size={16} />
                        </span>
                        <span className="auth-document-item__text">NPWP (Nomor Pokok Wajib Pajak)</span>
                      </li>
                      <li className="auth-document-item" data-tooltip="Izin usaha resmi dari pemerintah">
                        <span className="auth-document-item__icon">
                          <ClipboardList size={16} />
                        </span>
                        <span className="auth-document-item__text">SIUP (Surat Izin Usaha Perdagangan)</span>
                      </li>
                      <li className="auth-document-item" data-tooltip="Dokumen legal perusahaan">
                        <span className="auth-document-item__icon">
                          <FileCheck2 size={16} />
                        </span>
                        <span className="auth-document-item__text">Akta Pendirian Perusahaan</span>
                      </li>
                      <li className="auth-document-item" data-tooltip="Identitas penanggung jawab perusahaan">
                        <span className="auth-document-item__icon">
                          <User size={16} />
                        </span>
                        <span className="auth-document-item__text">KTP Direktur/Penanggung Jawab</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="auth-form-section">{children}</div>
      </div>
    </div>
  );
}
