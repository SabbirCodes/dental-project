export function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted flex flex-col md:flex-row items-center justify-between gap-2">
        <p>© {new Date().getFullYear()} BrightSmile. All rights reserved.</p>
        <p>Find. Book. Smile.</p>
      </div>
    </footer>
  );
}
