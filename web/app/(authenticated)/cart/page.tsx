'use client';

import Image from 'next/image';
import Link from 'next/link';
import { GlassCard } from '../../../components/common/GlassCard';
import { useCart } from '../../../lib/hooks/useCart';
import { formatCurrency } from '../../../lib/utils/formatCurrency';

export default function CartPage() {
  const { items, removeItem, totalAmount, itemCount } = useCart();

  if (itemCount() === 0) {
    return (
      <div className="min-h-dvh pt-[var(--nav-height)] flex items-center justify-center">
        <GlassCard size="lg" className="text-center max-w-sm">
          <p className="text-5xl mb-4">🛒</p>
          <h1 className="font-display font-bold text-xl mb-2">Your cart is empty</h1>
          <p className="text-luxa-text-muted text-sm mb-6">Find projects you love and add them here.</p>
          <Link href="/browse" className="btn-primary">Browse Projects</Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-dvh pt-[var(--nav-height)] pb-24">
      <div className="container-luxa pt-10">
        <h1 className="font-display font-bold text-3xl mb-8">Cart ({itemCount()})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Items */}
          <div className="space-y-3">
            {items.map(item => (
              <GlassCard key={item.projectId} size="none" className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-14 rounded-glass-sm overflow-hidden shrink-0">
                    <Image src={item.thumbnail || '/images/placeholder.png'} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                    <p className="text-luxa-text-dim text-xs">{item.creatorName}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <p className="font-display font-bold">{formatCurrency(item.price, item.currency)}</p>
                    <button onClick={() => removeItem(item.projectId)} className="btn-icon w-8 h-8 hover:text-red-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Summary */}
          <GlassCard variant="ocean" size="md" className="h-fit">
            <h2 className="font-display font-semibold mb-5">Order Summary</h2>
            <div className="space-y-2 mb-5">
              {items.map(item => (
                <div key={item.projectId} className="flex justify-between text-sm">
                  <span className="text-luxa-text-muted truncate mr-4">{item.title}</span>
                  <span>{formatCurrency(item.price, item.currency)}</span>
                </div>
              ))}
            </div>
            <div className="divider mb-4" />
            <div className="flex justify-between mb-6">
              <span className="font-display font-semibold">Total</span>
              <span className="font-display font-bold text-xl">{formatCurrency(totalAmount())}</span>
            </div>
            <Link href="/cart/checkout" className="btn-primary w-full justify-center py-3">
              Proceed to Checkout
            </Link>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
