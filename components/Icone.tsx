const CHEMINS = {
  "logo": "M12 3C12 3 6 10.5 6 15a6 6 0 0 0 12 0c0-4.5-6-12-6-12Z",
  "building": "M5 21V5a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v16 M3 21h18 M8 7h2v2H8V7Z M14 7h2v2h-2V7Z M8 12h2v2H8v-2Z M14 12h2v2h-2v-2Z M10.5 21v-4a1.5 1.5 0 0 1 3 0v4",
  "window": "M5 19 16 8 M13.5 5.5 18.5 10.5 M6 17 8 19",
  "buildings": "M3 10 12 4 21 10 M4 10h16 M6 10v9 M10 10v9 M14 10v9 M18 10v9 M3 19h18 M2 21h20",
  "storefront": "M6.5 6.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z M6.5 13.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z M8 9l11 10 M8 15 19 5",
  "broom": "M6 4h12 M8 4v2h8V4 M9 6v13 M12 6v13 M15 6v13 M6 20h12",
  "home": "M4 11l8-7 8 7 M6 10v10h12V10",
  "shield-check": "M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3Z M9 12l2 2 4-4",
  "clock": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 7v5l3 3",
  "mail": "M4 6h16v12H4V6Z M4 7l8 6 8-6",
  "phone": "M6 3h3l2 5-2 1a12 12 0 0 0 6 6l1-2 5 2v3a2 2 0 0 1-2 2C10 20 4 14 4 5a2 2 0 0 1 2-2Z",
  "pin": "M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z M12 11.5a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z",
  "arrow-right": "M4 12h16 M14 6l6 6-6 6",
  "menu": "M4 7h16 M4 12h16 M4 17h16",
  "close": "M6 6l12 12 M18 6l-12 12",
  "chevron-down": "M6 9l6 6 6-6",
  "eye": "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  "edit": "M4 20h4l11-11-4-4L4 16v4Z M14 6l4 4",
  "trash": "M5 7h14 M9 7V5h6v2 M7 7l1 13h8l1-13",
  "search": "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M21 21l-4.3-4.3",
  "logout": "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  "user": "M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z M4 21c1.5-4.5 5-6.5 8-6.5s6.5 2 8 6.5",
  "grid": "M4 4h7v7H4V4Z M13 4h7v7h-7V4Z M4 13h7v7H4v-7Z M13 13h7v7h-7v-7Z",
  "document": "M6 3h9l4 4v14H6V3Z M15 3v4h4 M9 12h7 M9 16h7 M9 8h3",
  "chart": "M4 20V10 M11 20V4 M18 20v-7 M2 20h20",
  "plus": "M12 5v14 M5 12h14",
  "filter": "M4 5h16 M7 12h10 M10 19h4",
  "lock": "M6 11V8a6 6 0 1 1 12 0v3 M5 11h14v10H5V11Z",
  "drag": "M8 12h8 M8 12l3-3 M8 12l3 3 M16 12l-3-3 M16 12l-3 3",
  "check": "M5 12l4 4 10-10",
  "alert": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 8v5 M12 16h.01",
  "info": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 8h.01 M11 12h1v5h1",
  "settings": "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.6V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V10c.1.7.6 1.3 1.6 1h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1Z",
  "star": "M12 3l2.2 5.8 6.3.3-4.9 4 1.7 6.1L12 15.9 6.7 19.2l1.7-6.1-4.9-4 6.3-.3L12 3Z",
  "camera": "M4 8h3l2-3h6l2 3h3v11H4V8Z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  "calendar": "M5 5h14v15H5V5Z M5 10h14 M9 3v4 M15 3v4",
  "image": "M4 5h16v14H4V5Z M4 16l5-5 4 4 3-3 4 4 M15.5 9.5h.01",
  "upload": "M12 16V4 M7 9l5-5 5 5 M4 20h16",
  "users": "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M2 21c1-4 4-6 7-6s6 2 7 6 M16 3.5a4 4 0 0 1 0 7.5 M18 15c2 .7 3.4 2.6 4 6",
  "list": "M8 6h12 M8 12h12 M8 18h12 M4 6h.01 M4 12h.01 M4 18h.01",
  "external": "M14 4h6v6 M20 4l-9 9 M18 14v6H4V6h6",
  "arrow-left": "M20 12H4 M10 6l-6 6 6 6",
  "chevron-left": "M15 6l-6 6 6 6",
  "chevron-right": "M9 6l6 6-6 6",
  "arrow-up": "M12 20V4 M6 10l6-6 6 6",
  "arrow-down": "M12 4v16 M6 14l6 6 6-6",
  "download": "M12 4v12 M7 11l5 5 5-5 M4 20h16",
  "send": "M21 3 10 14 M21 3l-7 18-4-7-7-4 18-7Z",
} as const;

export type NomIcone = keyof typeof CHEMINS;

export default function Icone({ nom, taille = 18, className }: { nom: NomIcone; taille?: number; className?: string }) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      className={className ?? "icon"}
      aria-hidden="true"
      focusable="false"
    >
      <path d={CHEMINS[nom]} />
    </svg>
  );
}
