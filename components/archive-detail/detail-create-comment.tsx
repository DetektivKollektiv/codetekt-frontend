import { Profile } from '@/lib/queries/getProfile';
import { User } from '@/lib/queries/getUser';
import Image from 'next/image';
import { FC } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';

interface DetailCreateCommentProps {
  user: User['user'] | null;
  isAuthenticated: boolean;
  profile: Profile | null;
}

const DetailCreateComment: FC<DetailCreateCommentProps> = ({
  user,
  isAuthenticated,
  profile,
}) => {
  console.log('DetailCreateComment - user:', user);
  return (
    <div className="page-max-w ">
      <Card className="flex flex-col-reverse lg:flex-row py-8 md:py-12 px-6 gap-12 md:gap-24 lg:gap-24">
        <CardContent className="flex flex-col md:flex-row items-center p-0 gap-6 md:gap-24 lg:gap-6 justify-center">
          <Image
            src="/images/community-people.svg"
            alt="Community People Illustration"
            width={400}
            height={400}
            className="w-48 md:w-80"
          />
          <CardHeader className="space-y-4 p-0 text-center md:text-left">
            <CardTitle>
              Mach mit und <br /> bearbeite diesen Fall!
            </CardTitle>
            <Button>Fall bearbeiten</Button>
          </CardHeader>
        </CardContent>
        <CardContent className="p-0 flex-1 flex flex-col">
          <p className="text-heading-lg font-bold">Neuen Kommentar verfassen</p>
          <p className="text-body-lg text-muted-foreground mb-4">
            {profile?.username}
          </p>
          <Textarea
            placeholder="Dein Kommentar..."
            className="mb-4 w-full flex-1 resize-none"
          />
          <Button disabled={!isAuthenticated} variant="secondary">
            {isAuthenticated
              ? 'Kommentar erstellen'
              : 'Anmelden zum Kommentieren'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailCreateComment;
