import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// Resolve Leaflet marker image loading bug in React build pipelines
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function LeafletMap({ lat, lng, station, unit }) {
  const position = [lat || 28.6143, lng || 77.2088]; // Fallback to New Delhi coordinates

  return (
    <div className="w-full h-80 rounded-lg overflow-hidden border border-tactical-gold/30 shadow-inner relative">
      {/* HUD Coordinate Stamp */}
      <div className="absolute top-3 left-3 bg-military-black/85 border border-tactical-gold/40 px-3 py-1.5 rounded z-[1000] font-mono text-[10px] text-tactical-khaki select-none shadow-md">
        <div className="text-tactical-gold font-bold">TACTICAL POSITION</div>
        <div>LAT: {position[0].toFixed(4)}° N</div>
        <div>LNG: {position[1].toFixed(4)}° E</div>
      </div>

      <MapContainer 
        center={position} 
        zoom={6} 
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        {/* CartoDB Dark Matter map layer - perfect for our dark military theme */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Radar Ring representing operational/deployment sector */}
        <Circle
          center={position}
          pathOptions={{ 
            color: '#d4af37', 
            fillColor: '#2d4a2d', 
            fillOpacity: 0.15,
            weight: 1.5,
            dashArray: '5, 5'
          }}
          radius={80000} // 80km military operation buffer zone
        />

        <Marker position={position}>
          <Popup className="font-mono text-xs">
            <div className="font-bold text-amber-700">{unit}</div>
            <div>STATION: {station}</div>
            <div className="text-[10px] text-gray-500">COORDS: {position[0]}, {position[1]}</div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
