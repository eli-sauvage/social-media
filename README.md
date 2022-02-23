# Maintenance
## pour linkedIn (tous les 2 mois)
https://www.linkedin.com/developers/tools/oauth/token-generator?clientId=78yo6lujfbczrc

cocher `r_organization_social rw_organization_admin w_member_social w_organization_social`

puis changer le token dans la base sql

# Pour lancer en local
lancer `portFwd.bat`

`.env` :
```
MYSQLPASSWORD=******
MYSQLHOST=127.0.0.1
HOST=http://127.0.0.1:1337
MYSQLPORT=3307
PORT=1337
```