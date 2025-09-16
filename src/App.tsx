import React, { useState } from "react";
import axios from "axios";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "450px",
};

interface GeocodeResponse {
  status: string;
  results: {
    formatted_address: string;
    geometry: {
      location: { lat: number; lng: number };
    };
  }[];
}

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [formatted, setFormatted] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || "AIzaSyD2GCanK5Gxm26zDyPrKc7MNy7WhAJZK7M";

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: mapsKey,
  });

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    if (!address.trim()) {
      setError("Escribe una dirección");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get<GeocodeResponse>(
        "https://maps.googleapis.com/maps/api/geocode/json",
        {
          params: {
            address: address,
            key: mapsKey,
          },
        }
      );

      console.log(response.data);

      if (response.data.status !== "OK" || !response.data.results?.length) {
        setError("No se encontraron resultados");
        setLocation(null);
        setFormatted("");
      } else {
        const r = response.data.results[0];
        setLocation(r.geometry.location);
        setFormatted(r.formatted_address);
      }
    } catch (err) {
      console.error(err);
      setError("Error en la petición. Revisa backend/API key");
      setLocation(null);
      setFormatted("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem" }}>
      <h2>Buscar dirección → coordenadas (Google Geocoding)</h2>

      <form
        onSubmit={handleSearch}
        style={{ display: "flex", gap: 8, marginBottom: 12 }}
      >
        <input
          style={{ flex: 1, padding: "8px 10px" }}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Escribe una dirección, ej. Plaza Murillo, La Paz"
        />
        <button type="submit" disabled={loading} style={{ padding: "8px 12px" }}>
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {error && <div style={{ color: "crimson" }}>{error}</div>}

      {formatted && (
        <div style={{ marginTop: 8 }}>
          <strong>Dirección:</strong> {formatted}
        </div>
      )}
      {location && (
        <div>
          <strong>Coordenadas:</strong> {location.lat}, {location.lng}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        {isLoaded ? (
          location ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={location}
              zoom={15}
            >
              <Marker position={location} />
            </GoogleMap>
          ) : (
            <div
              style={{
                height: 450,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span>Realiza una búsqueda para mostrar el mapa</span>
            </div>
          )
        ) : (
          <div>Cargando Google Maps...</div>
        )}
      </div>
    </div>
  );
}

export default App;
