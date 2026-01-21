import { useEffect, useMemo, useState } from 'react'
import './App.css'
import Auth from './Auth'
import { addTodo, deleteTodo, ensureDefaultTodos, subscribeToTodos, toggleTodo } from './todos'

const filterTodos = (todos, filter) => {
  if (filter === 'active') return todos.filter((todo) => !todo.completed)
  if (filter === 'completed') return todos.filter((todo) => todo.completed)
  return todos
}

function App() {
  const [user, setUser] = useState(null)
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedTodoId, setSelectedTodoId] = useState(null)

  useEffect(() => {
    if (!user) {
      setTodos([])
      setLoading(false)
      setSelectedTodoId(null)
      return undefined
    }

    let unsubscribe
    const start = async () => {
      setLoading(true)
      setError('')
      try {
        await ensureDefaultTodos(user.uid)
        unsubscribe = subscribeToTodos(
          user.uid,
          (items) => {
            setTodos(items)
            setLoading(false)
          },
          (snapshotError) => {
            console.error('Error loading todos:', snapshotError)
            setError('Unable to load your TrailTasks right now.')
            setLoading(false)
          },
        )
      } catch (loadError) {
        console.error('Error preparing todos:', loadError)
        setError('Unable to prepare your TrailTasks right now.')
        setLoading(false)
      }
    }

    start()
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [user])

  useEffect(() => {
    const handleGlobalShortcut = (event) => {
      if (!selectedTodoId) return
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        const selectedTodo = todos.find((todo) => todo.id === selectedTodoId)
        if (!selectedTodo) return
        event.preventDefault()
        handleToggle(selectedTodo)
      }
    }

    window.addEventListener('keydown', handleGlobalShortcut)
    return () => window.removeEventListener('keydown', handleGlobalShortcut)
  }, [selectedTodoId, todos])

  const filteredTodos = useMemo(() => filterTodos(todos, filter), [todos, filter])
  const activeCount = useMemo(() => todos.filter((todo) => !todo.completed).length, [todos])

  const handleAddTodo = async () => {
    if (!inputValue.trim()) return
    if (!user) return
    try {
      await addTodo(user.uid, inputValue.trim())
      setInputValue('')
    } catch (addError) {
      console.error('Error adding todo:', addError)
      setError('Unable to add that trail task. Please try again.')
    }
  }

  const handleToggle = async (todo) => {
    if (!user) return
    try {
      await toggleTodo(user.uid, todo.id, !todo.completed)
    } catch (toggleError) {
      console.error('Error toggling todo:', toggleError)
      setError('Unable to update that trail task. Please try again.')
    }
  }

  const handleDelete = async (todoId) => {
    if (!user) return
    try {
      await deleteTodo(user.uid, todoId)
    } catch (deleteError) {
      console.error('Error deleting todo:', deleteError)
      setError('Unable to delete that trail task. Please try again.')
    }
  }

  const handleClearCompleted = async () => {
    if (!user) return
    const completedTodos = todos.filter((todo) => todo.completed)
    await Promise.all(completedTodos.map((todo) => handleDelete(todo.id)))
  }

  if (!user) {
    return (
      <div className="app auth-background">
        <Auth onAuthStateChange={setUser} />
      </div>
    )
  }

  return (
    <div className="app">
      <div className="todo-container">
        <header className="header-section">
          <div>
            <p className="eyebrow">Your hiking checklist</p>
            <h1 className="todo-title">TrailTasks</h1>
          </div>
          <Auth user={user} onAuthStateChange={setUser} />
        </header>

        <div className="input-section">
          <input
            type="text"
            className="todo-input"
            placeholder="Add a new hiking task..."
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleAddTodo()
              if (event.key === 'Escape') setInputValue('')
            }}
          />
          <button className="primary-button" onClick={handleAddTodo}>
            Add task
          </button>
        </div>

        <div className="shortcut-hints">
          <span>Enter adds · Esc clears · Ctrl/Cmd + Enter toggles selected</span>
        </div>

        <div className="filter-section">
          {['all', 'active', 'completed'].map((option) => (
            <button
              key={option}
              className={`filter-button ${filter === option ? 'active' : ''}`}
              onClick={() => setFilter(option)}
            >
              {option === 'all' ? 'All' : option === 'active' ? 'Active' : 'Completed'}
            </button>
          ))}
        </div>

        {error && <div className="app-error">{error}</div>}

        {loading ? (
          <div className="loading-state">Loading trail tasks...</div>
        ) : (
          <ul className="todo-list">
            {filteredTodos.length === 0 ? (
              <li className="empty-state">No trail tasks yet.</li>
            ) : (
              filteredTodos.map((todo) => (
                <li
                  key={todo.id}
                  className={`todo-item ${todo.completed ? 'completed' : ''} ${
                    selectedTodoId === todo.id ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedTodoId(todo.id)}
                >
                  <label className="todo-content">
                    <input
                      type="checkbox"
                      className="todo-checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggle(todo)}
                    />
                    <span className="todo-text">{todo.text}</span>
                  </label>
                  <div className="todo-actions">
                    <button className="icon-button" onClick={() => handleDelete(todo.id)}>
                      Remove
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}

        {todos.length > 0 && (
          <footer className="todo-footer">
            <span>
              {activeCount} {activeCount === 1 ? 'task' : 'tasks'} remaining
            </span>
            <button className="secondary-button" onClick={handleClearCompleted}>
              Clear completed
            </button>
          </footer>
        )}
      </div>
    </div>
  )
}

export default App
