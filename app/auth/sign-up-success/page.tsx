import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Page() {
  return (
    <div className="h-full flex-1 flex w-full items-center justify-center p-6 md:p-10 bg-gradient-neutral-coral">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Danke für deine Registrierung!
              </CardTitle>
              <CardDescription>
                Bitte bestätige deine E-Mail-Adresse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Deine Registrierung war erfolgreich. Schau jetzt in dein
                E-Mail-Postfach und bestätige deine Adresse, um deinen Account
                zu aktivieren.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
