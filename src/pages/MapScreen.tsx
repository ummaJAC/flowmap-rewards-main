import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import BottomNav from "../components/BottomNav";
import useGameStore, { getPlayerLevelStats } from "../store/useGameStore";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "";

const BERLIN_CENTER: [number, number] = [52.5228, 13.4025];

/* ------------------------------------------------------------------ */
/*  Business categories we care about (mapped from Mapbox maki icons) */
/* ------------------------------------------------------------------ */
const BUSINESS_CATEGORIES: Record<string, { icon: string; label: string; tier: "easy" | "medium" | "hard"; reward: number }> = {
  // Easy (common businesses)
  cafe: { icon: "☕", label: "Café", tier: "easy", reward: 25 },
  restaurant: { icon: "🍽", label: "Restaurant", tier: "easy", reward: 30 },
  "restaurant-noodle": { icon: "🍜", label: "Restaurant", tier: "easy", reward: 30 },
  "restaurant-pizza": { icon: "🍕", label: "Pizzeria", tier: "easy", reward: 25 },
  "restaurant-seafood": { icon: "🐟", label: "Seafood", tier: "easy", reward: 30 },
  bakery: { icon: "🥐", label: "Bakery", tier: "easy", reward: 20 },
  bar: { icon: "🍺", label: "Bar", tier: "easy", reward: 30 },
  "fast-food": { icon: "🍔", label: "Fast Food", tier: "easy", reward: 15 },
  "ice-cream": { icon: "🍦", label: "Ice Cream", tier: "easy", reward: 15 },
  grocery: { icon: "🛒", label: "Grocery", tier: "easy", reward: 20 },
  convenience: { icon: "🏪", label: "Store", tier: "easy", reward: 15 },
  pharmacy: { icon: "💊", label: "Pharmacy", tier: "easy", reward: 25 },
  // Medium (branded / mid-value)
  shop: { icon: "🛍", label: "Shop", tier: "medium", reward: 60 },
  clothing: { icon: "👕", label: "Fashion", tier: "medium", reward: 75 },
  "clothing-store": { icon: "👕", label: "Fashion", tier: "medium", reward: 75 },
  shoe: { icon: "👟", label: "Shoes", tier: "medium", reward: 70 },
  optician: { icon: "👓", label: "Optician", tier: "medium", reward: 50 },
  jewelry: { icon: "💎", label: "Jewelry", tier: "medium", reward: 90 },
  hotel: { icon: "🏨", label: "Hotel", tier: "medium", reward: 80 },
  lodging: { icon: "🏨", label: "Hotel", tier: "medium", reward: 80 },
  cinema: { icon: "🎬", label: "Cinema", tier: "medium", reward: 65 },
  theatre: { icon: "🎭", label: "Theatre", tier: "medium", reward: 70 },
  gym: { icon: "🏋", label: "Gym", tier: "medium", reward: 55 },
  hospital: { icon: "🏥", label: "Hospital", tier: "medium", reward: 60 },
  car: { icon: "🚗", label: "Auto", tier: "medium", reward: 65 },
  "car-rental": { icon: "🚗", label: "Car Rental", tier: "medium", reward: 65 },
  fuel: { icon: "⛽", label: "Gas Station", tier: "medium", reward: 45 },
  // Hard (rare / high-value)
  bank: { icon: "🏦", label: "Bank", tier: "hard", reward: 150 },
  college: { icon: "🎓", label: "University", tier: "hard", reward: 200 },
  museum: { icon: "🏛", label: "Museum", tier: "hard", reward: 180 },
  embassy: { icon: "🏛", label: "Embassy", tier: "hard", reward: 250 },
  stadium: { icon: "🏟", label: "Stadium", tier: "hard", reward: 300 },
  airport: { icon: "✈️", label: "Airport", tier: "hard", reward: 500 },
  "department-store": { icon: "🏬", label: "Dept Store", tier: "hard", reward: 200 },
};

// Fallback for any POI not in our map
const DEFAULT_CATEGORY: { icon: string; label: string; tier: "easy" | "medium" | "hard"; reward: number } = { icon: "📍", label: "Business", tier: "easy", reward: 20 };

// Mapbox class → category mapping (used when no specific maki icon matches)
const CLASS_TO_CATEGORY: Record<string, { icon: string; label: string; tier: "easy" | "medium" | "hard"; reward: number }> = {
  food_and_drink: { icon: "🍽", label: "Restaurant", tier: "easy", reward: 25 },
  food_and_drink_stores: { icon: "🛒", label: "Grocery", tier: "easy", reward: 20 },
  shop: { icon: "🛍", label: "Shop", tier: "medium", reward: 60 },
  commercial_services: { icon: "🏢", label: "Services", tier: "medium", reward: 50 },
  lodging: { icon: "🏨", label: "Hotel", tier: "medium", reward: 80 },
  medical: { icon: "🏥", label: "Medical", tier: "medium", reward: 60 },
  fitness_recreation: { icon: "🏋", label: "Fitness", tier: "medium", reward: 55 },
  arts_and_entertainment: { icon: "🎭", label: "Entertainment", tier: "medium", reward: 70 },
  education: { icon: "🎓", label: "University", tier: "hard", reward: 200 },
  motorist: { icon: "⛽", label: "Gas Station", tier: "medium", reward: 45 },
};

// Non-commercial classes to always skip
const NON_COMMERCIAL_CLASSES = new Set([
  'landmark', 'park', 'religious_institution', 'transport',
  'public_facilities', 'historic', 'natural_features',
  'bridge', 'viewpoint', 'information',
]);

const tierColors = {
  easy: "#22C55E",
  medium: "#38BDF8",
  hard: "#FACC15",
};

/* ------------------------------------------------------------------ */
/*  Interface for our processed business pins                          */
/* ------------------------------------------------------------------ */
interface BusinessPin {
  id: string;
  name: string;
  category: string;
  icon: string;
  label: string;
  tier: "easy" | "medium" | "hard";
  reward: number;
  lat: number;
  lng: number;
}

/* ------------------------------------------------------------------ */
/*  Apply cartoon game-board colors to the Mapbox base style           */
/* ------------------------------------------------------------------ */
const applyCartoonStyle = (map: mapboxgl.Map) => {
  const style = map.getStyle();
  if (!style || !style.layers) return;

  style.layers.forEach((layer: any) => {
    const id = layer.id.toLowerCase();
    const type = layer.type;

    try {
      // WATER → bright blue
      if (id.includes("water") && type === "fill") {
        map.setPaintProperty(layer.id, "fill-color", "#7DD3FC");
        map.setPaintProperty(layer.id, "fill-opacity", 1);
      }
      // PARKS → vivid green
      if ((id.includes("park") || id.includes("green") || id.includes("grass") || id.includes("vegetation")) && type === "fill") {
        map.setPaintProperty(layer.id, "fill-color", "#86EFAC");
        map.setPaintProperty(layer.id, "fill-opacity", 0.8);
      }
      // LAND / BACKGROUND → warm cream
      if ((id.includes("land") || id.includes("background")) && type === "background") {
        map.setPaintProperty(layer.id, "background-color", "#FFF7ED");
      }
      if (id === "land" && type === "fill") {
        map.setPaintProperty(layer.id, "fill-color", "#FFF7ED");
      }
      // ROADS → clean white
      if (id.includes("road") && type === "line") {
        map.setPaintProperty(layer.id, "line-color", "#FFFFFF");
        map.setPaintProperty(layer.id, "line-opacity", 0.9);
      }
      // HIDE 3D buildings
      if (id.includes("building") && type === "fill-extrusion") {
        map.setLayoutProperty(layer.id, "visibility", "none");
      }
      if (id.includes("building") && type === "fill") {
        map.setPaintProperty(layer.id, "fill-color", "#FDE68A");
        map.setPaintProperty(layer.id, "fill-opacity", 0.25);
      }
      // Soften default labels
      if (type === "symbol" && (id.includes("label") || id.includes("place"))) {
        map.setPaintProperty(layer.id, "text-color", "#94A3B8");
        map.setPaintProperty(layer.id, "text-halo-color", "#FFFFFF");
        map.setPaintProperty(layer.id, "text-halo-width", 1.5);
      }
      // HIDE Mapbox default POI labels visually, but keep the layer VISIBLE
      // so queryRenderedFeatures can still find POI features for our custom markers
      if (id.includes("poi") && type === "symbol") {
        map.setPaintProperty(layer.id, "text-opacity", 0);
        map.setPaintProperty(layer.id, "icon-opacity", 0);
      }
    } catch (_) {
      // silently skip unsupported layers
    }
  });
};

/* ------------------------------------------------------------------ */
/*  Determine category from Mapbox feature properties                  */
/* ------------------------------------------------------------------ */
const getCategory = (feature: any): { icon: string; label: string; tier: "easy" | "medium" | "hard"; reward: number } | null => {
  const maki = feature.properties?.maki || "";
  const type = feature.properties?.type || "";
  const cat = feature.properties?.category_en || "";
  const cls = feature.properties?.class || "";

  // Explicitly block non-commercial POI classes
  if (NON_COMMERCIAL_CLASSES.has(cls)) return null;

  // Try specific maki icon first, then type, then category_en, then class-based fallback
  return BUSINESS_CATEGORIES[maki] || BUSINESS_CATEGORIES[type] || BUSINESS_CATEGORIES[cat] || CLASS_TO_CATEGORY[cls] || null;
};

/* ------------------------------------------------------------------ */
/*  Create marker HTML based on zoom level                             */
/* ------------------------------------------------------------------ */
const createDotHTML = (tier: "easy" | "medium" | "hard") => {
  const c = tierColors[tier];
  return `<div style="width:12px;height:12px;border-radius:50%;background:${c};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.2);cursor:pointer;pointer-events:auto;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.4)'" onmouseout="this.style.transform='scale(1)'"></div>`;
};

const createIconHTML = (icon: string, tier: "easy" | "medium" | "hard") => {
  const c = tierColors[tier];
  return `
    <div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:white;border:2px solid ${c};box-shadow:0 2px 8px rgba(0,0,0,0.15);cursor:pointer;pointer-events:auto;font-size:16px;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
      ${icon}
    </div>
  `;
};

const getModelIconName = (icon: string) => {
  if (['☕', '🍦'].includes(icon)) return 'cafe';
  if (['🥐'].includes(icon)) return 'bakery';
  if (['🍽', '🍜', '🍕', '🐟', '🍔'].includes(icon)) return 'restaurant';
  if (['🛒', '🏪', '💊'].includes(icon)) return 'grocery';
  if (['🛍', '👕', '👟', '👓', '💎', '🏬'].includes(icon)) return 'shop';
  if (['🏨'].includes(icon)) return 'hotel';
  if (['🏥'].includes(icon)) return 'medical';
  if (['🏋'].includes(icon)) return 'fitness';
  if (['🎬', '🎭'].includes(icon)) return 'entertainment';
  if (['🎓'].includes(icon)) return 'education';
  if (['⛽'].includes(icon)) return 'gas';
  if (['🏦'].includes(icon)) return 'bank';
  if (['🍺'].includes(icon)) return 'bar';
  if (['🚗'].includes(icon)) return 'auto';
  if (['🏛', '🏟', '✈️'].includes(icon)) return 'museum';
  return 'cafe'; // Fallback
};

const createPillHTML = (business: BusinessPin, owned = false, showModel = false, zoom = 15) => {
  const c = owned ? '#22C55E' : tierColors[business.tier];
  const crownBadge = owned ? `<div style="position:absolute;top:-8px;right:-4px;font-size:12px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3));">👑</div>` : '';
  const glowStyle = owned ? 'box-shadow:0 0 12px rgba(34,197,94,0.5);' : '';

  // Calculate dynamic size for the 3D model based on map zoom
  // Zoom 14+ = 100px. Zoom 4 = 20px.
  const modelSize = showModel ? Math.max(20, Math.min(100, (zoom - 4) * 8 + 20)) : 100;
  
  const modelName = getModelIconName(business.icon);

  // 3D model div (only for owned properties)
  const modelDiv = owned
    ? `<div class="object-model" style="display:${showModel ? 'flex' : 'none'};align-items:center;justify-content:center;transform:translateY(-${modelSize * 0.2}px);pointer-events:none;">
         <img src="/models/${modelName}.png?v=2" style="width:${modelSize}px;height:auto;filter:drop-shadow(0px ${modelSize * 0.12}px ${modelSize * 0.08}px rgba(0,0,0,0.35));" />
       </div>`
    : '';

  // When showing 3D model, hide the pill; otherwise show it
  const pillDisplay = (owned && showModel) ? 'none' : 'inline-flex';

  return `
    <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;pointer-events:auto;">
      ${modelDiv}
      <div class="marker-pill" style="position:relative;display:${pillDisplay};align-items:center;background:rgba(255,255,255,0.95);backdrop-filter:blur(4px);padding:3px 8px 3px 3px;border-radius:20px;${glowStyle}cursor:pointer;pointer-events:auto;border:1.5px solid ${c}${owned ? '' : '40'};transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        ${crownBadge}
        <div style="width:24px;height:24px;border-radius:50%;background:${c};display:flex;align-items:center;justify-content:center;font-size:12px;margin-right:6px;flex-shrink:0;">${business.icon}</div>
        <span style="font-family:'Nunito',sans-serif;font-weight:900;font-size:11px;color:${owned ? '#15803D' : '#334155'};letter-spacing:-0.2px;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${business.name}</span>
      </div>
    </div>
  `;
};

/* ================================================================== */
/*  MapScreen Component                                                */
/* ================================================================== */
const MapScreen = () => {
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessPin | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [nearbyBusinesses, setNearbyBusinesses] = useState<BusinessPin[]>([]);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [gpsToast, setGpsToast] = useState<string | null>(null);
  const navigate = useNavigate();
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const balance = useGameStore(s => s.balance);
  const isOwned = useGameStore(s => s.isOwned);
  const ownedLocations = useGameStore(s => s.ownedLocations);
  const lastKnownLocation = useGameStore(s => s.lastKnownLocation);
  const setLastKnownLocation = useGameStore(s => s.setLastKnownLocation);
  const [isZoomedOut, setIsZoomedOut] = useState(false);

  // Cleanup GPS watcher on unmount to prevent massive battery drain
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // GPS Locate Me handler
  const handleLocateMe = (isManualRetry = false) => {
    if (!('geolocation' in navigator)) {
      setGpsToast('GPS is not supported in this browser');
      setTimeout(() => setGpsToast(null), 4000);
      return;
    }
    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
        if (userMarkerRef.current) {
          userMarkerRef.current.setLngLat(coords);
        }
        if (mapRef.current) {
          mapRef.current.flyTo({ center: coords, zoom: 16, essential: true });
          setTimeout(() => updatePOIMarkers(), 1500);
        }
        setLastKnownLocation(coords[1], coords[0]);
        setGpsStatus('ok');
        setGpsToast('📍 Location found!');
        setTimeout(() => setGpsToast(null), 3000);

        // Clear previous watch if user clicked the locate button multiple times
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }

        // Start continuous watch
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            if (pos && userMarkerRef.current) {
              const newCoords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
              userMarkerRef.current.setLngLat(newCoords);
              setLastKnownLocation(newCoords[1], newCoords[0]);
            }
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
      },
      (err) => {
        setGpsStatus('error');
        let msg = 'GPS unavailable';
        if (err.code === 1) {
          msg = '⛔ Access Denied.\nTurn ON your phone GPS & allow browser permissions.';
          // If user manually clicked the button and got instant denial,
          // Chrome permanently caches this. We must reload the page.
          if (isManualRetry) {
            msg += '\n🔄 Reloading app to apply new permissions...';
            setTimeout(() => window.location.reload(), 2500);
          }
        }
        else if (err.code === 2) msg = '📡 GPS signal lost.\nMake sure Location Services are ON in your phone settings.';
        else if (err.code === 3) msg = '⏳ GPS timed out.\nTurn ON Location Services and try again.';
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          msg += '\n⚠️ Note: GPS requires HTTPS to work on mobile.';
        }
        setGpsToast(msg);
        setTimeout(() => setGpsToast(null), 7000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };


  /* ---------------------------------------------------------------- */
  /*  Read Mapbox tiles and create/update our custom markers           */
  /* ---------------------------------------------------------------- */
  const updatePOIMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const zoom = map.getZoom();

    // Query every POI feature currently rendered on the map
    // Try multiple possible layer names
    let features: mapboxgl.MapboxGeoJSONFeature[] = [];
    const possibleLayers = ["poi-label", "poi_label", "poi"];
    for (const layerName of possibleLayers) {
      try {
        const f = map.queryRenderedFeatures(undefined, { layers: [layerName] });
        if (f.length > 0) {
          features = f;
          break;
        }
      } catch (_) {
        // layer doesn't exist in this style, skip
      }
    }

    // If no features from specific layers, query ALL rendered features and filter for POIs
    if (features.length === 0) {
      try {
        const allFeatures = map.queryRenderedFeatures();
        features = allFeatures.filter((f) => {
          const src = (f.source || "").toLowerCase();
          const srcLayer = (f.sourceLayer || "").toLowerCase();
          const layerId = (f.layer?.id || "").toLowerCase();
          return (
            srcLayer.includes("poi") ||
            layerId.includes("poi") ||
            src.includes("poi") ||
            f.properties?.maki ||
            f.properties?.class === "shop" ||
            f.properties?.class === "food_and_drink" ||
            f.properties?.class === "commercial_services"
          );
        });
      } catch (_) {}
    }

    // Deduplicate by name + coordinates (Mapbox can return the same POI from different tiles)
    const seen = new Set<string>();
    const businesses: BusinessPin[] = [];

    features.forEach((feature) => {
      if (feature.geometry.type !== "Point") return;
      const coords = (feature.geometry as any).coordinates as [number, number];
      const name = feature.properties?.name || feature.properties?.name_en;
      if (!name) return;

      const key = `${name}-${coords[0].toFixed(4)}-${coords[1].toFixed(4)}`;
      if (seen.has(key)) return;
      seen.add(key);

      const cat = getCategory(feature);
      if (!cat) return; // Skip non-commercial POIs (bridges, temples, bus stops, etc.)
      businesses.push({
        id: key,
        name,
        category: cat.label,
        icon: cat.icon,
        label: cat.label,
        tier: cat.tier,
        reward: cat.reward,
        lat: coords[1],
        lng: coords[0],
      });
    });

    // Update nearby businesses for the panel
    setNearbyBusinesses(businesses.slice(0, 25));

    // Track which markers to keep
    const currentIds = new Set(businesses.map((b) => b.id));
    const existingMarkers = markersRef.current;

    // Remove markers that are no longer visible
    existingMarkers.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        existingMarkers.delete(id);
      }
    });

    // Add or update markers
    const showModels = zoom < 14.5; // 3D Empire View threshold

    businesses.forEach((biz) => {
      const existingMarker = existingMarkers.get(biz.id);

      // Determine which HTML to render based on zoom
      const locationOwned = isOwned(biz.id);
      let html: string;
      let zoomType: string;

      if (locationOwned) {
        // Owned properties ALWAYS use pill HTML (contains the 3D model div)
        html = createPillHTML(biz, true, showModels, zoom);
        // Add Math.floor(zoom) to the type so the marker re-renders its HTML as size changes
        zoomType = showModels ? `owned-3d-${Math.floor(zoom)}` : 'owned-pill';
      } else if (zoom < 12) {
        html = createDotHTML(biz.tier);
        zoomType = 'dot';
      } else if (zoom < 14) {
        html = createIconHTML(biz.icon, biz.tier);
        zoomType = 'icon';
      } else {
        html = createPillHTML(biz, false, false, zoom);
        zoomType = 'pill';
      }

      if (existingMarker) {
        // Update existing marker's HTML for zoom changes
        const el = existingMarker.getElement();
        const currentType = el.getAttribute("data-zoom-type") || "";
        if (currentType !== zoomType) {
          el.innerHTML = html;
          el.setAttribute("data-zoom-type", zoomType);
        }
      } else {
        // Create new marker
        const el = document.createElement("div");
        el.innerHTML = html;
        el.setAttribute("data-zoom-type", zoomType);
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          setSelectedBusiness(biz);
        });

        const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
          .setLngLat([biz.lng, biz.lat])
          .addTo(map);
        existingMarkers.set(biz.id, marker);
      }
    });

    // ── Inject owned locations from Zustand that aren't already on the map ──
    const ownedLocs = useGameStore.getState().ownedLocations;
    ownedLocs.forEach((loc) => {
      // Check both exact ID match AND name-based match to avoid duplicates
      const alreadyRendered = existingMarkers.has(loc.id) ||
        Array.from(existingMarkers.keys()).some(key => key.includes(loc.name));
      if (alreadyRendered) return;

      const biz: BusinessPin = {
        id: loc.id,
        name: loc.name,
        category: loc.category || 'Business',
        icon: loc.icon || '📍',
        label: loc.category || 'Business',
        tier: (loc.tier as "easy" | "medium" | "hard") || 'easy',
        reward: loc.dailyYield || 2,
        lat: loc.lat,
        lng: loc.lng,
      };
      const html = createPillHTML(biz, true, showModels, zoom);
      const el = document.createElement('div');
      el.innerHTML = html;
      el.setAttribute('data-zoom-type', showModels ? `owned-3d-${Math.floor(zoom)}` : 'owned-pill');
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedBusiness(biz);
      });
      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([biz.lng, biz.lat])
        .addTo(map);
      existingMarkers.set(biz.id, marker);
    });
  }, [isOwned]);

  /* ---------------------------------------------------------------- */
  /*  Initialize the map                                               */
  /* ---------------------------------------------------------------- */
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Use cached location if available, otherwise fallback to Berlin
    const initialLng = lastKnownLocation ? lastKnownLocation.lng : BERLIN_CENTER[1];
    const initialLat = lastKnownLocation ? lastKnownLocation.lat : BERLIN_CENTER[0];

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [initialLng, initialLat],
      zoom: 15.5,
      pitch: 0,
      attributionControl: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", async () => {
      // Apply cartoon colors
      applyCartoonStyle(map);

      // User location marker
      const userEl = document.createElement("div");
      userEl.innerHTML = `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;width:40px;height:40px;">
          <div style="width:16px;height:16px;border-radius:50%;background:#3478F6;border:3px solid #f2f2f7;box-shadow:0 0 15px rgba(52,120,246,0.6);z-index:2;position:relative;"></div>
          <div style="position:absolute;width:40px;height:40px;border-radius:50%;background:rgba(52,120,246,0.15);animation:userPing 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
        </div>
      `;
      userMarkerRef.current = new mapboxgl.Marker({ element: userEl })
        .setLngLat([initialLng, initialLat])
        .addTo(map);

      // Auto-try GPS on load
      handleLocateMe();

      // Initial POI scan (fallback for Berlin if GPS fails)
      updatePOIMarkers();

      // Track zoom level for 3D Empire Models
      map.on('zoom', () => {
        if (!mapRef.current) return;
        const currentZoom = mapRef.current.getZoom();
        setIsZoomedOut(currentZoom < 14.5);
      });
    });

    // Re-apply cartoon style after style data changes
    map.on("styledata", () => applyCartoonStyle(map));

    // Update markers on every map movement (debounced)
    const debouncedUpdate = () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = setTimeout(updatePOIMarkers, 200);
    };

    map.on("moveend", debouncedUpdate);
    map.on("zoomend", debouncedUpdate);
    map.on("click", () => setSelectedBusiness(null));

    mapRef.current = map;

    return () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, [updatePOIMarkers]);

  // ── Toggle 3D Empire models when zoom changes ──



  /* ---------------------------------------------------------------- */
  /*  How many businesses are "claimable" (for the blinking star)      */
  /* ---------------------------------------------------------------- */
  // For MVP demo: mark every 3rd nearby business as "claimable"
  const claimableBusinesses = nearbyBusinesses.filter((_, i) => i % 3 === 0);
  const hasClaimableReward = claimableBusinesses.length > 0;

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <style>{`
        @keyframes userPing {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes blink-star {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
        }
        .mapboxgl-ctrl-attrib { background: rgba(255,255,255,0.8) !important; font-size: 9px !important; border-radius: 8px !important; }
        .mapboxgl-ctrl-attrib a { color: rgba(0,0,0,0.4) !important; }
        .mapboxgl-ctrl-group { border-radius: 12px !important; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important; }
        .mapboxgl-ctrl-group button { background: white !important; border: none !important; }
        .mapboxgl-ctrl-group button:hover { background: #f1f5f9 !important; }
      `}</style>

      {/* 3D Empire CSS (base styles only, toggling done via JS useEffect) */}
      <style dangerouslySetInnerHTML={{__html: `
        .object-model { display: none; align-items: center; justify-content: center; transition: opacity 0.3s ease; }
        .marker-pill { transition: opacity 0.3s ease; }
      `}} />

      {/* Top Header Overlay */}
      <div className="absolute top-[max(1rem,calc(env(safe-area-inset-top)+0.5rem))] left-5 right-5 flex justify-between items-start z-30">
        <div
          className="flex items-center bg-white p-1.5 pr-4 rounded-full shadow-lg border border-slate-100 cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden" style={{ backgroundColor: "#38BDF8" }}>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=38BDF8" alt="Avatar" className="w-full h-full" />
          </div>
          <div className="ml-2">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
              Level {getPlayerLevelStats(ownedLocations.length).level}
            </div>
            <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 ease-in-out" 
                style={{ 
                  backgroundColor: "#22C55E", 
                  width: `${getPlayerLevelStats(ownedLocations.length).progressPercent}%` 
                }} 
              />
            </div>
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 bg-white px-4 py-2.5 rounded-full shadow-lg border border-slate-100 cursor-pointer"
          onClick={() => navigate("/wallet")}
        >
          <i className="ph-fill ph-coins text-lg" style={{ color: "#FACC15" }} />
          <span className="font-black text-slate-800 text-sm">{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-slate-400 font-bold ml-0.5">GEO</span></span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1">
        <div
          ref={mapContainerRef}
          className={`h-full w-full ${isZoomedOut ? 'empire-zoomed-out' : ''}`}
        />

        {/* GPS Locate Me Button */}
        <button
          onClick={() => handleLocateMe(true)}
          className="absolute bottom-6 right-4 z-30 w-12 h-12 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center active:scale-95 transition-transform"
          style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
        >
          {gpsStatus === 'loading' ? (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <i className="ph-bold ph-crosshair text-slate-700 text-2xl"></i>
          )}
        </button>

        {/* GPS Toast */}
        {gpsToast && (
          <div className="absolute bottom-24 left-4 right-4 z-40 bg-slate-800 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl text-center whitespace-pre-line animate-pulse">
            {gpsToast}
          </div>
        )}

        {/* ===== Task Detail Sheet ===== */}
        <AnimatePresence>
          {selectedBusiness && (
            <motion.div
              className="absolute bottom-0 left-0 w-full bg-white rounded-t-[32px] z-40 px-6 pt-3 pb-6"
              style={{ boxShadow: "0 -20px 40px rgba(0,0,0,0.1)" }}
              initial={{ y: 300, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 300, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: tierColors[selectedBusiness.tier] + "20" }}>
                    {selectedBusiness.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">{selectedBusiness.name}</h3>
                    <p className="text-xs font-bold text-slate-400">{selectedBusiness.label} • {selectedBusiness.tier.toUpperCase()}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedBusiness(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <i className="ph-bold ph-x text-slate-400" />
                </button>
              </div>

              {/* Conditional Content based on Ownership */}
              {isOwned(selectedBusiness.id) ? (
                (() => {
                  const idLower = selectedBusiness.id.toLowerCase();
                  const owned = ownedLocations.find(l => 
                    l.id === selectedBusiness.id || 
                    l.name.toLowerCase() === idLower || 
                    idLower.startsWith(l.name.toLowerCase())
                  );
                  const displayYield = owned ? Math.floor(owned.dailyYield) : Math.round(selectedBusiness.reward * 0.1);
                  
                  return (
                    <>
                      <div className="bg-green-50 rounded-2xl p-4 mb-5 border border-green-100 flex items-start gap-3">
                        <div className="text-2xl mt-1">👑</div>
                        <div>
                          <h4 className="font-black text-green-800 text-sm uppercase mb-1">Property Owned</h4>
                          <p className="text-xs font-bold text-green-700/80 leading-relaxed">
                            You have already captured this location. It is currently generating passive {displayYield} GEO daily for your empire.
                          </p>
                        </div>
                      </div>
                      <button
                        disabled
                        className="w-full bg-slate-200 text-slate-400 py-4 rounded-2xl font-black text-lg uppercase tracking-wider cursor-not-allowed"
                      >
                        ALREADY OWNED
                      </button>
                    </>
                  );
                })()
              ) : (
                <>
                  <p className="text-sm text-slate-500 font-bold mb-4">
                    Take a clear photo of {selectedBusiness.name} entrance and storefront to claim this business for your empire.
                  </p>

                  <div className="flex items-center gap-3 mb-5">
                    <div className="bg-green-50 rounded-2xl px-4 py-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Reward</p>
                      <p className="font-black text-green-600 text-xl">+{selectedBusiness.reward} GEO</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl px-4 py-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Time Limit</p>
                      <p className="font-extrabold text-slate-700 text-xl">10 min</p>
                    </div>
                    <div className="bg-yellow-50 rounded-2xl px-4 py-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Daily Yield</p>
                      <p className="font-extrabold text-yellow-600 text-xl">+{Math.round(selectedBusiness.reward * 0.1)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/camera", { state: { business: selectedBusiness } })}
                    className="w-full bg-green-500 text-white py-4 rounded-2xl font-black text-lg uppercase tracking-wider hover:bg-green-600 transition-all active:translate-y-1"
                    style={{ boxShadow: "0 6px 0 #15803D" }}
                  >
                    CAPTURE NOW
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== Collapsible "Nearby" Panel ===== */}
        {!selectedBusiness && (
          <div className="absolute bottom-0 left-0 w-full z-40">
            <div
              className="mx-auto w-48 bg-white rounded-t-2xl shadow-lg border border-b-0 border-slate-100 flex items-center justify-center py-2 cursor-pointer relative"
              onClick={() => setPanelOpen(!panelOpen)}
            >
              <div className="flex items-center gap-2">
                {hasClaimableReward && (
                  <i className="ph-fill ph-star text-yellow-400 text-sm" style={{ animation: "blink-star 1.5s ease-in-out infinite" }} />
                )}
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  {panelOpen ? "Close" : "Nearby"}
                </span>
                <i className={`ph-bold ${panelOpen ? "ph-caret-down" : "ph-caret-up"} text-slate-400 text-xs`} />
              </div>
            </div>

            <AnimatePresence>
              {panelOpen && (
                <motion.div
                  className="bg-white px-6 pt-4 pb-4 border-t border-slate-100"
                  style={{ boxShadow: "0 -10px 30px rgba(0,0,0,0.08)" }}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-black text-slate-800 uppercase">Nearby Businesses</h3>
                    <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-full">
                      {nearbyBusinesses.length} found
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                    {nearbyBusinesses.length > 0 ? (
                      nearbyBusinesses.slice(0, 10).map((biz) => (
                        <div
                          key={biz.id}
                          className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={() => { setSelectedBusiness(biz); setPanelOpen(false); }}
                        >
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-base" style={{ backgroundColor: tierColors[biz.tier] + "20" }}>
                            {biz.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-slate-800 font-black truncate">{biz.name}</div>
                            <div className="text-slate-400 text-[10px] font-bold">{biz.label} • {biz.tier}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-black text-sm" style={{ color: tierColors[biz.tier] }}>+{biz.reward}</div>
                            <div className="text-[9px] font-bold text-slate-400">GEO</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-sm font-bold text-slate-400 py-4">Zoom in to discover businesses</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ===== Bottom Navigation ===== */}
      <div className="relative z-50">
        <BottomNav />
      </div>
    </div>
  );
};

export default MapScreen;
