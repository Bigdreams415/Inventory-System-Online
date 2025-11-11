import React, { useState } from 'react';

const Settings: React.FC = () => {
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const handleSave = async () => {
        setSaving(true);
        setSaveMessage('');
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSaveMessage('Settings saved successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            setSaveMessage('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Settings</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                    Manage your pharmacy system configuration
                </p>
            </div>

            {/* Save Message */}
            {saveMessage && (
                <div className={`mb-6 p-4 rounded-lg text-sm sm:text-base ${
                    saveMessage.includes('Error') 
                        ? 'bg-red-100 border border-red-400 text-red-700'
                        : 'bg-green-100 border border-green-400 text-green-700'
                }`}>
                    {saveMessage}
                </div>
            )}

            {/* Tab */}
            <div className="bg-white rounded-t-lg shadow-sm border border-gray-200 mb-0">
                <nav className="flex overflow-x-auto scrollbar-hide">
                    <button className="flex items-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 font-medium text-blue-700 border-b-2 border-blue-700 bg-blue-50 whitespace-nowrap text-sm sm:text-base">
                        <span className="text-lg">Backup & Data</span>
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-b-lg rounded-r-lg shadow-sm border border-t-0 border-gray-200 p-4 sm:p-6 lg:p-8">
                <div className="space-y-6 sm:space-y-8">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Backup & Data Management</h2>
                    
                    {/* Action Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {/* Export Card */}
                        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center hover:border-green-300 transition-colors">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                <span className="text-2xl">Export</span>
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Export Data</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-4 px-2">
                                Export your sales, inventory, and customer data
                            </p>
                            <button className="w-full sm:w-auto bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                                Export Now
                            </button>
                        </div>

                        {/* Import Card */}
                        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center hover:border-blue-300 transition-colors">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                <span className="text-2xl">Import</span>
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Import Data</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-4 px-2">
                                Import products, customers, or sales data
                            </p>
                            <button className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                Import Data
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 max-w-full">
                        <h4 className="font-semibold text-red-800 mb-2 text-sm sm:text-base">⚠️ Danger Zone</h4>
                        <p className="text-xs sm:text-sm text-red-700 mb-4">
                            Permanent actions that cannot be undone. Please proceed with caution.
                        </p>
                        <button className="w-full sm:w-auto bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                            Clear All Data
                        </button>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-gray-200">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full sm:w-auto bg-blue-600 text-white px-6 sm:px-10 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <span>Save Settings</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;