import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar({ onOpen }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <>
      <div className="navbar bg-base-100 shadow-sm">
        <div className="navbar-start">
          <span className="text-sm px-4">
            Welcome, {user?.username || "User"}
          </span>
        </div>
        <div className="navbar-center">
          <a className="btn btn-ghost text-xl">TODO APP</a>
        </div>
        <div className="navbar-end">
          <a className="btn btn-primary mr-2" onClick={onOpen}>
            Add TODO
          </a>
          <button className="btn btn-ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}