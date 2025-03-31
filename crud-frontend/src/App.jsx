import { useState, useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ModalForm from "./components/ModalForm";
import Navbar from "./components/Navbar";
import TableList from "./components/TableList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { getTodos, addTodo, updateTodo, deleteTodo } from "./services/todoService";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function TodoApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [todos, setTodos] = useState([]);
  const [currentTodo, setCurrentTodo] = useState(null);
  const [title, setTitle] = useState("");

  // Fetch todos
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const data = await getTodos();
        setTodos(data);
      } catch (error) {
        console.error("Error fetching todos:", error);
      }
    };

    fetchTodos();
  }, []);

  const handleOpen = (mode, todo = null) => {
    setModalMode(mode);
    if (mode === "edit" && todo) {
      setCurrentTodo(todo);
      setTitle(todo.title);
    } else {
      setTitle("");
      setCurrentTodo(null);
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTitle("");
    setCurrentTodo(null);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please enter a title for your todo");
      return;
    }

    try {
      if (modalMode === "add") {
        const newTodo = await addTodo(title);
        setTodos([newTodo, ...todos]);
      } else {
        const updatedTodo = await updateTodo(currentTodo.id, title);
        setTodos(
          todos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
        );
      }
      handleClose();
    } catch (error) {
      console.error("Error with todo operation:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this todo?");
      if (confirmed) {
        await deleteTodo(id);
        setTodos(todos.filter((todo) => todo.id !== id));
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  return (
    <>
      <Navbar onOpen={() => handleOpen("add")} />
      <TableList 
        todos={todos} 
        handleOpen={handleOpen} 
        handleDelete={handleDelete} 
      />
      <ModalForm
        isOpen={isOpen}
        onSubmit={handleSubmit}
        onClose={handleClose}
        mode={modalMode}
        title={title}
        onTitleChange={handleTitleChange}
      />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <TodoApp />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;