import React, { useState } from 'react';
import { Campaign, Engager, Submission, WithdrawalRequest, Announcement, User, UserRole, Creator, Notification, Task } from '../types';
import { CheckIcon, XIcon, BarChartIcon, CheckCircleIcon, MegaphoneIcon } from './icons';
import { MOCK_TASKS } from '../constants';


type AdminTab = 'Analytics' | 'Campaigns' | 'Users' | 'Task Approvals' | 'Payment Approvals' | 'Announcements';

interface AdminDashboardProps {
    submissions: Submission[];
    setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
    withdrawalRequests: WithdrawalRequest[];
    setWithdrawalRequests: React.Dispatch<React.SetStateAction<WithdrawalRequest[]>>;
    announcements: Announcement[];
    setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
    users: Record<string, User>;
    setUsers: React.Dispatch<React.SetStateAction<Record<string, User>>>;
    campaigns: Campaign[];
    notifications: Notification[];
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('Task Approvals');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Analytics':
                return <Analytics />;
            case 'Campaigns':
                return <CampaignsTable campaigns={props.campaigns} />;
            case 'Users':
                return <UsersTable users={Object.values(props.users)} setUsers={props.setUsers} setNotifications={props.setNotifications} />;
            case 'Task Approvals':
                return <TaskApprovals submissions={props.submissions} setSubmissions={props.setSubmissions} users={props.users} setUsers={props.setUsers} />;
            case 'Payment Approvals':
                return <PaymentApprovals requests={props.withdrawalRequests} setRequests={props.setWithdrawalRequests} users={props.users} />;
            case 'Announcements':
                return <Announcements announcements={props.announcements} setAnnouncements={props.setAnnouncements} />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {(['Analytics', 'Task Approvals', 'Payment Approvals', 'Users', 'Campaigns', 'Announcements'] as AdminTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${
                                activeTab === tab
                                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
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

const Analytics: React.FC = () => {
    const data = [
        { day: 'Mon', tasks: 120 },
        { day: 'Tue', tasks: 180 },
        { day: 'Wed', tasks: 150 },
        { day: 'Thu', tasks: 210 },
        { day: 'Fri', tasks: 300 },
        { day: 'Sat', tasks: 250 },
        { day: 'Sun', tasks: 280 },
    ];
    const maxTasks = Math.max(...data.map(d => d.tasks));
    
    return (
        <div>
            <h3 className="text-lg font-bold mb-4 flex items-center space-x-2"><BarChartIcon className="w-5 h-5"/><span>Tasks Completed This Week</span></h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg flex justify-around items-end" style={{ height: '300px' }}>
                {data.map(item => (
                    <div key={item.day} className="flex flex-col items-center">
                        <div 
                            className="w-10 bg-primary-500 rounded-t-md hover:bg-primary-600 transition-all"
                            style={{ height: `${(item.tasks / maxTasks) * 100}%` }}
                            title={`${item.tasks} tasks`}
                        ></div>
                        <span className="text-sm mt-2 font-medium text-gray-600 dark:text-gray-400">{item.day}</span>
                    </div>
                ))}
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
            if (!task) {
                console.error("Task not found for submission:", sub);
                return;
            }

            setUsers(prevUsers => {
                const userToUpdate = prevUsers[sub.userId] as Engager;
                if (userToUpdate) {
                    const newEarnings = userToUpdate.earnings + task.payout;
                    const newXp = userToUpdate.xp + 10; // Award 10 XP per approved task
                    const newLevel = Math.floor(newXp / 100) + 1;

                    return {
                        ...prevUsers,
                        [sub.userId]: { ...userToUpdate, earnings: newEarnings, xp: newXp, level: newLevel }
                    };
                }
                return prevUsers;
            });
        }
    };


    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Task</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Screenshot</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {submissions.map((sub: Submission) => {
                        const user = users[sub.userId];
                        if (!user) return null;
                        return (
                        <tr key={sub.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white flex items-center">
                                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full mr-3" />
                                {user.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{sub.taskDescription}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <a href={sub.screenshotUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">View Proof</a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{sub.status}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                               {sub.status === 'Pending' && (
                                 <>
                                     <button onClick={() => handleApproval(sub.id, 'Approved')} className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200"><CheckIcon className="w-5 h-5"/></button>
                                     <button onClick={() => handleApproval(sub.id, 'Rejected')} className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200"><XIcon className="w-5 h-5"/></button>
                                 </>
                               )}
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
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Campaign</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Budget</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {campaigns.map((campaign: Campaign) => (
                    <tr key={campaign.id}>
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

        setUsers(prevUsers => {
            const userToUpdate = prevUsers[userId];
            if (userToUpdate && userToUpdate.role === UserRole.Engager) {
                return {
                    ...prevUsers,
                    [userId]: { ...userToUpdate, isVerified: true }
                };
            }
            return prevUsers;
        });

        // Add notification for the user
        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            userId: userId,
            message: 'Your account has been verified!',
            read: false,
            createdAt: new Date().toISOString(),
        };
        setNotifications(prev => [newNotification, ...prev]);

        // Simulate sending a verification email
        alert(`A verification confirmation email has been sent to ${user.email}.`);
    };
    
    const handleApproveSubscription = (userId: string) => {
        setUsers(prevUsers => {
            const userToUpdate = prevUsers[userId];
            if (userToUpdate && userToUpdate.role === UserRole.Engager) {
                return {
                    ...prevUsers,
                    [userId]: { ...userToUpdate, isSubscribed: true, subscriptionPaymentPending: false }
                };
            }
            return prevUsers;
        });
        const newNotification: Notification = { 
            id: Date.now().toString(), 
            userId, 
            message: 'Your subscription has been approved! You can now access all tasks.', 
            read: false, 
            createdAt: new Date().toISOString() 
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subscription</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Verification</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user: User) => {
                        const isEngager = user.role === UserRole.Engager;
                        const engager = isEngager ? user as Engager : null;

                        return (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    <div className="flex items-center">
                                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full mr-3" />
                                        <span>{user.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {isEngager && (
                                        engager.isSubscribed ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Subscribed</span> 
                                        : engager.subscriptionPaymentPending ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Pending Payment</span> 
                                        : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Not Subscribed</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {isEngager && (engager.isVerified ? 
                                        <span className="flex items-center space-x-1 text-green-600 dark:text-green-400"><CheckCircleIcon className="w-4 h-4" /> <span>Verified</span></span> : 
                                        <span className="text-yellow-600 dark:text-yellow-400">Not Verified</span>)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {isEngager && engager.subscriptionPaymentPending && !engager.isSubscribed && <button onClick={() => handleApproveSubscription(user.id)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 mr-4">Approve Sub</button>}
                                    {isEngager && !engager.isVerified && <button onClick={() => handleVerify(user.id)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200 mr-4">Verify User</button>}
                                    <button className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-200">Suspend</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};


const PaymentApprovals: React.FC<{ requests: WithdrawalRequest[], setRequests: React.Dispatch<React.SetStateAction<WithdrawalRequest[]>>, users: Record<string, User> }> = ({ requests, setRequests, users }) => {
    const handleApproval = (id: string, status: 'Approved' | 'Rejected') => {
        setRequests(reqs => reqs.map(r => r.id === id ? { ...r, status } : r));
    };

    return (
     <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bank Details</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {requests.map((req: WithdrawalRequest) => {
                    const user = users[req.userId];
                    if (!user) return null;
                    return (
                        <tr key={req.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white flex items-center">
                                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full mr-3" />
                                {user.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${req.amount.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                <div>{req.bankName} ({req.bankCountry})</div>
                                <div>{req.accountNumber}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{req.status}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                {req.status === 'Pending' && (
                                    <>
                                        <button onClick={() => handleApproval(req.id, 'Approved')} className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200"><CheckIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleApproval(req.id, 'Rejected')} className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200"><XIcon className="w-5 h-5"/></button>
                                    </>
                                )}
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

        const newAnnouncement: Announcement = {
            id: Date.now().toString(),
            title,
            content,
            createdAt: new Date().toISOString(),
            author: 'Admin',
        };
        setAnnouncements(prev => [newAnnouncement, ...prev]);
        setTitle('');
        setContent('');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="text-lg font-bold mb-4">Create New Announcement</h3>
                <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Platform Update" className="mt-1 block w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
                        <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} placeholder="Describe the announcement..." className="mt-1 block w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500"></textarea>
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
                        <div key={ann.id} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
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