import React, { useState } from 'react';
import { Campaign, Engager, Submission, WithdrawalRequest, Announcement, User, UserRole, Creator, Notification, Task, DepositRequest } from '../types';
import { CheckIcon, XIcon, BarChartIcon, CheckCircleIcon, MegaphoneIcon, DollarSignIcon, UsersIcon, BriefcaseIcon } from './icons';
import { MOCK_TASKS } from '../constants';


type AdminTab = 'Analytics' | 'Campaigns' | 'Users' | 'Task Approvals' | 'Deposit Approvals' | 'Payment Approvals' | 'Announcements';

interface AdminDashboardProps {
    submissions: Submission[];
    setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
    withdrawalRequests: WithdrawalRequest[];
    setWithdrawalRequests: React.Dispatch<React.SetStateAction<WithdrawalRequest[]>>;
    depositRequests: DepositRequest[];
    setDepositRequests: React.Dispatch<React.SetStateAction<DepositRequest[]>>;
    announcements: Announcement[];
    setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
    users: Record<string, User>;
    setUsers: React.Dispatch<React.SetStateAction<Record<string, User>>>;
    campaigns: Campaign[];
    notifications: Notification[];
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('Analytics');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Analytics': return <Analytics 
                                        users={Object.values(props.users)} 
                                        campaigns={props.campaigns} 
                                        withdrawalRequests={props.withdrawalRequests}
                                        submissions={props.submissions}
                                        depositRequests={props.depositRequests}
                                     />;
            case 'Campaigns': return <CampaignsTable campaigns={props.campaigns} />;
            case 'Users': return <UsersTable users={Object.values(props.users)} setUsers={props.setUsers} setNotifications={props.setNotifications} />;
            case 'Task Approvals': return <TaskApprovals submissions={props.submissions} setSubmissions={props.setSubmissions} users={props.users} setUsers={props.setUsers} />;
            case 'Deposit Approvals': return <DepositApprovals requests={props.depositRequests} setRequests={props.setDepositRequests} users={props.users} setUsers={props.setUsers} setNotifications={props.setNotifications} />;
            case 'Payment Approvals': return <PaymentApprovals requests={props.withdrawalRequests} setRequests={props.setWithdrawalRequests} users={props.users} setUsers={props.setUsers} setNotifications={props.setNotifications} />;
            case 'Announcements': return <Announcements announcements={props.announcements} setAnnouncements={props.setAnnouncements} />;
            default: return null;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 animate-fade-in">
            <h2 className="text-3xl font-bold font-display mb-4">Admin Panel</h2>
            <div className="border-b border-gray-200 dark:border-gray-800">
                <nav className="flex space-x-2 overflow-x-auto pb-2" aria-label="Tabs">
                    {(['Analytics', 'Task Approvals', 'Deposit Approvals', 'Payment Approvals', 'Users', 'Campaigns', 'Announcements'] as AdminTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${
                                activeTab === tab
                                    ? 'bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-300'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                            } whitespace-nowrap py-2 px-4 rounded-lg font-semibold text-sm transition-colors duration-200`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="mt-6">
                {renderTabContent()}
            </div>
        </div>
    );
};

const StatCard: React.FC<{ icon: React.ElementType, label: string, value: string | number, color: string }> = ({ icon: Icon, label, value, color }) => (
    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm flex items-center space-x-4 border border-gray-200 dark:border-gray-700">
        <div className={`p-4 rounded-full ${color}`}>
            <Icon className="h-7 w-7 text-white" />
        </div>
        <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);


const Analytics: React.FC<{ users: User[], campaigns: Campaign[], withdrawalRequests: WithdrawalRequest[], submissions: Submission[], depositRequests: DepositRequest[] }> = ({ users, campaigns, withdrawalRequests, submissions, depositRequests }) => {
    
    const totalPayouts = withdrawalRequests
        .filter(req => req.status === 'Approved')
        .reduce((sum, req) => sum + req.amount, 0);

    const pendingApprovals = submissions.filter(s => s.status === 'Pending').length + 
                             withdrawalRequests.filter(w => w.status === 'Pending').length +
                             depositRequests.filter(d => d.status === 'Pending').length;

    return (
        <div>
            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2"><BarChartIcon className="w-6 h-6"/><span>Platform Overview</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard icon={UsersIcon} label="Total Users" value={users.length} color="bg-blue-500" />
                 <StatCard icon={BriefcaseIcon} label="Active Campaigns" value={campaigns.filter(c => c.status === 'Active').length} color="bg-purple-500" />
                 <StatCard icon={DollarSignIcon} label="Total Payouts" value={`$${totalPayouts.toLocaleString()}`} color="bg-green-500" />
                 <StatCard icon={MegaphoneIcon} label="Pending Approvals" value={pendingApprovals} color="bg-yellow-500" />
            </div>
        </div>
    );
};

const TaskApprovals: React.FC<{ submissions: Submission[], setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>, users: Record<string, User>, setUsers: React.Dispatch<React.SetStateAction<Record<string, User>>> }> = ({ submissions, setSubmissions, users, setUsers }) => {
    const handleApproval = (id: string, status: 'Approved' | 'Rejected') => {
        const sub = submissions.find(s => s.id === id);
        if (!sub) return;

        setSubmissions(subs => subs.map(s => s.id === id ? { ...s, status } : s));

        if (status === 'Approved') {
            const task = MOCK_TASKS.find(t => t.id === sub.taskId);
            if (!task) return;

            setUsers(prevUsers => {
                const userToUpdate = prevUsers[sub.userId] as Engager;
                if (userToUpdate) {
                    const newEarnings = userToUpdate.earnings + task.payout;
                    const newXp = userToUpdate.xp + 10;
                    const newLevel = Math.floor(newXp / 100) + 1;
                    return { ...prevUsers, [sub.userId]: { ...userToUpdate, earnings: newEarnings, xp: newXp, level: newLevel } };
                }
                return prevUsers;
            });
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Task</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {submissions.map((sub: Submission) => {
                        const user = users[sub.userId];
                        if (!user) return null;
                        return (
                        <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white flex items-center">
                                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full mr-3" />
                                {user.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{sub.taskDescription}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm"><a href={sub.screenshotUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">View Proof</a></td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                               {sub.status === 'Pending' ? (
                                 <>
                                     <button onClick={() => handleApproval(sub.id, 'Approved')} className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200"><CheckIcon className="w-5 h-5"/></button>
                                     <button onClick={() => handleApproval(sub.id, 'Rejected')} className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200"><XIcon className="w-5 h-5"/></button>
                                 </>
                               ) : <span className={`text-xs font-semibold ${sub.status === 'Approved' ? 'text-green-500' : 'text-red-500'}`}>{sub.status}</span>}
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>
    );
};

const CampaignsTable: React.FC<{ campaigns: Campaign[] }> = ({ campaigns }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
             <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Campaign</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Budget</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {campaigns.map((campaign: Campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{campaign.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${campaign.budget.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{campaign.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-200 mr-4">Edit</button>
                            <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const UsersTable: React.FC<{ users: User[], setUsers: React.Dispatch<React.SetStateAction<Record<string, User>>>, setNotifications: React.Dispatch<React.SetStateAction<Notification[]>> }> = ({ users, setUsers, setNotifications }) => {

    const handleVerify = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (!user || user.role !== UserRole.Engager) return;
        setUsers(prev => ({ ...prev, [userId]: { ...prev[userId], isVerified: true } as Engager }));
        setNotifications(prev => [...prev, { id: `notif-${Date.now()}`, userId, message: 'Your account has been verified!', read: false, createdAt: new Date().toISOString() }]);
        alert(`A verification confirmation email has been sent to ${user.email}.`);
    };
    
    const handleApproveSubscription = (userId: string) => {
        setUsers(prev => ({ ...prev, [userId]: { ...prev[userId], isSubscribed: true, subscriptionPaymentPending: false } as Engager }));
        setNotifications(prev => [...prev, { id: Date.now().toString(), userId, message: 'Your subscription is approved! You can now access all tasks.', read: false, createdAt: new Date().toISOString() }]);
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                 <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {users.map((user: User) => {
                        const isEngager = user.role === UserRole.Engager;
                        const engager = isEngager ? user as Engager : null;
                        return (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"><div className="flex items-center"><img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full mr-3" /><span>{user.name}</span></div></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                    {isEngager && (engager.isSubscribed ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Subscribed</span> 
                                        : engager.subscriptionPaymentPending ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">Pending</span> 
                                        : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Inactive</span>)}
                                    {isEngager && (engager.isVerified ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Verified</span> : null)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {isEngager && engager.subscriptionPaymentPending && <button onClick={() => handleApproveSubscription(user.id)} className="text-blue-600 hover:underline dark:text-blue-400 mr-4">Approve Sub</button>}
                                    {isEngager && !engager.isVerified && <button onClick={() => handleVerify(user.id)} className="text-green-600 hover:underline dark:text-green-400 mr-4">Verify User</button>}
                                    <button className="text-yellow-600 hover:underline dark:text-yellow-400">Suspend</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

const DepositApprovals: React.FC<{ requests: DepositRequest[], setRequests: React.Dispatch<React.SetStateAction<DepositRequest[]>>, users: Record<string, User>, setUsers: React.Dispatch<React.SetStateAction<Record<string, User>>>, setNotifications: React.Dispatch<React.SetStateAction<Notification[]>> }> = ({ requests, setRequests, users, setUsers, setNotifications }) => {
    const handleApproval = (id: string, status: 'Approved' | 'Rejected') => {
        const req = requests.find(r => r.id === id);
        if (!req) return;

        setRequests(prevReqs => prevReqs.map(r => (r.id === id ? { ...r, status } : r)));

        if (status === 'Approved') {
            setUsers(prevUsers => {
                const userToUpdate = prevUsers[req.userId] as Creator;
                if (userToUpdate) {
                    const updatedUser = {
                        ...userToUpdate,
                        walletBalance: userToUpdate.walletBalance + req.amount,
                        transactions: [
                            ...userToUpdate.transactions,
                            {
                                id: `txn-${Date.now()}`,
                                type: 'deposit' as 'deposit',
                                description: `${req.paymentMethod} Deposit`,
                                amount: req.amount,
                                date: new Date().toISOString(),
                            },
                        ],
                    };
                    return { ...prevUsers, [req.userId]: updatedUser };
                }
                return prevUsers;
            });
            setNotifications(prev => [...prev, { id: `notif-${Date.now()}`, userId: req.userId, message: `Your deposit of $${req.amount.toFixed(2)} has been approved.`, read: false, createdAt: new Date().toISOString() }]);
        } else { // Rejected
             setNotifications(prev => [...prev, { id: `notif-${Date.now()}`, userId: req.userId, message: `Your deposit of $${req.amount.toFixed(2)} was rejected.`, read: false, createdAt: new Date().toISOString() }]);
        }
    };
    return (
     <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
             <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Method</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {requests.map((req: DepositRequest) => {
                    const user = users[req.userId];
                    if (!user) return null;
                    return (
                        <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white flex items-center"><img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full mr-3" />{user.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-mono">${req.amount.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{req.paymentMethod}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                {req.status === 'Pending' ? (
                                    <>
                                        <button onClick={() => handleApproval(req.id, 'Approved')} className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200"><CheckIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleApproval(req.id, 'Rejected')} className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200"><XIcon className="w-5 h-5"/></button>
                                    </>
                                ) : <span className={`text-xs font-semibold ${req.status === 'Approved' ? 'text-green-500' : 'text-red-500'}`}>{req.status}</span>}
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
    </div>
    );
};

const PaymentApprovals: React.FC<{ requests: WithdrawalRequest[], setRequests: React.Dispatch<React.SetStateAction<WithdrawalRequest[]>>, users: Record<string, User>, setUsers: React.Dispatch<React.SetStateAction<Record<string, User>>>, setNotifications: React.Dispatch<React.SetStateAction<Notification[]>> }> = ({ requests, setRequests, users, setUsers, setNotifications }) => {
    const handleApproval = (id: string, status: 'Approved' | 'Rejected') => {
        const req = requests.find(r => r.id === id);
        if (!req) return;

        setRequests(reqs => reqs.map(r => (r.id === id ? { ...r, status } : r)));

        if (status === 'Approved') {
            setUsers(prevUsers => {
                const userToUpdate = prevUsers[req.userId] as Engager;
                if (userToUpdate && userToUpdate.earnings >= req.amount) {
                    return { ...prevUsers, [req.userId]: { ...userToUpdate, earnings: userToUpdate.earnings - req.amount } };
                }
                console.warn(`User ${req.userId} has insufficient funds for withdrawal ${req.id}. Rejecting automatically.`);
                setRequests(reqs => reqs.map(r => (r.id === id ? { ...r, status: 'Rejected' } : r))); // Auto-reject if funds insufficient
                return prevUsers;
            });
            setNotifications(prev => [...prev, { id: `notif-${Date.now()}`, userId: req.userId, message: `Your withdrawal of $${req.amount.toFixed(2)} has been approved.`, read: false, createdAt: new Date().toISOString() }]);
        } else { // Rejected
             setNotifications(prev => [...prev, { id: `notif-${Date.now()}`, userId: req.userId, message: `Your withdrawal of $${req.amount.toFixed(2)} was rejected.`, read: false, createdAt: new Date().toISOString() }]);
        }
    };

    return (
     <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
             <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bank Details</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {requests.map((req: WithdrawalRequest) => {
                    const user = users[req.userId];
                    if (!user) return null;
                    return (
                        <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white flex items-center"><img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full mr-3" />{user.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-mono">${req.amount.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"><div>{req.bankName} ({req.bankCountry})</div><div className="font-mono">{req.accountNumber}</div></td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                {req.status === 'Pending' ? (
                                    <>
                                        <button onClick={() => handleApproval(req.id, 'Approved')} className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200"><CheckIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleApproval(req.id, 'Rejected')} className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200"><XIcon className="w-5 h-5"/></button>
                                    </>
                                ) : <span className={`text-xs font-semibold ${req.status === 'Approved' ? 'text-green-500' : 'text-red-500'}`}>{req.status}</span>}
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
    </div>
    );
};

const Announcements: React.FC<{ announcements: Announcement[], setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>> }> = ({ announcements, setAnnouncements }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        setAnnouncements(prev => [{ id: Date.now().toString(), title, content, createdAt: new Date().toISOString(), author: 'Admin' }, ...prev]);
        setTitle(''); setContent('');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="text-lg font-bold mb-4">Create New Announcement</h3>
                <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Platform Update" className="mt-1 block w-full bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
                        <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} placeholder="Describe the announcement..." className="mt-1 block w-full bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"></textarea>
                    </div>
                     <button type="submit" className="w-full bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200">
                        Post Announcement
                    </button>
                </form>
            </div>
             <div>
                <h3 className="text-lg font-bold mb-4">Recent Announcements</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {announcements.map(ann => (
                        <div key={ann.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                             <h4 className="font-semibold text-gray-800 dark:text-gray-200">{ann.title}</h4>
                             <p className="text-sm text-gray-600 dark:text-gray-400">{ann.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;