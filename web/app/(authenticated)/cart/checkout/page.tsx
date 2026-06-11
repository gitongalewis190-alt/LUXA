'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GlassCard } from '../../../../components/common/GlassCard';
import { useCart } from '../../../../lib/hooks/useCart';
import { useAuth } from '../../../../lib/hooks/useAuth';
import { formatCurrency } from '../../../../lib/utils/formatCurrency';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, totalAmount, clearCart } = useCart();
  const [phone,      setPhone]      = useState('');
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState('');

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/cart/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ paymentMethod: 'daraja', phoneNumber: phone, amount: totalAmount() }),
      });
      if (!res.ok) throw new Error((await res.json()).message ?? 'Checkout failed');
      const data = await res.json();
      clearCart();
      router.push(`/dashboard?order=${data.transactionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh pt-[var(--nav-height)] pb-24">
      <div className="container-luxa pt-10 max-w-lg">
        <h1 className="font-display font-bold text-3xl mb-8">Checkout</h1>

        {error && <div className="glass-fire rounded-glass-sm p-3 mb-5 text-sm text-red-300">{error}</div>}

        <GlassCard variant="ocean" size="md" className="mb-6">
          <h2 className="font-display font-semibold mb-4">Order ({items.length} items)</h2>
          <div className="space-y-2 mb-4">
            {items.map(item => (
              <div key={item.projectId} className="flex justify-between text-sm">
                <span className="text-luxa-text-muted truncate mr-4">{item.title}</span>
                <span>{formatCurrency(item.price, item.currency)}</span>
              </div>
            ))}
          </div>
          <div className="divider mb-3" />
          <div className="flex justify-between font-display font-bold text-xl">
            <span>Total</span>
            <span>{formatCurrency(totalAmount())}</span>
          </div>
        </GlassCard>

        <GlassCard size="md">
          <h2 className="font-display font-semibold mb-5">Payment — M-Pesa (Daraja)</h2>
          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-sm text-luxa-text-muted mb-1.5">M-Pesa Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                placeholder="+254712345678"
                className="input"
                pattern="^\+?[0-9]{10,13}$"
              />
              <p className="text-luxa-text-dim text-xs mt-1">You will receive an STK push to approve payment.</p>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3">
              {isLoading ? 'Processing…' : `Pay ${formatCurrency(totalAmount())}`}
            </button>
          </form>
        </GlassCard>

        <div className="text-center mt-4">
          <Link href="/cart" className="text-luxa-text-muted text-sm hover:text-luxa-text">← Back to Cart</Link>
        </div>
      </div>
    </div>
  );
}
