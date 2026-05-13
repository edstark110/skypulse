// Right-side map panel — wraps the Globe in route mode.

import Globe from './Globe.jsx';

export default function MapPanel() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <Globe routeMode />
    </div>
  );
}
