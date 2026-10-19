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
  onSnapshot,
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

export interface ListItemData {
  nombre: string;
  marca: string;
  formato: 'gramos' | 'mililitros' | 'unidades';
  cantidad: number;
  comprado?: boolean;
  addedBy?: string;
  addedById?: string;
}

export interface CollaboratorInfo {
  uid: string;
  name: string;
  email?: string;
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
  collaborators?: CollaboratorInfo[];
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
      collaborators: data.collaborators || [],
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
        collaborators: data.collaborators || [],
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
          collaborators: data.collaborators || [],
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
            collaborators: data.collaborators || [],
            sharedWithEmails: data.sharedWithEmails || [],
            isOwner: false,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        }
      });
    } catch (err) {
      console.warn('Error fetching shared lists by email:', err);
    }
  }

  // 4. Fallback: Listas de la subcolección anterior users/{userId}/lists
  try {
    const legacyRef = collection(db, 'users', userId, 'lists');
    const snapLegacy = await getDocs(legacyRef);
    snapLegacy.forEach((d) => {
      if (!listsMap.has(d.id)) {
        const data = d.data();
        listsMap.set(d.id, {
          id: d.id,
          nombre: data.nombre || 'Sin título',
          ciudad: data.ciudad || 'bogota',
          items: data.items || [],
          ownerId: userId,
          ownerName: 'Tú',
          ownerEmail: userEmail || '',
          collaboratorIds: [userId],
          collaborators: [{ uid: userId, name: 'Tú', email: userEmail || '' }],
          sharedWithEmails: [],
          isOwner: true,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      }
    });
  } catch (err) {
    console.warn('Fallback users/lists check:', err);
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
  const myName = userProfile?.displayName || userProfile?.email?.split('@')[0] || 'Tú';
  const myEmail = userProfile?.email || '';
  const userCollab: CollaboratorInfo = {
    uid: userId,
    name: myName,
    email: myEmail,
  };

  const sanitizedItems: ListItemData[] = listData.items.map((item) => {
    const clean: ListItemData = {
      nombre: item.nombre || '',
      marca: item.marca || 'TODAS',
      formato: item.formato || 'unidades',
      cantidad: Number(item.cantidad) || 1,
      comprado: Boolean(item.comprado),
    };
    if (item.addedBy) clean.addedBy = item.addedBy;
    if (item.addedById) clean.addedById = item.addedById;
    return clean;
  });

  const cleanListData = {
    ...listData,
    items: sanitizedItems,
  };

  if (listId) {
    const docRef = doc(db, LISTS_COLLECTION, listId);
    const updatePayload: Record<string, any> = {
      ...cleanListData,
      collaboratorIds: arrayUnion(userId),
      collaborators: arrayUnion(userCollab),
      updatedAt: serverTimestamp(),
    };
    await updateDoc(docRef, updatePayload);
    return {
      id: listId,
      ...cleanListData,
      ownerId: userId,
      collaborators: [userCollab],
      isOwner: true,
    };
  } else {
    const payload = {
      ...cleanListData,
      ownerId: userId,
      ownerName: myName,
      ownerEmail: myEmail,
      collaboratorIds: [userId],
      collaborators: [userCollab],
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
    const collabInfo: CollaboratorInfo = {
      uid: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'Pareja / Familiar',
      email: user.email || '',
    };
    const updates: Record<string, any> = {
      collaboratorIds: arrayUnion(user.uid),
      collaborators: arrayUnion(collabInfo),
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

export function subscribeList(listId: string, callback: (list: SavedList | null) => void) {
  const docRef = doc(db, LISTS_COLLECTION, listId);
  return onSnapshot(
    docRef,
    (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }
      const data = snap.data();
      callback({
        id: snap.id,
        nombre: data.nombre || 'Sin título',
        ciudad: data.ciudad || 'bogota',
        items: data.items || [],
        ownerId: data.ownerId || '',
        ownerName: data.ownerName || 'Usuario',
        ownerEmail: data.ownerEmail || '',
        collaboratorIds: data.collaboratorIds || [],
        collaborators: data.collaborators || [],
        sharedWithEmails: data.sharedWithEmails || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    },
    (err) => {
      console.warn('Error en suscripción en tiempo real de la lista:', err);
    }
  );
}

export async function toggleItemBought(listId: string, itemIndex: number, comprado: boolean): Promise<void> {
  const docRef = doc(db, LISTS_COLLECTION, listId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;
  const data = snap.data();
  const items = [...(data.items || [])];
  if (items[itemIndex]) {
    items[itemIndex] = { ...items[itemIndex], comprado };
    await updateDoc(docRef, {
      items,
      updatedAt: serverTimestamp(),
    });
  }
}

export function subscribeUserLists(
  userId: string,
  userEmail: string | null | undefined,
  callback: (lists: SavedList[]) => void
): () => void {
  const listsRef = collection(db, LISTS_COLLECTION);
  const listsMap = new Map<string, SavedList>();

  function notify() {
    const result = Array.from(listsMap.values());
    result.sort((a, b) => {
      const timeA = a.updatedAt?.toMillis?.() || a.createdAt?.toMillis?.() || 0;
      const timeB = b.updatedAt?.toMillis?.() || b.createdAt?.toMillis?.() || 0;
      return timeB - timeA;
    });
    callback(result);
  }

  const qOwner = query(listsRef, where('ownerId', '==', userId));
  const unsubOwner = onSnapshot(
    qOwner,
    (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === 'removed') {
          listsMap.delete(change.doc.id);
        } else {
          const data = change.doc.data();
          listsMap.set(change.doc.id, {
            id: change.doc.id,
            nombre: data.nombre || 'Sin título',
            ciudad: data.ciudad || 'bogota',
            items: data.items || [],
            ownerId: data.ownerId,
            ownerName: data.ownerName || 'Tú',
            ownerEmail: data.ownerEmail,
            collaboratorIds: data.collaboratorIds || [],
            collaborators: data.collaborators || [],
            sharedWithEmails: data.sharedWithEmails || [],
            isOwner: true,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        }
      });
      notify();
    },
    (err) => console.warn('Error en subscribeUserLists (owner):', err)
  );

  const qCollab = query(listsRef, where('collaboratorIds', 'array-contains', userId));
  const unsubCollab = onSnapshot(
    qCollab,
    (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === 'removed') {
          const existing = listsMap.get(change.doc.id);
          if (existing && !existing.isOwner) {
            listsMap.delete(change.doc.id);
          }
        } else {
          const data = change.doc.data();
          if (data.ownerId !== userId) {
            listsMap.set(change.doc.id, {
              id: change.doc.id,
              nombre: data.nombre || 'Sin título',
              ciudad: data.ciudad || 'bogota',
              items: data.items || [],
              ownerId: data.ownerId,
              ownerName: data.ownerName || 'Pareja / Familiar',
              ownerEmail: data.ownerEmail,
              collaboratorIds: data.collaboratorIds || [],
              collaborators: data.collaborators || [],
              sharedWithEmails: data.sharedWithEmails || [],
              isOwner: false,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            });
          }
        }
      });
      notify();
    },
    (err) => console.warn('Error en subscribeUserLists (collab):', err)
  );

  return () => {
    unsubOwner();
    unsubCollab();
  };
}


