import { ReviewTemplateData } from './template-schemas';

export const template: ReviewTemplateData[] = [
  {
    id: 'title_question',
    fields: [
      {
        id: 'title',
        type: 'text',
        options: [
          {
            id: 'title_field',
            max_length: 500,
            min_length: 5,
            placeholder: 'Gib einen Titel ein...',
          },
        ],
        question: 'Finde einen prägnanten Titel für den Fall',
        is_required: true,
      },
    ],
    metadata: {
      text: 'Bitte gebe diesem Fall einen eindeutigen Titel. Dieser sollte den Inhalt des Falls kurz und prägnant zusammenfassen, damit er später leicht wiedergefunden werden kann.',
      title: 'Titel',
      help_url: '/help/title',
      indent_level: 0,
    },
  },
  {
    id: 'keywords_question',
    fields: [
      {
        id: 'keyword_type',
        type: 'multi-line-text',
        options: [],
        question: 'Fehlen Stichwörter?',
        max_length: 50,
        is_required: true,
        placeholder: 'Stichwort hinzufügen...',
        additonal_option_count: 5,
      },
    ],
    metadata: {
      text: 'Du hast die Bearbeitung dieses Falls gestartet. Bitte lies dir alle Aussagen durch und bewerte sie sorgfältig.',
      title: 'Stichwörter',
      help_url: '',
      indent_level: 0,
    },
  },
  {
    id: 'content_type_question',
    fields: [
      {
        id: 'content_type',
        type: 'chip',
        options: [
          { id: 'satire', text: 'Satire' },
          { id: 'neutral', text: 'Neutral' },
          { id: 'text_message', text: 'Textnachricht' },
          { id: 'opinion', text: 'Meinung' },
        ],
        question: 'Worum handelt es sich bei dem Fall?',
        is_disabled: false,
        is_required: true,
        is_disputable: false,
      },
    ],
    metadata: {
      text: 'Du hast die Bearbeitung dieses Falls gestartet. Bitte lies dir alle Aussagen durch und bewerte sie sorgfältig.',
      title: 'Inhaltstyp',
      help_url: '',
      indent_level: 0,
    },
  },
  {
    id: 'content_criteria_question',
    fields: [
      {
        id: 'grammar',
        type: 'traffic-light',
        question:
          'Die Grammatik und Rechtschreibung des Artikels sind fehlerfrei.',
        options: [
          {
            id: 'traffic-light-opt-1',
            value: 0,
            color: 'hsl(var(--brand-green))',
          },
          {
            id: 'traffic-light-opt-2',
            value: 1,
            color: 'hsl(var(--brand-yellow))',
          },
          {
            id: 'traffic-light-opt-3',
            value: 2,
            color: 'hsl(var(--brand-orange))',
          },
          {
            id: 'traffic-light-opt-4',
            value: 3,
            color: 'hsl(var(--brand-red))',
          },
          {
            id: 'traffic-light-opt-5',
            value: 4,
            color: 'hsl(var(--brand-neutral-0))',
          },
        ],
        is_required: true,
      },
      {
        id: 'structure',
        type: 'traffic-light',
        question:
          'Der Artikel ist keine Eilnachricht. Er besteht aus mehreren Paragraphen.',
        options: [
          {
            id: 'traffic-light-opt-1',
            value: 0,
            color: 'hsl(var(--brand-green))',
          },
          {
            id: 'traffic-light-opt-2',
            value: 1,
            color: 'hsl(var(--brand-yellow))',
          },
          {
            id: 'traffic-light-opt-3',
            value: 2,
            color: 'hsl(var(--brand-orange))',
          },
          {
            id: 'traffic-light-opt-4',
            value: 3,
            color: 'hsl(var(--brand-red))',
          },
          {
            id: 'traffic-light-opt-5',
            value: 4,
            color: 'hsl(var(--brand-neutral-0))',
          },
        ],
        is_required: true,
      },
      {
        id: 'headline',
        type: 'traffic-light',
        question: 'Die Überschrift passt zum Inhalt des Artikels.',
        options: [
          {
            id: 'traffic-light-opt-1',
            value: 0,
            color: 'hsl(var(--brand-green))',
          },
          {
            id: 'traffic-light-opt-2',
            value: 1,
            color: 'hsl(var(--brand-yellow))',
          },
          {
            id: 'traffic-light-opt-3',
            value: 2,
            color: 'hsl(var(--brand-orange))',
          },
          {
            id: 'traffic-light-opt-4',
            value: 3,
            color: 'hsl(var(--brand-red))',
          },
          {
            id: 'traffic-light-opt-5',
            value: 4,
            color: 'hsl(var(--brand-neutral-0))',
          },
        ],
        is_required: true,
      },
      {
        id: 'objectivity',
        type: 'traffic-light',
        question:
          'Der Artikel ist objektiv geschrieben und frei von Hetze, Generalisierungen, Panikmache oder Ähnlichem.',
        options: [
          {
            id: 'traffic-light-opt-1',
            value: 0,
            color: 'hsl(var(--brand-green))',
          },
          {
            id: 'traffic-light-opt-2',
            value: 1,
            color: 'hsl(var(--brand-yellow))',
          },
          {
            id: 'traffic-light-opt-3',
            value: 2,
            color: 'hsl(var(--brand-orange))',
          },
          {
            id: 'traffic-light-opt-4',
            value: 3,
            color: 'hsl(var(--brand-red))',
          },
          {
            id: 'traffic-light-opt-5',
            value: 4,
            color: 'hsl(var(--brand-neutral-0))',
          },
        ],
        is_required: true,
      },
      {
        id: 'perspectives',
        type: 'traffic-light',
        question: 'Im Artikel werden unterschiedliche Positionen dargestellt.',
        options: [
          {
            id: 'traffic-light-opt-1',
            value: 0,
            color: 'hsl(var(--brand-green))',
          },
          {
            id: 'traffic-light-opt-2',
            value: 1,
            color: 'hsl(var(--brand-yellow))',
          },
          {
            id: 'traffic-light-opt-3',
            value: 2,
            color: 'hsl(var(--brand-orange))',
          },
          {
            id: 'traffic-light-opt-4',
            value: 3,
            color: 'hsl(var(--brand-red))',
          },
          {
            id: 'traffic-light-opt-5',
            value: 4,
            color: 'hsl(var(--brand-neutral-0))',
          },
        ],
        is_required: true,
      },
    ],
    metadata: {
      text: 'Bewerte die folgenden Aussagen sorgfältig.',
      title: 'Inhalte',
      help_url: '',
      indent_level: 0,
    },
  },
  {
    id: 'source_criteria_question',
    fields: [
      {
        id: 'external_sources',
        type: 'traffic-light',
        question:
          'Im Artikel werden für alle Behauptungen externe Quellen genannt.',
        options: [
          {
            id: 'traffic-light-opt-1',
            value: 0,
            color: 'hsl(var(--brand-green))',
          },
          {
            id: 'traffic-light-opt-2',
            value: 1,
            color: 'hsl(var(--brand-yellow))',
          },
          {
            id: 'traffic-light-opt-3',
            value: 2,
            color: 'hsl(var(--brand-orange))',
          },
          {
            id: 'traffic-light-opt-4',
            value: 3,
            color: 'hsl(var(--brand-red))',
          },
          {
            id: 'traffic-light-opt-5',
            value: 4,
            color: 'hsl(var(--brand-neutral-0))',
          },
        ],
        is_required: true,
      },
      {
        id: 'claims_match_sources',
        type: 'traffic-light',
        question:
          'Die Behauptungen des Artikels decken sich vollständig mit denen der Originalquellen.',
        options: [
          {
            id: 'traffic-light-opt-1',
            value: 0,
            color: 'hsl(var(--brand-green))',
          },
          {
            id: 'traffic-light-opt-2',
            value: 1,
            color: 'hsl(var(--brand-yellow))',
          },
          {
            id: 'traffic-light-opt-3',
            value: 2,
            color: 'hsl(var(--brand-orange))',
          },
          {
            id: 'traffic-light-opt-4',
            value: 3,
            color: 'hsl(var(--brand-red))',
          },
          {
            id: 'traffic-light-opt-5',
            value: 4,
            color: 'hsl(var(--brand-neutral-0))',
          },
        ],
        is_required: true,
      },
      {
        id: 'public_media_match',
        type: 'traffic-light',
        question:
          'Die Behauptungen des Artikels decken sich mit der Berichterstattung öffentlich-rechtlicher Medien und/oder Fachmedien.',
        options: [
          {
            id: 'traffic-light-opt-1',
            value: 0,
            color: 'hsl(var(--brand-green))',
          },
          {
            id: 'traffic-light-opt-2',
            value: 1,
            color: 'hsl(var(--brand-yellow))',
          },
          {
            id: 'traffic-light-opt-3',
            value: 2,
            color: 'hsl(var(--brand-orange))',
          },
          {
            id: 'traffic-light-opt-4',
            value: 3,
            color: 'hsl(var(--brand-red))',
          },
          {
            id: 'traffic-light-opt-5',
            value: 4,
            color: 'hsl(var(--brand-neutral-0))',
          },
        ],
        is_required: true,
      },
      {
        id: 'author_credentials',
        type: 'traffic-light',
        question:
          'Der Artikel ist von einer fachkundigen Person oder einer*m beruflichen Journalist*in geschrieben.',
        options: [
          {
            id: 'traffic-light-opt-1',
            value: 0,
            color: 'hsl(var(--brand-green))',
          },
          {
            id: 'traffic-light-opt-2',
            value: 1,
            color: 'hsl(var(--brand-yellow))',
          },
          {
            id: 'traffic-light-opt-3',
            value: 2,
            color: 'hsl(var(--brand-orange))',
          },
          {
            id: 'traffic-light-opt-4',
            value: 3,
            color: 'hsl(var(--brand-red))',
          },
          {
            id: 'traffic-light-opt-5',
            value: 4,
            color: 'hsl(var(--brand-neutral-0))',
          },
        ],
        is_required: true,
      },
    ],
    metadata: {
      text: 'Bewerte die folgenden Aussagen sorgfältig.',
      title: 'Quelle',
      help_url: '',
      indent_level: 0,
    },
  },
  {
    id: 'images_question',
    fields: [
      {
        id: 'images_quality',
        type: 'traffic-light',
        question: 'Die Bilder sind relevant und unterstützen den Inhalt.',
        options: [
          {
            id: 'traffic-light-opt-1',
            value: 0,
            color: 'hsl(var(--brand-green))',
          },
          {
            id: 'traffic-light-opt-2',
            value: 1,
            color: 'hsl(var(--brand-yellow))',
          },
          {
            id: 'traffic-light-opt-3',
            value: 2,
            color: 'hsl(var(--brand-orange))',
          },
          {
            id: 'traffic-light-opt-4',
            value: 3,
            color: 'hsl(var(--brand-red))',
          },
          {
            id: 'traffic-light-opt-5',
            value: 4,
            color: 'hsl(var(--brand-neutral-0))',
          },
        ],
        is_required: true,
      },
    ],
    metadata: {
      text: 'Bewerte die Bilder im Artikel.',
      title: 'Bilder',
      help_url: '',
      indent_level: 0,
    },
  },
  {
    id: 'evaluation_criteria_question',
    fields: [
      {
        id: 'additional_rating',
        type: 'likert-scale',
        options: [
          {
            id: 'positive',
            text: 'Ja,',
            color: 'hsl(var(--brand-green))',
            value: 0,
            description: 'etwas positives',
          },
          {
            id: 'minor_issue',
            text: 'Ja,',
            color: 'hsl(var(--brand-yellow))',
            value: 1,
            description: 'kleiner Mangel',
          },
          {
            id: 'critical_error',
            text: 'Ja,',
            color: 'hsl(var(--brand-red))',
            value: 2,
            description: 'gravierender Fehler',
          },
          {
            id: 'nothing',
            text: 'Nein,',
            color: 'hsl(var(--brand-neutral-0))',
            value: 3,
            description: 'alles geprüft',
          },
        ],
        question:
          'Ist dir sonst noch etwas aufgefallen, das in die Bewertung einfliessen sollte?',
        is_required: true,
      },
    ],
    metadata: {
      text: 'Hinweis: Im Rahmen dieses Tests, kann nur ein *sonstiger* Punkt angegeben werden. Falls du mehrere Punkte angeben willst, wähle bitte den gravierendsten aus. Später wird es die Möglichkeit geben, hier auch mehrere Punkte aufzuführen.',
      title: 'Bewertungskriterien',
      help_url: '',
      indent_level: 0,
    },
  },
  {
    id: 'additional_comment_question',
    fields: [
      {
        id: 'additional_comment',
        type: 'text-area',
        options: [
          {
            id: 'comment_field',
            max_length: 500,
            placeholder: 'Type your answer here...',
          },
        ],
        is_shown: [{ value: 4, field_id: 'additional_rating', operator: '<' }],
        question: 'Was ist dir aufgefallen?',
        is_required: [
          { value: 4, field_id: 'additional_rating', operator: '<' },
        ],
      },
    ],
    metadata: {
      text: 'Versuche den Faktor möglichst kurz und knapp zu beschreiben. Du hast gleich noch mehr Platz für einen ausführlichen Fallbewertungskommentar.',
      title: 'Zusatz',
      help_url: '',
      indent_level: 1,
    },
  },
  {
    id: 'submit_question',
    fields: [],
    metadata: {
      text: 'Überprüfe deine Angaben und schließe den Fall ab.',
      title: 'Fall abschließen',
      help_url: '',
      indent_level: 0,
    },
  },
];
