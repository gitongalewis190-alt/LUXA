export function LandingFooter() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.06)] py-12">
      <div className="container-luxa">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <p className="font-display font-bold text-lg tracking-[-0.04em] text-luxa-text mb-1">LUXA</p>
            <p className="text-luxa-text-dim text-sm">Advanced Vehicle Innovation Platform</p>
          </div>
          <div className="flex gap-8 text-sm text-luxa-text-muted">
            <a href="/browse" className="hover:text-luxa-text transition-colors">Browse</a>
            <a href="/signup" className="hover:text-luxa-text transition-colors">Join</a>
          </div>
          <p className="text-luxa-text-dim text-xs">
            © {new Date().getFullYear()} LUXA · Art Is Life Foundation
          </p>
        </div>
      </div>
    </footer>
  );
}
