import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Vielen Dank für deine Registrierung!
              </CardTitle>
              <CardDescription>E-Mail zur Bestätigung prüfen</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Du hast dich erfolgreich registriert. Bitte überprüfe dein
                E-Mail-Postfach und bestätige deinen Account, bevor du dich
                anmeldest.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
