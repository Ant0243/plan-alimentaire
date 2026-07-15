# Mon plan alimentaire — PWA synchronisée

Application d’organisation personnelle sur sept jours :

- plans « petit déjeuner simple » et « petit déjeuner complet » ;
- suivi quotidien des repas ;
- quantités cumulées sur sept jours ;
- garde-manger vide par défaut ;
- retrait automatique des produits déjà disponibles ;
- liste de courses partageable ;
- synchronisation ordinateur/téléphone avec Supabase ;
- installation en application web sur mobile ;
- fonctionnement hors ligne avec synchronisation différée.

## 1. Créer le dépôt GitHub

1. Créez un nouveau dépôt GitHub.
2. Décompressez cette archive dans le dépôt.
3. Envoyez tous les fichiers sur la branche `main`.

Exemple :

```bash
git init
git add .
git commit -m "Initial meal planner PWA"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/VOTRE-DEPOT.git
git push -u origin main
```

## 2. Créer le serveur de données Supabase

1. Créez un projet sur Supabase.
2. Ouvrez **SQL Editor**.
3. Copiez tout le contenu de `supabase.sql`.
4. Exécutez le script.
5. Dans **Authentication > Providers > Email**, activez l’authentification par e-mail.
6. Pour un usage personnel plus simple, vous pouvez désactiver la confirmation d’e-mail.
7. Dans **Project Settings > API Keys**, récupérez :
   - l’URL du projet ;
   - la clé publique `sb_publishable_...`.

La clé publique peut être présente dans le navigateur. La sécurité des données repose
sur les politiques Row Level Security du fichier SQL. Ne mettez jamais une clé
`sb_secret_...` ou `service_role` dans ce projet.

## 3. Configurer l’application

Ouvrez `config.js` et remplacez les valeurs :

```js
window.APP_CONFIG = {
  supabaseUrl: "https://VOTRE-PROJET.supabase.co",
  supabasePublishableKey: "sb_publishable_VOTRE_CLE"
};
```

Commitez ensuite la modification :

```bash
git add config.js
git commit -m "Configure Supabase"
git push
```

## 4. Activer GitHub Pages

1. Ouvrez le dépôt GitHub.
2. Allez dans **Settings > Pages**.
3. Dans **Build and deployment**, choisissez **GitHub Actions**.
4. Ouvrez l’onglet **Actions** et attendez la fin du workflow.
5. GitHub affichera l’adresse publique du site.

## 5. Utiliser la synchronisation

1. Ouvrez le site sur l’ordinateur.
2. Cliquez sur l’avatar « A ».
3. Créez un compte.
4. Connectez-vous avec le même compte sur le téléphone.
5. Les données sont ensuite enregistrées dans le navigateur et synchronisées avec Supabase.

La synchronisation utilise la date de dernière modification. En cas de modifications
simultanées hors ligne sur deux appareils, la version la plus récente remplace l’autre.

## 6. Installer l’application sur téléphone

### Android / Chrome

1. Ouvrez le site.
2. Ouvrez le menu du navigateur.
3. Choisissez **Installer l’application** ou **Ajouter à l’écran d’accueil**.

### iPhone / Safari

1. Ouvrez le site dans Safari.
2. Touchez **Partager**.
3. Choisissez **Sur l’écran d’accueil**.

## 7. Test local

Les fonctions PWA ne fonctionnent pas correctement avec un simple fichier `file://`.
Utilisez un serveur local :

```bash
python -m http.server 8000
```

Puis ouvrez :

```text
http://localhost:8000
```

## Confidentialité

Cette application n’est pas un outil de suivi médical destiné au diététicien.
Chaque compte ne peut lire et modifier que ses propres données grâce aux politiques RLS.
