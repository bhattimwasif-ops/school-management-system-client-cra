import { RouterProvider } from 'react-router-dom';
import router from './router';

function App() {
  return (
    <div className="container mx-auto p-4">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;