import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initAdmin } from '../../../../lib/firebaseAdmin';

initAdmin();

export async function POST(req: NextRequest) {
  try {
    // Verify auth token
    const authHeader = req.headers.get('Authorization') ?? '';
    const token      = authHeader.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'unauthorized', message: 'Not authenticated' }, { status: 401 });

    const decoded = await getAuth().verifyIdToken(token);
    const uid     = decoded.uid;

    const body = await req.json() as { paymentMethod: string; phoneNumber: string; amount: number };
    const { paymentMethod, phoneNumber, amount } = body;

    if (!phoneNumber || !amount) {
      return NextResponse.json({ error: 'validation_error', message: 'Phone and amount required' }, { status: 400 });
    }

    const db = getFirestore();

    // Get platformConfig for facilitation fee
    const configSnap = await db.collection('platformConfig').doc('main').get();
    const fee        = configSnap.exists ? (configSnap.data()?.facilitation_fee ?? 15) : 15;

    // Create pending transaction
    const txRef = await db.collection('transactions').add({
      buyerId:         uid,
      buyerName:       decoded.name ?? 'Member',
      amount,
      facilitation_fee: (amount * fee) / 100,
      payout_amount:   amount - (amount * fee) / 100,
      currency:        'KES',
      status:          'pending',
      paymentMethod,
      transactionDate: new Date(),
      metadata: { phoneNumber },
    });

    return NextResponse.json({
      transactionId: txRef.id,
      status:        'pending',
      amount,
      message:       'Payment initiated. Approve the M-Pesa prompt on your phone.',
    });
  } catch (err) {
    console.error('[checkout]', err);
    return NextResponse.json({ error: 'server_error', message: 'Checkout failed' }, { status: 500 });
  }
}
