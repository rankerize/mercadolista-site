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
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

export interface ListItemData {
  nombre: string;
  marca: string;
  formato: 'gramos' | 'mililitros' | 'unidades';
  cantidad: number;
}

export interface SavedList {
  id: string;
  nombre: string;
  ciudad: string;
  items: ListItemData[];
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  collaboratorIds?: string[];
  sharedWithEmails?: string[];
  isOwner?: boolean;
  createdAt?: any;
  updatedAt?: any;
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

const LISTS_COLLECTION = 'shared_lists';

export async function getListById(listId: string): Promise<SavedList | null> {
  try {
    const docRef = doc(db, LISTS_COLLECTION, listId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: snap.id,
      nombre: data.nombre || 'Sin título',
      ciudad: data.ciudad || 'bogota',
      items: data.items || [],
      ownerId: data.ownerId || '',
      ownerName: data.ownerName || 'Usuario',
      ownerEmail: data.ownerEmail || '',
      collaboratorIds: data.collaboratorIds || [],
      sharedWithEmails: data.sharedWithEmails || [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  } catch (err) {
    console.error('Error fetching list by ID:', err);
    return null;
  }
}

export async function getUserLists(userId: string, userEmail?: string | null): Promise<SavedList[]> {
  const listsMap = new Map<string, SavedList>();
  const listsRef = collection(db, LISTS_COLLECTION);

  // 1. Listas donde soy el dueño
  try {
    const qOwner = query(listsRef, where('ownerId', '==', userId));
    const snapOwner = await getDocs(qOwner);
    snapOwner.forEach((d) => {
      const data = d.data();
      listsMap.set(d.id, {
        id: d.id,
        nombre: data.nombre || 'Sin título',
        ciudad: data.ciudad || 'bogota',
        items: data.items || [],
        ownerId: data.ownerId,
        ownerName: data.ownerName || 'Tú',
        ownerEmail: data.ownerEmail,
        collaboratorIds: data.collaboratorIds || [],
        sharedWithEmails: data.sharedWithEmails || [],
        isOwner: true,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });
  } catch (err) {
    console.error('Error fetching owned lists:', err);
  }

  // 2. Listas donde soy colaborador por ID
  try {
    const qCollab = query(listsRef, where('collaboratorIds', 'array-contains', userId));
    const snapCollab = await getDocs(qCollab);
    snapCollab.forEach((d) => {
      if (!listsMap.has(d.id)) {
        const data = d.data();
        listsMap.set(d.id, {
          id: d.id,
          nombre: data.nombre || 'Sin título',
          ciudad: data.ciudad || 'bogota',
          items: data.items || [],
          ownerId: data.ownerId,
          ownerName: data.ownerName || 'Pareja / Familiar',
          ownerEmail: data.ownerEmail,
          collaboratorIds: data.collaboratorIds || [],
          sharedWithEmails: data.sharedWithEmails || [],
          isOwner: false,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      }
    });
  } catch (err) {
    console.error('Error fetching collaborated lists:', err);
  }

  // 3. Listas compartidas con mi correo electrónico
  if (userEmail) {
    try {
      const cleanEmail = userEmail.toLowerCase().trim();
      const qEmail = query(listsRef, where('sharedWithEmails', 'array-contains', cleanEmail));
      const snapEmail = await getDocs(qEmail);
      snapEmail.forEach((d) => {
        if (!listsMap.has(d.id)) {
          const data = d.data();
          listsMap.set(d.id, {
            id: d.id,
            nombre: data.nombre || 'Sin título',
            ciudad: data.ciudad || 'bogota',
            items: data.items || [],
            ownerId: data.ownerId,
            ownerName: data.ownerName || 'Pareja / Familiar',
            ownerEmail: data.ownerEmail,
            collaboratorIds: data.collaboratorIds || [],
            sharedWithEmails: data.sharedWithEmails || [],
            isOwner: false,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        }
      });
    } catch (err) {
      console.error('Error fetching shared email lists:', err);
    }
  }

  const result = Array.from(listsMap.values());
  // Ordenar por fecha de actualización o creación
  result.sort((a, b) => {
    const timeA = a.updatedAt?.toMillis?.() || a.createdAt?.toMillis?.() || 0;
    const timeB = b.updatedAt?.toMillis?.() || b.createdAt?.toMillis?.() || 0;
    return timeB - timeA;
  });

  return result;
}

export async function saveUserList(
  userId: string,
  listData: {
    nombre: string;
    ciudad: string;
    items: ListItemData[];
  },
  listId?: string,
  userProfile?: { displayName?: string | null; email?: string | null }
): Promise<SavedList> {
  const listsRef = collection(db, LISTS_COLLECTION);

  if (listId) {
    const docRef = doc(db, LISTS_COLLECTION, listId);
    await updateDoc(docRef, {
      ...listData,
      collaboratorIds: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    });
    return {
      id: listId,
      ...listData,
      ownerId: userId,
      isOwner: true,
    };
  } else {
    const payload = {
      ...listData,
      ownerId: userId,
      ownerName: userProfile?.displayName || userProfile?.email || 'Usuario',
      ownerEmail: userProfile?.email || '',
      collaboratorIds: [userId],
      sharedWithEmails: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(listsRef, payload);
    return {
      id: docRef.id,
      ...payload,
      isOwner: true,
    };
  }
}

export async function joinSharedList(listId: string, user: User): Promise<boolean> {
  try {
    const docRef = doc(db, LISTS_COLLECTION, listId);
    const updates: Record<string, any> = {
      collaboratorIds: arrayUnion(user.uid),
    };
    if (user.email) {
      updates.sharedWithEmails = arrayUnion(user.email.toLowerCase().trim());
    }
    await updateDoc(docRef, updates);
    return true;
  } catch (err) {
    console.error('Error joining shared list:', err);
    return false;
  }
}

export async function shareListWithEmail(listId: string, targetEmail: string): Promise<void> {
  const cleanEmail = targetEmail.toLowerCase().trim();
  const docRef = doc(db, LISTS_COLLECTION, listId);
  await updateDoc(docRef, {
    sharedWithEmails: arrayUnion(cleanEmail),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteUserList(userId: string, listId: string, isOwner = true): Promise<void> {
  const docRef = doc(db, LISTS_COLLECTION, listId);
  if (isOwner) {
    await deleteDoc(docRef);
  } else {
    // Si no es el dueño, solo se desvincula de los colaboradores
    await updateDoc(docRef, {
      collaboratorIds: arrayRemove(userId),
    });
  }
}
