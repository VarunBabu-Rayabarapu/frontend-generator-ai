import React, { useState } from 'react';
import configs from '../../utils/config';

function Admin() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState();
  const [code, setCode] = useState('');
  const [fileError, setFileError] = useState('');

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password.trim() !== '') {
      setAuthenticated(true);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Success:', data);
      alert(data.status === 'ok' ? 'Success' : 'Something went wrong!');
    } catch (error) {
      console.error('Error:', error);
      alert('Submission failed.');
    }
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

      {authenticated && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Page
        </button>
      )}

      {authenticated && showForm && (
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
    </div>
  );
}

export default Admin;
