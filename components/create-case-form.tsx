'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CURRENT_TEMPLATE_VERSION } from '@/lib/constants';
import { createCaseMutation } from '@/lib/queries/createCase';

import {
  createCaseFormSchema,
  type ContentType,
  type CreateCaseFormData,
} from '@/lib/schemas/case-schemas';
import { createClient } from '@/lib/supabase/client';
import { getAuth } from '@/lib/supabase/getAuth';
import { cn } from '@/lib/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CreateCaseFormProps {
  auth: Awaited<ReturnType<typeof getAuth>>;
}

export function CreateCaseForm({
  className,
  auth,
}: React.ComponentPropsWithoutRef<'div'> & CreateCaseFormProps) {
  // Auth context
  const router = useRouter();
  const supabase = createClient();

  const { data: authData } = useQuery({
    queryFn: () => getAuth(supabase),
    queryKey: ['auth'],
    initialData: auth,
  });

  const { isAuthenticated, user } = authData;

  // Form state
  const [contentType, setContentType] = useState<ContentType>('url');
  const [content, setContent] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/submit');
    }
  }, [isAuthenticated, router]);

  // Mutation
  const { mutate, isPending } = useMutation({
    ...createCaseMutation(supabase),
    onSuccess: () => {
      toast.success('Fall erfolgreich eingereicht!');
      router.push('/');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Ein Fehler ist aufgetreten');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Check authentication (defensive check)
    if (!isAuthenticated || !user) {
      toast.error('Du musst angemeldet sein, um einen Fall einzureichen');
      return;
    }

    // Validate form data
    const formData: CreateCaseFormData = {
      content_type: contentType,
      content,
      legal: {
        privacy: privacyAccepted,
        terms: termsAccepted,
      },
    };

    const validation = createCaseFormSchema.safeParse(formData);

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
      content_type: validation.data.content_type,
      submitted_by: user.id,
      template_version: CURRENT_TEMPLATE_VERSION,
    });
  };

  const handleCancel = () => {
    router.push('/archive');
  };

  // Don't render form if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          {/* Content Type Select */}
          <div className="grid gap-2">
            <Label htmlFor="content-type">Um welchen Medien-Typ geht es?</Label>
            <Select
              value={contentType}
              onValueChange={(value) => {
                setContentType(value as ContentType);
                setContent(''); // Clear content when switching types
                setErrors({ ...errors, content: '' });
              }}
              disabled={isPending}
            >
              <SelectTrigger id="content-type" className="w-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="url">
                  Link zu einem Online-Artikel
                </SelectItem>
                <SelectItem value="text">Textnachricht oder Aussage</SelectItem>
              </SelectContent>
            </Select>
            {errors.content_type && (
              <p className="text-sm text-red-500" role="alert">
                {errors.content_type}
              </p>
            )}
          </div>

          {/* Content Input - Conditional on content_type */}
          <div className="grid gap-2">
            <Label htmlFor="content">
              {contentType === 'url'
                ? 'Bitte gib hier einen Link ein'
                : 'Bitte gib hier eine Textnachricht oder Aussage ein'}
            </Label>
            {contentType === 'url' ? (
              <Input
                id="content"
                type="url"
                placeholder="https://example.com/artikel"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={
                  errors.content
                    ? 'border-red-500 bg-background'
                    : 'bg-background'
                }
                disabled={isPending}
                aria-describedby={errors.content ? 'content-error' : undefined}
                aria-invalid={!!errors.content}
              />
            ) : (
              <Textarea
                id="content"
                placeholder="Gib hier die Textnachricht oder Aussage ein, die überprüft werden soll..."
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={
                  errors.content
                    ? 'border-red-500 bg-background'
                    : 'bg-background'
                }
                disabled={isPending}
                aria-describedby={errors.content ? 'content-error' : undefined}
                aria-invalid={!!errors.content}
              />
            )}
            {errors.content && (
              <p
                id="content-error"
                className="text-sm text-red-500"
                role="alert"
              >
                {errors.content}
              </p>
            )}
          </div>

          {/* Legal Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="privacy"
                checked={privacyAccepted}
                onCheckedChange={(checked) =>
                  setPrivacyAccepted(checked === true)
                }
                className={
                  errors['legal.privacy']
                    ? 'border-red-500 bg-background'
                    : 'bg-background'
                }
                disabled={isPending}
              />
              <div className="grid gap-1.5 leading-none">
                <label htmlFor="privacy" className="text-sm cursor-pointer">
                  Ich stimme den Bedingungen der{' '}
                  <Link
                    href="/datenschutz"
                    className="underline underline-offset-4 hover:text-primary"
                    target="_blank"
                  >
                    Datenschutzerklärung
                  </Link>{' '}
                  zu
                </label>
                {errors['legal.privacy'] && (
                  <p className="text-sm text-red-500" role="alert">
                    {errors['legal.privacy']}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) =>
                  setTermsAccepted(checked === true)
                }
                className={
                  errors['legal.terms']
                    ? 'border-red-500 bg-background'
                    : 'bg-background'
                }
                disabled={isPending}
              />
              <div className="grid gap-1.5 leading-none">
                <label htmlFor="terms" className="text-sm cursor-pointer">
                  Ich stimme den{' '}
                  <Link
                    href="/nutzungsbedingungen"
                    className="underline underline-offset-4 hover:text-primary"
                    target="_blank"
                  >
                    Nutzungsbedingungen
                  </Link>{' '}
                  zu
                </label>
                {errors['legal.terms'] && (
                  <p className="text-sm text-red-500" role="alert">
                    {errors['legal.terms']}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col  gap-3">
            <Button
              type="submit"
              disabled={
                isPending ||
                !isAuthenticated ||
                !privacyAccepted ||
                !termsAccepted
              }
            >
              {isPending ? 'Wird eingereicht...' : 'Fall einreichen'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              Abbrechen
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
