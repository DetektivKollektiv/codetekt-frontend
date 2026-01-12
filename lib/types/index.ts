export type NavLink = {
  label: string;
  href: string;
  children?: NavLink[];
  highlight?: boolean;
};
