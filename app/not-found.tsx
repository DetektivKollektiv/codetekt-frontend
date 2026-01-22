import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="w-full h-screen bg-background flex flex-col items-center justify-center gap-6">
      <div className="text-center space-y-4">
        <div>
          <p className="text-body-md text-muted-foreground">
            Diese Seite wurde nicht gefunden.
          </p>
        </div>
        <Link href="/" className="block">
          <Button variant="default" size={'lg'}>
            Zurück zur Startseite
          </Button>
        </Link>
      </div>
    </div>
  );
}
