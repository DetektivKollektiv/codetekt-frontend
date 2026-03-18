export type NavLink = {
  label: string;
  href: string;
  children?: NavLink[];
  highlight?: boolean;
};

export * from './review';
