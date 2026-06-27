declare module "../data/geolocation" {
  export const PROVINCES: string[];
  export const citiesByProvince: Record<string, string[]>;
  export const districtsByCity: Record<string, string[]>;
  export const postalCodesByCity: Record<string, string[]>;
  
  export function getCitiesByProvince(province: string): string[];
  export function getDistrictsByCity(city: string): string[];
  export function getPostalCodesByCity(city: string): string[];
  
  export default {
    PROVINCES,
    getCitiesByProvince,
    getDistrictsByCity,
    getPostalCodesByCity
  };
}