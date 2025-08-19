import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getNotionApiKey, 
  setNotionApiKey, 
  getNotionPageId, 
  setNotionPageId,
  getNotionEnabled,
  setNotionEnabled,
  getDictionaryEnabled,
  setDictionaryEnabled
} from '../services/preferences';
import { testNotionConnection } from '../services/notion';
import { useToast } from '../contexts/ToastContext';

interface NotionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotionModal: React.FC<NotionModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useToast();
  const [apiKey, setApiKeyState] = useState('');
  const [pageId, setPageIdState] = useState('');
  const [enabled, setEnabledState] = useState(false);
  const [dictionaryEnabled, setDictionaryEnabledState] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKeyState(getNotionApiKey() || '');
      setPageIdState(getNotionPageId() || '');
      setEnabledState(getNotionEnabled());
      setDictionaryEnabledState(getDictionaryEnabled());
    }
  }, [isOpen]);

  const handleSave = async () => {
    try {
      if (enabled && (!apiKey.trim() || !pageId.trim())) {
        addToast('Please provide both API key and page ID', 'error');
        return;
      }

      if (enabled) {
        setIsTestingConnection(true);
        const isValid = await testNotionConnection(apiKey.trim(), pageId.trim());
        
        if (!isValid) {
          addToast('Invalid Notion credentials or page not accessible', 'error');
          setIsTestingConnection(false);
          return;
        }
      }

      setNotionApiKey(apiKey.trim());
      setNotionPageId(pageId.trim());
      setNotionEnabled(enabled);
      setDictionaryEnabled(dictionaryEnabled);
      
      addToast('Settings saved successfully', 'success');
      onClose();
    } catch (error) {
      console.error('Error saving Notion settings:', error);
      addToast('Failed to save Notion settings', 'error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim() || !pageId.trim()) {
      addToast('Please provide both API key and page ID', 'error');
      return;
    }

    setIsTestingConnection(true);
    try {
      const isValid = await testNotionConnection(apiKey.trim(), pageId.trim());
      
      if (isValid) {
        addToast('Connection successful!', 'success');
      } else {
        addToast('Connection failed. Check your credentials and page access.', 'error');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      addToast('Connection test failed', 'error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="w-full max-w-lg bg-dark-card rounded-xl border border-dark-border shadow-xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-dark-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-dark-text">
                      Settings
                    </h2>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg text-dark-textMuted hover:text-dark-text hover:bg-dark-bg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="px-6 py-4 space-y-6">
                  {/* Dictionary Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-dark-text font-medium">Oxford Dictionary Lookup</h3>
                      <p className="text-sm text-dark-textMuted">
                        Show dictionary definitions with "Lookup" button
                      </p>
                      <p className="text-xs text-dark-textMuted mt-1 text-yellow-400">
                        ⚠️ Currently works with English words only
                      </p>
                    </div>
                    <button
                      onClick={() => setDictionaryEnabledState(!dictionaryEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        dictionaryEnabled ? 'bg-dark-accent' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          dictionaryEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Notion Integration Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-dark-text font-medium">Enable Notion Integration</h3>
                      <p className="text-sm text-dark-textMuted">
                        Add translated words to your Notion page
                      </p>
                    </div>
                    <button
                      onClick={() => setEnabledState(!enabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        enabled ? 'bg-dark-accent' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {enabled && (
                    <>
                      {/* API Key Input */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-dark-text">
                          Notion API Key
                        </label>
                        <input
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKeyState(e.target.value)}
                          placeholder="secret_..."
                          className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-textMuted focus:ring-2 focus:ring-dark-accent focus:border-transparent"
                        />
                        <p className="text-xs text-dark-textMuted">
                          Create an integration at{' '}
                          <a 
                            href="https://www.notion.so/my-integrations" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-dark-accent hover:underline"
                          >
                            notion.so/my-integrations
                          </a>
                        </p>
                      </div>

                      {/* Page ID Input */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-dark-text">
                          Notion Page ID or URL
                        </label>
                        <input
                          type="text"
                          value={pageId}
                          onChange={(e) => setPageIdState(e.target.value)}
                          placeholder="Page URL or ID (e.g., https://notion.so/...)"
                          className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-textMuted focus:ring-2 focus:ring-dark-accent focus:border-transparent"
                        />
                        <p className="text-xs text-dark-textMuted">
                          Make sure to share the page with your integration
                        </p>
                      </div>

                      {/* Test Connection Button */}
                      <button
                        onClick={handleTestConnection}
                        disabled={isTestingConnection || !apiKey.trim() || !pageId.trim()}
                        className="w-full px-4 py-2 bg-dark-accent hover:bg-dark-accentHover disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                      >
                        {isTestingConnection ? 'Testing Connection...' : 'Test Connection'}
                      </button>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-dark-border flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-dark-textMuted hover:text-dark-text transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isTestingConnection}
                    className="px-4 py-2 bg-dark-accent hover:bg-dark-accentHover disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {isTestingConnection ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotionModal;
