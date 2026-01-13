import {
  FileText,
  Heading,
  ListTree,
  Scale,
  Users,
  Link2,
  CheckCircle2,
  Radio,
  UserCheck,
  Image,
  Star,
  type LucideIcon,
} from 'lucide-react';

export type FieldId =
  | 'grammar'
  | 'structure'
  | 'headline'
  | 'objectivity'
  | 'perspectives'
  | 'external_sources'
  | 'claims_match_sources'
  | 'public_media_match'
  | 'author_credentials'
  | 'images_quality'
  | 'additional_rating';

export type CategoryId =
  | 'content_quality'
  | 'objectivity_balance'
  | 'sources_verification'
  | 'media_quality'
  | 'additional';

export interface FieldDefinition {
  id: FieldId;
  title: string;
  question: string;
  icon: LucideIcon;
  categoryId: CategoryId;
}

export interface CategoryDefinition {
  id: CategoryId;
  title: string;
  icon: LucideIcon;
  fieldIds: FieldId[];
}

export const fieldDefinitions: Record<FieldId, FieldDefinition> = {
  grammar: {
    id: 'grammar',
    title: 'Grammatik und Rechtschreibung',
    question: 'Die Grammatik und Rechtschreibung des Artikels sind fehlerfrei.',
    icon: FileText,
    categoryId: 'content_quality',
  },
  structure: {
    id: 'structure',
    title: 'Struktur',
    question: 'Der Artikel ist gut strukturiert und logisch aufgebaut.',
    icon: ListTree,
    categoryId: 'content_quality',
  },
  headline: {
    id: 'headline',
    title: 'Überschrift',
    question:
      'Die Überschrift passt inhalt des mehreren Quellen aus ausreichend.',
    icon: Heading,
    categoryId: 'content_quality',
  },
  objectivity: {
    id: 'objectivity',
    title: 'Objektivität',
    question: 'Der Artikel ist objektiv und nicht einseitig gewertet.',
    icon: Scale,
    categoryId: 'objectivity_balance',
  },
  perspectives: {
    id: 'perspectives',
    title: 'Perspektiven',
    question: 'Der Artikel beleuchtet verschiedene Perspektiven.',
    icon: Users,
    categoryId: 'objectivity_balance',
  },
  external_sources: {
    id: 'external_sources',
    title: 'Externe Quellen',
    question: 'Der Artikel enthält Verweise auf externe Quellen.',
    icon: Link2,
    categoryId: 'sources_verification',
  },
  claims_match_sources: {
    id: 'claims_match_sources',
    title: 'Behauptungen und Quellen',
    question: 'Die Behauptungen im Artikel stimmen mit den Quellen überein.',
    icon: CheckCircle2,
    categoryId: 'sources_verification',
  },
  public_media_match: {
    id: 'public_media_match',
    title: 'Öffentliche Medienberichterstattung',
    question:
      'Der Artikel passt zur Berichterstattung der öffentlichen Medien.',
    icon: Radio,
    categoryId: 'sources_verification',
  },
  author_credentials: {
    id: 'author_credentials',
    title: 'Autor-Glaubwürdigkeit',
    question: 'Der Autor des Artikels ist glaubwürdig und vertrauenswürdig.',
    icon: UserCheck,
    categoryId: 'sources_verification',
  },
  images_quality: {
    id: 'images_quality',
    title: 'Bildqualität',
    question: 'Die Bilder im Artikel sind qualitativ hochwertig und relevant.',
    icon: Image,
    categoryId: 'media_quality',
  },
  additional_rating: {
    id: 'additional_rating',
    title: 'Zusätzliche Bewertung',
    question: 'Wie würden Sie den Artikel insgesamt bewerten?',
    icon: Star,
    categoryId: 'additional',
  },
};

export const categoryDefinitions: Record<CategoryId, CategoryDefinition> = {
  content_quality: {
    id: 'content_quality',
    title: 'Inhaltsqualität',
    icon: FileText,
    fieldIds: ['grammar', 'structure', 'headline'],
  },
  objectivity_balance: {
    id: 'objectivity_balance',
    title: 'Objektivität & Balance',
    icon: Scale,
    fieldIds: ['objectivity', 'perspectives'],
  },
  sources_verification: {
    id: 'sources_verification',
    title: 'Quellen & Verifikation',
    icon: Link2,
    fieldIds: [
      'external_sources',
      'claims_match_sources',
      'public_media_match',
      'author_credentials',
    ],
  },
  media_quality: {
    id: 'media_quality',
    title: 'Medienqualität',
    icon: Image,
    fieldIds: ['images_quality'],
  },
  additional: {
    id: 'additional',
    title: 'Zusätzlich',
    icon: Star,
    fieldIds: ['additional_rating'],
  },
};

// Helper to get all categories in order
export const categories: CategoryDefinition[] = [
  categoryDefinitions.content_quality,
  categoryDefinitions.objectivity_balance,
  categoryDefinitions.sources_verification,
  categoryDefinitions.media_quality,
  categoryDefinitions.additional,
];
