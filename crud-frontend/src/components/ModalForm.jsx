import React from "react";

function ModalForm({ isOpen, onClose, mode, onSubmit, title, onTitleChange }) {
  if (!isOpen) return null;
  
  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg py-4">
          {mode === "edit" ? "Edit Todo" : "Add Todo"}
        </h3>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Todo Title</span>
            </label>
            <input
              type="text"
              placeholder="Enter todo title"
              className="input input-bordered w-full"
              value={title}
              onChange={onTitleChange}
              autoFocus
            />
          </div>
          
          <div className="modal-action">
            <button type="submit" className="btn btn-success">
              {mode === "edit" ? "Save Changes" : "Add Todo"}
            </button>
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

export default ModalForm;