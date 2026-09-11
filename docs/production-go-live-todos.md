# Production Go-live: offene Sicherheits-Todos

Diese Punkte sind bewusst nicht Teil des ersten automatischen Deployments. Sie
sollten vor der breiten öffentlichen Nutzung abgeschlossen und jeweils mit
einem kurzen Nachweis dokumentiert werden. Keine Secret-Werte in Git, Issues
oder Chat-Protokollen speichern.

## 1. Dependabot aktivieren

- GitHub Dependabot Alerts und Security Updates für das Repository aktivieren.
- Eine `.github/dependabot.yml` für npm und GitHub Actions anlegen (mindestens
  wöchentlich).
- Dependabot-PRs wie normale PRs durch die verpflichtenden Checks laufen
  lassen.

## 2. GitHub Secret Scanning aktivieren

- GitHub Secret Scanning und Push Protection für das Repository aktivieren.
- Prüfen, ob organisationweite Richtlinien die Aktivierung beeinflussen.
- Einen Fund als Sicherheitsvorfall behandeln: Secret unverzüglich rotieren,
  betroffene Systeme prüfen und den Fund schließen.

## 3. Supabase-Standardsecrets rotieren

- Alle Werte erfassen, die aus einer Beispiel-, Default- oder Bootstrap-
  Konfiguration stammen.
- Neue kryptografisch sichere Werte erzeugen und mindestens `JWT_SECRET`, die
  daraus abgeleiteten `ANON_KEY`/`SERVICE_ROLE_KEY` sowie noch vorhandene
  Datenbank-, Dashboard- und Auth-Admin-Passwörter ersetzen.
- Die neuen Werte abgestimmt im Hetzner-Supabase-Stack und in den betroffenen
  GitHub-Umgebungssecrets hinterlegen; bestehende Sessions und Schlüssel nach
  der Rotation als ungültig behandeln.
- Vorher ein getestetes Backup bereithalten und danach API, Auth, Edge
  Functions und die Produktions-Frontend-Verbindung prüfen.
