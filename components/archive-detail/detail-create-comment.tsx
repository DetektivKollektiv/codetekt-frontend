'use client';
import { createCommentMutation } from '@/lib/queries/createComment';
import {
  createCommentFormSchema,
  type CreateCommentFormData,
} from '@/lib/schemas/comment-schemas';
import { createClient } from '@/lib/supabase/client';
import { getAuth } from '@/lib/supabase/getAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { FC, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Textarea } from '../ui/textarea';
import Link from 'next/link';

interface DetailCreateCommentProps {
  auth: Awaited<ReturnType<typeof getAuth>>;
  caseId: string;
}

const DetailCreateComment: FC<DetailCreateCommentProps> = ({
  auth,
  caseId,
}) => {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: authData } = useQuery({
    queryFn: () => getAuth(supabase),
    queryKey: ['auth'],
    initialData: auth,
  });

  const { isAuthenticated, user, profile } = authData;

  // Form state
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mutation
  const { mutate, isPending } = useMutation({
    ...createCommentMutation(supabase),
    onSuccess: () => {
      toast.success('Kommentar erfolgreich erstellt!');
      setContent('');
      setErrors({});
      // Invalidate comments query to refetch
      queryClient.invalidateQueries({ queryKey: ['case-comments', caseId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Ein Fehler ist aufgetreten');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Check authentication
    if (!isAuthenticated || !user) {
      toast.error('Du musst angemeldet sein, um zu kommentieren');
      return;
    }

    // Validate form data
    const formData: CreateCommentFormData = {
      content,
      case_id: caseId,
    };

    const validation = createCommentFormSchema.safeParse(formData);

    if (!validation.success) {
      // Map Zod errors to form fields
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const path = err.path.join('.');
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Submit to database
    mutate({
      content: validation.data.content,
      case_id: validation.data.case_id,
      author_id: user.id,
    });
  };

  return (
    <div className="page-max-w ">
      {isAuthenticated ? (
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
              <Button>Fall checken</Button>
            </CardHeader>
          </CardContent>
          <CardContent className="p-0 flex-1 flex flex-col">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <p className="text-heading-lg font-bold">
                Neuen Kommentar verfassen
              </p>
              <p className="text-body-lg text-muted-foreground mb-4">
                {profile?.username}
              </p>
              <Textarea
                placeholder="Dein Kommentar..."
                className={
                  errors.content
                    ? 'border-destructive mb-2 w-full flex-1 resize-none'
                    : 'mb-4 w-full flex-1 resize-none'
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isPending}
                aria-describedby={errors.content ? 'content-error' : undefined}
                aria-invalid={!!errors.content}
              />
              {errors.content && (
                <p
                  id="content-error"
                  className="text-sm text-destructive mb-4"
                  role="alert"
                >
                  {errors.content}
                </p>
              )}
              <Button
                type="submit"
                disabled={!isAuthenticated || isPending}
                variant="secondary"
              >
                {isPending
                  ? 'Wird erstellt...'
                  : isAuthenticated
                    ? 'Kommentar erstellen'
                    : 'Anmelden zum Kommentieren'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-secondary text-secondary-foreground">
          <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 w-full">
            <div className="w-full md:w-auto">
              <CardTitle>
                Du möchtest den Fall checken <br />
                oder kommentieren?
              </CardTitle>
              <CardDescription className="mt-4">Mach mit!</CardDescription>
            </div>
            <div className="flex flex-col w-full md:w-80 gap-2">
              <Button asChild variant="ghost">
                <Link href="/auth/login">
                  Anmelden
                </Link>
              </Button>
              <Button asChild variant="default">
                <Link href="/auth/sign-up">
                  co:detective werden
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default DetailCreateComment;
