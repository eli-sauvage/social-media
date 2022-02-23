# Maintenance
## pour linkedIn (tous les 2 mois)
https://www.linkedin.com/developers/tools/oauth/token-generator?clientId=78yo6lujfbczrc

cocher `r_organization_social rw_organization_admin w_member_social w_organization_social`

puis remplacer avec le nouveau token dans la base sql

# Pour lancer en local en utilisant la DB distante
lancer `portFwd.bat` (la DB n'accepte que les connexions locales)

`.env` :
```
MYSQLPASSWORD=******
MYSQLHOST=127.0.0.1
HOST=http://127.0.0.1:1337
MYSQLPORT=3307
PORT=1337
```