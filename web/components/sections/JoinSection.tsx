import Link from 'next/link';
import { GlassCard } from '../common/GlassCard';

export function JoinSection() {
  return (
    <section className="py-24 border-t border-[rgba(255,255,255,0.06)]">
      <div className="container-luxa">
        <GlassCard variant="ocean" size="lg" className="text-center max-w-2xl mx-auto">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
            Join the LUXA Community
          </h2>
          <p className="text-luxa-text-muted mb-8 max-w-md mx-auto">
            Submit your vehicle projects, build your audience, and earn from your engineering passion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary px-8 py-3">Create Account</Link>
            <Link href="/browse" className="btn-secondary px-8 py-3">Browse First</Link>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
