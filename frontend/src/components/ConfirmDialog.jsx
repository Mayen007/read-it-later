import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

const ConfirmDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  title = "Confirm Action",
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  type = "danger", // "danger", "warning", "info"
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const dialogContent = (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-gray-200 flex items-start gap-3 sm:gap-4">
          <div
            className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
              type === "danger"
                ? "bg-red-100 text-red-600"
                : type === "warning"
                ? "bg-yellow-100 text-yellow-600"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            <AlertTriangle size={24} className="sm:w-6 sm:h-6" />
          </div>
          <h3
            id="dialog-title"
            className="flex-1 text-lg sm:text-xl font-semibold text-gray-900 leading-tight"
          >
            {title}
          </h3>
          <button
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={onCancel}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
          <button
            className="flex-1 px-4 py-2.5 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 active:scale-95 transition-all"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium active:scale-95 transition-all ${
              type === "danger"
                ? "bg-red-500 hover:bg-red-600"
                : type === "warning"
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  // Render dialog in a portal to prevent layout issues
  return createPortal(dialogContent, document.body);
};

export default ConfirmDialog;
