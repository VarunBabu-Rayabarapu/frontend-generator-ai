// AdminPage.jsx
import React, { useState } from 'react';
import configs from '../../utils/config';

const AiAdminPage = () => {
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const generateAndSubmit = async () => {
    setLoading(true);
    setMessage('');
    try {
      // Step 1: Generate code from description
      const aiRes = await fetch(`${configs.API_URL}/generate-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      const aiData = await aiRes.json();

      if (!aiRes.ok || !aiData.code) throw new Error(aiData.message || 'AI generation failed');

      // Step 2: Submit the generated code
      const submitRes = await fetch(
        `${configs.API_URL}/component/submit/${configs.MASTER_PASSWORD}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            code: aiData.code,
            createdAt: new Date().toISOString(),
          }),
        }
      );

      const submitData = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitData.message || 'Submission failed');

      setMessage('✅ Page successfully created and submitted!');
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-center">🧠 AI Page Generator</h2>
      <input
        type="text"
        placeholder="Enter page URL (e.g., amazon)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <textarea
        placeholder="Describe the page you want (e.g., An Amazon-like homepage with navbar, search, and product listings)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded h-40"
      />
      <button
        onClick={generateAndSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Generating...' : 'Generate & Submit'}
      </button>
      {message && <p className="text-center">{message}</p>}
    </div>
  );
};

export default AiAdminPage;
