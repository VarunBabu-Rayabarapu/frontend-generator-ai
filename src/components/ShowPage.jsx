import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import configs from '../../utils/config';

const ShowPage = () => {
  const { url } = useParams();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Check if Babel is available globally
  const babel = window.Babel;

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

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-600 text-center p-4">Error: {error}</div>;

  // Create a dynamic component from the received code string
  const DynamicComponent = () => {
    if (!babel) {
      return <div>Error: Babel is not loaded!</div>;
    }

    try {
      // Transform the JSX into JavaScript
      const transformedCode = babel.transform(code, {
        presets: ['react'],
      }).code; // Transforms JSX to JS code

      // Use new Function to create the component from the transformed code
      const componentFunction = new Function('React', `return ${transformedCode}`);  // Dynamically create the component
      const Component = componentFunction(React); // Pass React as a context to the component

      if (typeof Component !== 'function') {
        throw new Error('Invalid component returned');
      }

      // Render the dynamically created component
      return <Component />;
    } catch (err) {
      console.error('Error in evaluating the dynamic component code:', err);
      return <div>Error rendering component: {err.message}</div>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <DynamicComponent />
    </div>
  );
};

export default ShowPage;
