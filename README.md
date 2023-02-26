# Social Media
Ce repo est un fork de [celui-ci](https://gitlab.com/jc-utt/social-media-analyzer)

Actuellement hébergé sur un cluster Kubenetees (Redhat OC OKD).

# Aperçu de l'application :

![Capture d'écran 2023-02-26 174237](https://user-images.githubusercontent.com/36312455/221424070-d8208a36-4386-4529-9395-a111a55e03b8.png)



# Pour lancer sur le server
```
docker build -t social-media-analyzer .
(docker stop s-m-a && docker rm s-m-a)
docker run -p 1337:1337 --name s-m-a -d social-media-analyzer
```

# Maintenance
## Tokens d'application
- Pour linkedIn et facebook(donc instagram), les flows d'authorisation OAuth2.0 sont censé s'exécuter seuls si l'appli détecte un token invalide/expiré
- Pour tweeter, le token devrait être d'une durée de vie infinie

## En cas d'erreur inexpliquée
- hit F5 (le proxy aime pas trop lorsque c'est long à charger)
- regarder la console côté client
- si les informations sont trop vagues, lancer le projet en local avec un debugger pour avoir accès aux détails, call stack, etc.

# Pour lancer en local en utilisant la DB distante
lancer `portFwd.bat` (la DB n'accepte que les connexions locales)

`.env` :
```
MYSQLPASSWORD=******
MYSQLHOST=127.0.0.1
HOST=http://127.0.0.1:1337
MYSQLPORT=3307
PORT=1337
USERPASSWORD=************ #mot de passe utilisé pour la connexion utilisateur
```

# Sécurité
- l'application utilise un mdp unique, sans identifiant (données pas assez sensibles pour s'embeter à créer des comptes..)
  - authentification par cookie, les sessions sont stokées comme simples variables et donc terminées si l'appli est redémarée

# TODO
- twitter 3-legged ["OAuth 2.0 Authorization Code Flow with PKCE"](https://developer.twitter.com/en/docs/authentication/oauth-2-0/authorization-code) au lieu de l'actuel Bearer
    - permettra d'acceder au likes, commentaires, retweets ...
- affichage multi paramètres sur le même graph (exp : observation du lien entre évolution des impressions et évolution des followers)
- temps de chargement plus rapide
- site responsive ?
