'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection, query, where, orderBy, limit, startAfter,
  getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
  type QueryDocumentSnapshot, type DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase';
import { COLLECTIONS, type Project } from '../firestore';
import { useAuth } from './useAuth';

interface UseProjectsOptions {
  categoryId?:    string;
  status?:        Project['status'];
  creatorUid?:    string;
  pageSize?:      number;
  isAntonioOnly?: boolean;
}

export function useProjects(opts: UseProjectsOptions = {}) {
  const { pageSize = 20, categoryId, status, creatorUid, isAntonioOnly } = opts;

  const [projects,     setProjects]     = useState<(Project & { id: string })[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [hasMore,      setHasMore]      = useState(false);
  const [lastVisible,  setLastVisible]  = useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  const fetchProjects = useCallback(async (reset = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const constraints: Parameters<typeof query>[1][] = [
        where('isApproved', '==', true),
        where('status', '!=', 'unlisted'),
        orderBy('status'),
        orderBy('createdAt', 'desc'),
        limit(pageSize + 1),
      ];

      if (categoryId)    constraints.push(where('category',         '==', categoryId));
      if (status)        constraints.push(where('status',           '==', status));
      if (creatorUid)    constraints.push(where('creatorUid',       '==', creatorUid));
      if (isAntonioOnly) constraints.push(where('isAntonioProject', '==', true));
      if (!reset && lastVisible) constraints.push(startAfter(lastVisible));

      const snap = await getDocs(query(collection(db, COLLECTIONS.PROJECTS), ...constraints));
      const docs  = snap.docs;
      const more  = docs.length > pageSize;
      const slice = more ? docs.slice(0, -1) : docs;

      const items = slice.map(d => ({ ...d.data() as Project, id: d.id, projectId: d.id }));

      setProjects(prev => reset ? items : [...prev, ...items]);
      setLastVisible(slice.length ? slice[slice.length - 1] : null);
      setHasMore(more);
    } catch (err) {
      setError('Failed to load projects.');
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, status, creatorUid, isAntonioOnly, pageSize, lastVisible]);

  useEffect(() => {
    fetchProjects(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, status, creatorUid, isAntonioOnly]);

  const loadMore = useCallback(() => fetchProjects(false), [fetchProjects]);

  return { projects, isLoading, error, hasMore, loadMore, refetch: () => fetchProjects(true) };
}

export function useMyProjects() {
  const { user } = useAuth();
  const [projects,  setProjects]  = useState<(Project & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }
    (async () => {
      const q = query(
        collection(db, COLLECTIONS.PROJECTS),
        where('creatorUid', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setProjects(snap.docs.map(d => ({ ...d.data() as Project, id: d.id, projectId: d.id })));
      setIsLoading(false);
    })();
  }, [user]);

  const deleteProject = useCallback(async (projectId: string) => {
    await deleteDoc(doc(db, COLLECTIONS.PROJECTS, projectId));
    setProjects(prev => prev.filter(p => p.id !== projectId));
  }, []);

  const updateProject = useCallback(async (projectId: string, data: Partial<Project>) => {
    await updateDoc(doc(db, COLLECTIONS.PROJECTS, projectId), { ...data, updatedAt: serverTimestamp() });
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...data } : p));
  }, []);

  return { projects, isLoading, deleteProject, updateProject };
}

export function useCreateProject() {
  const { user, userData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const createProject = useCallback(async (data: Omit<Project, 'creatorUid' | 'creatorName' | 'viewCount' | 'likeCount' | 'commentCount' | 'saleCount' | 'isApproved' | 'isAntonioProject' | 'createdAt' | 'updatedAt'>) => {
    if (!user || !userData) throw new Error('Not authenticated');
    setIsSubmitting(true);
    setError(null);
    try {
      const now = serverTimestamp();
      const ref = await addDoc(collection(db, COLLECTIONS.PROJECTS), {
        ...data,
        creatorUid:       user.uid,
        creatorName:      userData.displayName,
        viewCount:        0,
        likeCount:        0,
        commentCount:     0,
        saleCount:        0,
        isApproved:       userData.role === 'admin',
        isAntonioProject: userData.role === 'admin',
        createdAt:        now,
        updatedAt:        now,
      });

      if (userData.role !== 'admin') {
        await addDoc(collection(db, COLLECTIONS.APPROVAL_QUEUE), {
          projectId:      ref.id,
          submitterId:    user.uid,
          submitterName:  userData.displayName,
          submissionDate: now,
          status:         'pending',
        });
      }

      return ref.id;
    } catch (err) {
      const msg = 'Failed to create project.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [user, userData]);

  return { createProject, isSubmitting, error };
}
