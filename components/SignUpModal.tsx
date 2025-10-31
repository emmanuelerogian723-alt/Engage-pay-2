import React, { useState } from 'react';
import { CloseIcon, UserIcon, BriefcaseIcon } from './icons';
import { UserRole } from '../types';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (email: string, pass: string) => void;
    onSignUp: (role: UserRole, name: string, email: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, onSignUp }) => {
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.Engager);
    
    // State for all form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    if (!isOpen) return null;

    const getRoleButtonStyle = (role: UserRole) => {
        return selectedRole === role
            ? 'bg-primary-100 dark:bg-primary-900/50 border-primary-500 text-primary-700 dark:text-primary-300'
            : 'bg-gray-100 dark:bg-gray-700 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600';
    };

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(email, password);
    };

    const handleSignUpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSignUp(selectedRole, name, email);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold">Welcome to EngagePay</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                           {authMode === 'login' ? 'Log in to your account' : 'Create a new account'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <CloseIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                <div className="p-6">
                    {authMode === 'login' ? (
                        <form className="space-y-4" onSubmit={handleLoginSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md p-2 focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md p-2 focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <button type="submit" className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200">
                                Log In
                            </button>
                            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                                Don't have an account? <button type="button" onClick={() => setAuthMode('signup')} className="font-semibold text-primary-600 hover:underline">Sign up</button>.
                            </p>
                        </form>
                    ) : (
                        <form className="space-y-4" onSubmit={handleSignUpSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I am a...</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button type="button" onClick={() => setSelectedRole(UserRole.Engager)} className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors duration-200 ${getRoleButtonStyle(UserRole.Engager)}`}>
                                        <UserIcon className="w-8 h-8 mb-2" />
                                        <span className="font-semibold">Engager</span>
                                    </button>
                                    <button type="button" onClick={() => setSelectedRole(UserRole.Creator)} className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors duration-200 ${getRoleButtonStyle(UserRole.Creator)}`}>
                                        <BriefcaseIcon className="w-8 h-8 mb-2" />
                                        <span className="font-semibold">Creator</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md p-2 focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md p-2 focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md p-2 focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                             <button type="submit" className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200">
                                Create Account
                            </button>
                             <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                                Already have an account? <button type="button" onClick={() => setAuthMode('login')} className="font-semibold text-primary-600 hover:underline">Log in</button>.
                            </p>
                        </form>
                    )}
                </div>
            </div>
             <style>{`
                @keyframes fadeInScale {
                    from { transform: scale(.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fade-in-scale { animation: fadeInScale 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default AuthModal;