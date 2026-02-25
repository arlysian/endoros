"use client";

export default function ExampleWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      onClick={(e) => {
        const target = e.target as HTMLElement;
        const anchor = target.closest("a");
        if (anchor && anchor.href && !anchor.href.endsWith("/example")) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </div>
  );
}
