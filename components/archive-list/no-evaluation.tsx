import { FC } from 'react';

const NoEvaluation: FC = ({}) => {
  return (
    <div className="w-full lg:w-72 flex-shrink-0 space-y-4 bg-secondary text-secondary-foreground p-4 rounded-lg h-48 lg:h-auto relative">
      <div className="absolute inset-0 bg-neutral-200/60 rounded-lg w-full h-full z-10 flex justify-center items-center">
        <div className="text-center px-4">
          <h4 className="text-lg font-semibold mb-2 leading-tight">
            Noch keine Bewertung verfügbar
          </h4>
        </div>
      </div>
    </div>
  );
};

export default NoEvaluation;
