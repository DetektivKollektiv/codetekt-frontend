import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Case } from '@/lib/queries/getCase';
import { getCaseTitle, getLocalDate } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import ImagePlaceholder from '../image-placeholder';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

interface CaseCardProps {
  case: NonNullable<Case>;
}

const CaseCard: FC<CaseCardProps> = ({ case: caseData }) => {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Card
            className={`overflow-hidden text-left cursor-pointer hover:shadow-lg transition-shadow`}
          >
            <div className="hidden lg:block">
              {caseData.open_graph_data?.og_image ? (
                <Image
                  height={168}
                  width={300}
                  src={caseData.open_graph_data.og_image}
                  alt={caseData.open_graph_data.og_image_alt || 'Case image'}
                />
              ) : (
                <ImagePlaceholder
                  width={300}
                  height={168}
                  seed={caseData.case_number}
                />
              )}
            </div>
            <CardHeader>
              <CardTitle className="line-clamp-1">
                {getCaseTitle(caseData)}
              </CardTitle>
              <CardDescription>
                Eingereicht am: {getLocalDate(caseData.submitted_at)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {caseData.content_type === 'url' ? (
                <Link
                  href={caseData.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="line-clamp-1 underline"
                >
                  {caseData.content}
                </Link>
              ) : (
                <p className="line-clamp-3">{caseData.content}</p>
              )}
            </CardContent>
          </Card>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{getCaseTitle(caseData)}</DialogTitle>
          </DialogHeader>
          {caseData.content_type === 'url' ? (
            <Link
              href={caseData.content}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {caseData.content}
            </Link>
          ) : (
            <p>{caseData.content}</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CaseCard;
