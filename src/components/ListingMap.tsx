
'use client';

import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { LatLngLiteral } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, PersonStanding, Clock, AlertTriangle, Route } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from './ui/badge';

interface ListingMapProps {
  listingLocation: LatLngLiteral;
  universityLocation: LatLngLiteral;
  universityName: string;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
  width: '100%',
  height: '300px', // Adjusted height
  borderRadius: '0.5rem', 
};

const libraries: ('places' | 'directions')[] = ['places', 'directions'];

interface TravelInfo {
  distance: string;
  duration: string;
}

export function ListingMap({ listingLocation, universityLocation, universityName }: ListingMapProps) {
  const [directionsDriving, setDirectionsDriving] = useState<google.maps.DirectionsResult | null>(null);
  const [directionsWalking, setDirectionsWalking] = useState<google.maps.DirectionsResult | null>(null);
  
  const [travelInfoDriving, setTravelInfoDriving] = useState<TravelInfo | null>(null);
  const [travelInfoWalking, setTravelInfoWalking] = useState<TravelInfo | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const directionsCallback = useCallback(
    (
      response: google.maps.DirectionsResult | null,
      status: google.maps.DirectionsStatus,
      mode: 'DRIVING' | 'WALKING'
    ) => {
      if (status === 'OK' && response) {
        const route = response.routes[0]?.legs[0];
        if (route?.distance?.text && route?.duration?.text) {
          const info = { distance: route.distance.text, duration: route.duration.text };
          if (mode === 'DRIVING') {
            setDirectionsDriving(response);
            setTravelInfoDriving(info);
          } else {
            // Don't set directions for walking to avoid clutter, just info
            setTravelInfoWalking(info);
          }
        } else {
           setError(`Não foi possível obter informações de rota (${mode}).`);
        }
      } else {
        console.warn(`Directions request failed for ${mode} due to ${status}`);
        setError(`Falha ao calcular rota (${mode}): ${status}`);
      }
    },
    []
  );

  const center = useMemo(() => {
    if (listingLocation && universityLocation) {
      return {
        lat: (listingLocation.lat + universityLocation.lat) / 2,
        lng: (listingLocation.lng + universityLocation.lng) / 2,
      };
    }
    return listingLocation || universityLocation; // Fallback if one is missing
  }, [listingLocation, universityLocation]);


  if (!API_KEY || API_KEY === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-destructive" /> API Key Faltando</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            A chave da API do Google Maps não está configurada. Por favor, adicione 
            <code className="mx-1 rounded bg-muted px-1 py-0.5 font-mono text-sm">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> 
            ao seu arquivo de ambiente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <LoadScript googleMapsApiKey={API_KEY} libraries={libraries} onLoad={() => setMapReady(true)} onError={() => setError("Falha ao carregar Google Maps SDK.")}>
        {mapReady ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={13} // Adjust zoom as needed
          >
            {listingLocation && <Marker position={listingLocation} title="Local do Quarto" />}
            {universityLocation && <Marker position={universityLocation} title={universityName} icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }} />}
            
            {/* Directions for Driving */}
            {listingLocation && universityLocation && (
              <DirectionsService
                options={{
                  destination: universityLocation,
                  origin: listingLocation,
                  travelMode: google.maps.TravelMode.DRIVING,
                }}
                callback={(res, status) => directionsCallback(res, status, 'DRIVING')}
              />
            )}

            {/* Directions for Walking (only for info, not rendering path by default) */}
            {listingLocation && universityLocation && !travelInfoWalking && (
               <DirectionsService
                options={{
                  destination: universityLocation,
                  origin: listingLocation,
                  travelMode: google.maps.TravelMode.WALKING,
                }}
                callback={(res, status) => directionsCallback(res, status, 'WALKING')}
              />
            )}

            {directionsDriving && (
              <DirectionsRenderer
                options={{
                  directions: directionsDriving,
                  polylineOptions: { strokeColor: 'hsl(var(--primary))', strokeWeight: 4 },
                  markerOptions: { visible: false } // Hide default A/B markers if custom ones are used
                }}
              />
            )}
          </GoogleMap>
        ) : (
          <Skeleton className="h-[300px] w-full rounded-lg" />
        )}
      </LoadScript>

      {error && (
        <Badge variant="destructive" className="w-full justify-center p-2 text-center">
          <AlertTriangle className="mr-2 h-4 w-4" /> {error}
        </Badge>
      )}

      {(travelInfoDriving || travelInfoWalking) && (
        <Card className="shadow-sm">
            <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-base font-medium flex items-center">
                    <Route className="mr-2 h-5 w-5 text-primary" /> Distância até {universityName}
                </CardTitle>
            </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm pt-2">
            {travelInfoDriving ? (
              <div className="flex items-center space-x-2">
                <Car className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">{travelInfoDriving.duration}</p>
                  <p className="text-xs text-muted-foreground">De carro ({travelInfoDriving.distance})</p>
                </div>
              </div>
            ) : mapReady && !error && <Skeleton className="h-10 w-full" />}
            
            {travelInfoWalking ? (
              <div className="flex items-center space-x-2">
                <PersonStanding className="h-5 w-5 text-muted-foreground" />
                 <div>
                  <p className="font-medium text-foreground">{travelInfoWalking.duration}</p>
                  <p className="text-xs text-muted-foreground">A pé ({travelInfoWalking.distance})</p>
                </div>
              </div>
            ) : mapReady && !error && <Skeleton className="h-10 w-full" />}
          </CardContent>
        </Card>
      )}
       {!mapReady && !error && (!travelInfoDriving || !travelInfoWalking) && (
         <Card className="shadow-sm">
            <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-base font-medium flex items-center">
                    <Skeleton className="h-5 w-5 mr-2" /> <Skeleton className="h-5 w-3/4" />
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm pt-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
         </Card>
       )}
    </div>
  );
}
