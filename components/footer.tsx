import Link from 'next/link';
import { FC } from 'react';

interface FooterProps {}

const Footer: FC<FooterProps> = ({}) => {
  return (
    <footer className="w-full h-80 bg-accent">
      <div className="page-max-w grid grid-cols-4 text-accent-foreground py-12">
        <div>
          <h3 className="font-bold font-mono text-3xl mb-3">Aktion</h3>
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
          <h3 className="font-bold font-mono text-3xl mb-3">codetekt</h3>
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
          <h3 className="font-bold font-mono text-3xl mb-3">Kontakt</h3>
          <ul className="space-y-2">
            <li>
              <Link href="mailto:info@codetekt.org" className="hover:underline">
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
          <h3 className="font-bold font-mono text-3xl mb-3">Rechtliches</h3>
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
    </footer>
  );
};

export default Footer;
