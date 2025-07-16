import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Label from '@radix-ui/react-label';
import { loginUser } from '@/services/login.services';
import mainApi from '@/apis/main.api';
import { User, Lock } from 'lucide-react';

const Login: React.FC = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		const verifyToken = async () => {
			try {
				const response = await mainApi.get('/v1/auth/verify', {
					withCredentials: true
				});
				if (response.data.success) {
					navigate('/dashboard');
				}
			} catch (error) {
				//console.log('Token verification failed:', error);
			}
		};
		verifyToken();
	}, [navigate]);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		try {
			const response = await loginUser({ username, password });

			if (response.success) {
				navigate('/dashboard');
			} else {
				setError(response.message || 'Invalid login credentials');
			}
		} catch {
			setError('An error occurred. Please try again.');
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
			<div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
				{/* Logo and Title Section */}
				<div className="text-center">
					<div className="flex justify-center mb-4">
					</div>
					<h2 className="text-3xl font-bold text-gray-900 mb-2">Warehouse Calculation</h2>
					<p className="text-gray-600">Please sign in to your account</p>
				</div>

				{/* Error Message */}
				{error && (
					<div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
						<p className="text-red-700 text-sm">{error}</p>
					</div>
				)}

				{/* Login Form */}
				<form className="mt-8 space-y-6" onSubmit={handleLogin}>
					<div className="space-y-4">
						{/* Username Field */}
						<div className="relative">
							<Label.Root htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
								Username
							</Label.Root>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<User className="h-5 w-5 text-gray-400" />
								</div>
								<input
									id="username"
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
									placeholder="Enter your username"
								/>
							</div>
						</div>

						{/* Password Field */}
						<div className="relative">
							<Label.Root htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
								Password
							</Label.Root>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Lock className="h-5 w-5 text-gray-400" />
								</div>
								<input
									id="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
									placeholder="Enter your password"
								/>
							</div>
						</div>
					</div>

					{/* Login Button */}
					<button
						type="submit"
						className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
					>
						Sign in
					</button>
				</form>

				{/* Footer */}
				<div className="text-center mt-6">
					<p className="text-sm text-gray-600">
						Warehouse Management System
					</p>
				</div>
			</div>
		</div>
	);
};

export default Login;


