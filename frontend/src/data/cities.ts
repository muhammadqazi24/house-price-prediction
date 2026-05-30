export interface City {
  name: string;
  province: string;
  latitude: number;
  longitude: number;
  locations: string[];
}

export const CITIES: City[] = [
  {
    name: "Karachi",
    province: "Sindh",
    latitude: 24.8607,
    longitude: 67.0011,
    locations: [
      "DHA Defence", "Clifton", "Gulshan-e-Iqbal", "North Nazimabad",
      "Gulistan-e-Jauhar", "Nazimabad", "F.B. Area", "Korangi",
      "Malir", "Landhi", "Bahria Town", "Scheme 33",
      "North Karachi", "Surjani Town", "Orangi Town",
    ],
  },
  {
    name: "Lahore",
    province: "Punjab",
    latitude: 31.5204,
    longitude: 74.3587,
    locations: [
      "DHA Defence", "Bahria Town", "Gulberg", "Model Town",
      "Johar Town", "Wapda Town", "Garden Town", "Cantt",
      "Iqbal Town", "Faisal Town", "Township", "Raiwind Road",
      "Bedian Road", "Valencia Town", "Lake City",
    ],
  },
  {
    name: "Islamabad",
    province: "Islamabad Capital",
    latitude: 33.6844,
    longitude: 73.0479,
    locations: [
      "DHA Defence", "Bahria Town", "F-6", "F-7", "F-8",
      "F-10", "F-11", "G-9", "G-10", "G-11",
      "E-7", "E-11", "I-8", "I-10", "Bani Gala",
    ],
  },
  {
    name: "Rawalpindi",
    province: "Punjab",
    latitude: 33.5651,
    longitude: 73.0169,
    locations: [
      "Bahria Town", "DHA Defence", "Gulraiz Housing Society",
      "Saddar", "Chaklala Scheme", "Askari", "Satellite Town",
      "Adiala Road", "Chakri Road", "GT Road",
    ],
  },
  {
    name: "Faisalabad",
    province: "Punjab",
    latitude: 31.4504,
    longitude: 73.135,
    locations: [
      "Canal Road", "Peoples Colony", "Gulberg", "Madina Town",
      "D-Type Colony", "Millat Road", "Jinnah Colony",
      "Kohinoor City", "Eden Gardens", "Ghulam Muhammad Abad",
    ],
  },
  {
    name: "Quetta",
    province: "Balochistan",
    latitude: 30.1798,
    longitude: 66.975,
    locations: [
      "Satellite Town", "Jinnah Town", "Airport Road",
      "Brewery Road", "Sariab Road", "Samungli Road",
      "Kuchlak Road", "Zarghoon Road",
    ],
  },
];

export const PROPERTY_TYPES: string[] = ["House", "Flat"];
