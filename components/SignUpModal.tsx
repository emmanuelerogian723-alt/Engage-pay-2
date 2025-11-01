import React, { useState, useEffect } from 'react';
import { CloseIcon, UserIcon, BriefcaseIcon } from './icons';
import { UserRole } from '../types';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (email: string, pass: string) => void;
    onSignUp: (role: UserRole, name: string, email: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, onSignUp }) => {
    const [authMode, setAuthMode] = useState<'login' | 'signup' | 'verify'>('login');
    const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.Engager);
    
    // State for all form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    // State for verification flow
    const [verificationCode, setVerificationCode] = useState('');
    const [userInputCode, setUserInputCode] = useState('');
    const [verificationError, setVerificationError] = useState('');
    const [pendingUserData, setPendingUserData] = useState<{role: UserRole, name: string, email: string} | null>(null);

    // Reset state when modal is closed
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setAuthMode('login');
                setSelectedRole(UserRole.Engager);
                setEmail('');
                setPassword('');
                setName('');
                setVerificationCode('');
                setUserInputCode('');
                setVerificationError('');
                setPendingUserData(null);
            }, 300); // Delay to allow fade-out animation
        }
    }, [isOpen]);


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
        // Generate a 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setVerificationCode(code);
        setPendingUserData({ role: selectedRole, name, email });
        
        // Simulate sending email
        alert(`Your Erogian Social verification code is: ${code}`);

        setAuthMode('verify');
    };

    const handleVerificationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userInputCode === verificationCode) {
            if (pendingUserData) {
                onSignUp(pendingUserData.role, pendingUserData.name, pendingUserData.email);
            }
        } else {
            setVerificationError('Invalid code. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold">Welcome to Erogian Social</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                           {authMode === 'login' && 'Log in to your account'}
                           {authMode === 'signup' && 'Create a new account'}
                           {authMode === 'verify' && 'Verify your email address'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <CloseIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                <div className="p-6">
                    {authMode === 'login' && (
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
                    )} 
                    {authMode === 'signup' && (
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
                    {authMode === 'verify' && (
                         <form className="space-y-4" onSubmit={handleVerificationSubmit}>
                            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                A 6-digit verification code has been sent to <span className="font-semibold text-gray-800 dark:text-gray-200">{pendingUserData?.email}</span>. Please enter it below.
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Verification Code</label>
                                <input 
                                    type="text" 
                                    value={userInputCode} 
                                    onChange={e => setUserInputCode(e.target.value)} 
                                    placeholder="123456" 
                                    required 
                                    maxLength={6}
                                    className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md p-2 text-center text-lg tracking-[0.5em] focus:ring-primary-500 focus:border-primary-500" 
                                />
                            </div>
                            {verificationError && <p className="text-sm text-red-500 text-center">{verificationError}</p>}
                            <button type="submit" className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200">
                                Verify Account
                            </button>
                            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                                Didn't receive a code? <button type="button" className="font-semibold text-primary-600 hover:underline">Resend code</button>.
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