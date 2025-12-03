import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom driver icon
const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapCenterUpdaterProps {
  lat: number;
  lng: number;
}

const MapCenterUpdater = ({ lat, lng }: MapCenterUpdaterProps) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  
  return null;
};

interface DriverTrackingMapProps {
  latitude: number;
  longitude: number;
  status?: string;
  showDriverLabel?: boolean;
}

const DriverTrackingMap = ({ 
  latitude, 
  longitude, 
  status = 'out_for_delivery',
  showDriverLabel = true 
}: DriverTrackingMapProps) => {
  // Default to Kuwait City if no coordinates
  const defaultLat = 29.3759;
  const defaultLng = 47.9774;
  
  const lat = latitude || defaultLat;
  const lng = longitude || defaultLng;

  return (
    <div className="w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={driverIcon}>
          {showDriverLabel && (
            <Popup>
              <div className="text-center">
                <strong>🚗 Driver Location</strong>
                <br />
                <span className="text-sm text-muted-foreground">
                  {status === 'delivered' ? 'Delivery completed' : 'On the way'}
                </span>
              </div>
            </Popup>
          )}
        </Marker>
        <MapCenterUpdater lat={lat} lng={lng} />
      </MapContainer>
    </div>
  );
};

export default DriverTrackingMap;
