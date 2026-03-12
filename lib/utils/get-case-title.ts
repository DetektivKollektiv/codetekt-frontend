import { AggregatedReviews } from '../queries/getAggregatedReviews';
import { Case } from '../queries/getCase';
import { OpenCases } from '../queries/getOpenCases';
import { UserCases } from '../queries/getUserCases';

type DirectCaseData = NonNullable<Case> | UserCases[number] | OpenCases[number];

const buildTitle = (
  case_number: number | null,
  case_titles: { value: string } | null | undefined,
  open_graph_data: { og_title: string | null } | null | undefined,
) => {
  const title = case_titles?.value ?? open_graph_data?.og_title ?? null;
  return title ? `Fall ${case_number}: ${title}` : `Fall ${case_number}`;
};

export const getCaseTitle = (
  caseData: DirectCaseData | AggregatedReviews[number],
) => {
  if ('cases' in caseData && caseData.cases) {
    const { case_number, open_graph_data, case_titles } = caseData.cases;
    return buildTitle(case_number, case_titles, open_graph_data);
  }
  const { open_graph_data, case_number, case_titles } =
    caseData as DirectCaseData;
  return buildTitle(case_number, case_titles, open_graph_data);
};
