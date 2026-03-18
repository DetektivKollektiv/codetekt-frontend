import { Case } from '@/lib/queries/getCase';
import { CaseCategoryValue } from '@/lib/schemas/case-metadata-schemas';
import { getCaseKeywords } from '@/lib/utils/get-case-keywords';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface MetadataDraftState {
  title: string;
  keywords: string[];
  category: CaseCategoryValue | null;
}

interface MetadataDirtyState {
  title: boolean;
  keywords: boolean;
  category: boolean;
}

interface UseMetadataDraftStateOptions {
  caseData: NonNullable<Case>;
  userId?: string;
  setTitle: (value: string) => void;
  setKeywords: (values: string[]) => void;
  setCategory: (value: CaseCategoryValue) => void;
}

const hasSameKeywords = (left: string[], right: string[]) => {
  if (left.length !== right.length) return false;
  return left.every((keyword, index) => keyword === right[index]);
};

const getInitialTitle = (caseData: NonNullable<Case>) => {
  const caseTitle = caseData.case_titles?.value?.trim();
  if (caseTitle) {
    return caseData.case_titles?.value ?? '';
  }

  const openGraphTitle = caseData.open_graph_data?.og_title?.trim();
  if (openGraphTitle) {
    return caseData.open_graph_data?.og_title ?? '';
  }

  return '';
};

export const useMetadataDraftState = ({
  caseData,
  userId,
  setTitle,
  setKeywords,
  setCategory,
}: UseMetadataDraftStateOptions) => {
  const userExistingKeywords = useMemo(
    () =>
      userId
        ? (caseData.case_keywords?.find(
            (keywordSet) => keywordSet.created_by === userId,
          )?.values ?? [])
        : [],
    [caseData.case_keywords, userId],
  );

  const existingKeywords = useMemo(() => getCaseKeywords(caseData), [caseData]);

  const [metadataDraft, setMetadataDraft] = useState<MetadataDraftState>(
    () => ({
      title: getInitialTitle(caseData),
      keywords: userExistingKeywords,
      category:
        (caseData.case_categories?.value as CaseCategoryValue | null) ?? null,
    }),
  );

  const [metadataDirty, setMetadataDirty] = useState<MetadataDirtyState>({
    title: false,
    keywords: false,
    category: false,
  });

  useEffect(() => {
    const nextTitle = getInitialTitle(caseData);
    const nextCategory =
      (caseData.case_categories?.value as CaseCategoryValue | null) ?? null;

    setMetadataDraft((prev) => ({
      title: metadataDirty.title ? prev.title : nextTitle,
      keywords: metadataDirty.keywords ? prev.keywords : userExistingKeywords,
      category: metadataDirty.category ? prev.category : nextCategory,
    }));
  }, [
    caseData.case_titles?.value,
    caseData.open_graph_data?.og_title,
    caseData.case_categories?.value,
    metadataDirty.title,
    metadataDirty.keywords,
    metadataDirty.category,
    userExistingKeywords,
  ]);

  useEffect(() => {
    if (
      metadataDirty.title &&
      (caseData.case_titles?.value ?? '') === metadataDraft.title
    ) {
      setMetadataDirty((prev) => ({ ...prev, title: false }));
    }
  }, [metadataDirty.title, caseData.case_titles?.value, metadataDraft.title]);

  useEffect(() => {
    if (!metadataDirty.keywords) return;
    if (hasSameKeywords(userExistingKeywords, metadataDraft.keywords)) {
      setMetadataDirty((prev) => ({ ...prev, keywords: false }));
    }
  }, [metadataDirty.keywords, userExistingKeywords, metadataDraft.keywords]);

  useEffect(() => {
    if (
      metadataDirty.category &&
      caseData.case_categories?.value === metadataDraft.category
    ) {
      setMetadataDirty((prev) => ({ ...prev, category: false }));
    }
  }, [
    metadataDirty.category,
    caseData.case_categories?.value,
    metadataDraft.category,
  ]);

  const handleTitleChange = useCallback((value: string) => {
    setMetadataDraft((prev) => ({ ...prev, title: value }));
    setMetadataDirty((prev) => ({ ...prev, title: true }));
  }, []);

  const handleKeywordsChange = useCallback((values: string[]) => {
    setMetadataDraft((prev) => ({ ...prev, keywords: values }));
    setMetadataDirty((prev) => ({ ...prev, keywords: true }));
  }, []);

  const handleCategoryChange = useCallback(
    (value: CaseCategoryValue | null) => {
      setMetadataDraft((prev) => ({ ...prev, category: value }));
      setMetadataDirty((prev) => ({ ...prev, category: true }));
    },
    [],
  );

  const handleSaveTitle = useCallback(() => {
    setTitle(metadataDraft.title);
  }, [metadataDraft.title, setTitle]);

  const handleSaveKeywords = useCallback(() => {
    setKeywords(metadataDraft.keywords);
  }, [metadataDraft.keywords, setKeywords]);

  const handleSaveCategory = useCallback(() => {
    if (!metadataDraft.category) return;
    setCategory(metadataDraft.category);
  }, [metadataDraft.category, setCategory]);

  return {
    metadataDraft,
    existingKeywords,
    handleTitleChange,
    handleKeywordsChange,
    handleCategoryChange,
    handleSaveTitle,
    handleSaveKeywords,
    handleSaveCategory,
  };
};
