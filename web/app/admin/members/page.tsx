'use client';

import { useEffect, useState } from 'react';
import { getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { GlassCard } from '../../../components/common/GlassCard';
import { usersRef, type LuxaUser } from '../../../lib/firestore';
import { formatDate } from '../../../lib/utils/formatDate';

export default function MembersPage() {
  const [members,   setMembers]   = useState<(LuxaUser & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search,    setSearch]    = useState('');

  useEffect(() => {
    getDocs(usersRef()).then(snap => {
      setMembers(snap.docs.map(d => ({ ...d.data() as LuxaUser, id: d.id })));
      setIsLoading(false);
    });
  }, []);

  const toggleActive = async (userId: string, current: boolean) => {
    await updateDoc(doc(db, 'users', userId), { isActive: !current });
    setMembers(prev => prev.map(m => m.uid === userId ? { ...m, isActive: !current } : m));
  };

  const filtered = search
    ? members.filter(m =>
        m.displayName.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase())
      )
    : members;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-3xl">Members <span className="text-luxa-text-dim text-xl">({members.length})</span></h1>
        <input
          type="text"
          placeholder="Search members…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input w-64 py-2 text-sm"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-luxa-text-muted">Loading members…</div>
      ) : (
        <GlassCard variant="admin" size="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  {['Member', 'LUXA ID', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs text-luxa-text-dim uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(member => (
                  <tr key={member.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium">{member.displayName}</p>
                      <p className="text-luxa-text-dim text-xs">{member.email}</p>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-luxa-text-dim">{member.luzaId}</td>
                    <td className="px-5 py-3">
                      <span className={member.role === 'admin' ? 'badge-antonio' : 'badge-available text-[10px]'}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-luxa-text-muted">{formatDate(member.createdAt)}</td>
                    <td className="px-5 py-3">
                      <span className={member.isActive ? 'badge-available' : 'badge-sold'}>
                        {member.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {member.role !== 'admin' && (
                        <button
                          onClick={() => toggleActive(member.id, member.isActive)}
                          className={`text-xs px-3 py-1 rounded-glass-sm border transition-colors ${
                            member.isActive
                              ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                              : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                          }`}
                        >
                          {member.isActive ? 'Suspend' : 'Reinstate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
