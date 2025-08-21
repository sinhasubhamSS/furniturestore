"use client";

import React, { useState } from "react";
import type { StoreLocation } from "../../../types/footer";
import { storeLocations } from "../data/StoreLocation";

const StoreLocator: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [nearbyStores, setNearbyStores] = useState<StoreLocation[]>([]);
  const [showAllStores, setShowAllStores] = useState<boolean>(false);

  const availableCities = Array.from(
    new Set(storeLocations.map((store) => store.city))
  );

  const findNearbyStores = (city: string): void => {
    if (city) {
      const stores = storeLocations.filter(
        (store) => store.city.toLowerCase() === city.toLowerCase()
      );
      setNearbyStores(stores);
    } else {
      setNearbyStores([]);
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const city = e.target.value;
    setSelectedCity(city);
    findNearbyStores(city);
  };

  const toggleAllStores = (): void => {
    setShowAllStores((prev) => !prev);
    if (!showAllStores) {
      setNearbyStores(storeLocations);
      setSelectedCity("all");
    } else {
      setNearbyStores([]);
      setSelectedCity("");
    }
  };

  const openInMaps = (coordinates: [number, number]): void => {
    const [lat, lng] = coordinates;
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(mapsUrl, "_blank");
  };

  return (
    <div className="w-full bg-[--color-primary] py-8">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="text-center">
            <h4 className="text-2xl font-bold text-[--color-accent] mb-2">
              Find Store Near You
            </h4>
            <p className="text-[--text-accent]">
              Visit our physical stores for hands-on experience
            </p>
          </div>

          {/* Store Search */}
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <select
              value={selectedCity}
              onChange={handleCityChange}
              className="px-4 py-3 rounded-lg border border-[--color-border-custom] bg-[--color-card] text-[--text-accent] focus:outline-none focus:ring-2 focus:ring-[--color-accent]"
            >
              <option value="">Select City</option>
              {availableCities.map((city: string) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <button
              onClick={toggleAllStores}
              className="px-6 py-3 bg-[--color-accent] text-[--text-light] rounded-lg hover:opacity-90 transition-opacity"
            >
              {showAllStores ? "Hide All Stores" : "Show All Stores"}
            </button>
          </div>

          {/* Store List */}
          {nearbyStores.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyStores.map((store: StoreLocation) => (
                <div
                  key={store.id}
                  className="bg-[--color-card] p-6 rounded-lg border border-[--color-border-custom] hover:bg-[--color-hover-card] transition-colors"
                >
                  <div className="space-y-3">
                    <h5 className="font-bold text-[--color-accent] text-lg">
                      {store.name}
                    </h5>

                    <div className="space-y-2 text-sm text-[--text-accent]">
                      <p className="flex items-start space-x-2">
                        <span>📍</span>
                        <span>{store.address}</span>
                      </p>

                      <p className="flex items-center space-x-2">
                        <span>📞</span>
                        <a
                          href={`tel:${store.phone}`}
                          className="hover:text-[--color-accent]"
                        >
                          {store.phone}
                        </a>
                      </p>

                      <p className="flex items-center space-x-2">
                        <span>⏰</span>
                        <span>{store.hours}</span>
                      </p>
                    </div>

                    <div className="flex space-x-3 pt-3">
                      <button
                        onClick={() => openInMaps(store.coordinates)}
                        className="flex-1 bg-[--color-accent] text-[--text-light] py-2 px-4 rounded-lg text-sm hover:opacity-90 transition-opacity"
                      >
                        📍 Get Directions
                      </button>

                      <a
                        href={`tel:${store.phone}`}
                        className="flex-1 bg-[--color-secondary] text-[--text-accent] py-2 px-4 rounded-lg text-sm text-center border border-[--color-border-custom] hover:bg-[--color-hover-card] transition-colors"
                      >
                        📞 Call Store
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedCity && nearbyStores.length === 0 && (
            <div className="text-center py-8">
              <p className="text-[--text-accent]">
                No stores found in {selectedCity}. Coming soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreLocator;
