import React, { useState, useEffect } from 'react';
import { Campaign, EngagementType, SocialPlatform, Announcement, Creator, Transaction } from '../types';
import { PLATFORM_ICONS } from '../constants';
import { TrendingUpIcon, DollarSignIcon, UsersIcon, CheckCircleIcon, CloseIcon, CreditCardIcon, BankIcon, LinkIcon, MegaphoneIcon, WalletIcon } from './icons';

interface AnalyticsCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    color: string;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const CampaignCard: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
    const progress = (campaign.completedTasks / campaign.totalTasks) * 100;
    const PlatformIcon = PLATFORM_ICONS[campaign.platform];

    const getStatusChipStyle = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <PlatformIcon className="w-5 h-5 text-gray-500" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{campaign.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{campaign.engagementType} on {campaign.platform}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusChipStyle(campaign.status)}`}>{campaign.status}</span>
            </div>
            <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{campaign.completedTasks.toLocaleString()} / {campaign.totalTasks.toLocaleString()} Engagers</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Budget: <span className="text-primary-500">${campaign.budget.toLocaleString()}</span></span>
                <button className="text-primary-600 dark:text-primary-400 hover:underline font-semibold">View Analytics</button>
            </div>
        </div>
    );
};

const CreatorWallet: React.FC<{ user: Creator; onFund: () => void; }> = ({ user, onFund }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md col-span-1 lg:col-span-2">
        <h3 className="text-lg font-bold mb-4">My Wallet</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-gray-700 to-gray-900 text-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
                 <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Balance</h3>
                        <WalletIcon className="w-8 h-8 opacity-70" />
                    </div>
                    <p className="text-4xl font-bold tracking-tight">${user.walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-sm opacity-80 mt-1">Available funds</p>
                 </div>
                <button onClick={onFund} className="mt-6 w-full bg-primary-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors duration-200">
                    Fund Account
                </button>
            </div>
             <div className="max-h-64 overflow-y-auto pr-2">
                <h4 className="text-md font-semibold mb-2 text-gray-700 dark:text-gray-300">Transaction History</h4>
                <ul className="space-y-2">
                    {user.transactions.slice().reverse().map(tx => (
                        <li key={tx.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md text-sm">
                            <div>
                                <p className="font-semibold">{tx.description}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(tx.date).toLocaleDateString()}</p>
                            </div>
                            <span className={`font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {tx.amount > 0 ? '+' : ''}${tx.amount.toFixed(2)}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
);


const PaymentModal: React.FC<{ isOpen: boolean, onClose: () => void, onAddFunds: (amount: number) => void, currentUserId?: string }> = ({ isOpen, onClose, onAddFunds, currentUserId }) => {
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card');
    const [amount, setAmount] = useState<number>(100);
    
    // Card details state
    const [cardDetails, setCardDetails] = useState({ cardNumber: '', expiryDate: '', cvc: '' });
    const [cardErrors, setCardErrors] = useState<Partial<typeof cardDetails>>({});

    if (!isOpen) return null;
    
    const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCardDetails(prev => ({...prev, [name]: value}));
    };

    const validateCard = () => {
        const newErrors: Partial<typeof cardDetails> = {};
        if (!/^\d{16}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
            newErrors.cardNumber = "Card number must be 16 digits.";
        }
        if (!/^(0[1-9]|1[0-2])\/?\d{2}$/.test(cardDetails.expiryDate)) {
            newErrors.expiryDate = "Use MM/YY format.";
        } else {
            const [month, year] = cardDetails.expiryDate.split('/');
            const expiry = new Date(Number(`20${year}`), Number(month), 0); // Day 0 gives last day of previous month
            if (expiry < new Date()) {
                newErrors.expiryDate = "Card has expired.";
            }
        }
        if (!/^\d{3,4}$/.test(cardDetails.cvc)) {
            newErrors.cvc = "CVC must be 3 or 4 digits.";
        }

        setCardErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleFund = () => {
        if (amount <= 0) return;
        
        if (paymentMethod === 'card') {
            if (validateCard()) {
                onAddFunds(amount);
                onClose();
            }
        } else { // For bank transfer
            onAddFunds(amount); // Assuming the user confirms payment, let's just add the fund for simulation
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Fund Your Account</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <CloseIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                <div className="p-6">
                    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                        <button onClick={() => setPaymentMethod('card')} className={`flex-1 py-2 text-sm font-semibold flex items-center justify-center space-x-2 ${paymentMethod === 'card' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-gray-500'}`}>
                            <CreditCardIcon className="w-5 h-5" />
                            <span>Credit Card</span>
                        </button>
                        <button onClick={() => setPaymentMethod('transfer')} className={`flex-1 py-2 text-sm font-semibold flex items-center justify-center space-x-2 ${paymentMethod === 'transfer' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-gray-500'}`}>
                            <BankIcon className="w-5 h-5" />
                            <span>Bank Transfer</span>
                        </button>
                    </div>

                    {paymentMethod === 'card' && (
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                                <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} placeholder="$100.00" className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md p-2 focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Card Number</label>
                                <input type="text" name="cardNumber" value={cardDetails.cardNumber} onChange={handleCardChange} placeholder="**** **** **** 1234" className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md p-2 focus:ring-primary-500 focus:border-primary-500" />
                                {cardErrors.cardNumber && <p className="text-red-500 text-xs mt-1">{cardErrors.cardNumber}</p>}
                            </div>
                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date</label>
                                    <input type="text" name="expiryDate" value={cardDetails.expiryDate} onChange={handleCardChange} placeholder="MM/YY" className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md p-2 focus:ring-primary-500 focus:border-primary-500" />
                                    {cardErrors.expiryDate && <p className="text-red-500 text-xs mt-1">{cardErrors.expiryDate}</p>}
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CVC</label>
                                    <input type="text" name="cvc" value={cardDetails.cvc} onChange={handleCardChange} placeholder="123" className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md p-2 focus:ring-primary-500 focus:border-primary-500" />
                                    {cardErrors.cvc && <p className="text-red-500 text-xs mt-1">{cardErrors.cvc}</p>}
                                </div>
                            </div>
                        </div>
                    )}
                    {paymentMethod === 'transfer' && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <p>Please transfer the desired amount to the bank account below. Use your User ID as the reference.</p>
                            <p><strong>Bank:</strong> First City Monument Bank</p>
                            <p><strong>Account Holder:</strong> Emmanuel Ene Rejoice Gideon</p>
                            <p><strong>Account Number:</strong> 7415707015</p>
                            <p><strong>Your User ID:</strong> {currentUserId}</p>
                        </div>
                    )}
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
                    <button onClick={handleFund} className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200">
                        {paymentMethod === 'card' ? `Add $${amount}` : 'I Have Transferred'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const CreateTaskModal: React.FC<{ isOpen: boolean, onClose: () => void, onCreateCampaign: (campaign: Omit<Campaign, 'id' | 'creatorId' | 'completedTasks' | 'status'>) => void, balance: number }> = ({ isOpen, onClose, onCreateCampaign, balance }) => {
    const initialFormState = {
        campaignName: '',
        platform: SocialPlatform.Instagram,
        engagementType: EngagementType.Like,
        payout: '',
        totalTasks: '',
    };
    
    // State for inputs using a single state object
    const [formData, setFormData] = useState(initialFormState);

    // State for validation
    const [budget, setBudget] = useState(0);
    const [error, setError] = useState('');

    // Handler for all form inputs
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Effect for real-time validation
    useEffect(() => {
        const numPayout = parseFloat(formData.payout) || 0;
        const numTasks = parseInt(formData.totalTasks, 10) || 0;
        const calculatedBudget = numPayout * numTasks;
        setBudget(calculatedBudget);

        if (calculatedBudget > 0 && calculatedBudget > balance) {
            const shortfall = calculatedBudget - balance;
            setError(`Insufficient funds. You are short by $${shortfall.toFixed(2)}.`);
        } else {
            setError('');
        }
    }, [formData.payout, formData.totalTasks, balance]);
    
    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData(initialFormState);
            setBudget(0);
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (error || budget <= 0) {
            return; // Don't submit if there's an error or budget is zero
        }

        const newCampaign = {
            name: formData.campaignName,
            platform: formData.platform as SocialPlatform,
            engagementType: formData.engagementType as EngagementType,
            budget,
            totalTasks: parseInt(formData.totalTasks, 10),
        };
        onCreateCampaign(newCampaign);
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold">Create a New Campaign</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <CloseIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Campaign Name</label>
                                <input name="campaignName" value={formData.campaignName} onChange={handleInputChange} type="text" placeholder="e.g., Summer Collection Launch" required className="block w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md p-2 focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Platform</label>
                                    <select name="platform" value={formData.platform} onChange={handleInputChange} required className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md p-2 focus:ring-primary-500 focus:border-primary-500">
                                        {Object.values(SocialPlatform).map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Engagement Type</label>
                                    <select name="engagementType" value={formData.engagementType} onChange={handleInputChange} required className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md p-2 focus:ring-primary-500 focus:border-primary-500">
                                        {Object.values(EngagementType).map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex space-x-4">
                               <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payout per Task</label>
                                    <input name="payout" value={formData.payout} onChange={handleInputChange} type="number" step="0.01" min="0.01" placeholder="$0.10" required className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md p-2 focus:ring-primary-500 focus:border-primary-500" />
                                </div>
                                 <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Tasks</label>
                                    <input name="totalTasks" value={formData.totalTasks} onChange={handleInputChange} type="number" step="1" min="1" placeholder="1000" required className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md p-2 focus:ring-primary-500 focus:border-primary-500" />
                                </div>
                            </div>
                             <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Campaign Budget: 
                                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400 ml-2">${budget.toFixed(2)}</span>
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">Available Balance: ${balance.toFixed(2)}</p>
                                {error && (
                                  <div className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-2 rounded-md font-semibold">
                                    {error}
                                  </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
                        <button type="submit" disabled={!!error || budget <= 0} className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                            Launch Campaign
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface CreatorDashboardProps {
    announcements: Announcement[];
    currentUser: Creator;
    campaigns: Campaign[];
    setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
    onUpdateUser: (user: Creator) => void;
}

const CreatorDashboard: React.FC<CreatorDashboardProps> = ({ announcements, currentUser, campaigns, setCampaigns, onUpdateUser }) => {
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [isCreateTaskModalOpen, setCreateTaskModalOpen] = useState(false);

    const handleCreateCampaign = (newCampaignData: Omit<Campaign, 'id' | 'creatorId' | 'completedTasks' | 'status'>) => {
        const newCampaign: Campaign = {
            ...newCampaignData,
            id: Date.now().toString(),
            creatorId: currentUser.id,
            completedTasks: 0,
            status: 'Active',
        };
        setCampaigns(prev => [newCampaign, ...prev]);

        // Deduct from wallet and add transaction
        const updatedUser: Creator = {
            ...currentUser,
            walletBalance: currentUser.walletBalance - newCampaign.budget,
            transactions: [
                ...currentUser.transactions,
                {
                    id: `txn-${Date.now()}`,
                    type: 'campaign',
                    description: newCampaign.name,
                    amount: -newCampaign.budget,
                    date: new Date().toISOString()
                }
            ]
        };
        onUpdateUser(updatedUser);
    };

    const handleAddFunds = (amount: number) => {
        const updatedUser: Creator = {
            ...currentUser,
            walletBalance: currentUser.walletBalance + amount,
            transactions: [
                ...currentUser.transactions,
                {
                    id: `txn-${Date.now()}`,
                    type: 'deposit',
                    description: 'Card Deposit',
                    amount: amount,
                    date: new Date().toISOString()
                }
            ]
        };
        onUpdateUser(updatedUser);
    };

    return (
        <div className="space-y-8">
             <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setPaymentModalOpen(false)} onAddFunds={handleAddFunds} currentUserId={currentUser.id} />
             <CreateTaskModal isOpen={isCreateTaskModalOpen} onClose={() => setCreateTaskModalOpen(false)} onCreateCampaign={handleCreateCampaign} balance={currentUser.walletBalance} />
            
            {announcements.length > 0 && (
                 <section className="bg-primary-50 dark:bg-primary-900/50 p-4 rounded-lg">
                    <h2 className="text-xl font-bold mb-2 flex items-center space-x-2 text-primary-800 dark:text-primary-200"><MegaphoneIcon className="w-6 h-6"/><span>Admin Announcements</span></h2>
                    <div className="space-y-3">
                    {announcements.map(ann => (
                        <div key={ann.id} className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{ann.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{ann.content}</p>
                        </div>
                    ))}
                    </div>
                </section>
            )}

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <CreatorWallet user={currentUser} onFund={() => setPaymentModalOpen(true)} />
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4 col-span-1">
                    <AnalyticsCard title="Total Spend" value={`$${currentUser.transactions.filter(t=>t.type==='campaign').reduce((acc, t) => acc + Math.abs(t.amount), 0).toLocaleString()}`} icon={DollarSignIcon} color="bg-green-500" />
                    <AnalyticsCard title="Active Campaigns" value={campaigns.filter(c => c.status === 'Active').length.toString()} icon={UsersIcon} color="bg-purple-500" />
                </div>
            </section>
            
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">My Campaigns</h2>
                    <button onClick={() => setCreateTaskModalOpen(true)} className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200">
                        + Create Campaign
                    </button>
                </div>
                {campaigns.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {campaigns.map(campaign => (
                            <CampaignCard key={campaign.id} campaign={campaign} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <p className="text-gray-500 dark:text-gray-400">You haven't created any campaigns yet.</p>
                        <button onClick={() => setCreateTaskModalOpen(true)} className="mt-4 bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200">
                            Create Your First Campaign
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default CreatorDashboard;
