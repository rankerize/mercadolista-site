import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

export interface SavedList {
  id: string;
  nombre: string;
  ciudad: string;
  items: Array<{
    nombre: string;
    marca: string;
    formato: 'gramos' | 'mililitros' | 'unidades';
    cantidad: number;
  }>;
  createdAt?: any;
}

export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function registerWithEmail(nombre: string, email: string, pass: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (result.user) {
    await updateProfile(result.user, { displayName: nombre });
  }
  return result.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserLists(userId: string): Promise<SavedList[]> {
  const listsRef = collection(db, 'users', userId, 'lists');
  const q = query(listsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  const lists: SavedList[] = [];
  snapshot.forEach((d) => {
    const data = d.data();
    lists.push({
      id: d.id,
      nombre: data.nombre || 'Sin título',
      ciudad: data.ciudad || 'bogota',
      items: data.items || [],
      createdAt: data.createdAt,
    });
  });
  return lists;
}

export async function saveUserList(
  userId: string,
  listData: Omit<SavedList, 'id' | 'createdAt'>,
  listId?: string
): Promise<SavedList> {
  const listsRef = collection(db, 'users', userId, 'lists');
  if (listId) {
    const docRef = doc(db, 'users', userId, 'lists', listId);
    await updateDoc(docRef, {
      ...listData,
      updatedAt: serverTimestamp(),
    });
    return { id: listId, ...listData };
  } else {
    const docRef = await addDoc(listsRef, {
      ...listData,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...listData };
  }
}

export async function deleteUserList(userId: string, listId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'lists', listId);
  await deleteDoc(docRef);
}
