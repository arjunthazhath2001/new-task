import { useState, useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ModalForm from "./components/ModalForm";
import Navbar from "./components/Navbar";
import TableList from "./components/TableList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { getTodos, addTodo, updateTodo, deleteTodo } from "./services/todoService";

// Protected route component to restrict access to authenticated users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />; // Redirect to login if not authenticated
  }
  
  return children;
};

// Main Todo Application Component
function TodoApp() {
  const [isOpen, setIsOpen] = useState(false); // State to manage modal visibility
  const [modalMode, setModalMode] = useState('add'); // State to track modal mode (add/edit)
  const [todos, setTodos] = useState([]); // State to store todos
  const [currentTodo, setCurrentTodo] = useState(null); // State for currently selected todo
  const [title, setTitle] = useState(""); // State for todo title input

  // Fetch todos when the component mounts
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const data = await getTodos(); // Fetch todos from the API
        setTodos(data);
      } catch (error) {
        console.error("Error fetching todos:", error);
      }
    };

    fetchTodos();
  }, []);

  // Function to open modal in add/edit mode
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

  // Function to close modal
  const handleClose = () => {
    setIsOpen(false);
    setTitle("");
    setCurrentTodo(null);
  };

  // Function to handle title input change
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  // Function to handle add or update todo
  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please enter a title for your todo");
      return;
    }

    try {
      if (modalMode === "add") {
        const newTodo = await addTodo(title); // Add new todo to API
        setTodos([newTodo, ...todos]); // Update UI
      } else {
        const updatedTodo = await updateTodo(currentTodo.id, title); // Update todo in API
        setTodos(
          todos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
        );
      }
      handleClose(); // Close modal after submission
    } catch (error) {
      console.error("Error with todo operation:", error);
    }
  };

  // Function to handle delete todo
  const handleDelete = async (id) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this todo?");
      if (confirmed) {
        await deleteTodo(id); // Delete todo from API
        setTodos(todos.filter((todo) => todo.id !== id)); // Remove from UI
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  return (
    <>
      {/* Navbar component with add todo button */}
      <Navbar onOpen={() => handleOpen("add")} />
      {/* TableList component to display todos */}
      <TableList 
        todos={todos} 
        handleOpen={handleOpen} 
        handleDelete={handleDelete} 
      />
      {/* ModalForm component for adding/editing todos */}
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

// Root App Component with authentication and routing
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
