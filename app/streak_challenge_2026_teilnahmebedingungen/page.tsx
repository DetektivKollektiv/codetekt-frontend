import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Teilnahmebedingungen Streak-Challenge 2026 | codetekt',
  description:
    'Transparenz und Teilnahmebedingungen für die Streak-Challenge 2026 von codetekt e. V.',
};

export default function StreakChallengeTermsPage() {
  return (
    <div>
      <section className="w-full bg-gradient-neutral-coral py-12 lg:py-24">
        <div className="page-max-w w-full">
          <p className="text-display-eyebrow uppercase">
            Streak-Challenge 2026
          </p>
          <h1 className="mt-2 max-w-4xl text-display-sm uppercase sm:text-display-md 2xl:text-display-lg">
            Transparenz und Teilnahme&shy;bedingungen
          </h1>
          <p className="mt-4 max-w-3xl text-body-md">
            Für die Teilnahme an der Streak-Challenge und am Gewinnspiel gelten
            folgende Regeln.
          </p>
        </div>
      </section>

      <section className="pb-10 lg:pb-16">
        <div className="page-max-w">
          <div className="max-w-3xl space-y-10">
            <article className="space-y-4">
              <h2 className="text-heading-lg">Veranstalter</h2>
              <p className="text-body-md text-muted-foreground">
                Veranstalter des Gewinnspiels ist codetekt e. V. Weitere
                Angaben zu unserem Verein findest du im{' '}
                <a
                  href="https://codetekt.org/impressum/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  Impressum
                </a>
                .
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-heading-lg">Challenge-Zeitraum</h2>
              <p className="text-body-md text-muted-foreground">
                Für das Gewinnspiel zählen Trust-Checks und Trust-Shares, die
                zwischen dem 1. September 2026, 00:00 Uhr und dem 20. September
                2026, 23:59 Uhr abgeschlossen bzw. geteilt werden.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-heading-lg">
                Trust-Checks und Trust-Shares
              </h2>
              <p className="text-body-md text-muted-foreground">
                Ein Trust-Check ist die Prüfung eines Falls durch eine Person
                mit Nutzerkonto auf der Trust-Checking-Plattform. Ein Fall gilt
                als gelöst, wenn er von mindestens zwei co:detectives geprüft
                wurde. Ein Trust-Share ist ein öffentlich geteilter gelöster
                Fall, der durch Link und Screenshot auf unserem{' '}
                <a
                  href="https://discord.gg/hDFban499"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  Discord-Server
                </a>{' '}
                nachgewiesen wird.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-heading-lg">Top-3 des Leaderboards</h2>
              <p className="text-body-md text-muted-foreground">
                Die drei co:detectives mit den meisten abgeschlossenen
                Trust-Checks im Challenge-Zeitraum gewinnen. Bei Gleichstand
                entscheidet das Los.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-heading-lg">
                Lostopf-Qualifikation für co:detectives
              </h2>
              <p className="text-body-md text-muted-foreground">
                Um in den Lostopf für die fünf Zusatzgewinne zu gelangen, muss
                ein:e co:detective zwischen dem 1. und 20. September 2026
                mindestens fünf Trust-Checks mit demselben Nutzerkonto
                abgeschlossen haben. Die Top-3 co:detectives aus dem
                Leaderboard sind aus diesem Lostopf ausgeschlossen. Die fünf
                Zusatzgewinne werden nur freigeschaltet, wenn die Community im
                Challenge-Zeitraum mindestens 75 Fälle gemeinsam gelöst hat.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-heading-lg">
                Lostopf-Qualifikation für Trust-Spreader
              </h2>
              <p className="text-body-md text-muted-foreground">
                Um in den Lostopf für die drei Trust-Spreader-Gewinne zu
                gelangen, teile mindestens drei Ergebnisse eines Trust-Checks
                öffentlich im Internet, z. B. auf einem öffentlich einsehbaren
                Social-Media-Profil oder in einer öffentlich einsehbaren
                Kommentarspalte. Nutze dafür einfach die Teilfunktion auf der
                Plattform. Um deinen Share nachzuweisen, poste den Link zum
                Beitrag und einen Screenshot davon auf unserem{' '}
                <a
                  href="https://discord.gg/hDFban499"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  Discord-Server
                </a>{' '}
                im Channel „Trust-Spreader Reichweite“. Nutze dafür immer
                denselben Discord-Account, damit wir dir die Trust-Shares
                zuordnen können. Wenn du das Ergebnis in deiner Story bei
                Telegram, WhatsApp oder Signal postest, reicht ein Screenshot
                davon als Nachweis.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-heading-lg">Teilnahmeberechtigung</h2>
              <div className="space-y-3 text-body-md text-muted-foreground">
                <p>
                  Teilnehmen können alle natürlichen Personen ab 16 Jahren.
                  Wenn eine minderjährige Person gewinnt, kann codetekt vor
                  Versand des Gewinns eine Zustimmung der Erziehungsberechtigten
                  anfragen.
                </p>
                <p>
                  Hauptangestellte von codetekt e. V. sind vom Gewinnspiel
                  ausgeschlossen. Ehrenamtliche und Vereinsmitglieder können
                  teilnehmen, sofern sie bei codetekt nicht hauptangestellt
                  sind.
                </p>
              </div>
            </article>

            <article className="space-y-4">
              <h2 className="text-heading-lg">Gewinne und Versand</h2>
              <p className="text-body-md text-muted-foreground">
                Für den Versand der Gewinne benötigen wir eine Lieferadresse in
                Deutschland. Eine Barauszahlung der Gewinne ist ausgeschlossen.
                Gewinne sind nicht übertragbar. Sollte ein Gewinn nicht
                verfügbar sein, behalten wir uns vor, einen gleichwertigen
                Ersatzgewinn bereitzustellen.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-heading-lg">
                Auswertung und Benachrichtigung
              </h2>
              <p className="text-body-md text-muted-foreground">
                Nach Ende der Challenge werten wir das Leaderboard aus und
                ziehen die Lostopf-Gewinner:innen nach dem Zufallsprinzip. Die
                Gewinner:innen werden bis spätestens 30. September 2026 per
                E-Mail kontaktiert. Dafür nutzen wir die E-Mail-Adresse, die bei
                der Registrierung auf der Plattform angegeben wurde. Meldet
                sich eine gewinnende Person nicht innerhalb von 7 Tagen zurück,
                behalten wir uns vor, den Gewinn neu zu vergeben.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-heading-lg">Datenschutz</h2>
              <p className="text-body-md text-muted-foreground">
                Für die Durchführung der Challenge und des Gewinnspiels
                verarbeiten wir die dafür notwendigen Daten, insbesondere
                Nutzername, Anzahl abgeschlossener Trust-Checks, E-Mail-Adresse,
                Discord-Account, eingereichte Links/Screenshots und im
                Gewinnfall die Lieferadresse. Die Daten werden ausschließlich
                zur Durchführung, Auswertung, Kontaktaufnahme und
                Gewinnzustellung verwendet. Weitere Informationen findest du in
                unserer{' '}
                <a
                  href="https://codetekt.org/datenschutz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  Datenschutzerklärung
                </a>
                . Gewinner*innen werden nur mit ihrer ausdrücklichen Zustimmung
                öffentlich genannt.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-heading-lg">Ausschluss</h2>
              <p className="text-body-md text-muted-foreground">
                codetekt behält sich vor, Teilnehmende bei
                Manipulationsversuchen, Mehrfachaccounts, missbräuchlicher
                Nutzung der Plattform oder Verstößen gegen die Community-Regeln
                vom Gewinnspiel auszuschließen.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-heading-lg">
                Anpassung oder Beendigung des Gewinnspiels
              </h2>
              <p className="text-body-md text-muted-foreground">
                codetekt behält sich vor, das Gewinnspiel anzupassen, zu
                unterbrechen oder zu beenden, wenn technische Probleme,
                Manipulationen oder andere Umstände eine ordnungsgemäße
                Durchführung beeinträchtigen. Änderungen werden transparent
                kommuniziert.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-heading-lg">
                Keine Verbindung zu Drittplattformen
              </h2>
              <p className="text-body-md text-muted-foreground">
                Das Gewinnspiel wird ausschließlich von codetekt e. V.
                veranstaltet. Social-Media-Plattformen und Discord sind nicht
                Veranstalter des Gewinnspiels und stehen nicht mit dem
                Gewinnspiel in Verbindung.
              </p>
            </article>

            <article className="space-y-4">
              <h2 className="text-heading-lg">
                Überparteilichkeit und verantwortungsvolles Teilen
              </h2>
              <div className="space-y-3 text-body-md text-muted-foreground">
                <p>
                  Die Challenge ist überparteilich. Ziel ist es,
                  Nachrichtenkompetenz zu stärken und Informationen auf
                  Vertrauenswürdigkeit zu prüfen. codetekt gibt im Rahmen der
                  Challenge keine Wahlempfehlungen ab.
                </p>
                <p>
                  Bitte teile gelöste Fälle verantwortungsvoll und immer mit der
                  codetekt-Einordnung. Vermeide es, Falschinformationen ohne
                  Kontext weiterzuverbreiten.
                </p>
              </div>
            </article>

            <article className="space-y-4">
              <h2 className="text-heading-lg">Rechtsweg</h2>
              <p className="text-body-md text-muted-foreground">
                Der Rechtsweg ist ausgeschlossen.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
