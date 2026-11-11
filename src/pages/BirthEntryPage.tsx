import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, MapPin, Clock, Calendar, User, ChevronDown, Users, Check } from 'lucide-react';
import { locationService } from '../services/locationService';
import { deckService } from '../services/deckService';
import { useDeck } from '../context/DeckContext';
import { AligningSkyLoader } from '../components/AligningSkyLoader';
import { ILocationResult } from '../types';

export interface ITimezoneOption {
  id: string;
  value: number;
  label: string;
  iana: string;
}

export const WORLD_TIMEZONES: ITimezoneOption[] = [
  { id: 'in', value: 5.5, label: 'India (IST - UTC+5:30)', iana: 'Asia/Kolkata' },
  { id: 'lk', value: 5.5, label: 'Sri Lanka (SLST - UTC+5:30)', iana: 'Asia/Colombo' },
  { id: 'np', value: 5.75, label: 'Nepal / Kathmandu (UTC+5:45)', iana: 'Asia/Kathmandu' },
  { id: 'pk', value: 5, label: 'Pakistan / Karachi / Tashkent (UTC+5:00)', iana: 'Asia/Karachi' },
  { id: 'bd', value: 6, label: 'Bangladesh / Dhaka / Almaty (UTC+6:00)', iana: 'Asia/Dhaka' },
  { id: 'mm', value: 6.5, label: 'Myanmar / Yangon (UTC+6:30)', iana: 'Asia/Yangon' },
  { id: 'ae', value: 4, label: 'United Arab Emirates / Dubai / Baku / Oman (UTC+4:00)', iana: 'Asia/Dubai' },
  { id: 'ir', value: 3.5, label: 'Iran / Tehran (UTC+3:30)', iana: 'Asia/Tehran' },
  { id: 'af', value: 4.5, label: 'Afghanistan / Kabul (UTC+4:30)', iana: 'Asia/Kabul' },
  { id: 'ru_mow', value: 3, label: 'Moscow / Riyadh / Istanbul / Nairobi / Qatar (UTC+3:00)', iana: 'Europe/Moscow' },
  { id: 'eet', value: 2, label: 'Eastern Europe / Athens / Cairo / Johannesburg (UTC+2:00)', iana: 'Europe/Athens' },
  { id: 'cet', value: 1, label: 'Central Europe / Paris / Berlin / Rome / Madrid (UTC+1:00)', iana: 'Europe/Paris' },
  { id: 'gb', value: 0, label: 'UTC / London / Dublin / Lisbon (UTC+0:00)', iana: 'Europe/London' },
  { id: 'az', value: -1, label: 'Azores / Cape Verde (UTC-1:00)', iana: 'Atlantic/Azores' },
  { id: 'mid', value: -2, label: 'Mid-Atlantic (UTC-2:00)', iana: 'Atlantic/South_Georgia' },
  { id: 'br', value: -3, label: 'Brazil / Argentina / Buenos Aires / Sao Paulo (UTC-3:00)', iana: 'America/Sao_Paulo' },
  { id: 'nl', value: -3.5, label: 'Newfoundland (UTC-3:30)', iana: 'America/St_Johns' },
  { id: 'cl', value: -4, label: 'Atlantic / Santiago / Caracas (UTC-4:00)', iana: 'America/Santiago' },
  { id: 'us_ea', value: -5, label: 'US Eastern / New York / Toronto (UTC-5:00)', iana: 'America/New_York' },
  { id: 'us_ct', value: -6, label: 'US Central / Chicago / Mexico City (UTC-6:00)', iana: 'America/Chicago' },
  { id: 'us_mt', value: -7, label: 'US Mountain / Denver / Phoenix (UTC-7:00)', iana: 'America/Denver' },
  { id: 'us_pt', value: -8, label: 'US Pacific / Los Angeles / Vancouver (UTC-8:00)', iana: 'America/Los_Angeles' },
  { id: 'us_ak', value: -9, label: 'Alaska (UTC-9:00)', iana: 'America/Anchorage' },
  { id: 'us_hi', value: -10, label: 'Hawaii / Honolulu (UTC-10:00)', iana: 'Pacific/Honolulu' },
  { id: 'sm', value: -11, label: 'Samoa, Midway (UTC-11:00)', iana: 'Pacific/Midway' },
  { id: 'th', value: 7, label: 'Thailand / Bangkok / Jakarta / Hanoi (UTC+7:00)', iana: 'Asia/Bangkok' },
  { id: 'sg', value: 8, label: 'Singapore / Malaysia / Beijing / Perth (UTC+8:00)', iana: 'Asia/Singapore' },
  { id: 'au_eu', value: 8.75, label: 'Australia / Eucla (UTC+8:45)', iana: 'Australia/Eucla' },
  { id: 'jp', value: 9, label: 'Japan / Tokyo / Seoul (UTC+9:00)', iana: 'Asia/Tokyo' },
  { id: 'au_ad', value: 9.5, label: 'Australia / Adelaide / Darwin (UTC+9:30)', iana: 'Australia/Adelaide' },
  { id: 'au_sy', value: 10, label: 'Australia / Sydney / Melbourne / Brisbane (UTC+10:00)', iana: 'Australia/Sydney' },
  { id: 'lh', value: 10.5, label: 'Lord Howe Island (UTC+10:30)', iana: 'Australia/Lord_Howe' },
  { id: 'nc', value: 11, label: 'Solomon Islands / New Caledonia (UTC+11:00)', iana: 'Pacific/Guadalcanal' },
  { id: 'nz', value: 12, label: 'New Zealand / Auckland / Fiji (UTC+12:00)', iana: 'Pacific/Auckland' },
  { id: 'to', value: 13, label: 'Tonga / Samoa (UTC+13:00)', iana: 'Pacific/Tongatapu' },
  { id: 'ki', value: 14, label: 'Line Islands / Kiritimati (UTC+14:00)', iana: 'Pacific/Kiritimati' },
];

const birthFormSchema = z.object({
  name: z.string().min(1, 'Please enter your name'),
  gender: z.enum(['Male', 'Female', 'Other', 'Non-Binary'], {
    errorMap: () => ({ message: 'Please select your gender' }),
  }),
  date: z
    .string()
    .min(1, 'Please select your birth date')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((val) => {
      const d = new Date(val);
      return !isNaN(d.getTime()) && d <= new Date();
    }, 'Date of birth must be a valid date in the past'),
  time: z
    .string()
    .min(1, 'Please enter your birth time')
    .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Time must be in HH:mm format'),
  place: z.string().min(2, 'Please select a birthplace'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  timezone: z.number().optional().default(5.5),
  ianaTimezone: z.string().optional(),
});

type BirthFormData = z.infer<typeof birthFormSchema>;

export const BirthEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const { setProfileAndDeck } = useDeck();
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('Finding your birthplace…');
  const [apiError, setApiError] = useState<string | null>(null);

  // Autocomplete state
  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<ILocationResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<ILocationResult | null>(null);
  const [isSearchingLocation, setIsSearchingLocation] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const debounceTimer = useRef<any>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BirthFormData>({
    resolver: zodResolver(birthFormSchema),
    defaultValues: {
      name: '',
      gender: undefined as any,
      date: '',
      time: '',
      place: '',
      latitude: undefined as any,
      longitude: undefined as any,
      timezone: 5.5,
      ianaTimezone: 'Asia/Kolkata',
    },
  });

  const selectedTz = watch('timezone') ?? 5.5;
  const selectedGender = watch('gender');
  const selectedIana = watch('ianaTimezone') || 'Asia/Kolkata';

  // Find active option matching by IANA timezone (to distinguish India vs Sri Lanka) or numeric value
  const activeTzOption =
    WORLD_TIMEZONES.find((tz) => selectedIana && tz.iana === selectedIana) ||
    WORLD_TIMEZONES.find((tz) => Math.abs(tz.value - selectedTz) < 0.01) ||
    WORLD_TIMEZONES[0];

  // Handle location debounced search
  useEffect(() => {
    if (query.trim().length < 2 || (selectedPlace && selectedPlace.label === query)) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      setIsSearchingLocation(true);
      try {
        const results = await locationService.search(query);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 250);

    return () => clearTimeout(debounceTimer.current);
  }, [query, selectedPlace]);

  const handleSelectPlace = (place: ILocationResult) => {
    setSelectedPlace(place);
    setQuery(place.label);
    setValue('place', place.label, { shouldValidate: true });
    setValue('latitude', place.lat, { shouldValidate: true });
    setValue('longitude', place.lon, { shouldValidate: true });
    setValue('timezone', place.timezone, { shouldValidate: true });

    // Explicitly differentiate Sri Lanka vs India
    let iana = place.ianaTimezone;
    const lower = place.label.toLowerCase();
    if (lower.includes('sri lanka')) {
      iana = 'Asia/Colombo';
    } else if (lower.includes('india')) {
      iana = 'Asia/Kolkata';
    }
    if (iana) {
      setValue('ianaTimezone', iana);
    }
    setShowDropdown(false);
  };

  const onSubmit = async (data: BirthFormData) => {
    setApiError(null);
    let placeData = selectedPlace;

    // Auto-resolve coordinates if user typed their birthplace without clicking dropdown
    if (!placeData || typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
      const placeQuery = data.place || query;
      if (placeQuery && placeQuery.trim().length >= 2) {
        try {
          const results = await locationService.search(placeQuery);
          if (results && results.length > 0) {
            placeData = results[0];
            setSelectedPlace(placeData);
            setValue('place', placeData.label, { shouldValidate: true });
            setValue('latitude', placeData.lat, { shouldValidate: true });
            setValue('longitude', placeData.lon, { shouldValidate: true });
            setValue('timezone', placeData.timezone, { shouldValidate: true });
            if (placeData.ianaTimezone) {
              setValue('ianaTimezone', placeData.ianaTimezone);
            }
          }
        } catch {
          // fallback
        }
      }
    }

    const lat = placeData?.lat ?? data.latitude ?? 28.6139;
    const lon = placeData?.lon ?? data.longitude ?? 77.2090;
    const tz = placeData?.timezone ?? data.timezone ?? 5.5;
    const iana = placeData?.ianaTimezone ?? data.ianaTimezone ?? 'Asia/Kolkata';

    setLoading(true);

    try {
      setLoadingStep('Reading the sky at your exact birth…');
      const response = await deckService.submitBirthDetails({
        name: data.name,
        gender: data.gender,
        date: data.date,
        time: data.time.length === 5 ? `${data.time}:00` : data.time,
        place: placeData?.label || data.place,
        latitude: lat,
        longitude: lon,
        timezone: tz,
        ianaTimezone: iana,
      });

      setLoadingStep('Calculating 55 Vedic card archetypes…');
      setProfileAndDeck(
        response.profile,
        response.deck,
        response.cards,
        response.entitlements
      );

      // Smooth transition to deck view
      setTimeout(() => {
        navigate('/deck');
      }, 500);
    } catch (err: any) {
      setApiError(err.message || 'Failed to align your birth sky. Please check details.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <AligningSkyLoader
          message={loadingStep}
          subMessage="Aligning exact ascendant, nakshatra padas, sphutas & upagrahas"
        />
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center w-full px-3.5 sm:px-6 md:px-8 py-3 sm:py-6 md:py-8 my-auto">
      <div className="relative z-10 w-full max-w-[430px] sm:max-w-[470px] md:max-w-[490px] space-y-2 sm:space-y-3">
        {/* Hero Title */}
        <div className="text-center space-y-0.5 sm:space-y-1">
          <div className="text-[#8C6D3B] text-xs sm:text-sm select-none leading-none">✦</div>
          <h1 className="font-cinzel text-xl sm:text-2xl md:text-[26px] tracking-[0.16em] font-bold text-[#1A1817] leading-tight">
            PARROT CARDS
          </h1>
          <p className="font-cormorant italic text-xs sm:text-sm md:text-base text-[#595147]">
            Draw the deck your birth sky dealt you.
          </p>
        </div>

        {/* Main Form Card Container with Vintage Ornate Corner Framing */}
        <div className="relative bg-[#FAF5EE]/95 backdrop-blur-sm border border-[#8C6D3B]/45 rounded-2xl p-4 sm:p-5 md:p-6 shadow-[0_8px_30px_rgba(80,60,30,0.12)] space-y-2.5 sm:space-y-3.5 overflow-hidden">
          {/* Inner Hairline Framing */}
          <div className="absolute inset-1 sm:inset-1.5 rounded-xl border border-[#8C6D3B]/20 pointer-events-none" />

          {/* Vintage Ornate Corner Accents */}
          <div className="absolute top-1.5 left-1.5 text-[#8C6D3B] pointer-events-none select-none">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 14V6a4 4 0 0 1 4-4h8" />
              <circle cx="6" cy="6" r="1.5" fill="#8C6D3B" />
            </svg>
          </div>
          <div className="absolute top-1.5 right-1.5 text-[#8C6D3B] pointer-events-none select-none">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 14V6a4 4 0 0 0-4-4h-8" />
              <circle cx="18" cy="6" r="1.5" fill="#8C6D3B" />
            </svg>
          </div>
          <div className="absolute bottom-1.5 left-1.5 text-[#8C6D3B] pointer-events-none select-none">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 10v8a4 4 0 0 0 4 4h8" />
              <circle cx="6" cy="18" r="1.5" fill="#8C6D3B" />
            </svg>
          </div>
          <div className="absolute bottom-1.5 right-1.5 text-[#8C6D3B] pointer-events-none select-none">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 10v8a4 4 0 0 1-4 4h-8" />
              <circle cx="18" cy="18" r="1.5" fill="#8C6D3B" />
            </svg>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 sm:space-y-3 relative z-10">
            {/* Full Name Field */}
            <div className="space-y-1">
              <label className="text-[10.5px] sm:text-[11.5px] md:text-xs uppercase tracking-wider font-bold text-[#595147] font-cinzel flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#8C6D3B]" />
                <span>Full Name</span>
              </label>
              <div className="relative">
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Arjun Verma"
                  className="w-full px-3.5 py-2.5 sm:py-2.5 md:py-3 rounded-xl bg-[#F4EEE4] border border-[#C9B390]/80 text-[#1A1817] placeholder-[#7A7268]/60 focus:outline-none focus:border-[#8C6D3B] focus:bg-[#FFFDF9] transition-all text-base sm:text-sm font-sans shadow-xs"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C6D3B]/60 text-xs select-none pointer-events-none">✦</span>
              </div>
              {errors.name && (
                <span className="text-[11px] text-red-600 block mt-0.5">{errors.name.message}</span>
              )}
            </div>

            {/* Gender Field */}
            <div className="space-y-1">
              <label className="text-[10.5px] sm:text-[11.5px] md:text-xs uppercase tracking-wider font-bold text-[#595147] font-cinzel flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#8C6D3B]" />
                <span>Gender</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {([
                  { id: 'Male', label: 'Male', symbol: '♂' },
                  { id: 'Female', label: 'Female', symbol: '♀' },
                  { id: 'Other', label: 'Other', symbol: '✦' },
                ] as const).map((g) => {
                  const isSelected = selectedGender === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setValue('gender', g.id, { shouldValidate: true })}
                      className={`py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                        isSelected
                          ? 'bg-[#E6D7BE] border-2 border-[#8C6D3B] text-[#1A1817] font-bold shadow-inner'
                          : 'bg-[#F4EEE4] border border-[#C9B390]/80 text-[#595147] hover:text-[#1A1817] hover:border-[#8C6D3B]/60'
                      }`}
                    >
                      <span className="text-xs sm:text-sm">{g.symbol}</span>
                      <span className="truncate">{g.label}</span>
                    </button>
                  );
                })}
              </div>
              <input type="hidden" {...register('gender')} />
              {errors.gender && (
                <span className="text-[11px] text-red-600 block mt-0.5">{errors.gender.message}</span>
              )}
            </div>

            {/* Date & Time Grid - Side by Side and 100% Contained */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full min-w-0">
              <div className="space-y-1 min-w-0 w-full">
                <label className="text-[10.5px] sm:text-[11.5px] md:text-xs uppercase tracking-wider font-bold text-[#595147] font-cinzel flex items-center gap-1.5 truncate">
                  <Calendar className="w-3.5 h-3.5 text-[#8C6D3B] shrink-0" />
                  <span>Date of Birth</span>
                </label>
                <div className="relative min-w-0 w-full overflow-hidden rounded-xl">
                  <input
                    {...register('date')}
                    type="text"
                    placeholder="dd-mm-yyyy"
                    onFocus={(e) => {
                      e.target.type = 'date';
                      try {
                        e.target.showPicker();
                      } catch {}
                    }}
                    onBlur={(e) => {
                      if (!e.target.value) e.target.type = 'text';
                    }}
                    className="w-full min-w-0 max-w-full pl-3 pr-8 py-2 sm:py-2.5 md:py-3 rounded-xl bg-[#F4EEE4] border border-[#C9B390]/80 text-[#1A1817] placeholder-[#7A7268]/60 focus:outline-none focus:border-[#8C6D3B] focus:bg-[#FFFDF9] transition-all text-base sm:text-sm font-sans shadow-xs"
                  />
                  <Calendar className="w-3.5 h-3.5 text-[#8C6D3B]/70 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.date && (
                  <span className="text-[11px] text-red-600 block mt-0.5 leading-tight">{errors.date.message}</span>
                )}
              </div>

              <div className="space-y-1 min-w-0 w-full">
                <label className="text-[10.5px] sm:text-[11.5px] md:text-xs uppercase tracking-wider font-bold text-[#595147] font-cinzel flex items-center gap-1.5 truncate">
                  <Clock className="w-3.5 h-3.5 text-[#8C6D3B] shrink-0" />
                  <span>Time of Birth</span>
                </label>
                <div className="relative min-w-0 w-full overflow-hidden rounded-xl">
                  <input
                    {...register('time')}
                    type="text"
                    step="60"
                    placeholder="--:--"
                    onFocus={(e) => {
                      e.target.type = 'time';
                      try {
                        e.target.showPicker();
                      } catch {}
                    }}
                    onBlur={(e) => {
                      if (!e.target.value) e.target.type = 'text';
                    }}
                    className="w-full min-w-0 max-w-full pl-3 pr-8 py-2 sm:py-2.5 md:py-3 rounded-xl bg-[#F4EEE4] border border-[#C9B390]/80 text-[#1A1817] placeholder-[#7A7268]/60 focus:outline-none focus:border-[#8C6D3B] focus:bg-[#FFFDF9] transition-all text-base sm:text-sm font-sans shadow-xs"
                  />
                  <Clock className="w-3.5 h-3.5 text-[#8C6D3B]/70 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.time && (
                  <span className="text-[11px] text-red-600 block mt-0.5 leading-tight">{errors.time.message}</span>
                )}
              </div>
            </div>

            {/* Birthplace Autocomplete */}
            <div className="space-y-1 relative">
              <label className="text-[10.5px] sm:text-[11.5px] md:text-xs uppercase tracking-wider font-bold text-[#595147] font-cinzel flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#8C6D3B]" />
                  <span>Birthplace (type & pick from list)</span>
                </span>
                {selectedPlace && (
                  <span className="text-[10.5px] text-[#2E5A36] flex items-center gap-1 font-semibold">
                    <Check className="w-3 h-3 text-[#2E5A36]" />
                    <span>Coordinates set</span>
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQuery(val);
                    setValue('place', val, { shouldValidate: true });
                    setSelectedPlace(null);
                    setValue('latitude', undefined as any, { shouldValidate: true });
                    setValue('longitude', undefined as any, { shouldValidate: true });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (suggestions.length > 0) {
                        handleSelectPlace(suggestions[0]);
                      }
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setShowDropdown(false);
                    }, 220);
                  }}
                  placeholder="Search city, district, country..."
                  className="w-full pl-9 pr-9 py-2.5 sm:py-2.5 md:py-3 rounded-xl bg-[#F4EEE4] border border-[#C9B390]/80 text-[#1A1817] placeholder-[#7A7268]/60 focus:outline-none focus:border-[#8C6D3B] focus:bg-[#FFFDF9] transition-all text-base sm:text-sm font-sans shadow-xs"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C6D3B]/70 pointer-events-none text-xs">🔍</span>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C6D3B]/60 text-xs select-none pointer-events-none">✦</span>
              </div>

              {/* Autocomplete Dropdown */}
              {showDropdown && suggestions.length > 0 && (
                <ul className="absolute top-full left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-[#FFFDF9] border border-[#8C6D3B]/40 rounded-xl shadow-xl z-50 py-1 text-xs divide-y divide-[#8C6D3B]/10 no-scrollbar">
                  {suggestions.map((item, idx) => (
                    <li
                      key={idx}
                      onMouseDown={() => handleSelectPlace(item)}
                      className="p-2.5 hover:bg-[#F2ECE1] cursor-pointer text-[#1A1817] flex items-center justify-between transition-colors text-xs"
                    >
                      <div className="truncate pr-2">
                        <span className="font-medium text-[#1A1817]">{item.label}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8C6D3B]/10 text-[#8C6D3B] border border-[#8C6D3B]/25 font-mono font-semibold flex-shrink-0">
                        UTC{item.timezone >= 0 ? `+${item.timezone}` : item.timezone}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {isSearchingLocation && (
                <span className="text-[10px] text-[#6B635B] block mt-0.5 font-serif">Locating coordinates and timezone…</span>
              )}
              {errors.place && (
                <span className="text-[11px] text-red-600 block mt-0.5">{errors.place.message}</span>
              )}
            </div>

            {/* Timezone Selector (Auto-set from place) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10.5px] sm:text-[11.5px] md:text-xs uppercase tracking-wider font-bold text-[#595147] font-cinzel flex items-center gap-1.5">
                  <span className="text-xs">🌐</span>
                  <span>Timezone (auto-set from place)</span>
                </label>
                <span className="text-[#8C6D3B] font-mono font-bold px-2 py-0.5 rounded-md bg-[#F4EEE4] border border-[#C9B390]/80 text-[10px]">
                  UTC{selectedTz >= 0 ? `+${selectedTz}` : selectedTz}
                </span>
              </div>
              <div className="relative">
                <select
                  value={activeTzOption.id}
                  onChange={(e) => {
                    const picked = WORLD_TIMEZONES.find((t) => t.id === e.target.value);
                    if (picked) {
                      setValue('timezone', picked.value, { shouldValidate: true });
                      setValue('ianaTimezone', picked.iana);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 sm:py-2.5 md:py-3 rounded-xl bg-[#F4EEE4] border border-[#C9B390]/80 text-[#1A1817] focus:outline-none focus:border-[#8C6D3B] focus:bg-[#FFFDF9] text-base sm:text-sm appearance-none cursor-pointer pr-9 font-sans shadow-xs"
                >
                  {!WORLD_TIMEZONES.some((tz) => Math.abs(tz.value - selectedTz) < 0.01) && (
                    <option
                      value="custom"
                      className="bg-[#F4EEE4] text-[#1A1817] py-1 text-xs"
                    >
                      Location Timezone (UTC{selectedTz >= 0 ? `+${selectedTz}` : selectedTz})
                    </option>
                  )}
                  {WORLD_TIMEZONES.map((tz) => (
                    <option
                      key={tz.id}
                      value={tz.id}
                      className="bg-[#F4EEE4] text-[#1A1817] py-1 text-xs"
                    >
                      {tz.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C6D3B]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Technical Details Disclosure */}
            <details className="text-xs text-[#595147] group pt-0.5">
              <summary className="cursor-pointer hover:text-[#8C6D3B] inline-flex items-center gap-1 font-serif text-[11px]">
                <span>Technical & Ephemeris Details</span>
                <ChevronDown className="w-3.5 h-3.5 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="p-2 mt-1 rounded-xl bg-[#F4EEE4] border border-[#C9B390]/60 space-y-0.5 font-mono text-[10px] text-[#1A1817]">
                <div>Ayanamsha: Lahiri / Chitrapaksha</div>
                <div>House System: Bhava Madhya Method 5</div>
                <div>Nodes: True Node (Chitrapaksha)</div>
                <div>Calculation Engine: Jagannatha Hora (Cloud Run)</div>
              </div>
            </details>

            {/* Error Banner */}
            {apiError && (
              <div className="p-2.5 rounded-xl bg-red-100/90 border border-red-300 text-xs text-red-800">
                {apiError}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #8C6D3B 0%, #9B7B43 50%, #735626 100%)',
                  color: '#FFFDF9',
                  boxShadow: '0 4px 18px rgba(117, 88, 41, 0.38)',
                }}
                className="w-full py-3 sm:py-3.5 px-6 rounded-xl hover:brightness-110 active:scale-[0.98] font-cinzel font-bold text-xs sm:text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-[#C29B58]/60 cursor-pointer select-none"
              >
                <span className="text-xs" style={{ color: '#F5E6CC' }}>✦</span>
                <span className="font-cinzel font-bold tracking-[0.16em]" style={{ color: '#FFFDF9', textShadow: '0 1px 3px rgba(30, 20, 10, 0.5)' }}>
                  ENTER THE SKY
                </span>
                <span className="text-xs" style={{ color: '#F5E6CC' }}>✦</span>
              </button>
            </div>
          </form>
        </div>

        {/* Attribution Footnote */}
        <div className="text-center text-xs text-[#595147] font-serif pt-1">
          Astronomical data verified by{' '}
          <a
            href="https://jagannathahora.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8C6D3B] underline font-semibold hover:text-[#73582D]"
          >
            Jagannatha Hora
          </a>
        </div>
      </div>
    </div>
  );
};
