# Document d’architecture – Plateforme de réservation de cours

## 1. Vision générale

L’application vise à offrir :
- Un front office web pour les adhérents (consultation du calendrier, réservation de cours, gestion des crédits, achat de cartes).
- Un back office admin (gestion des cours, planning, instructeurs, adhérents, suivi des crédits, opérations marketing).
- Une API sécurisée pour les communications front/back et intégrations tierces.
- Un système de réservation basé sur un calendrier et un modèle de crédits consommés.
- Un module de paiement (cartes de crédits) via Stripe.

Stack technologique imposée : **TypeScript, Node.js, Express, PostgreSQL, React, Tailwind, JWT, Stripe**.

## 2. Architecture logicielle

### 2.1. Vue d’ensemble
- **Architecture en micro-modules** : monorepo avec packages séparés (front adhérents, admin, API, libs partagées).
- **Back-end Node.js + Express** servant une API REST sécurisée, structurée en domaines (auth, users, courses, reservations, payments, credits).
- **Front-end React** (adhérents et admin) utilisant Tailwind pour la mise en forme, géré via Vite ou Next.js (option SSG/SSR si nécessaire).
- **Base de données PostgreSQL** avec Prisma (ORM TypeScript) ou Knex + Objection pour migrations et accès typé.
- **Authentification** via JWT (Access + Refresh tokens), intégration d’un provider OAuth (optionnel) et compatibilité SSO ultérieure.
- **Paiements** via Stripe (Checkout + Webhooks).
- **Tests** : Jest pour unitaires, Playwright/Cypress pour E2E, Supertest pour API.
- **CI/CD** : GitHub Actions ou GitLab CI avec pipeline (lint, tests unitaires, tests e2e, build, déploiement).

### 2.2. Schéma logique
1. Utilisateur adhérent (Front) ↔ API via HTTPS + JWT → Services : 
   - Auth Service (login, refresh, MFA éventuelle).
   - Course Service (catalogue, calendrier).
   - Reservation Service (book/cancel, check credits).
   - Credits Service (soldes, historique).
   - Payment Service (initiation paiement via Stripe, webhooks).
2. Back-office Admin (front dédié) ↔ API (endpoints protégés RBAC).
3. Base PostgreSQL :
   - Tables `users`, `roles`, `courses`, `sessions`, `reservations`, `credits_transactions`, `credit_packages`, `payments`, `stripe_events`.
4. Webhooks Stripe ↔ API Payment controller.
5. Services internes (jobs CRON) pour rappels de cours, expiration des crédits, envoi d’emails.

### 2.3. Modules back-end
- `AuthModule`: gestion inscription, login, refresh, reset password, MFA (TOTP ou OTP par email/SMS), rôles et permissions.
- `UserModule`: profil adhérent, préférences, historique.
- `CourseModule`: cours, instructeurs, calendrier, capacité.
- `ReservationModule`: workflow de réservation, annulation, listes d’attente, validation des crédits disponibles, émission d’événements (event-driven via queue interne ou simple publish/subscribe en mémoire type Node EventEmitter ou BullMQ si besoin).
- `CreditsModule`: achat, consommation, recharge, règles de validité.
- `PaymentModule`: Stripe Checkout, gestion des webhooks, mapping des paiements → crédits.
- `AdminModule`: endpoints d’administration (RBAC strict), dashboards (stats, gestion instructeurs).
- `NotificationModule`: envoi d’emails (SES/Mailgun), SMS (Twilio) et notifications push.
- `AuditModule`: logging, audit trails (traçabilité des actions sensibles).
- `HealthModule`: endpoints de santé, metrics (Prometheus).

### 2.4. Modules front-end
- **Front adhérent** :
  - Auth (login/register/forgot + MFA).
  - Dashboard (crédits restants, cours réservés).
  - Calendrier (React Big Calendar ou FullCalendar).
  - Réservation (UX guidée, validation crédits).
  - Paiement (intégration Stripe Checkout ou Elements).
  - Historique (transactions, réservations passées).
  - Profil (infos, préférences, notifications).
- **Front admin** :
  - Auth + RBAC (rôles admin, manager, instructeur).
  - Gestion cours/planning (CRUD, assignation instructeurs).
  - Gestion adhérents (profil, crédits, historique).
  - Tableau de bord (KPIs : taux de remplissage, revenus).
  - Gestion des promotions/packs de crédits.
  - Monitoring (logs, webhooks, alertes).
- **Librairie partagée** :
  - Types TypeScript partagés (DTOs, modèles).
  - Composants UI communs (boutons, modaux, forms).
  - Hooks auth, API clients.

## 3. Arborescence de projet (monorepo)

```
/app
  /apps
    /api
      src/
        modules/
          auth/
          users/
          courses/
          reservations/
          credits/
          payments/
          notifications/
          admin/
          audit/
        config/
        middlewares/
        utils/
        app.ts
        server.ts
      tests/
        unit/
        integration/
        e2e/
      prisma/ (ou migrations/)
      package.json
    /web-member
      src/
        components/
        pages/ (ou routes/)
        hooks/
        services/
        styles/
        tests/
      package.json
    /web-admin
      src/ (structure similaire)
      package.json
  /packages
    /ui
      src/ (composants partagés)
      package.json
    /tsconfig
    /eslint-config
    /jest-config
    /types (types partagés)
  package.json (workspace)
  turbo.json (ou nx.json) pour orchestration
  docker/
    docker-compose.yml
    api.Dockerfile
    web.Dockerfile
    nginx.conf
  .github/workflows/ (ou .gitlab-ci.yml)
  README.md
```

## 4. Base de données – Modèle de données (simplifié)

- `users (id, email, password_hash, salt, first_name, last_name, role_id, status, created_at, updated_at)`
- `roles (id, name, permissions JSONB)`
- `courses (id, title, description, level, duration, created_at, updated_at)`
- `course_sessions (id, course_id, instructor_id, start_time, end_time, capacity, location, status)`
- `instructors (id, user_id, bio, certifications)`
- `reservations (id, user_id, session_id, status, created_at, updated_at)`
- `credits_wallets (id, user_id, balance, expires_at)`
- `credits_transactions (id, wallet_id, amount, type [purchase|deduction|refund], reference_id, created_at)`
- `credit_packages (id, name, credits_amount, price, validity_days, created_at)`
- `payments (id, user_id, package_id, stripe_payment_intent, amount, currency, status, created_at)`
- `stripe_events (id, event_id, type, payload JSONB, processed_at)`
- `audit_logs (id, user_id, action, entity, metadata JSONB, created_at)`

## 5. Sécurité & Authentification

### 5.1. Authentification
- **JWT Access Token** (durée courte, 15 min) + **Refresh Token** (durée longue, 7 jours) stocké HTTP-only Secure cookie côté client.
- Prise en charge **MFA** (TOTP) pour admin, optionnel pour adhérent.
- Password hashing via Argon2id (ou bcrypt avec coût élevé).
- Politique de rotation des refresh tokens (token rotation).
- Mécanisme de revocation (table `token_blacklist` ou versionning via `token_version` par utilisateur).
- Support OAuth 2.0 / OpenID Connect (extension future).
- CSRF protection pour actions sensibles (tokens double-submit pour cookies si usage cookie).

### 5.2. Autorisation
- **RBAC** : rôles (admin, manager, instructeur, membre) + granularité via permissions JSON.
- Middleware Express pour contrôler les scopes.
- Restrictions sur endpoints admin (double-check) et logs d’audit.

### 5.3. OWASP bonnes pratiques
- **OWASP Top 10** :
  - A01 (Broken Access Control) : tests d’autorisation systématiques, enforcement RBAC, audits, policies.
  - A02 (Cryptographic Failures) : HTTPS partout, TLS 1.2+, secrets gérés via vault (.env chiffrés), Argon2/Bcrypt.
  - A03 (Injection) : ORM/Query Builder paramétré, validation input (Zod/Yup), sanitization, prepared statements.
  - A04 (Insecure Design) : threat modeling régulier, tests sécurité, patterns secure by design.
  - A05 (Security Misconfiguration) : config par environnement, headers sécurité (Helmet), CORS restrictif, scanners.
  - A06 (Vulnerable Components) : Dependabot, npm audit, pin versions.
  - A07 (Identification/Authentication Failures) : MFA, rate limiting login, lockout progressif.
  - A08 (Software/Integrity Failures) : CI signature, attestation artefacts, dépendances hashées.
  - A09 (Security Logging/Monitoring) : logs structurés, centralisation (ELK), alertes anomalies.
  - A10 (Server-Side Request Forgery) : validation URL, allowlist, proxy.
- Autres :
  - Rate limiting (login, réservations, paiement) avec Redis/Bull.
  - Helmet (Content-Security-Policy, HSTS, XSS protection).
  - Sanitisation et validation de toutes entrées (zod).
  - Stockage minimal de données sensibles (compliance RGPD, PCI).
  - Logging audit (création, suppression, modification données critiques).

## 6. Tests et qualité

### 6.1. Stratégie de tests
- **Unit tests** (Jest) pour services, utilitaires, hooks front.
- **Integration tests** pour endpoints Express (Supertest + DB test container via Docker + Testcontainers).
- **E2E tests** :
  - Back-end : Postman/Newman, Pact tests pour contrats, Playwright API.
  - Front-end : Playwright/Cypress (scénarios adhérents et admin).
- **Test de performance** (k6) sur endpoints critiques (réservations, paiement).
- **Test sécurité** : scans OWASP ZAP, npm audit, Snyk.

### 6.2. Pipeline CI/CD
- GitHub Actions:
  1. `lint` (ESLint, Prettier check).
  2. `test:unit`.
  3. `test:integration` (DB container).
  4. `test:e2e` (optionnel nightly).
  5. `build` (front + API).
  6. `docker build` + push registry.
  7. Déploiement staging (manu/déclenchement auto) via IaC (Terraform/Ansible/Helm).
- Secrets gérés via GitHub Secrets/HashiCorp Vault.
- Quality gates (coverage >= 80%, lint zero errors).

## 7. Observabilité & Ops

- **Logging** : Winston/Pino (JSON), corrélation via request-id (middleware), centralisé (ELK/Datadog).
- **Metrics** : Prometheus (Node exporter, business metrics : réservations, paiements).
- **Tracing** : OpenTelemetry (option).
- **Monitoring** : alertes (PagerDuty/Slack).
- **Backups** : snapshots PostgreSQL, rotation.
- **DRP** : plan de reprise (RPO/RTO définis).
- **Environnements** : dev (local Docker), staging (mirroring prod), prod (HA, scaling auto).
- **Infrastructure** : conteneurs (Docker/K8s), reverse proxy (NGINX) pour SSL termination, WAF optionnel.

## 8. Flux principaux

1. **Inscription adhérent** : Formulaire → validation → création user (hash) → email confirmation → attribution wallet.
2. **Réservation** : Auth → sélection cours → check capacité + crédits → transaction (débit) → confirmation, envoi email → mise à jour planning instructeur.
3. **Achat crédits** : Sélection package → Stripe Checkout → webhook (payment succeeded) → créditation wallet → email facture.
4. **Admin planning** : Auth admin (MFA) → gestion sessions (CRUD) → notifications instructeurs/adhérents.
5. **Annulation** : Adhérent annule → règles (remboursement selon délai) → créditation wallet si éligible → notifications.

## 9. Sécurité des paiements (Stripe)

- Utilisation Stripe Checkout / Payment Intents.
- Aucune donnée carte stockée, seulement IDs Stripe.
- Webhooks sécurisés (signing secret, IP allowlist, retries).
- Gestion des statuts de paiement (pending, succeeded, failed).
- Audit log actions financières.

## 10. Gestion des crédits

- **Wallet** : chaque user a un solde et historique.
- **Transaction** : toute opération (achat, consommation, remboursement) = `credits_transactions`.
- **Validité** : expiry géré via `expires_at` + job CRON.
- **Politique** : configuration packs (taille, prix, validité).
- **Prévention** : double spending évité via transactions SQL (SERIALIZABLE/REPEATABLE READ) lors des réservations.

## 11. Déploiement & scalabilité

- **Back-end** : conteneurs Node, scale horizontal (K8s autoscaling).
- **Front** : statique (Vercel/Netlify) ou conteneur NGINX.
- **DB** : PostgreSQL géré (RDS/CloudSQL) en HA, read replica pour analytics.
- **Cache** : Redis pour sessions, rate limiting, caching (disponibilité, queue).
- **File storage** : S3-like si besoin (documents, images).
- **CDN** : pour assets front.

## 12. Roadmap évolutive

- Phase 1 : MVP (réservations, crédits, paiement, admin basique).
- Phase 2 : Notifications push, analytics avancés, intégration CRM.
- Phase 3 : Mobile app (React Native) exploitant la même API, SSO corporatif, B2B.

## 13. Gouvernance & conformité

- Documentation (ADR, README, API docs via OpenAPI + Redoc).
- Revues de code obligatoires, lint et tests automatiques.
- Politique RGPD : consentement, anonymisation, DPO.
- Backups chiffrés, rotation clés API.
- Mise en place d’un registre de traitements (RGPD).
- Conformité PCI DSS pour usage Stripe (limiter portée, pas de stockage carte).

---

Ce document offre une vision complète, testable et sécurisée de l’architecture de la plateforme de réservation de cours, prête à être implémentée avec la stack TypeScript/Node/React/PostgreSQL/Stripe, en appliquant les meilleures pratiques OWASP et une démarche DevSecOps intégrée.
