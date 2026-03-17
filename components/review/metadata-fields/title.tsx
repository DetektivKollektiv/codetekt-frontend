import { FC, useState } from 'react';
import { TextField } from '../fields/text-field';

interface TitleProps {}

const Title: FC<TitleProps> = ({}) => {
  const [value, setValue] = useState('');
  return (
    <div>
      <TextField
        field={{
          id: 'title',
          type: 'text',
          question: 'Bitte gebe einen Titel für diesen Fall ein',
          options: [
            {
              id: 'title',
              placeholder: 'Titel für den Fall',
              max_length: 200,
              min_length: 10,
            },
          ],
          answer_value: '',
          initial_answer_value: '',
        }}
        onChange={(val) => setValue(val)}
        onCreateReviewDispute={(val) => {
          console.log('issue created', val);
        }}
        issues={[]}
      />
    </div>
  );
};

export default Title;
