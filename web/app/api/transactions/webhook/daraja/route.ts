import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initAdmin } from '../../../../../lib/firebaseAdmin';

initAdmin();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = body?.Body?.stkCallback ?? body?.Result;

    if (!result) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const resultCode = result.ResultCode ?? result.resultCode ?? 1;
    const merchantRef = result.CheckoutRequestID ?? result.OriginatorConversationID;

    const db = getFirestore();

    // Find the pending transaction by metadata or direct lookup
    if (merchantRef) {
      const snap = await db.collection('transactions')
        .where('metadata.checkoutRequestId', '==', merchantRef)
        .limit(1)
        .get();

      if (!snap.empty) {
        const txDoc  = snap.docs[0];
        const txData = txDoc.data();

        if (resultCode === 0) {
          // Payment successful
          await txDoc.ref.update({
            status:      'completed',
            completedAt: new Date(),
            'metadata.darajaRef': merchantRef,
          });

          // Update project status to sold if single-purchase
          if (txData.projectId) {
            await db.collection('projects').doc(txData.projectId).update({
              status:    'sold',
              saleCount: (txData.saleCount ?? 0) + 1,
            });
          }

          // Notify Antonio
          await db.collection('notifications').doc('admin').collection('items').add({
            type:      'sale_complete',
            message:   `Sale completed: ${txData.projectTitle ?? 'Project'} — ${txData.amount} ${txData.currency}`,
            createdAt: new Date(),
            read:      false,
          });
        } else {
          await txDoc.ref.update({ status: 'failed' });
        }
      }
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    console.error('[daraja webhook]', err);
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' }); // Always ack Daraja
  }
}
