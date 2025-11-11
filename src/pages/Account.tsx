import React from 'react';

interface AccountProps {}

const Account: React.FC<AccountProps> = () => {
    return (
        <div className="account-container">
            <div className="account-header">
                <h1>Account Settings</h1>
            </div>
            
            <div className="account-content">
                <section className="profile-section">
                    <h2>Profile Information</h2>
                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" placeholder="Enter username" />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" placeholder="Enter email" />
                    </div>
                </section>

                <section className="security-section">
                    <h2>Security</h2>
                    <div className="form-group">
                        <label>Current Password</label>
                        <input type="password" placeholder="Enter current password" />
                    </div>
                    <div className="form-group">
                        <label>New Password</label>
                        <input type="password" placeholder="Enter new password" />
                    </div>
                </section>

                <div className="account-actions">
                    <button className="btn-primary">Save Changes</button>
                    <button className="btn-secondary">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default Account;