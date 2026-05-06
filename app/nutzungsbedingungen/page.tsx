import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nutzungsbedingungen Plattform | codetekt',
  description: 'Nutzungsbedingungen für die Online-Plattform von codetekt.',
};

type TermsSection = {
  title: string;
  paragraphs: string[];
  list?: string[];
  trailingParagraphs?: string[];
};

const sections: TermsSection[] = [
  {
    title: '1. Geltungsbereich und Vertragsgegenstand',
    paragraphs: [
      'Diese Nutzungsbedingungen regeln die Nutzung der Online-Plattform von codetekt (nachfolgend „Plattform“). Mit der Registrierung und Nutzung der Plattform erklärst du dich mit diesen Nutzungsbedingungen einverstanden.',
    ],
  },
  {
    title: '2. Teilnahmevoraussetzungen und Registrierung',
    paragraphs: [
      'Die Nutzung der Plattform ist nur Personen ab 13 Jahren erlaubt.',
      'Pro Person ist nur ein Benutzerkonto zulässig. Mehrfachregistrierungen sind nicht gestattet.',
      'Es besteht kein Anspruch auf Teilnahme oder dauerhaften Zugang zur Plattform. codetekt kann Registrierungen ablehnen oder Zugänge beschränken, sofern hierfür sachliche Gründe vorliegen.',
      'Bei der Registrierung sind wahrheitsgemäße Angaben zu machen und diese aktuell zu halten.',
    ],
  },
  {
    title: '3. Zugangsdaten und Kontosicherheit',
    paragraphs: [
      'Zugangsdaten sind geheim zu halten und vor dem Zugriff durch Dritte zu schützen.',
      'Bei Verdacht auf unbefugte Nutzung ist codetekt unverzüglich zu informieren.',
      'Nutzer*innen haften für Aktivitäten über ihr Konto, soweit sie die missbräuchliche Nutzung zu vertreten haben.',
    ],
  },
  {
    title: '4. Inhalte und Fall-Einreichungen',
    paragraphs: [
      'Nutzer*innen können Inhalte, insbesondere Fälle, Texte, Links und sonstige Beiträge („Inhalte“) einstellen.',
      'Beim Einstellen von Inhalten sind geltende Gesetze einzuhalten.',
      'Es dürfen keine Inhalte eingestellt werden, die Rechte Dritter verletzen, insbesondere Urheber- oder Markenrechte. Insbesondere ist das vollständige Kopieren fremder Artikel oder geschützter Inhalte nicht gestattet.',
      'Es dürfen keine Inhalte eingestellt werden, die Sicherheitsrisiken darstellen, insbesondere Phishing-Links oder vergleichbare schädliche Inhalte.',
      'Es dürfen keine Artikel eingereicht werden, die sich hinter einer Paywall befinden, da diese nicht von allen Nutzenden geprüft werden können.',
      'Mehrfacheinreichungen identischer oder im Wesentlichen gleicher Fälle sind zu unterlassen.',
    ],
  },
  {
    title: '5. Bearbeitung von Fällen und Verantwortlichkeit',
    paragraphs: [
      'Beiträge und Bearbeitungen sollen sorgfältig sowie nach bestem Wissen und Gewissen erfolgen.',
      'Inhalte stellen, sofern nicht ausdrücklich anders gekennzeichnet, keine Rechtsberatung oder sonstige professionelle Beratung dar.',
      'Nutzer*innen sind für ihre Inhalte selbst verantwortlich. codetekt macht sich Inhalte von Nutzer*innen nicht zu eigen.',
    ],
  },
  {
    title: '6. Netiquette und Verhaltensregeln',
    paragraphs: [
      'Bei der Nutzung der Plattform, insbesondere in Kommentaren, ist ein respektvoller Umgang einzuhalten. Untersagt sind insbesondere:',
    ],
    list: [
      'Beleidigungen, Herabwürdigungen oder persönliche Angriffe.',
      'Unwahre, irreführende oder bewusst falsche Inhalte.',
      'Werbung, Spam oder sonstige unerwünschte kommerzielle Kommunikation.',
      'Gesetzlich geschützte Inhalte oder Inhalte, die Rechte Dritter verletzen (insbesondere Urheber- und Markenrecht).',
      'Diskriminierende Inhalte, insbesondere aufgrund von Herkunft, Aussehen, sexueller Identität, Behinderung, Geschlecht, Religion oder Weltanschauung.',
      'Pornographische Inhalte.',
    ],
  },
  {
    title: '7. Moderation und Maßnahmen bei Verstößen',
    paragraphs: [
      'codetekt kann Inhalte prüfen, moderieren und bei Bedarf bearbeiten oder löschen.',
      'Bei Verstößen gegen diese Nutzungsbedingungen oder bei begründetem Verdacht kann codetekt nach pflichtgemäßem Ermessen Maßnahmen ergreifen. Dazu gehören insbesondere:',
    ],
    list: [
      'Löschung oder Sperrung von Inhalten,',
      'Verwarnung,',
      'vorübergehende Sperrung (Suspendierung) des Kontos,',
      'dauerhafter Ausschluss von der Plattform.',
    ],
    trailingParagraphs: [
      'codetekt behält sich vor, Personen nach einem Ausschluss die Neuerstellung von Accounts zu untersagen.',
    ],
  },
  {
    title: '8. Verfügbarkeit der Plattform',
    paragraphs: [
      'codetekt bemüht sich um eine möglichst unterbrechungsfreie Verfügbarkeit der Plattform. Ein Anspruch auf jederzeitige Verfügbarkeit besteht nicht.',
    ],
  },
  {
    title: '9. Änderungen der Nutzungsbedingungen',
    paragraphs: [
      'codetekt kann diese Nutzungsbedingungen anpassen, wenn dies aus rechtlichen, technischen oder organisatorischen Gründen erforderlich ist. Über wesentliche Änderungen werden Nutzer*innen in geeigneter Form informiert.',
    ],
  },
  {
    title: '10. Schlussbestimmungen',
    paragraphs: [
      'Sollten einzelne Bestimmungen dieser Nutzungsbedingungen unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.',
      'Es gilt das Recht der Bundesrepublik Deutschland, soweit dem keine zwingenden gesetzlichen Vorschriften entgegenstehen.',
    ],
  },
];

export default function TermsOfUsePage() {
  return (
    <div className="">
      <section className="w-full bg-gradient-neutral-coral py-12 lg:py-24">
        <div className="page-max-w w-full">
          <p className="text-display-eyebrow uppercase">Rechtliches</p>
          <h1 className="mt-2 text-display-sm uppercase sm:text-display-md 2xl:text-display-lg">
            Nutzungs&shy;bedingungen Plattform
          </h1>
          <p className="text-body-md mt-4 max-w-3xl">
            Diese Nutzungsbedingungen regeln die Nutzung der Online-Plattform
            von codetekt.
          </p>
        </div>
      </section>

      <section className="pb-10 lg:pb-16">
        <div className="page-max-w">
          <div className="max-w-3xl space-y-10">
            {sections.map((section) => (
              <article className="space-y-4" key={section.title}>
                <h2 className="text-heading-lg">{section.title}</h2>
                <div className="space-y-3 text-body-md text-muted-foreground">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.list ? (
                    <ul className="list-disc space-y-2 pl-6">
                      {section.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                  {section.trailingParagraphs?.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
