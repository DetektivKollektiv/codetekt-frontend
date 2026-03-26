import { Case } from '@/lib/queries/getCase';
import {
  CaseCategoryValue,
  CaseFactcheckValue,
} from '@/lib/schemas/case-metadata-schemas';
import { getCaseKeywords } from '@/lib/utils/get-case-keywords';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface MetadataDraftState {
  title: string;
  keywords: string[];
  category: CaseCategoryValue | null;
  factcheckSelection: 'yes' | 'no' | null;
  factcheckValue: string;
}

interface MetadataDirtyState {
  title: boolean;
  keywords: boolean;
  category: boolean;
  factcheck: boolean;
}

interface UseMetadataDraftStateOptions {
  caseData: NonNullable<Case>;
  userId?: string;
  setTitle: (value: string) => void;
  setKeywords: (values: string[]) => void;
  setCategory: (value: CaseCategoryValue) => void;
  setFactcheck: (value: CaseFactcheckValue) => void;
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
  setFactcheck,
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
      factcheckSelection:
        caseData.case_factchecks?.has_factcheck === true
          ? 'yes'
          : caseData.case_factchecks?.has_factcheck === false
            ? 'no'
            : null,
      factcheckValue: caseData.case_factchecks?.value ?? '',
    }),
  );

  const [metadataDirty, setMetadataDirty] = useState<MetadataDirtyState>({
    title: false,
    keywords: false,
    category: false,
    factcheck: false,
  });

  useEffect(() => {
    const nextTitle = getInitialTitle(caseData);
    const nextCategory =
      (caseData.case_categories?.value as CaseCategoryValue | null) ?? null;
    const nextFactcheckSelection =
      caseData.case_factchecks?.has_factcheck === true
        ? 'yes'
        : caseData.case_factchecks?.has_factcheck === false
          ? 'no'
          : null;
    const nextFactcheckValue = caseData.case_factchecks?.value ?? '';

    setMetadataDraft((prev) => ({
      title: metadataDirty.title ? prev.title : nextTitle,
      keywords: metadataDirty.keywords ? prev.keywords : userExistingKeywords,
      category: metadataDirty.category ? prev.category : nextCategory,
      factcheckSelection: metadataDirty.factcheck
        ? prev.factcheckSelection
        : nextFactcheckSelection,
      factcheckValue: metadataDirty.factcheck
        ? prev.factcheckValue
        : nextFactcheckValue,
    }));
  }, [
    caseData.case_titles?.value,
    caseData.open_graph_data?.og_title,
    caseData.case_categories?.value,
    caseData.case_factchecks?.has_factcheck,
    caseData.case_factchecks?.value,
    metadataDirty.title,
    metadataDirty.keywords,
    metadataDirty.category,
    metadataDirty.factcheck,
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

  useEffect(() => {
    if (!metadataDirty.factcheck) return;

    const persistedSelection =
      caseData.case_factchecks?.has_factcheck === true
        ? 'yes'
        : caseData.case_factchecks?.has_factcheck === false
          ? 'no'
          : null;
    const persistedValue = caseData.case_factchecks?.value ?? '';

    if (
      persistedSelection === metadataDraft.factcheckSelection &&
      persistedValue === metadataDraft.factcheckValue
    ) {
      setMetadataDirty((prev) => ({ ...prev, factcheck: false }));
    }
  }, [
    metadataDirty.factcheck,
    caseData.case_factchecks?.has_factcheck,
    caseData.case_factchecks?.value,
    metadataDraft.factcheckSelection,
    metadataDraft.factcheckValue,
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

  const handleFactcheckSelectionChange = useCallback(
    (value: 'yes' | 'no' | null) => {
      setMetadataDraft((prev) => ({ ...prev, factcheckSelection: value }));
      setMetadataDirty((prev) => ({ ...prev, factcheck: true }));
    },
    [],
  );

  const handleFactcheckValueChange = useCallback((value: string) => {
    setMetadataDraft((prev) => ({ ...prev, factcheckValue: value }));
    setMetadataDirty((prev) => ({ ...prev, factcheck: true }));
  }, []);

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

  const handleSaveFactcheck = useCallback(() => {
    if (!metadataDraft.factcheckSelection) return;

    setFactcheck({
      hasFactcheck: metadataDraft.factcheckSelection === 'yes',
      value:
        metadataDraft.factcheckSelection === 'yes'
          ? metadataDraft.factcheckValue
          : null,
    });
  }, [
    metadataDraft.factcheckValue,
    metadataDraft.factcheckSelection,
    setFactcheck,
  ]);

  return {
    metadataDraft,
    existingKeywords,
    handleTitleChange,
    handleKeywordsChange,
    handleCategoryChange,
    handleFactcheckSelectionChange,
    handleFactcheckValueChange,
    handleSaveTitle,
    handleSaveKeywords,
    handleSaveCategory,
    handleSaveFactcheck,
  };
};
