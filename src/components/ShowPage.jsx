import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import configs from '../../utils/config';

const ShowPage = () => {
  const { url } = useParams();
  const iframeRef = useRef(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch the component code
  useEffect(() => {
    const fetchCode = async () => {
      try {
        const res = await fetch(`${configs.API_URL}/component/${url}`);
        const data = await res.json();

        if (!res.ok || !data.code) throw new Error(data.message || 'Component not found');
        setCode(data.code); // Store the component code
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCode();
  }, [url]);

  useEffect(() => {
    if (!code || !iframeRef.current) return;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${url}</title>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- React and ReactDOM -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  
  <!-- Babel for JSX -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
    }
    html, body, #root {
      height: 100%;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
    // Insert the received code here (React Component JSX)
    ${code}

    // Safeguard: Check if the App  component is defined.
    const root = document.getElementById('root');
    const AppComponent = typeof App === 'function' ? App : () => React.createElement('div', null, '⚠️ App component not found');
    
    // Render the component
    ReactDOM.createRoot(root).render(<AppComponent />);
  </script>
</body>
</html>
    `.trim();

    // Create a Blob URL for the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    iframeRef.current.src = blobUrl;

    // Cleanup on unmount
    return () => URL.revokeObjectURL(blobUrl); // Cleanup URL
  }, [code]);

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-600 text-center p-4">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <iframe
        ref={iframeRef}
        title="Rendered React Component"
        className="w-full h-screen"
        style={{ border: 'none' }}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default ShowPage;
