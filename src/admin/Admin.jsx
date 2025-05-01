import React, { useState, useEffect } from 'react';
import configs from '../../utils/config';

function Admin() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [fileError, setFileError] = useState('');
  const [components, setComponents] = useState([]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (password.trim() !== '') {
      setAuthenticated(true);
      await fetchComponents(password);
    }
  };

  const reloadDynamicRoutes = async (password) => {
    try {
      const res = await fetch(`${configs.API_URL}/reload/${password}`, {
        method: 'POST',
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reload failed');
  
      console.log('✅ Dynamic routes reloaded:', data.message);
      return { success: true, message: data.message };
    } catch (err) {
      console.error('❌ Failed to reload dynamic routes:', err.message);
      return { success: false, message: err.message };
    }
  };
  

  const fetchComponents = async () => {
    try {
      const res = await fetch(`${configs.API_URL}/all-components`);
      const data = await res.json();
      if (res.ok) setComponents(data.components || []);
    } catch (err) {
      console.error('Failed to fetch components:', err);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = () => {
        setCode(reader.result);
      };
      reader.readAsText(file);
      setFileError('');
    } else {
      setFileError('Only .txt files are allowed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      url,
      code,
      description,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${configs.API_URL}/submit/${password}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      alert(data.status === 'ok' ? 'Success' : 'Something went wrong!');
      if (data.status === 'ok') {
        fetchComponents(password);
        setShowForm(false);
        setUrl('');
        setCode('');
        setDescription('');
        reloadDynamicRoutes(password);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Submission failed.');
    }
  };

  const handleDelete = async (urlToDelete) => {
    if (!window.confirm('Are you sure you want to delete this component?')) return;
    try {
      const res = await fetch(`${configs.API_URL}/delete-component/${password}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToDelete }),
      });
      const result = await res.json();
      if (result.status === 'ok') {
        setComponents((prev) => prev.filter((comp) => comp.url !== urlToDelete));
      }
    } catch (err) {
      alert('Failed to delete.');
    }
  };

  const handleEdit = (comp) => {
    setShowForm(true);
    setUrl(comp.url);
    setCode(comp.code);
    setDescription(comp.description || '');
  };

  const handlePreview = (url) => {
    window.open(`/${url}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white-100 p-6 font-sans">
      {!authenticated && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form
            onSubmit={handlePasswordSubmit}
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm"
          >
            <h2 className="text-lg font-semibold mb-16">Enter Password</h2>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Submit
            </button>
          </form>
        </div>
      )}


      {authenticated && (
        <>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4"
          >
            {showForm ? 'Go Back to list' : 'Add Page'}
          </button>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mt-6 max-w-2xl">
              <div className="mb-4">
                <label className="block font-medium mb-1">URL to host:</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block font-medium mb-1">Paste your code:</label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={10}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block font-medium mb-1">Describe your page:</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={10}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block font-medium mb-1">Or upload .txt file:</label>
                <input type="file" accept=".txt" onChange={handleFileUpload} className="block" />
                {fileError && <p className="text-red-600 mt-1">{fileError}</p>}
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </form>
          )}

          {!showForm && components.length > 0 && (
            <table className="w-full bg-white shadow rounded mb-6">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3">URL</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {components.map((comp) => (
                  <tr key={comp.url} className="border-t">
                    <td className="p-3 font-mono text-sm">{comp.url}</td>
                    <td className="p-3 space-x-2">
                      <button
                        className="px-3 py-1 bg-blue-500 text-white rounded"
                        onClick={() => handlePreview(comp.url)}
                      >
                        Open
                      </button>
                      <button
                        className="px-3 py-1 bg-yellow-500 text-white rounded"
                        onClick={() => handleEdit(comp)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded"
                        onClick={() => handleDelete(comp.url)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}


    </div>
  );
}

export default Admin;
