import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { CITIES, PROPERTY_TYPES, City } from "./data/cities";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormState {
  city: string;
  location: string;
  property_type: string;
  area: string;
  bedrooms: string;
  baths: string;
}

interface PredictPayload {
  area: number;
  bedrooms: number;
  baths: number;
  location: string;
  city: string;
  property_type: string;
  latitude: number;
  longitude: number;
  province_name: string;
}

interface PredictResult {
  predicted_price: number;
  predicted_price_million: number;
  currency: string;
  input_received: {
    area: number;
    bedrooms: number;
    baths: number;
    location: string;
    city: string;
    property_type: string;
    province_name: string;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPKR(amount: number): string {
  if (amount >= 1_00_00_000) {
    return `PKR ${(amount / 1_00_00_000).toFixed(2)} Crore`;
  } else if (amount >= 1_00_000) {
    return `PKR ${(amount / 1_00_000).toFixed(2)} Lakh`;
  }
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

const EMPTY_FORM: FormState = {
  city: "",
  location: "",
  property_type: "",
  area: "",
  bedrooms: "",
  baths: "",
};

// ── Reusable components ───────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-widest text-stone-400">
        {label}
      </label>
      {children}
    </div>
  );
}

interface SelectProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  children: React.ReactNode;
}

function Select({
  value,
  onChange,
  disabled = false,
  placeholder,
  children,
}: SelectProps) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full bg-stone-900 border border-stone-700 rounded-lg px-4 py-3
                 text-stone-100 text-sm focus:outline-none focus:border-amber-500
                 focus:ring-1 focus:ring-amber-500/40 transition-all
                 disabled:opacity-40 disabled:cursor-not-allowed appearance-none cursor-pointer"
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {children}
    </select>
  );
}

interface NumberInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  placeholder?: string;
}

function NumberInput({ value, onChange, min, placeholder }: NumberInputProps) {
  return (
    <input
      type="number"
      value={value}
      onChange={onChange}
      min={min}
      placeholder={placeholder}
      className="w-full bg-stone-900 border border-stone-700 rounded-lg px-4 py-3
                 text-stone-100 text-sm focus:outline-none focus:border-amber-500
                 focus:ring-1 focus:ring-amber-500/40 transition-all
                 placeholder:text-stone-600"
    />
  );
}

// ── Result Screen ─────────────────────────────────────────────────────────────
interface ResultScreenProps {
  result: PredictResult;
  onReset: () => void;
}

function ResultScreen({ result, onReset }: ResultScreenProps) {
  const meta = [
    { icon: "📍", label: "City", value: result.input_received.city },
    { icon: "🏠", label: "Type", value: result.input_received.property_type },
    { icon: "📐", label: "Area", value: `${result.input_received.area} sq ft` },
    {
      icon: "🛏",
      label: "Bedrooms",
      value: String(result.input_received.bedrooms),
    },
    {
      icon: "🚿",
      label: "Bathrooms",
      value: String(result.input_received.baths),
    },
    { icon: "📌", label: "Location", value: result.input_received.location },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in">
      {/* Back button + badge row */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-stone-400 hover:text-stone-100
                     text-sm transition-colors group"
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          New estimate
        </button>
        <span
          className="text-xs font-medium bg-amber-500/15 text-amber-400
                         px-3 py-1 rounded-full border border-amber-500/20"
        >
          Estimate ready
        </span>
      </div>

      {/* Price card */}
      <div
        className="bg-stone-900/60 border border-stone-800 rounded-2xl p-8
                      backdrop-blur-sm text-center mb-5"
      >
        <p className="text-xs uppercase tracking-widest text-amber-500/70 font-medium mb-3">
          Estimated Price
        </p>
        <p className="font-display text-5xl font-bold text-amber-400 mb-2">
          {formatPKR(result.predicted_price)}
        </p>
        <p className="text-stone-400 text-sm">
          ≈ PKR {result.predicted_price_million}M
        </p>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {meta.map(({ icon, label, value }) => (
          <div
            key={label}
            className="bg-stone-900/60 border border-stone-800 rounded-xl
                       px-4 py-3 backdrop-blur-sm"
          >
            <p className="text-xs text-stone-500 mb-1">
              {icon} {label}
            </p>
            <p className="text-sm font-medium text-stone-200 truncate">
              {value}
            </p>
          </div>
        ))}
      </div>

      <p className="text-center text-stone-600 text-xs mt-6 leading-relaxed">
        Predictions are based on historical data and may vary from actual market
        prices.
      </p>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);

  const selectedCity: City | undefined = CITIES.find(
    (c) => c.name === form.city,
  );

  function handleCity(e: ChangeEvent<HTMLSelectElement>): void {
    setForm({ ...form, city: e.target.value, location: "" });
    setError(null);
  }

  function handleChange(field: keyof FormState) {
    return (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>): void => {
      setForm({ ...form, [field]: e.target.value });
      setError(null);
    };
  }

  function handleReset(): void {
    setShowResult(false);
    setResult(null);
    setError(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!selectedCity) return;

    setLoading(true);
    setError(null);

    try {
      const payload: PredictPayload = {
        area: parseFloat(form.area),
        bedrooms: parseInt(form.bedrooms),
        baths: parseInt(form.baths),
        location: form.location,
        city: form.city,
        property_type: form.property_type,
        latitude: selectedCity.latitude,
        longitude: selectedCity.longitude,
        province_name: selectedCity.province,
      };

      const res = await axios.post<PredictResult>(
        "http://localhost:8000/predict",
        payload,
      );
      setResult(res.data);
      setShowResult(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail ??
            "Server se connect nahi ho saka. Backend chal raha hai?",
        );
      } else {
        setError("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  const isFormValid: boolean =
    Boolean(form.city) &&
    Boolean(form.location) &&
    Boolean(form.property_type) &&
    parseFloat(form.area) > 0 &&
    parseInt(form.bedrooms) > 0 &&
    parseInt(form.baths) > 0;

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-stone-800 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-stone-950 font-bold text-sm">
              P
            </div>
            <span className="font-display text-lg font-semibold text-stone-100">
              PropValue<span className="text-amber-500">.</span>pk
            </span>
          </div>
          <span className="text-xs text-stone-500 hidden sm:block">
            Powered by XGBoost ML
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-start justify-center px-4 py-12">
        {showResult && result ? (
          <ResultScreen result={result} onReset={handleReset} />
        ) : (
          <div className="w-full max-w-2xl">
            {/* Hero */}
            <div className="text-center mb-10">
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-stone-100 leading-tight mb-3">
                Property Price
                <br />
                <span className="text-amber-500">Estimator</span>
              </h1>
              <p className="text-stone-400 text-sm max-w-md mx-auto leading-relaxed">
                Enter your property details below to get an instant AI-powered
                price estimate for any major Pakistani city.
              </p>
            </div>

            {/* Form card */}
            <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Row 1: City + Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="City">
                    <Select
                      value={form.city}
                      onChange={handleCity}
                      placeholder="Select city"
                    >
                      {CITIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Location / Area">
                    <Select
                      value={form.location}
                      onChange={
                        handleChange("location") as (
                          e: ChangeEvent<HTMLSelectElement>,
                        ) => void
                      }
                      disabled={!form.city}
                      placeholder={
                        form.city ? "Select location" : "Select city first"
                      }
                    >
                      {selectedCity?.locations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                {/* Row 2: Property type + Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Property Type">
                    <Select
                      value={form.property_type}
                      onChange={
                        handleChange("property_type") as (
                          e: ChangeEvent<HTMLSelectElement>,
                        ) => void
                      }
                      placeholder="Select type"
                    >
                      {PROPERTY_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Total Area (sq ft)">
                    <NumberInput
                      value={form.area}
                      onChange={
                        handleChange("area") as (
                          e: ChangeEvent<HTMLInputElement>,
                        ) => void
                      }
                      min={1}
                      placeholder="e.g. 2178"
                    />
                  </Field>
                </div>

                {/* Row 3: Bedrooms + Baths */}
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Bedrooms">
                    <NumberInput
                      value={form.bedrooms}
                      onChange={
                        handleChange("bedrooms") as (
                          e: ChangeEvent<HTMLInputElement>,
                        ) => void
                      }
                      min={1}
                      placeholder="e.g. 3"
                    />
                  </Field>

                  <Field label="Bathrooms">
                    <NumberInput
                      value={form.baths}
                      onChange={
                        handleChange("baths") as (
                          e: ChangeEvent<HTMLInputElement>,
                        ) => void
                      }
                      min={1}
                      placeholder="e.g. 2"
                    />
                  </Field>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className="mt-2 w-full py-3.5 rounded-xl font-semibold text-sm
                             bg-amber-500 text-stone-950 hover:bg-amber-400
                             disabled:opacity-40 disabled:cursor-not-allowed
                             transition-all duration-200 active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      Calculating...
                    </span>
                  ) : (
                    "Estimate Price"
                  )}
                </button>
              </form>

              {/* Error */}
              {error && (
                <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  ⚠️ {error}
                </div>
              )}
            </div>

            <p className="text-center text-stone-600 text-xs mt-6">
              Predictions are based on historical data and may vary from actual
              market prices.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
