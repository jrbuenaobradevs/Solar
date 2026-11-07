import type { ReactNode } from "react";

type IconProps = { name: string; size?: number };

function Icon({ name, size = 20 }: IconProps) {
  const paths: Record<string, ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    battery: <><rect x="3" y="6" width="17" height="12" rx="2" /><path d="M20 10h2v4h-2M7 10v4M10 12H4" /></>,
    bolt: <path d="m13 2-9 12h8l-1 8 9-12h-8l1-8Z" />,
    building: <><path d="M3 21h18M6 21V7l6-4 6 4v14M9 10h1M14 10h1M9 14h1M14 14h1" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    home: <><path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-7h6v7" /></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    panel: <><path d="M4 4h16l2 13H2L4 4ZM12 4v13M3 11h18M8 21h8M12 17v4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
  };
  return (
    <svg aria-hidden="true" className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none">
      {paths[name]}
    </svg>
  );
}

export default Icon;
