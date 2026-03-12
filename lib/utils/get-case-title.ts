import { AggregatedReviews } from '../queries/getAggregatedReviews';
import { Case } from '../queries/getCase';
import { OpenCases } from '../queries/getOpenCases';
import { UserCases } from '../queries/getUserCases';

type DirectCaseData = NonNullable<Case> | UserCases[number] | OpenCases[number];

export const getCaseTitle = (
  caseData: DirectCaseData | AggregatedReviews[number],
) => {
  if ('cases' in caseData && caseData.cases) {
    const { case_number, open_graph_data } = caseData.cases;
    return open_graph_data?.og_title
      ? `Fall ${case_number}: ${open_graph_data.og_title}`
      : `Fall ${case_number}`;
  }
  const { open_graph_data, case_number } = caseData as DirectCaseData;
  return open_graph_data?.og_title
    ? `Fall ${case_number}: ${open_graph_data.og_title}`
    : `Fall ${case_number}`;
};
