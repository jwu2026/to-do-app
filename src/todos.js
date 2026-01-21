import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebaseConfig'

const defaultTaskPool = [
  'Pack 2 liters of water',
  'Check trail weather and alerts',
  'Charge headlamp batteries',
  'Pack a lightweight rain jacket',
  'Download offline trail map',
  'Stretch calves and ankles',
  'Add trail mix and snacks',
  'Bring a small first-aid kit',
  'Spot three bird species',
  'Photograph a wildflower',
  'Stay on marked trail paths',
  'Pack out all trash',
  'Clean hiking boots after return',
  'Refill water bottles for next hike',
  'Log trail notes in journal',
  'Review route with hiking buddy',
  'Set out sunscreen and hat',
  'Pack trekking poles',
  'Leave a trip plan with a friend',
]

const getRandomDefaults = () => {
  const min = 8
  const max = 12
  const count = Math.floor(Math.random() * (max - min + 1)) + min
  const shuffled = [...defaultTaskPool].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export const ensureDefaultTodos = async (uid) => {
  const todosRef = collection(db, 'users', uid, 'todos')
  const existingSnapshot = await getDocs(query(todosRef, limit(1)))
  if (!existingSnapshot.empty) return

  const defaultTasks = getRandomDefaults()
  await Promise.all(
    defaultTasks.map((taskText, index) =>
      addDoc(todosRef, {
        text: taskText,
        completed: false,
        createdAt: serverTimestamp(),
        order: index,
      }),
    ),
  )
}

export const subscribeToTodos = (uid, onData, onError) => {
  const todosRef = collection(db, 'users', uid, 'todos')
  const todosQuery = query(todosRef, orderBy('createdAt', 'asc'))
  return onSnapshot(
    todosQuery,
    (snapshot) => {
      const todos = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      onData(todos)
    },
    onError,
  )
}

export const addTodo = async (uid, text) => {
  const todosRef = collection(db, 'users', uid, 'todos')
  return addDoc(todosRef, {
    text,
    completed: false,
    createdAt: serverTimestamp(),
  })
}

export const toggleTodo = async (uid, todoId, completed) => {
  const todoRef = doc(db, 'users', uid, 'todos', todoId)
  return updateDoc(todoRef, { completed })
}

export const deleteTodo = async (uid, todoId) => {
  const todoRef = doc(db, 'users', uid, 'todos', todoId)
  return deleteDoc(todoRef)
}
