import React, { useMemo } from "react";
import { FormLabel, Field } from "./OnboardingUI";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { 
  PROVINCES, 
  getCitiesByProvince, 
  getDistrictsByCity,
  getPostalCodesByCity,
} from "../data/locationData";

interface LocationStepProps {
  formData: any;
  updateField: (key: string, value: string) => void;
}

/**
 * LocationStep Component
 * 
 * Provides hierarchical select dropdowns for Indonesian provinces, cities, and districts
 * with postal code selection and address autocomplete integration.
 */
export const LocationStep: React.FC<LocationStepProps> = ({ formData, updateField }) => {
  // Get available cities based on selected province
  const citiesList = useMemo(() => {
    return getCitiesByProvince(formData.provincy_country);
  }, [formData.provincy_country]);

  // Get available districts based on selected city
  const districtsList = useMemo(() => {
    return getDistrictsByCity(formData.city);
  }, [formData.city]);

  // Get available postal codes based on selected city
  const postalCodesList = useMemo(() => {
    return getPostalCodesByCity(formData.city);
  }, [formData.city]);

  // Reset city and district when province changes
  const handleProvinceChange = (province: string) => {
    updateField("provincy_country", province);
    updateField("city", ""); // Reset city
    updateField("regency", ""); // Reset district
    updateField("zip_code", ""); // Reset postal code
  };

  // Reset district and postal code when city changes
  const handleCityChange = (city: string) => {
    updateField("city", city);
    updateField("regency", ""); // Reset district
    updateField("zip_code", ""); // Reset postal code
  };

  return (
    <div className="space-y-5">
      {/* Province Select */}
      <div className="flex flex-col gap-1.5">
        <FormLabel>Province *</FormLabel>
        <select
          value={formData.provincy_country}
          onChange={e => handleProvinceChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] outline-none text-sm appearance-none"
        >
          <option value="" className="bg-[var(--ui-bg-page)]">Select Province...</option>
          {PROVINCES.map(province => (
            <option key={province} value={province} className="bg-[var(--ui-bg-page)]">
              {province}
            </option>
          ))}
        </select>
      </div>

      {/* City Select */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <FormLabel>City *</FormLabel>
          <select
            value={formData.city}
            onChange={e => handleCityChange(e.target.value)}
            disabled={!formData.provincy_country}
            className="w-full px-4 py-3 rounded-xl bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] outline-none text-sm appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="" className="bg-[var(--ui-bg-page)]">
              {formData.provincy_country ? "Select City..." : "Select Province First..."}
            </option>
            {citiesList.map(city => (
              <option key={city} value={city} className="bg-[var(--ui-bg-page)]">
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* District/Regency Select */}
        <div className="flex flex-col gap-1.5">
          <FormLabel>District</FormLabel>
          <select
            value={formData.regency}
            onChange={e => updateField("regency", e.target.value)}
            disabled={!formData.city}
            className="w-full px-4 py-3 rounded-xl bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] outline-none text-sm appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="" className="bg-[var(--ui-bg-page)]">
              {formData.city ? "Select District..." : "Select City First..."}
            </option>
            {districtsList.map(district => (
              <option key={district} value={district} className="bg-[var(--ui-bg-page)]">
                {district}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Postal Code Select */}
      <div className="flex flex-col gap-1.5">
        <FormLabel>Postal Code</FormLabel>
        {postalCodesList.length > 0 ? (
          <select
            value={formData.zip_code}
            onChange={e => updateField("zip_code", e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] outline-none text-sm appearance-none"
          >
            <option value="" className="bg-[var(--ui-bg-page)]">Select Postal Code...</option>
            {postalCodesList.map(code => (
              <option key={code} value={code} className="bg-[var(--ui-bg-page)]">
                {code}
              </option>
            ))}
          </select>
        ) : (
          <input 
            type="text" 
            value={formData.zip_code} 
            onChange={e => updateField("zip_code", e.target.value)} 
            placeholder="E.g.: 40132" 
            className="px-4 py-3 rounded-xl bg-[var(--ui-bg-input)] border border-[var(--ui-border-input)] text-[var(--ui-text-primary)] outline-none text-sm"
          />
        )}
      </div>

      {/* Address Autocomplete */}
      <AddressAutocomplete 
        value={formData.address} 
        onChange={(v: any) => updateField("address", v)} 
      />
    </div>
  );
};
