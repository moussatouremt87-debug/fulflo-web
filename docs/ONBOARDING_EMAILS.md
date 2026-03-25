# FulFlo - Sequence d'emails d'onboarding client

> **From:** "FulFlo" <james@fulflo.app>
> **Marche:** France uniquement
> **Ton:** Chaleureux, authentique, anti-gaspi positif, jamais agressif
> **Marques partenaires:** Favrichon, Michel et Augustin, Coslys, Melvita, Alpina Savoie, Cristalline, Le Petit Marseillais, Lamazuna

---

## Vue d'ensemble de la sequence

| Email | Timing | Condition | Objectif |
|-------|--------|-----------|----------|
| J0 - Bienvenue | Immediat (signup) | Aucune | Accueil + code FULFLO10 |
| J1 - Comment ca marche | +24h | Aucune | Education + decouverte produits |
| J3 - Offre du moment | +3 jours | Pas de commande | Conversion via produit hero |
| J7 - Votre code expire | +7 jours | Pas de commande | Urgence code promo |
| J14 - Derniere chance | +14 jours | Pas de commande | Derniere tentative + offre exclusive |
| J30 - On vous manque | +30 jours | Pas de commande | Re-engagement doux |

---

## J0 -- Bienvenue

**Declencheur:** Immediatement apres inscription
**Condition:** `customer.created_at` = maintenant, aucune condition supplementaire

**Sujet:** Bienvenue chez FulFlo, {{prenom}} !
*(47 caracteres avec prenom court)*

**Texte d'apercu:** -5EUR sur votre 1ere commande avec le code FULFLO10

### Corps de l'email

```
Bonjour {{prenom}},

Bienvenue dans la communaute FulFlo !

Vous venez de rejoindre des milliers de personnes qui ont choisi de consommer
malin tout en luttant contre le gaspillage. On est ravis de vous compter
parmi nous.

FulFlo, c'est simple : on recupere les surplus de grandes marques francaises
-- des produits parfaitement bons, certifies, mais qui n'ont pas trouve leur
place en rayon. Resultat : vous en profitez a -40% a -70% du prix habituel.

Des marques que vous connaissez deja :
- Favrichon (cereales & mueslis bio)
- Michel et Augustin (biscuits gourmands)
- Melvita (cosmetiques bio)
- Le Petit Marseillais (soins du quotidien)
- Lamazuna (zero dechet)
- Et bien d'autres...

Pour feter votre arrivee, voici un petit cadeau :

    ┌─────────────────────────────────┐
    │   Code : FULFLO10               │
    │   -5EUR sur votre 1ere commande  │
    │   Valable 21 jours              │
    └─────────────────────────────────┘

Livraison en 3 a 5 jours ouvrés, gratuite des 49EUR.

[CTA] Decouvrir les offres du moment
      → https://fulflo.app/offres

A tres vite,
James
FulFlo -- Le surplus des grandes marques, a petit prix.

---
Se desinscrire | Preferences email
FulFlo SAS - France
```

**Texte du bouton CTA:** `Decouvrir les offres du moment`

---

## J1 -- Comment ca marche

**Declencheur:** 24h apres `customer.created_at`
**Condition:** Aucune (envoye a tous)

**Sujet:** Comment ca marche, FulFlo ?
*(35 caracteres)*

**Texte d'apercu:** 3 etapes, des economies reelles, zero gaspillage

### Corps de l'email

```
Bonjour {{prenom}},

On sait que decouvrir un nouveau site peut soulever des questions.
Voici comment FulFlo fonctionne, en 3 etapes :

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. LES MARQUES ONT DES SURPLUS
     Changement de packaging, fin de serie, surproduction...
     Ces produits sont 100% conformes mais ne peuvent plus etre
     vendus en circuit classique.

  2. FULFLO LES RECUPERE
     On les controle, on verifie les DLC, et on les met en
     ligne a prix reduit : -40% a -70%.

  3. VOUS EN PROFITEZ
     Vous commandez, on livre chez vous en 3-5 jours ouvrés.
     Gratuit des 49EUR d'achat.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nos meilleures offres du moment :

  ★ Muesli Croustillant Bio - Favrichon
    500g | DLC : encore 4 mois
    Prix magasin : 5,90EUR → FulFlo : 2,49EUR (-58%)

  ★ Sables Ronds Beurre - Michel et Augustin
    120g | DLC : encore 3 mois
    Prix magasin : 3,20EUR → FulFlo : 1,29EUR (-60%)

  ★ Gel Douche Lavande - Le Petit Marseillais
    400ml | Surplus packaging
    Prix magasin : 3,80EUR → FulFlo : 1,59EUR (-58%)

Et n'oubliez pas : votre code FULFLO10 vous offre -5EUR
supplementaires sur votre premiere commande.

[CTA] Voir toutes les offres
      → https://fulflo.app/offres

Bonne decouverte,
James
FulFlo

---
Se desinscrire | Preferences email
FulFlo SAS - France
```

**Texte du bouton CTA:** `Voir toutes les offres`

---

## J3 -- Offre du moment

**Declencheur:** 3 jours apres `customer.created_at`
**Condition:** `orders.count = 0` (aucune commande passee)

**Sujet:** -63% sur ce best-seller Melvita
*(37 caracteres)*

**Texte d'apercu:** DLC courte = prix imbattable, ne tardez pas

### Corps de l'email

```
Bonjour {{prenom}},

Cette semaine, on a recu un arrivage exceptionnel :

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  PRODUIT STAR

  Huile de Douche Extra-Douce - Melvita
  Bio | 200ml

  Prix habituel : 12,90EUR
  Prix FulFlo :    4,79EUR  (-63%)

  DLC : encore 2 mois
  Stock : 127 unites restantes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pourquoi ce prix ? Melvita a change le design de son flacon.
Le produit a l'interieur est strictement identique -- meme
formule bio certifiee, meme qualite. Seul l'emballage est
l'ancienne version.

C'est ca, l'anti-gaspi intelligent.

Avec votre code FULFLO10 (-5EUR), cette huile de douche
vous revient a... 0EUR (ou presque) dans un panier a 49EUR+.

[CTA] Ajouter au panier
      → https://fulflo.app/produit/melvita-huile-douche

On vous garde ca de cote ?

James
FulFlo

---
Se desinscrire | Preferences email
FulFlo SAS - France
```

**Texte du bouton CTA:** `Ajouter au panier`

---

## J7 -- Votre code expire bientot

**Declencheur:** 7 jours apres `customer.created_at`
**Condition:** `orders.count = 0` (aucune commande passee)

**Sujet:** FULFLO10 expire dans 14 jours
*(35 caracteres)*

**Texte d'apercu:** Vos -5EUR vous attendent encore, mais plus pour longtemps

### Corps de l'email

```
Bonjour {{prenom}},

Un petit rappel : votre code de bienvenue FULFLO10
(-5EUR sur votre 1ere commande) expire dans 14 jours.

On ne veut pas que vous passiez a cote.

Voici ce que nos clients achetent en ce moment :

  ┌────────────────────────────────────────┐
  │  Top 3 des ventes cette semaine        │
  │                                        │
  │  1. Pates d'Alsace - Alpina Savoie     │
  │     500g | -52% → 1,19EUR              │
  │                                        │
  │  2. Shampoing Solide - Lamazuna        │
  │     55g  | -45% → 4,89EUR              │
  │                                        │
  │  3. Eau Minerale x6 - Cristalline      │
  │     6x1,5L | -67% → 1,29EUR           │
  └────────────────────────────────────────┘

Ce que disent nos clients :

  "J'etais sceptique au debut, mais la qualite est
   vraiment la. Les memes produits que j'achete en
   magasin, a moitie prix. J'ai recommande 3 fois
   depuis."
   -- Sophie, Lyon ★★★★★

Rappel : livraison gratuite des 49EUR.

    Code : FULFLO10
    -5EUR sur votre 1ere commande
    Expire le {{date_expiration}}

[CTA] Utiliser mon code maintenant
      → https://fulflo.app/offres?code=FULFLO10

A bientot,
James
FulFlo

---
Se desinscrire | Preferences email
FulFlo SAS - France
```

**Texte du bouton CTA:** `Utiliser mon code maintenant`

---

## J14 -- Derniere chance

**Declencheur:** 14 jours apres `customer.created_at`
**Condition:** `orders.count = 0` (aucune commande passee)

**Sujet:** -8EUR au lieu de -5EUR, juste pour vous
*(42 caracteres)*

**Texte d'apercu:** Offre exceptionnelle avant qu'on se fasse discrets

### Corps de l'email

```
Bonjour {{prenom}},

On ne va pas se mentir : on aimerait vraiment que vous
testiez FulFlo. Pas pour nous -- pour vous.

Alors voici ce qu'on vous propose :

    ┌─────────────────────────────────────┐
    │                                     │
    │   Code exclusif : FULFLO8           │
    │   -8EUR sur votre 1ere commande     │
    │   (au lieu de -5EUR)                │
    │   Valable 7 jours seulement        │
    │                                     │
    └─────────────────────────────────────┘

C'est notre meilleure offre de bienvenue. On ne la
propose pas a tout le monde, et elle ne reviendra pas.

Pourquoi tester ?

  ✓ Des marques premium francaises a -40% a -70%
  ✓ Produits 100% certifies, controles avant mise en ligne
  ✓ Livraison 3-5 jours, gratuite des 49EUR
  ✓ Satisfait ou rembourse

Ce que dit Marie, Toulouse :

  "Je commande tous les mois maintenant. Mon budget
   courses a baisse de 30% sans changer de marques.
   C'est concret."
   -- Marie, Toulouse ★★★★★

[CTA] Profiter de -8EUR sur ma commande
      → https://fulflo.app/offres?code=FULFLO8

Apres cet email, on ne vous sollicitera plus pendant
un bon moment. On prefere etre discrets plutot que
lourds.

A vous de jouer,
James
FulFlo

---
Se desinscrire | Preferences email
FulFlo SAS - France
```

**Texte du bouton CTA:** `Profiter de -8EUR sur ma commande`

**Note :** Le code FULFLO8 doit etre cree comme coupon specifique dans Stripe avec une valeur de 8EUR, usage unique, et attribue uniquement aux clients qui recoivent cet email.

---

## J30 -- On vous manque

**Declencheur:** 30 jours apres `customer.created_at`
**Condition:** `orders.count = 0` (aucune commande passee)

**Sujet:** Du nouveau chez FulFlo
*(26 caracteres)*

**Texte d'apercu:** De nouvelles marques et de nouveaux arrivages vous attendent

### Corps de l'email

```
Bonjour {{prenom}},

Ca fait un moment qu'on ne s'est pas donne de nouvelles.
On espere que tout va bien de votre cote.

Chez FulFlo, les choses bougent. Voici ce qui a change
depuis votre inscription :

  NOUVEAUTES

  → Nouveaux arrivages Coslys (gamme hygiene bio complete)
  → Lot exceptionnel Michel et Augustin (cookies, sables, vaches)
  → Retour en stock : Favrichon granolas bio
  → Nouvelle categorie : epicerie salee (pates, sauces, condiments)

  CHIFFRES ANTI-GASPI

  Depuis votre inscription, la communaute FulFlo a
  sauve {{tonnes_sauvees}} tonnes de produits du gaspillage.
  Pas mal, non ?

On ne vous propose pas de code promo aujourd'hui.
Juste une invitation a (re)decouvrir le catalogue.
Les prix parlent d'eux-memes.

[CTA] Voir les nouveautes
      → https://fulflo.app/nouveautes

Si FulFlo ne vous interesse plus, aucun souci.
Vous pouvez vous desinscrire en un clic ci-dessous.
Zero rancune.

A bientot peut-etre,
James
FulFlo

---
Se desinscrire | Preferences email
FulFlo SAS - France
```

**Texte du bouton CTA:** `Voir les nouveautes`

---

## Notes d'implementation technique

### Champs Supabase requis

```sql
-- Table customers (ou profiles)
customer.id             -- UUID, cle primaire
customer.email          -- email du client
customer.first_name     -- prenom pour personnalisation
customer.created_at     -- timestamp inscription (declencheur principal)
customer.email_opt_in   -- boolean, consentement email

-- Table orders
orders.customer_id      -- FK vers customer
orders.created_at       -- timestamp commande
orders.status           -- statut commande (confirmed, shipped, etc.)

-- Table email_sequence_logs (a creer)
email_logs.id           -- UUID
email_logs.customer_id  -- FK vers customer
email_logs.email_key    -- 'J0', 'J1', 'J3', 'J7', 'J14', 'J30'
email_logs.sent_at      -- timestamp envoi
email_logs.opened_at    -- timestamp ouverture (nullable)
email_logs.clicked_at   -- timestamp clic (nullable)
email_logs.status       -- 'sent', 'delivered', 'opened', 'clicked', 'bounced'
```

### Migration SQL suggeree

```sql
CREATE TABLE IF NOT EXISTS email_sequence_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    email_key TEXT NOT NULL CHECK (email_key IN ('J0', 'J1', 'J3', 'J7', 'J14', 'J30')),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
    metadata JSONB DEFAULT '{}',
    UNIQUE(customer_id, email_key)
);

CREATE INDEX idx_email_logs_customer ON email_sequence_logs(customer_id);
CREATE INDEX idx_email_logs_status ON email_sequence_logs(status);
```

### Conditions de declenchement

```typescript
// Pseudo-code pour le systeme d'agent FulFlo

interface OnboardingEmailJob {
  emailKey: 'J0' | 'J1' | 'J3' | 'J7' | 'J14' | 'J30';
  delayHours: number;
  requiresNoOrder: boolean;
  promoCode?: string;
}

const SEQUENCE: OnboardingEmailJob[] = [
  { emailKey: 'J0',  delayHours: 0,     requiresNoOrder: false },
  { emailKey: 'J1',  delayHours: 24,    requiresNoOrder: false },
  { emailKey: 'J3',  delayHours: 72,    requiresNoOrder: true  },
  { emailKey: 'J7',  delayHours: 168,   requiresNoOrder: true,  promoCode: 'FULFLO10' },
  { emailKey: 'J14', delayHours: 336,   requiresNoOrder: true,  promoCode: 'FULFLO8' },
  { emailKey: 'J30', delayHours: 720,   requiresNoOrder: true  },
];

async function shouldSendEmail(customerId: string, job: OnboardingEmailJob): Promise<boolean> {
  // 1. Verifier que l'email n'a pas deja ete envoye
  const alreadySent = await supabase
    .from('email_sequence_logs')
    .select('id')
    .eq('customer_id', customerId)
    .eq('email_key', job.emailKey)
    .single();

  if (alreadySent.data) return false;

  // 2. Verifier le opt-in email
  const customer = await supabase
    .from('customers')
    .select('email_opt_in, created_at')
    .eq('id', customerId)
    .single();

  if (!customer.data?.email_opt_in) return false;

  // 3. Verifier le delai depuis inscription
  const hoursSinceSignup = differenceInHours(new Date(), new Date(customer.data.created_at));
  if (hoursSinceSignup < job.delayHours) return false;

  // 4. Si requiresNoOrder, verifier l'absence de commande
  if (job.requiresNoOrder) {
    const orders = await supabase
      .from('orders')
      .select('id')
      .eq('customer_id', customerId)
      .in('status', ['confirmed', 'shipped', 'delivered'])
      .limit(1);

    if (orders.data && orders.data.length > 0) return false;
  }

  return true;
}
```

### Integration avec le systeme d'agent FulFlo

**Option A : Supabase Edge Function + pg_cron (recommande)**

```
pg_cron job (toutes les heures)
  → Appelle une Edge Function "process-onboarding-emails"
  → La fonction requete les clients eligibles pour chaque etape
  → Envoie via Resend/Postmark/SendGrid
  → Log dans email_sequence_logs
```

**Option B : Supabase Database Webhooks**

```
Webhook sur INSERT dans customers
  → Declenche J0 immediatement
  → Cree des scheduled tasks pour J1, J3, J7, J14, J30
  → Chaque task verifie les conditions avant envoi
```

**Option C : Agent autonome (si agent FulFlo deja en place)**

```
L'agent FulFlo execute un check periodique :
  1. SELECT clients inscrits sans commande
  2. Pour chaque client, determine l'email suivant dans la sequence
  3. Verifie les conditions
  4. Envoie l'email via l'API d'envoi
  5. Log le resultat
```

### Variables dynamiques a injecter

| Variable | Source | Utilise dans |
|----------|--------|-------------|
| `{{prenom}}` | `customer.first_name` | Tous les emails |
| `{{date_expiration}}` | `customer.created_at + 21 jours` | J7 |
| `{{tonnes_sauvees}}` | Agregat global ou estimation | J30 |

### Codes promo a creer dans Stripe

| Code | Valeur | Usage | Emails |
|------|--------|-------|--------|
| `FULFLO10` | -5 EUR | 1 fois / client | J0, J1, J3, J7 |
| `FULFLO8` | -8 EUR | 1 fois / client | J14 uniquement |

**Important :** FULFLO8 doit remplacer FULFLO10 (un seul code utilisable par client). Configurer la logique pour invalider FULFLO10 si FULFLO8 est attribue, ou s'assurer que le systeme n'accepte qu'un seul code de bienvenue par compte.

### Regles d'arret de la sequence

La sequence s'arrete automatiquement si :
1. Le client passe une commande (pour J3, J7, J14, J30)
2. Le client se desinscrit des emails (`email_opt_in = false`)
3. L'email bounce (`status = 'bounced'`) -- retirer de la sequence
4. Le client a deja utilise un code promo de bienvenue

### Metriques a suivre

- Taux d'ouverture par email (objectif : >30%)
- Taux de clic par email (objectif : >5%)
- Taux de conversion J0→premiere commande (objectif : >8%)
- Delai moyen inscription→premiere commande
- Revenue attribue a chaque email de la sequence
