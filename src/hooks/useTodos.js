import { useState, useEffect } from 'react'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'

export function usePrivateTodos(userId) {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setTodos([])
      setLoading(false)
      return
    }

    const q = query(collection(db, 'users', userId, 'todos'), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setTodos(todosData)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching private todos:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  const addTodo = async (text) => {
    if (!userId) return null

    try {
      const cleanedText = text.trim()
      if (!cleanedText) return null
      const newTodo = {
        text: cleanedText,
        completed: false,
        createdAt: serverTimestamp(),
      }
      const docRef = await addDoc(collection(db, 'users', userId, 'todos'), newTodo)
      return docRef.id
    } catch (error) {
      console.error('Error adding todo:', error)
      throw error
    }
  }

  const updateTodo = async (id, updates) => {
    try {
      const todoRef = doc(db, 'users', userId, 'todos', id)
      await updateDoc(todoRef, updates)
    } catch (error) {
      console.error('Error updating todo:', error)
      throw error
    }
  }

  const toggleTodo = async (id, completed) => {
    await updateTodo(id, { completed })
  }

  const deleteTodo = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', userId, 'todos', id))
    } catch (error) {
      console.error('Error deleting todo:', error)
      throw error
    }
  }

  return { todos, loading, addTodo, updateTodo, toggleTodo, deleteTodo }
}

export function useSharedTodos() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'sharedTodos'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setTodos(todosData)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching shared todos:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const addTodo = async (text, userName) => {
    try {
      const newTodo = {
        text: text.trim(),
        completed: false,
        createdByName: userName || 'Anonymous',
        createdAt: new Date().toISOString()
      }
      const docRef = await addDoc(collection(db, 'sharedTodos'), newTodo)
      return docRef.id
    } catch (error) {
      console.error('Error adding shared todo:', error)
      throw error
    }
  }

  const updateTodo = async (id, updates) => {
    try {
      const todoRef = doc(db, 'sharedTodos', id)
      await updateDoc(todoRef, updates)
    } catch (error) {
      console.error('Error updating shared todo:', error)
      throw error
    }
  }

  const toggleTodo = async (id, completed) => {
    await updateTodo(id, { completed: !completed })
  }

  const deleteTodo = async (id) => {
    try {
      await deleteDoc(doc(db, 'sharedTodos', id))
    } catch (error) {
      console.error('Error deleting shared todo:', error)
      throw error
    }
  }

  return { todos, loading, addTodo, updateTodo, toggleTodo, deleteTodo }
}
