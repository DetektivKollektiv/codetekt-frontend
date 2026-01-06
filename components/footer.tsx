import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';
import { FC } from 'react';

interface FooterProps {}

const Footer: FC<FooterProps> = ({}) => {
  return (
    <footer className="w-full bg-secondary border-t border-border">
      <div className="page-max-w text-secondary-foreground py-12">
        {/* Desktop Version */}
        <div className="hidden lg:grid grid-cols-4 h-56">
          <div>
            <h3 className="font-bold text-2xl mb-3">Aktion</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:underline">
                  Fall bearbeiten
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Fall einreichen
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Gelöste Fälle ansehen
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-2xl mb-3">codetekt</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:underline">
                  Überblick
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Der Verein
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Trust-Checking
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-2xl mb-3">Kontakt</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="mailto:info@codetekt.org"
                  className="hover:underline"
                >
                  info@codetekt.org
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Instagram
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Twitter
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Facebook
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  LinkedIn
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-2xl mb-3">Rechtliches</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:underline">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Nutzungsbedingungen
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile Version */}
        <Accordion type="single" collapsible className="lg:hidden w-full">
          <AccordionItem className="border-secondary-border" value="item-1">
            <AccordionTrigger className="font-bold font-mono text-2xl">
              Aktion
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 pl-1">
                <li>
                  <Link href="#" className="hover:underline">
                    Fall bearbeiten
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Fall einreichen
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Gelöste Fälle ansehen
                  </Link>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem className="border-secondary-border" value="item-2">
            <AccordionTrigger className="font-bold font-mono text-2xl">
              codetekt
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 pl-1">
                <li>
                  <Link href="#" className="hover:underline">
                    Überblick
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Der Verein
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Trust-Checking
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    FAQ
                  </Link>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem className="border-secondary-border" value="item-3">
            <AccordionTrigger className="font-bold font-mono text-2xl">
              Kontakt
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 pl-1">
                <li>
                  <Link
                    href="mailto:info@codetekt.org"
                    className="hover:underline"
                  >
                    info@codetekt.org
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Instagram
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Facebook
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    LinkedIn
                  </Link>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem className="border-secondary-border" value="item-4">
            <AccordionTrigger className="font-bold font-mono text-2xl">
              Rechtliches
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 pl-1">
                <li>
                  <Link href="#" className="hover:underline">
                    Impressum
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Datenschutz
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
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
