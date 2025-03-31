import React from "react";

function TableList({ todos, handleOpen, handleDelete }) {
  if (todos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Todos Yet!</h2>
          <p className="text-gray-500">Click the "Add TODO" button to create your first todo.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto mx-8 lg:mx-32 mt-10">
        <table className="table w-full">
          {/* head */}
          <thead>
            <tr>
              <th>ID</th>
              <th>TITLE</th>
              <th colSpan="2" className="text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {todos.map((todo) => (
              <tr key={todo.id} className="hover">
                <th>{todo.id}</th>
                <td>{todo.title}</td>
                <td>
                  <button
                    onClick={() => handleOpen("edit", todo)}
                    className="btn btn-accent btn-sm"
                  >
                    Update
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="btn btn-error btn-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default TableList;