'use client';

import { useState, useEffect } from 'react';

export default function TestStoragePage() {
  const [testResult, setTestResult] = useState('');
  const [token, setToken] = useState('');
  const [user, setUser] = useState('');

  useEffect(() => {
    checkStorage();
  }, []);

  const checkStorage = () => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      setToken(token || 'No token found');
      setUser(user || 'No user found');
      setTestResult('localStorage is working!');
    } catch (error: any) {
      setTestResult('localStorage ERROR: ' + error.message);
    }
  };

  const testWrite = () => {
    try {
      const testToken = 'test-token-' + Date.now();
      const testUser = JSON.stringify({ id: '1', username: 'test' });
      
      localStorage.setItem('token', testToken);
      localStorage.setItem('user', testUser);
      
      const readToken = localStorage.getItem('token');
      const readUser = localStorage.getItem('user');
      
      if (readToken === testToken && readUser === testUser) {
        setTestResult('✅ Write test PASSED!');
        setToken(readToken);
        setUser(readUser);
      } else {
        setTestResult('❌ Write test FAILED - data mismatch');
      }
    } catch (error: any) {
      setTestResult('❌ Write test FAILED: ' + error.message);
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    checkStorage();
    setTestResult('Storage cleared');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">localStorage Test Page</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded">
            <h2 className="font-bold mb-2">Test Result:</h2>
            <p className="text-lg">{testResult}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded">
            <h2 className="font-bold mb-2">Current Token:</h2>
            <p className="font-mono text-sm break-all">{token}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded">
            <h2 className="font-bold mb-2">Current User:</h2>
            <p className="font-mono text-sm break-all">{user}</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={testWrite}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Test Write
            </button>
            <button
              onClick={checkStorage}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Refresh
            </button>
            <button
              onClick={clearStorage}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Clear Storage
            </button>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 rounded border border-yellow-200">
            <h3 className="font-bold mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Click "Test Write" to write test data to localStorage</li>
              <li>If it shows "✅ Write test PASSED!", localStorage is working</li>
              <li>Go back to <a href="/login" className="text-blue-600 underline">/login</a> and try logging in</li>
              <li>Come back here to see if the login data was saved</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
