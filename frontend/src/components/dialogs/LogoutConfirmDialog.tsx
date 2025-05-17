import React from "react";

interface LogoutConfirmDialogProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const LogoutConfirmDialog: React.FC<LogoutConfirmDialogProps> = ({ open, onConfirm, onCancel }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full relative animate-fade-in">
                <div className="flex flex-col items-center">
                    <div className="bg-red-100 rounded-full p-3 mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2"> Log out </h2>
                    <p className="text-gray-600 mb-6 text-center">Are you sure you want to log out??</p>
                    <div className="flex gap-4 w-full">
                        <button
                            className="flex-1 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                        <button
                            className="flex-1 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition shadow"
                            onClick={onConfirm}
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoutConfirmDialog; 