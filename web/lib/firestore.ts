import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  increment,
  Timestamp,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Collection Names ─────────────────────────────────────────────────────────
export const COLLECTIONS = {
  USERS:          'users',
  PROJECTS:       'projects',
  TRANSACTIONS:   'transactions',
  CATEGORIES:     'categories',
  COMPANY_SHARES: 'companyShares',
  PLATFORM_CONFIG:'platformConfig',
  APPROVAL_QUEUE: 'approvalQueue',
  NOTIFICATIONS:  'notifications',
} as const;

export const SUBCOLLECTIONS = {
  COMMENTS: 'comments',
  LIKES:    'likes',
  CART:     'cart',
} as const;

export const CONFIG_DOC_ID = 'main';

// ─── TypeScript Interfaces ────────────────────────────────────────────────────

export interface LuxaUser {
  uid:             string;
  email:           string;
  displayName:     string;
  luzaId:          string;
  role:            'member' | 'admin';
  profileImage?:   string;
  bio?:            string;
  walletAddress?:  string;
  walletProvider?: 'daraja' | 'africa-talking' | 'bank';
  joinedGenres?:   string[];
  isActive:        boolean;
  createdAt:       Timestamp;
  updatedAt:       Timestamp;
}

export interface Project {
  projectId?:       string;
  title:            string;
  description:      string;
  creatorUid:       string;
  creatorName:      string;
  price:            number;
  currency:         string;
  status:           'available' | 'featured' | 'sold' | 'unlisted';
  category:         string;
  tags:             string[];
  contentType:      'video' | 'image' | 'diagram' | 'text';
  mediaUrls:        string[];
  thumbnail:        string;
  viewCount:        number;
  likeCount:        number;
  commentCount:     number;
  saleCount:        number;
  isApproved:       boolean;
  isAntonioProject: boolean;
  approvedAt?:      Timestamp;
  metadata?:        Record<string, string | number | boolean>;
  createdAt:        Timestamp;
  updatedAt:        Timestamp;
}

export interface Transaction {
  transactionId?:   string;
  projectId:        string;
  projectTitle:     string;
  buyerId:          string;
  buyerName:        string;
  sellerId:         string;
  sellerName:       string;
  amount:           number;
  facilitation_fee: number;
  payout_amount:    number;
  currency:         string;
  status:           'pending' | 'completed' | 'failed';
  paymentMethod:    string;
  transactionDate:  Timestamp;
  completedAt?:     Timestamp;
  metadata?:        Record<string, string>;
}

export interface Category {
  categoryId?: string;
  name:        string;
  icon?:       string;
  color?:      string;
  order:       number;
  isActive:    boolean;
}

export interface PlatformConfig {
  colors: {
    primary:       string;
    secondary:     string;
    accent:        string;
    glass_overlay: string;
    background:    string;
  };
  facilitation_fee: number;
  featured_projects: string[];
  visible_sections: {
    browse_feed:       boolean;
    company_shares:    boolean;
    featured_carousel: boolean;
  };
  analytics: {
    totalMembers:    number;
    totalProjects:   number;
    totalRevenue:    number;
    activeThisMonth: number;
  };
  lastUpdatedAt: Timestamp;
}

export interface Comment {
  commentId?: string;
  projectId:  string;
  userId:     string;
  userName:   string;
  userImage?: string;
  text:       string;
  createdAt:  Timestamp;
  updatedAt:  Timestamp;
  isDeleted:  boolean;
}

export interface ApprovalQueueItem {
  queueId?:         string;
  projectId:        string;
  submitterId:      string;
  submitterName:    string;
  submissionDate:   Timestamp;
  status:           'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

// ─── Collection References ────────────────────────────────────────────────────
export const usersRef         = () => collection(db, COLLECTIONS.USERS);
export const projectsRef      = () => collection(db, COLLECTIONS.PROJECTS);
export const transactionsRef  = () => collection(db, COLLECTIONS.TRANSACTIONS);
export const categoriesRef    = () => collection(db, COLLECTIONS.CATEGORIES);
export const configRef        = () => doc(db, COLLECTIONS.PLATFORM_CONFIG, CONFIG_DOC_ID);
export const approvalQueueRef = () => collection(db, COLLECTIONS.APPROVAL_QUEUE);

export const commentsRef = (projectId: string) =>
  collection(db, COLLECTIONS.PROJECTS, projectId, SUBCOLLECTIONS.COMMENTS);

export const likesRef = (projectId: string) =>
  collection(db, COLLECTIONS.PROJECTS, projectId, SUBCOLLECTIONS.LIKES);

export const cartRef = (userId: string) =>
  collection(db, COLLECTIONS.USERS, userId, SUBCOLLECTIONS.CART);

// ─── Generic Helpers ──────────────────────────────────────────────────────────

export function docToObject<T extends object>(
  snap: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>
): T & { id: string } {
  return { id: snap.id, ...snap.data() } as T & { id: string };
}

export async function fetchDoc<T extends object>(
  collectionName: string,
  docId: string
): Promise<(T & { id: string }) | null> {
  const snap = await getDoc(doc(db, collectionName, docId));
  if (!snap.exists()) return null;
  return docToObject<T>(snap);
}

export async function fetchPlatformConfig(): Promise<PlatformConfig | null> {
  const snap = await getDoc(configRef());
  if (!snap.exists()) return null;
  return snap.data() as PlatformConfig;
}

export async function incrementField(
  collectionName: string,
  docId: string,
  field: string,
  amount = 1
) {
  await updateDoc(doc(db, collectionName, docId), {
    [field]: increment(amount),
  });
}

// ─── Paginated Project Query ──────────────────────────────────────────────────
export interface ProjectQueryOptions {
  categoryId?:    string;
  status?:        'available' | 'featured' | 'sold' | 'unlisted';
  pageSize?:      number;
  lastVisible?:   QueryDocumentSnapshot<DocumentData> | null;
  isAntonioOnly?: boolean;
}

export async function fetchPublicProjects(opts: ProjectQueryOptions = {}): Promise<{
  projects: (Project & { id: string })[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}> {
  const { categoryId, status, pageSize = 20, lastVisible, isAntonioOnly } = opts;

  const constraints: Parameters<typeof query>[1][] = [
    where('isApproved', '==', true),
    where('status', '!=', 'unlisted'),
    orderBy('status'),
    orderBy('createdAt', 'desc'),
    limit(pageSize + 1),
  ];

  if (categoryId)    constraints.push(where('category', '==', categoryId));
  if (status)        constraints.push(where('status', '==', status));
  if (isAntonioOnly) constraints.push(where('isAntonioProject', '==', true));
  if (lastVisible)   constraints.push(startAfter(lastVisible));

  const q = query(projectsRef(), ...constraints);
  const snap = await getDocs(q);
  const docs = snap.docs;

  const hasMore = docs.length > pageSize;
  const projectDocs = hasMore ? docs.slice(0, -1) : docs;

  return {
    projects: projectDocs.map(d => ({ ...d.data() as Project, id: d.id, projectId: d.id })),
    lastVisible: projectDocs.length > 0 ? projectDocs[projectDocs.length - 1] : null,
    hasMore,
  };
}

// ─── Real-time listeners ──────────────────────────────────────────────────────

export function subscribeApprovalQueue(
  callback: (items: (ApprovalQueueItem & { id: string })[]) => void
) {
  const q = query(
    approvalQueueRef(),
    where('status', '==', 'pending'),
    orderBy('submissionDate', 'asc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => docToObject<ApprovalQueueItem>(d)));
  });
}

export function subscribeComments(
  projectId: string,
  callback: (comments: (Comment & { id: string })[]) => void
) {
  const q = query(commentsRef(projectId), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => docToObject<Comment>(d)).filter(c => !c.isDeleted));
  });
}

// ─── Re-exports ───────────────────────────────────────────────────────────────
export {
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  increment,
  Timestamp,
};
