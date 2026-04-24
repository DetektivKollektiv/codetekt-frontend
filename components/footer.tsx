import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';
import { FC } from 'react';

const Footer: FC = ({}) => {
  return (
    <footer className="w-full bg-secondary ">
      <div className="w-full bg-gradient-brand h-px"></div>
      <div className="page-max-w text-secondary-foreground py-12">
        {/* Desktop Version */}
        <div className="hidden lg:grid grid-cols-3 w-full h-56">
          <div className="lg:w-40">
            <h3 className="font-bold text-heading-lg mb-3">Aktion</h3>
            <ul className="space-y-2 text-secondary-foreground/60">
              <li>
                <Link href="/#open-cases" className="hover:underline">
                  Fall bearbeiten
                </Link>
              </li>
              <li>
                <Link href="/submit" className="hover:underline">
                  Fall einreichen
                </Link>
              </li>
              <li>
                <Link href="/archive" className="hover:underline">
                  Gelöste Fälle ansehen
                </Link>
              </li>
            </ul>
          </div>
          <div className="lg:w-40 mx-auto">
            <h3 className="font-bold text-heading-lg mb-3">Kontakt</h3>
            <ul className="space-y-2 text-secondary-foreground/60">
              <li>
                <Link
                  href="mailto:info@codetekt.org"
                  className="hover:underline"
                >
                  info@codetekt.org
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.instagram.com/codetekt/"
                  className="hover:underline"
                >
                  Instagram
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.tiktok.com/@codetekt"
                  className="hover:underline"
                >
                  TikTok
                </Link>
              </li>

              <li>
                <Link
                  href="https://www.linkedin.com/company/codetekt"
                  className="hover:underline"
                >
                  LinkedIn
                </Link>
              </li>
            </ul>
          </div>
          <div className="lg:w-40 lg:ml-auto">
            <h3 className="font-bold text-heading-lg mb-3">Rechtliches</h3>
            <ul className="space-y-2 text-secondary-foreground/60">
              <li>
                <Link
                  href="https://codetekt.org/impressum/"
                  className="hover:underline"
                >
                  Impressum
                </Link>
              </li>
              <li>
                <Link
                  href="https://codetekt.org/datenschutz/"
                  className="hover:underline"
                >
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link
                  href="https://gilded-fireplant-773.notion.site/Nutzungsbedingungen-Plattform-34a425d9f23a80f59c2ec28daab286e8"
                  className="hover:underline"
                >
                  Nutzungsbedingungen
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile Version */}
        <Accordion type="single" collapsible className="lg:hidden w-full">
          <AccordionItem className="border-none" value="item-1">
            <AccordionTrigger className="font-bold text-heading-sm relative [&[data-state=open]>div]:hidden">
              Aktion
              <div className="w-full bg-gradient-brand h-px absolute bottom-0 left-0 "></div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 text-secondary-foreground/60 pl-4 text-body-md">
                <li>
                  <Link href="/#open-cases">Fall bearbeiten</Link>
                </li>
                <li>
                  <Link href="/submit">Fall einreichen</Link>
                </li>
                <li>
                  <Link href="/archive">Gelöste Fälle ansehen</Link>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem className="border-none" value="item-2">
            <AccordionTrigger className="font-bold text-heading-sm relative [&[data-state=open]>div]:hidden">
              Kontakt
              <div className="w-full bg-gradient-brand h-px absolute bottom-0 left-0"></div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 text-secondary-foreground/60 pl-4 text-body-md">
                <li>
                  <Link href="mailto:info@codetekt.org">info@codetekt.org</Link>
                </li>
                <li>
                  <Link href="https://www.instagram.com/codetekt/">
                    Instagram
                  </Link>
                </li>
                <li>
                  <Link href="https://www.tiktok.com/@codetekt">TikTok</Link>
                </li>
                <li>
                  <Link href="https://www.linkedin.com/company/codetekt">
                    LinkedIn
                  </Link>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem className="border-none" value="item-3">
            <AccordionTrigger className="font-bold text-heading-sm relative [&[data-state=open]>div]:hidden">
              Rechtliches
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 text-secondary-foreground/60 pl-4 text-body-md">
                <li>
                  <Link href="https://codetekt.org/impressum/">Impressum</Link>
                </li>
                <li>
                  <Link href="https://codetekt.org/datenschutz/">
                    Datenschutz
                  </Link>
                </li>
                <li>
                  <Link href="https://gilded-fireplant-773.notion.site/Nutzungsbedingungen-Plattform-34a425d9f23a80f59c2ec28daab286e8">
                    Nutzungsbedingungen
                  </Link>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </footer>
  );
};

export default Footer;
