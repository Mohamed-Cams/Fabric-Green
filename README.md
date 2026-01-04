# GreenLand Fabric

**Plateforme immobilière blockchain multitenante basée sur Hyperledger Fabric 2 pour le Sénégal**

![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)
![Hyperledger Fabric](https://img.shields.io/badge/Hyperledger%20Fabric-2.5-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)

## 🌍 À propos

GreenLand Fabric est une solution blockchain complète développée par **Green T SARL Sénégal** pour résoudre les problèmes fonciers au Sénégal. La plateforme utilise Hyperledger Fabric 2 pour offrir transparence, traçabilité et confiance dans la gestion immobilière.

### ✨ Fonctionnalités principales

- 🏠 **Enregistrement et transfert de propriétés** avec historique immuable
- 📄 **Gestion sécurisée des documents** avec accès temporel contrôlé
- 🪙 **Tokenisation des actifs** pour propriété fractionnée
- 🏘️ **Gestion des baux et loyers** automatisée
- 💳 **4 modes de paiement** : Stripe (Visa), Wave, Orange Money, Virement bancaire
- 💰 **Commission automatique 3%** reversée à Green T SARL
- 🔐 **Sécurité renforcée** : JWT, RBAC, rate limiting, encryption
- 📊 **Observabilité complète** : Prometheus, Grafana, Jaeger
- 🌐 **Multitenancy** : Support de plusieurs régions/communes
- 📱 **Application mobile** React Native avec géolocalisation

## 🏗️ Architecture

```
greenland-fabric/
├── fabric/                    # Réseau Hyperledger Fabric
│   ├── config/               # Configurations réseau
│   ├── chaincode/            # Smart contracts (4 contrats)
│   └── network/              # Scripts de déploiement
├── backend/                   # API Node.js/Express
│   └── src/
│       ├── config/           # Configuration
│       ├── middleware/       # Auth, RBAC, Validation
│       ├── services/         # Paiements, Notifications, AI
│       ├── controllers/      # Logique métier
│       └── routes/           # API REST
├── frontend/                  # Application web Next.js
├── mobile/                    # Application mobile React Native
├── observability/            # Prometheus, Grafana, Jaeger
└── deploy/                   # Docker Compose, Kubernetes
```

## 🚀 Démarrage rapide

### Prérequis

- Docker & Docker Compose
- Node.js 18+
- Hyperledger Fabric binaries (cryptogen, configtxgen)
- PostgreSQL 15+

### Installation

#### 1. Cloner le projet

```bash
git clone https://github.com/green-t-sarl/greenland-fabric.git
cd greenland-fabric
```

#### 2. Générer le réseau Fabric

```bash
cd fabric/network/scripts
chmod +x *.sh
./generate.sh
./up.sh
./createChannel.sh dakar
./deployChaincode.sh property dakar
```

#### 3. Démarrer le backend

```bash
cd backend
cp .env.example .env
# Éditer .env avec vos configurations
npm install
npm start
```

#### 4. Démarrer le frontend

```bash
cd frontend
npm install
npm run dev
```

#### 5. Démarrer l'application mobile

```bash
cd mobile
npm install
expo start
```

## 📡 API Endpoints

### Propriétés

- `POST /api/properties/register` - Enregistrer une propriété
- `POST /api/properties/transfer` - Transférer une propriété
- `GET /api/properties/:id` - Obtenir une propriété
- `GET /api/properties/:id/history` - Historique d'une propriété

### Baux

- `POST /api/leases/create` - Créer un bail
- `POST /api/leases/pay` - Payer un loyer
- `GET /api/leases/:id` - Statut d'un bail
- `POST /api/leases/close` - Fermer un bail

### Paiements

- `POST /api/payments/pay` - Effectuer un paiement
  - Méthodes: `STRIPE`, `WAVE`, `OM`, `BANK`
  - Commission automatique 3% pour Green T SARL

## 💳 Modes de paiement

| Méthode | Description | Commission Green T |
|---------|-------------|-------------------|
| **Stripe** | Paiements Visa/Mastercard | 3% auto-reversée |
| **Wave** | Wave Sénégal (mobile money) | 3% auto-reversée |
| **Orange Money** | Orange Money Sénégal | 3% auto-reversée |
| **Virement** | Virement bancaire | 3% (validation manuelle) |

## 🔐 Rôles et permissions (RBAC)

- **BUYER** : Acheteur
- **SELLER** : Vendeur
- **NOTARY** : Notaire (approbations, enregistrements)
- **BANK** : Banque (hypothèques, financements)
- **AUTHORITY** : Autorité publique (validation, audit)
- **ADMIN** : Administrateur système
- **TENANT** : Locataire (paiements de loyers)

## 📊 Observabilité

### Métriques Prometheus

- Transactions blockchain
- Paiements et commissions
- Baux et loyers
- Notifications envoyées

### Dashboards Grafana

- **Fabric Transactions** : Métriques du réseau blockchain
- **Paiements & Commission Green T** : Suivi financier
- **Baux & Loyers** : Gestion locative
- **Notifications** : Alertes et rappels

### Tracing Jaeger

- Traçabilité distribuée des requêtes API
- Performance et debugging

## 🌍 Conformité Sénégal

La plateforme respecte :

- ✅ Lois sur le cadastre et la conservation des hypothèques
- ✅ Protection des données personnelles
- ✅ Traçabilité et audit légal
- ✅ Interopérabilité avec systèmes existants

Voir `backend/src/docs/compliance-senegal.md` pour plus de détails.

## 🔧 Configuration

### Variables d'environnement backend

Copier `.env.example` vers `.env` et configurer :

```env
# Paiements
STRIPE_KEY=sk_test_...
WAVE_API_KEY=...
OM_API_KEY=...

# Comptes Green T SARL (Commission 3%)
GREEN_T_WAVE_ACCOUNT=+221XXXXXXXXX
GREEN_T_OM_ACCOUNT=+221XXXXXXXXX
GREEN_T_BANK_IBAN=SN00XXXXXXXXXXXXXXXXXXXX
COMMISSION_RATE=0.03
```

## 📱 Application mobile

L'application mobile React Native offre :

- Consultation des propriétés
- Géolocalisation avec OpenStreetMap
- Paiements simplifiés
- Notifications push

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence Apache 2.0. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Auteurs

**Green T SARL Sénégal**

- Website: https://greent.sn
- Email: contact@greent.sn

## 🙏 Remerciements

- Hyperledger Fabric Community
- Communauté blockchain du Sénégal
- Tous les contributeurs du projet

---

**© 2024 Green T SARL Sénégal. Tous droits réservés.**
