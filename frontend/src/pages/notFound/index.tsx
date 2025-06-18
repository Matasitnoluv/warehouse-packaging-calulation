import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-800 px-4">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <p className="text-xl mb-2">Page not found</p>
            <p className="text-sm text-gray-500 mb-6">
                Sorry, the page you’re looking for doesn’t exist or has been moved.
            </p>
            <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
                Go Back
            </button>
        </div>
    );
}
