import { useState, useEffect, useRef } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  navy: "#0D1F3C",
  navyMid: "#1A3460",
  teal: "#0B8F7A",
  tealLight: "#E0F4F1",
  amber: "#E8900A",
  amberLight: "#FEF3DC",
  slate: "#4A5568",
  slateLight: "#F7F8FA",
  white: "#FFFFFF",
  border: "#E2E8F0",
  text: "#1A202C",
  muted: "#718096",
};

const STYLES = {
  card: {
    background: "#fff",
    borderRadius: 16,
    border: `1px solid ${COLORS.border}`,
    padding: "1.5rem",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  badge: (color, bg) => ({
    display: "inline-block",
    background: bg,
    color: color,
    fontSize: 12,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 20,
    letterSpacing: "0.03em",
  }),
};

// ─── Travel Mode Data ─────────────────────────────────────────────────────────
const TRAVEL_MODES = [
  {
    id: "bus",
    icon: "🚌",
    label: "Bus",
    color: "#0B8F7A",
    bg: "#E0F4F1",
    tagline: "Affordable city-wide coverage",
    description:
      "Buses form the backbone of urban transport, connecting neighbourhoods across the city with frequent stops and accessible boarding. Ideal for medium-distance city journeys without the cost of rail.",
    benefits: [
      "Low cost per journey",
      "Dense route network across most areas",
      "Contactless & card payment",
      "Real-time arrival displays at stops",
      "Accessible for mobility aid users",
    ],
    limitations: [
      "Subject to road traffic delays",
      "Less frequent at off-peak hours",
      "Standing room only at rush hour",
      "Journey times can vary significantly",
    ],
    costPer: 0.18,
    baseFare: 1.75,
    unit: "per km",
    co2: 82,
    speed: "15–25 km/h (city average)",
  },
  {
    id: "rail",
    icon: "🚆",
    label: "Rail",
    color: "#185FA5",
    bg: "#E6F1FB",
    tagline: "Fast, reliable longer journeys",
    description:
      "Urban rail—trams, metro, and overground—offers the fastest point-to-point travel in busy cities. Fixed infrastructure means timetables are reliable and journey times predictable, making rail ideal for commuters.",
    benefits: [
      "Fastest option for longer distances",
      "Unaffected by road congestion",
      "High frequency at peak hours",
      "Comfortable seating on most services",
      "Direct city-centre connections",
    ],
    limitations: [
      "Higher fares than bus",
      "Limited stops between stations",
      "Overcrowding during peak hours",
      "Dependent on station proximity",
    ],
    costPer: 0.28,
    baseFare: 2.8,
    unit: "per km",
    co2: 41,
    speed: "40–80 km/h",
  },
  {
    id: "cycling",
    icon: "🚲",
    label: "Cycling",
    color: "#3B6D11",
    bg: "#EAF3DE",
    tagline: "Zero-cost, zero-emission freedom",
    description:
      "Cycling is one of the most efficient, healthy, and environmentally friendly ways to navigate a city. Whether on your own bike or a hire scheme, cycling beats traffic and keeps costs minimal for short-to-medium distances.",
    benefits: [
      "Zero fuel cost (own bike) or low hire fee",
      "Zero carbon emissions",
      "Health benefits from physical activity",
      "No waiting at stops or stations",
      "Beat traffic on congested routes",
    ],
    limitations: [
      "Weather-dependent comfort",
      "Requires physical effort",
      "Limited to shorter distances for most",
      "Requires secure parking at destination",
    ],
    costPer: 0.02,
    baseFare: 0,
    unit: "maintenance est.",
    co2: 0,
    speed: "12–20 km/h",
  },
  {
    id: "walking",
    icon: "🚶",
    label: "Walking",
    color: "#854F0B",
    bg: "#FAEEDA",
    tagline: "Free, healthy, always available",
    description:
      "Walking is the most accessible and sustainable form of travel. For journeys under 2 km, walking is often comparable in time to public transport—especially when accounting for waiting and boarding. It's also deeply beneficial for mental and physical wellbeing.",
    benefits: [
      "Completely free",
      "No timetable or waiting",
      "Zero carbon footprint",
      "Significant health and wellbeing benefits",
      "Flexible route-finding",
    ],
    limitations: [
      "Practical only for short distances",
      "Weather can affect comfort",
      "Accessibility challenges on uneven ground",
      "Time-consuming for longer journeys",
    ],
    costPer: 0,
    baseFare: 0,
    unit: "free",
    co2: 0,
    speed: "4–6 km/h",
  },
];

// ─── Service Alerts ───────────────────────────────────────────────────────────
const ALERTS = [
  {
    id: 1,
    type: "warning",
    mode: "Bus",
    line: "Route 47",
    message: "Delays of up to 15 min due to roadworks on Corporation Street. Diversion in effect until 18 May.",
    updated: "Today, 08:14",
  },
  {
    id: 2,
    type: "info",
    mode: "Rail",
    line: "Cross-City Line",
    message: "Reduced timetable on Saturdays during May. Check individual journey times before travel.",
    updated: "Yesterday, 17:30",
  },
  {
    id: 3,
    type: "success",
    mode: "Cycling",
    line: "Canal Towpath",
    message: "Resurfacing complete. Canal towpath route fully reopened between city centre and Selly Oak.",
    updated: "12 Apr, 09:00",
  },
];

// ─── Predefined Locations ─────────────────────────────────────────────────────
const LOCATIONS = [
  { id: "city_centre",     label: "City Centre",           zone: "Central",    x:  0.0, y:  0.0 },
  { id: "st_marys",        label: "St Mary's Square",      zone: "St Mary's",  x: -0.6, y:  0.8 },
  { id: "central_station", label: "Central Station",       zone: "Central",    x:  0.4, y:  0.6 },
  { id: "university",      label: "University Campus",     zone: "Edgbaston",  x: -1.7, y: -2.0 },
  { id: "hospital",        label: "City Hospital",         zone: "Digbeth",    x:  1.5, y: -0.4 },
  { id: "shopping",        label: "Grand Shopping Centre", zone: "West End",   x: -2.0, y:  0.4 },
  { id: "canal_quarter",   label: "Canal Quarter",         zone: "Eastside",   x:  2.3, y:  1.2 },
  { id: "victoria_park",   label: "Victoria Park",         zone: "Moseley",    x: -0.8, y: -2.8 },
  { id: "airport",         label: "St Mary's Airport",     zone: "South",      x: -1.2, y: -5.5 },
  { id: "north_suburb",    label: "North Suburb Centre",   zone: "Handsworth", x: -0.5, y:  3.5 },
];

// ─── Nav ──────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "home",      label: "Home" },
  { id: "planner",   label: "Journey Planner" },
  { id: "modes",     label: "Travel Modes" },
  { id: "estimator", label: "Cost Estimator" },
  { id: "compare",   label: "Compare Journeys" },
  { id: "updates",   label: "Service Updates" },
];

// ─── Components ───────────────────────────────────────────────────────────────

function Navbar({ current, onNav, menuOpen, setMenuOpen }) {
  return (
    <nav style={{
      background: COLORS.navy,
      position: "sticky",
      top: 0,
      zIndex: 100,
      borderBottom: `3px solid ${COLORS.teal}`,
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "0 1.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
      }}>
        {/* Logo */}
        <button
          onClick={() => { onNav("home"); setMenuOpen(false); }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: 0,
          }}
        >
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: COLORS.teal,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}>🗺️</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, lineHeight: 1.1, fontFamily: "Georgia, serif" }}>
              St Mary's
            </div>
            <div style={{ color: COLORS.teal, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Urban Mobility Hub
            </div>
          </div>
        </button>

        {/* Desktop Nav */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }} className="desktop-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                background: current === item.id ? COLORS.teal : "transparent",
                color: current === item.id ? "#fff" : "rgba(255,255,255,0.75)",
                border: "none",
                borderRadius: 8,
                padding: "8px 16px",
                fontSize: 14,
                fontWeight: current === item.id ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: 22,
            cursor: "pointer",
            padding: "6px 8px",
          }}
          className="hamburger"
          aria-label="Menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          background: COLORS.navyMid,
          padding: "0.5rem 1rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { onNav(item.id); setMenuOpen(false); }}
              style={{
                background: current === item.id ? COLORS.teal : "transparent",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 14px",
                textAlign: "left",
                fontSize: 15,
                fontWeight: current === item.id ? 600 : 400,
                cursor: "pointer",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ onNav }) {
  const tips = [
    { icon: "📍", title: "Plan Ahead", body: "Check timetables and service updates before you leave to avoid unexpected delays." },
    { icon: "🔄", title: "Combine Modes", body: "Mix cycling, bus, and walking for faster, cheaper journeys tailored to each leg." },
    { icon: "🌱", title: "Travel Green", body: "Walking and cycling have zero emissions. Rail produces far less CO₂ than driving." },
    { icon: "🕐", title: "Avoid Peak Hours", body: "Travel before 7:30 am or after 9:30 am to avoid overcrowding and often save on fares." },
    { icon: "📱", title: "Use Live Data", body: "Real-time displays at stops show actual arrival times — rely on them over printed timetables." },
    { icon: "💳", title: "Pay Smart", body: "Contactless and daily fare caps mean you're never overcharged for multiple bus or rail trips." },
  ];

  const stats = [
    { label: "Travel modes covered", value: "4" },
    { label: "Avg. city bus routes", value: "120+" },
    { label: "CO₂ saved vs driving", value: "Up to 95%" },
    { label: "Walking journeys under", value: "20 min" },
  ];

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.navyMid} 60%, #1D4E6E 100%)`,
        padding: "5rem 1.25rem 4rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />
        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}>
          <div style={{
            display: "inline-block",
            background: "rgba(11,143,122,0.2)",
            border: `1px solid rgba(11,143,122,0.4)`,
            borderRadius: 20,
            padding: "6px 16px",
            fontSize: 13,
            color: "#4ECDC4",
            marginBottom: "1.25rem",
            letterSpacing: "0.04em",
          }}>
            🗺️ Urban Mobility Guide for St Mary's District
          </div>
          <h1 style={{
            color: "#fff",
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            fontWeight: 800,
            margin: "0 0 1rem",
            lineHeight: 1.15,
            fontFamily: "Georgia, serif",
          }}>
            Getting Around the City,<br />
            <span style={{ color: "#4ECDC4" }}>Made Simple.</span>
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            lineHeight: 1.7,
            margin: "0 0 2rem",
          }}>
            Your guide to buses, rail, cycling, and walking in the city. Compare
            travel options, estimate costs, and check live service updates — all
            in one place.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => onNav("modes")}
              style={{
                background: COLORS.teal,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "14px 28px",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Explore Travel Modes →
            </button>
            <button
              onClick={() => onNav("estimator")}
              style={{
                background: "transparent",
                color: "#fff",
                border: "1.5px solid rgba(255,255,255,0.35)",
                borderRadius: 10,
                padding: "14px 28px",
                fontSize: 15,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Estimate My Journey Cost
            </button>
            <button
              onClick={() => onNav("compare")}
              style={{
                background: "transparent",
                color: "#fff",
                border: "1.5px solid rgba(255,255,255,0.35)",
                borderRadius: 10,
                padding: "14px 28px",
                fontSize: 15,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Compare Two Modes
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.25rem" }}>

        {/* Quick stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: "3rem",
        }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: COLORS.slateLight,
              borderRadius: 12,
              padding: "1.25rem",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.teal, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: COLORS.muted }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Mode shortcuts */}
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 1rem", color: COLORS.text, fontFamily: "Georgia, serif" }}>
          Travel by Mode
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: "3rem",
        }}>
          {TRAVEL_MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => onNav("modes")}
              style={{
                background: mode.bg,
                border: `1.5px solid ${mode.color}30`,
                borderRadius: 14,
                padding: "1.25rem",
                textAlign: "left",
                cursor: "pointer",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{mode.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: mode.color, marginBottom: 4 }}>{mode.label}</div>
              <div style={{ fontSize: 13, color: COLORS.slate, lineHeight: 1.5 }}>{mode.tagline}</div>
            </button>
          ))}
        </div>

        {/* Tips grid */}
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 1rem", color: COLORS.text, fontFamily: "Georgia, serif" }}>
          Journey Planning Tips
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          marginBottom: "3rem",
        }}>
          {tips.map(tip => (
            <div key={tip.title} style={{ ...STYLES.card, display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: COLORS.tealLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
              }}>{tip.icon}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, color: COLORS.text }}>{tip.title}</div>
                <div style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.6 }}>{tip.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA banner */}
        <div style={{
          background: `linear-gradient(120deg, ${COLORS.navy} 0%, ${COLORS.navyMid} 100%)`,
          borderRadius: 16,
          padding: "2rem 2.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 20,
        }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 20, marginBottom: 6, fontFamily: "Georgia, serif" }}>
              Ready to plan your journey?
            </div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 14 }}>
              Use our cost estimator to compare modes and find the best option for your trip.
            </div>
          </div>
          <button
            onClick={() => onNav("estimator")}
            style={{
              background: COLORS.teal,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "12px 24px",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Open Cost Estimator →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TRAVEL MODES PAGE ────────────────────────────────────────────────────────
function ModesPage() {
  const [active, setActive] = useState(null);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.25rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.text, margin: "0 0 0.5rem", fontFamily: "Georgia, serif" }}>
          Travel Modes
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 16, margin: 0, lineHeight: 1.7 }}>
          Compare the four main ways to travel across the city. Each mode suits
          different journey types — tap a card to explore the details.
        </p>
      </div>

      {/* Cards grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 20,
        marginBottom: "2.5rem",
      }}>
        {TRAVEL_MODES.map(mode => (
          <div
            key={mode.id}
            onClick={() => setActive(active === mode.id ? null : mode.id)}
            style={{
              ...STYLES.card,
              borderColor: active === mode.id ? mode.color : COLORS.border,
              borderWidth: active === mode.id ? 2 : 1,
              cursor: "pointer",
              transition: "all 0.15s",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute",
              top: 0, right: 0,
              width: 80,
              height: 80,
              background: mode.bg,
              borderRadius: "0 16px 0 80px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-end",
              padding: "14px 14px 0 0",
              fontSize: 24,
            }}>
              {mode.icon}
            </div>

            <div style={{ paddingRight: 60 }}>
              <span style={STYLES.badge(mode.color, mode.bg)}>{mode.label}</span>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0.6rem 0 0.4rem", color: COLORS.text }}>
                {mode.tagline}
              </h3>
              <p style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.65, margin: "0 0 1rem" }}>
                {mode.description}
              </p>
            </div>

            {/* Quick facts row */}
            <div style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              borderTop: `1px solid ${COLORS.border}`,
              paddingTop: "0.75rem",
              marginTop: "0.25rem",
            }}>
              <div style={{ fontSize: 12, color: COLORS.slate }}>
                🚀 <strong>{mode.speed}</strong>
              </div>
              <div style={{ fontSize: 12, color: COLORS.slate }}>
                💨 <strong>{mode.co2} g CO₂/km</strong>
              </div>
              <div style={{ fontSize: 12, color: COLORS.slate }}>
                💷 Base fare: <strong>{mode.baseFare === 0 ? "Free" : `£${mode.baseFare.toFixed(2)}`}</strong>
              </div>
            </div>

            {/* Expanded detail */}
            {active === mode.id && (
              <div style={{ marginTop: "1.25rem", borderTop: `1px solid ${COLORS.border}`, paddingTop: "1.25rem" }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 20,
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.teal, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      ✓ Benefits
                    </div>
                    <ul style={{ margin: 0, padding: "0 0 0 1rem", listStyle: "disc" }}>
                      {mode.benefits.map(b => (
                        <li key={b} style={{ fontSize: 13, color: COLORS.slate, marginBottom: 5, lineHeight: 1.5 }}>{b}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.amber, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      ✗ Limitations
                    </div>
                    <ul style={{ margin: 0, padding: "0 0 0 1rem", listStyle: "disc" }}>
                      {mode.limitations.map(l => (
                        <li key={l} style={{ fontSize: 13, color: COLORS.slate, marginBottom: 5, lineHeight: 1.5 }}>{l}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div style={{
              textAlign: "center",
              marginTop: "0.75rem",
              fontSize: 12,
              color: COLORS.muted,
            }}>
              {active === mode.id ? "▲ Collapse" : "▼ View benefits & limitations"}
            </div>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 1rem", color: COLORS.text, fontFamily: "Georgia, serif" }}>
        Quick Comparison
      </h2>
      <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: COLORS.navy }}>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#fff", fontWeight: 600 }}>Mode</th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#fff", fontWeight: 600 }}>Typical Speed</th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#fff", fontWeight: 600 }}>Base Fare</th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#fff", fontWeight: 600 }}>CO₂ (g/km)</th>
              <th style={{ padding: "12px 16px", textAlign: "left", color: "#fff", fontWeight: 600 }}>Best For</th>
            </tr>
          </thead>
          <tbody>
            {TRAVEL_MODES.map((mode, i) => (
              <tr key={mode.id} style={{ background: i % 2 === 0 ? "#fff" : COLORS.slateLight }}>
                <td style={{ padding: "11px 16px" }}>
                  <span style={{ marginRight: 8 }}>{mode.icon}</span>
                  <strong>{mode.label}</strong>
                </td>
                <td style={{ padding: "11px 16px", color: COLORS.slate }}>{mode.speed}</td>
                <td style={{ padding: "11px 16px" }}>
                  <span style={STYLES.badge(mode.color, mode.bg)}>
                    {mode.baseFare === 0 ? "Free" : `£${mode.baseFare.toFixed(2)}`}
                  </span>
                </td>
                <td style={{ padding: "11px 16px", color: mode.co2 === 0 ? "#3B6D11" : COLORS.slate, fontWeight: mode.co2 === 0 ? 700 : 400 }}>
                  {mode.co2 === 0 ? "Zero 🌱" : mode.co2}
                </td>
                <td style={{ padding: "11px 16px", color: COLORS.slate }}>
                  {mode.id === "bus" && "City-wide, affordable"}
                  {mode.id === "rail" && "Long-distance, speed"}
                  {mode.id === "cycling" && "Short–medium, eco"}
                  {mode.id === "walking" && "Under 2 km, health"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── COST ESTIMATOR PAGE ──────────────────────────────────────────────────────
function EstimatorPage() {
  const [distance, setDistance] = useState(5);
  const [mode, setMode] = useState("bus");
  const [passengers, setPassengers] = useState(1);
  const [result, setResult] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("smh_estimator");
      if (saved) {
        const { mode: m, distance: d, passengers: p } = JSON.parse(saved);
        if (m) setMode(m);
        if (d) setDistance(d);
        if (p) setPassengers(p);
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("smh_estimator", JSON.stringify({ mode, distance, passengers }));
  }, [mode, distance, passengers]);

  const selectedMode = TRAVEL_MODES.find(m => m.id === mode);

  function calculate() {
    const m = selectedMode;
    let base = m.baseFare + (m.costPer * distance);
    const low = (base * 0.9).toFixed(2);
    const high = (base * 1.15).toFixed(2);
    const perPax = base.toFixed(2);
    const total = (base * passengers).toFixed(2);
    const totalLow = (base * passengers * 0.9).toFixed(2);
    const totalHigh = (base * passengers * 1.15).toFixed(2);
    const minutes = Math.round((distance / (mode === "walking" ? 5 : mode === "cycling" ? 15 : mode === "bus" ? 20 : 60)) * 60);
    const co2Total = (m.co2 * distance * passengers / 1000).toFixed(2);
    const carCo2 = (180 * distance * passengers / 1000).toFixed(2);
    const saved = (carCo2 - co2Total).toFixed(2);
    setResult({ low, high, perPax, total, totalLow, totalHigh, minutes, co2Total, carCo2, saved });
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2.5rem 1.25rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.text, margin: "0 0 0.5rem", fontFamily: "Georgia, serif" }}>
          Journey Cost Estimator
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 16, margin: 0 }}>
          Enter your journey details to receive an estimated cost range and environmental comparison.
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
        gap: 24,
        alignItems: "start",
      }}>
        {/* Input panel */}
        <div style={{ ...STYLES.card }}>
          <h2 style={{ margin: "0 0 1.25rem", fontSize: 17, fontWeight: 700, color: COLORS.text }}>Journey Details</h2>

          {/* Mode selector */}
          <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.slate, display: "block", marginBottom: 8 }}>
            Travel Mode
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: "1.25rem" }}>
            {TRAVEL_MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                style={{
                  background: mode === m.id ? m.bg : "#f9f9f9",
                  border: `1.5px solid ${mode === m.id ? m.color : COLORS.border}`,
                  borderRadius: 10,
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  fontWeight: mode === m.id ? 600 : 400,
                  fontSize: 14,
                  color: mode === m.id ? m.color : COLORS.slate,
                }}
              >
                <span style={{ fontSize: 18 }}>{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>

          {/* Distance slider */}
          <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.slate, display: "block", marginBottom: 4 }}>
            Distance: <span style={{ color: COLORS.teal, fontWeight: 700 }}>{distance} km</span>
          </label>
          <input
            type="range"
            min={0.5}
            max={50}
            step={0.5}
            value={distance}
            onChange={e => setDistance(Number(e.target.value))}
            style={{ width: "100%", marginBottom: "1.25rem", accentColor: COLORS.teal }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.muted, marginTop: -16, marginBottom: "1.25rem" }}>
            <span>0.5 km</span><span>50 km</span>
          </div>

          {/* Passengers */}
          <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.slate, display: "block", marginBottom: 8 }}>
            Number of Passengers
          </label>
          <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem", flexWrap: "wrap" }}>
            {[1, 2, 3, 4, 5, 6].map(n => (
              <button
                key={n}
                onClick={() => setPassengers(n)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  border: `1.5px solid ${passengers === n ? COLORS.teal : COLORS.border}`,
                  background: passengers === n ? COLORS.teal : "#fff",
                  color: passengers === n ? "#fff" : COLORS.slate,
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Mode info */}
          <div style={{
            background: selectedMode.bg,
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: "1.5rem",
            fontSize: 13,
            color: COLORS.slate,
            lineHeight: 1.6,
          }}>
            <strong style={{ color: selectedMode.color }}>{selectedMode.icon} {selectedMode.label}</strong> — Base fare: {selectedMode.baseFare === 0 ? "Free" : `£${selectedMode.baseFare.toFixed(2)}`} + £{selectedMode.costPer.toFixed(2)}/km
          </div>

          <button
            onClick={calculate}
            style={{
              width: "100%",
              background: COLORS.teal,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "14px",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Calculate Estimate →
          </button>
        </div>

        {/* Results panel */}
        <div>
          {!result ? (
            <div style={{
              ...STYLES.card,
              textAlign: "center",
              padding: "3rem 1.5rem",
              color: COLORS.muted,
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🧮</div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>Enter your journey details</div>
              <div style={{ fontSize: 14, marginTop: 6 }}>
                Select a mode, set the distance, and tap Calculate.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Cost card */}
              <div style={{
                background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.navyMid} 100%)`,
                borderRadius: 16,
                padding: "1.75rem",
                color: "#fff",
              }}>
                <div style={{ fontSize: 13, opacity: 0.65, marginBottom: 4 }}>
                  Estimated cost {passengers > 1 ? `(${passengers} passengers)` : "(1 passenger)"}
                </div>
                <div style={{ fontSize: 40, fontWeight: 800, color: "#4ECDC4", letterSpacing: "-1px" }}>
                  £{result.totalLow} – £{result.totalHigh}
                </div>
                {passengers > 1 && (
                  <div style={{ fontSize: 14, opacity: 0.65, marginTop: 4 }}>
                    £{(result.totalLow / passengers).toFixed(2)} – £{(result.totalHigh / passengers).toFixed(2)} per person
                  </div>
                )}
                <div style={{
                  marginTop: "1rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(255,255,255,0.15)",
                  display: "flex",
                  gap: 24,
                }}>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.55 }}>Distance</div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{distance} km</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.55 }}>Est. travel time</div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{result.minutes} min</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.55 }}>Mode</div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{selectedMode.icon} {selectedMode.label}</div>
                  </div>
                </div>
              </div>

              {/* CO2 card */}
              <div style={{ ...STYLES.card }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>
                  🌱 Environmental Impact
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 12,
                }}>
                  <div style={{ background: COLORS.slateLight, borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 2 }}>Your CO₂</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: Number(result.co2Total) === 0 ? "#3B6D11" : COLORS.text }}>
                      {Number(result.co2Total) === 0 ? "0 g 🌱" : `${result.co2Total} kg`}
                    </div>
                  </div>
                  <div style={{ background: COLORS.slateLight, borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 2 }}>Equivalent by car</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#A32D2D" }}>{result.carCo2} kg</div>
                  </div>
                </div>
                {Number(result.saved) > 0 && (
                  <div style={{
                    background: "#EAF3DE",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: 13,
                    color: "#3B6D11",
                    fontWeight: 500,
                  }}>
                    ✓ You're saving approx. {result.saved} kg CO₂ vs driving
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.6, padding: "0 4px" }}>
                ⚠ Estimates are indicative only and exclude discounts, railcards, or daily fare caps.
                Actual fares may vary — always check operator websites for confirmed pricing.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SERVICE UPDATES PAGE ─────────────────────────────────────────────────────
function UpdatesPage() {
  const typeStyle = {
    warning: { bg: "#FEF3DC", color: "#854F0B", icon: "⚠️", label: "Disruption" },
    info: { bg: "#E6F1FB", color: "#185FA5", icon: "ℹ️", label: "Information" },
    success: { bg: "#EAF3DE", color: "#3B6D11", icon: "✅", label: "Restored" },
  };

  const generalInfo = [
    {
      title: "Winter timetables in effect",
      body: "Some bus and rail services are operating on reduced timetables. Services typically run at reduced frequency after 20:00 on weekdays and throughout Sundays.",
      icon: "🕐",
    },
    {
      title: "Cycle hire available citywide",
      body: "The city's public cycle hire scheme operates 24/7. Docking stations are located near major rail stations and bus interchanges. First 30 minutes free with app registration.",
      icon: "🚲",
    },
    {
      title: "Accessible travel assistance",
      body: "Passenger Assist is available on all rail services. Contact your departure station at least 2 hours before travel. All buses have low-floor access and priority seating.",
      icon: "♿",
    },
    {
      title: "Emergency transport contacts",
      body: "Lost property: 0121 254 7272. Accessibility helpline: 0800 032 0204. Journey planner text service: text JOURNEY to 60835.",
      icon: "📞",
    },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.25rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.text, margin: "0 0 0.5rem", fontFamily: "Georgia, serif" }}>
          Service Updates
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 16, margin: 0 }}>
          Current disruptions, notices, and useful information for St Mary's district travellers.
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 0.8fr)",
        gap: 24,
        alignItems: "start",
      }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 1rem", color: COLORS.text }}>
            Live Alerts
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {ALERTS.map(alert => {
              const t = typeStyle[alert.type];
              return (
                <div key={alert.id} style={{
                  ...STYLES.card,
                  borderLeft: `4px solid ${t.color}`,
                  borderRadius: 12,
                  padding: "1.1rem 1.25rem",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{t.icon}</span>
                      <span style={STYLES.badge(t.color, t.bg)}>{t.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.slate }}>{alert.mode} — {alert.line}</span>
                    </div>
                    <span style={{ fontSize: 12, color: COLORS.muted }}>{alert.updated}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: COLORS.slate, lineHeight: 1.65 }}>
                    {alert.message}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Network map placeholder */}
          <div style={{
            marginTop: 20,
            ...STYLES.card,
            background: COLORS.slateLight,
            textAlign: "center",
            padding: "2rem",
            borderStyle: "dashed",
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🗺️</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: COLORS.slate, marginBottom: 4 }}>
              Interactive Network Map
            </div>
            <div style={{ fontSize: 13, color: COLORS.muted }}>
              Full real-time network map would integrate here via operator API (TfWM / National Rail).
            </div>
          </div>
        </div>

        {/* General info */}
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 1rem", color: COLORS.text }}>
            General Information
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {generalInfo.map(info => (
              <div key={info.title} style={{ ...STYLES.card, padding: "1rem 1.25rem" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: COLORS.tealLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 17,
                    flexShrink: 0,
                  }}>
                    {info.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: COLORS.text }}>{info.title}</div>
                    <div style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.6 }}>{info.body}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Last updated */}
          <div style={{
            marginTop: 16,
            background: COLORS.navy,
            borderRadius: 12,
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Information last updated</div>
              <div style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>14 April 2026, 09:00</div>
            </div>
            <div style={{ fontSize: 22 }}>🔄</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── JOURNEY PLANNER PAGE ────────────────────────────────────────────────────
function JourneyPlannerPage() {
  const [from, setFrom] = useState("city_centre");
  const [to,   setTo]   = useState("st_marys");
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("smh_planner");
      if (saved) {
        const data = JSON.parse(saved);
        if (data.from) setFrom(data.from);
        if (data.to)   setTo(data.to);
        setRestored(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("smh_planner", JSON.stringify({ from, to }));
  }, [from, to]);

  const fromLoc = LOCATIONS.find(l => l.id === from);
  const toLoc   = LOCATIONS.find(l => l.id === to);
  const same    = from === to;

  const km = same ? 0 : (() => {
    const dx = fromLoc.x - toLoc.x, dy = fromLoc.y - toLoc.y;
    return parseFloat((Math.sqrt(dx * dx + dy * dy) * 1.3).toFixed(1));
  })();

  const AVG_SPEEDS = { bus: 20, rail: 60, cycling: 15, walking: 5 };
  const walkExcluded = km > 5;

  const routes = !same
    ? TRAVEL_MODES
        .filter(m => !(m.id === "walking" && walkExcluded))
        .map(m => ({
          mode: m,
          cost: m.baseFare + m.costPer * km,
          time: Math.round((km / AVG_SPEEDS[m.id]) * 60),
          co2:  parseFloat((m.co2 * km / 1000).toFixed(3)),
        }))
    : [];

  const minCost = routes.length ? Math.min(...routes.map(r => r.cost)) : 0;
  const minTime = routes.length ? Math.min(...routes.map(r => r.time)) : 0;
  const minCo2  = routes.length ? Math.min(...routes.map(r => r.co2))  : 0;

  function getBadges(r) {
    const out = [];
    if (r.cost === minCost) out.push({ label: "Cheapest", color: COLORS.teal });
    if (r.time === minTime) out.push({ label: "Fastest",  color: "#185FA5" });
    if (r.co2  === minCo2)  out.push({ label: "Greenest", color: "#3B6D11" });
    return out;
  }

  const sel = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: `1.5px solid ${COLORS.border}`, fontSize: 15,
    color: COLORS.text, background: "#fff", cursor: "pointer",
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "2.5rem 1.25rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.text, margin: "0 0 0.5rem", fontFamily: "Georgia, serif" }}>
          Journey Planner
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 16, margin: 0 }}>
          Select your start and end point to compare every travel option instantly.
        </p>
      </div>

      {restored && (
        <div style={{
          background: COLORS.tealLight, borderLeft: `4px solid ${COLORS.teal}`,
          borderRadius: 10, padding: "0.7rem 1rem", marginBottom: "1.25rem",
          fontSize: 13, color: COLORS.teal, display: "flex", alignItems: "center", gap: 8,
        }}>
          💾 Last journey restored from saved inputs.
        </div>
      )}

      {/* Input row */}
      <div style={{ ...STYLES.card, marginBottom: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "end" }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.slate, display: "block", marginBottom: 6 }}>
              📍 From
            </label>
            <select value={from} onChange={e => setFrom(e.target.value)} style={sel}>
              {LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.label} — {l.zone}</option>)}
            </select>
          </div>

          <button
            onClick={() => { const t = from; setFrom(to); setTo(t); }}
            title="Swap"
            style={{
              width: 40, height: 40, borderRadius: "50%", border: `1.5px solid ${COLORS.border}`,
              background: "#fff", cursor: "pointer", fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = COLORS.tealLight; e.currentTarget.style.borderColor = COLORS.teal; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = COLORS.border; }}
          >⇄</button>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.slate, display: "block", marginBottom: 6 }}>
              🏁 To
            </label>
            <select value={to} onChange={e => setTo(e.target.value)} style={sel}>
              {LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.label} — {l.zone}</option>)}
            </select>
          </div>
        </div>

        {!same && (
          <p style={{ margin: "0.75rem 0 0", fontSize: 13, color: COLORS.muted }}>
            📏 {km} km &nbsp;·&nbsp; {fromLoc.zone} → {toLoc.zone}
          </p>
        )}
      </div>

      {same && (
        <div style={{
          background: COLORS.amberLight, borderLeft: `4px solid ${COLORS.amber}`,
          borderRadius: 12, padding: "1rem 1.25rem", fontSize: 14, color: "#854F0B",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          ⚠️ Origin and destination are the same. Select different locations.
        </div>
      )}

      {!same && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: "0.75rem" }}>
            {routes.map(r => {
              const bs = getBadges(r);
              return (
                <div key={r.mode.id} style={{
                  ...STYLES.card, padding: 0, overflow: "hidden",
                  border: `1.5px solid ${bs.length ? r.mode.color : COLORS.border}`,
                }}>
                  {/* Header */}
                  <div style={{
                    background: r.mode.bg, padding: "0.9rem 1rem",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 22 }}>{r.mode.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: 15, color: r.mode.color }}>{r.mode.label}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
                      {bs.map(b => (
                        <span key={b.label} style={{
                          background: b.color, color: "#fff",
                          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                        }}>{b.label}</span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: "flex", borderTop: `1px solid ${COLORS.border}` }}>
                    {[
                      { icon: "💷", label: "Cost", val: r.cost === 0 ? "Free" : `£${r.cost.toFixed(2)}` },
                      { icon: "⏱",  label: "Time", val: `${r.time} min` },
                      { icon: "🌱", label: "CO₂",  val: r.co2 === 0 ? "0 g" : `${r.co2} kg` },
                    ].map((s, i) => (
                      <div key={s.label} style={{
                        flex: 1, padding: "0.7rem 0.4rem", textAlign: "center",
                        borderRight: i < 2 ? `1px solid ${COLORS.border}` : "none",
                      }}>
                        <div style={{ fontSize: 13 }}>{s.icon}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{s.val}</div>
                        <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 1 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {walkExcluded && (
            <p style={{ fontSize: 13, color: COLORS.muted, margin: "0 0 4px" }}>
              🚶 Walking hidden — journey exceeds 5 km practical limit.
            </p>
          )}
          <p style={{ fontSize: 12, color: COLORS.muted, margin: "4px 0 0" }}>
            ⚠ Estimates based on predefined local data. Actual fares and times may vary.
          </p>
        </>
      )}
    </div>
  );
}

// ─── JOURNEY COMPARISON PAGE ─────────────────────────────────────────────────
function ComparisonPage() {
  const [modeA, setModeA] = useState("bus");
  const [modeB, setModeB] = useState("rail");
  const [distance, setDistance] = useState(5);
  const [passengers, setPassengers] = useState(1);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("smh_compare");
      if (saved) {
        const { modeA: a, modeB: b, distance: d, passengers: p } = JSON.parse(saved);
        if (a) setModeA(a);
        if (b) setModeB(b);
        if (d) setDistance(d);
        if (p) setPassengers(p);
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("smh_compare", JSON.stringify({ modeA, modeB, distance, passengers }));
  }, [modeA, modeB, distance, passengers]);

  const AVG_SPEEDS = { bus: 20, rail: 60, cycling: 15, walking: 5 };

  function convScore(modeId, dist) {
    if (modeId === "walking") return dist <= 1 ? 9 : dist <= 2 ? 7 : dist <= 3 ? 5 : 2;
    if (modeId === "cycling") return dist <= 5 ? 9 : dist <= 10 ? 7 : dist <= 20 ? 5 : 3;
    if (modeId === "bus")     return dist <= 1 ? 4 : dist <= 15 ? 8 : 7;
    /* rail */                return dist <= 3 ? 5 : dist <= 8 ? 7 : 9;
  }

  function calcMode(modeId) {
    const m = TRAVEL_MODES.find(t => t.id === modeId);
    return {
      mode: m,
      cost: (m.baseFare + m.costPer * distance) * passengers,
      time: Math.round((distance / AVG_SPEEDS[modeId]) * 60),
      co2:  parseFloat((m.co2 * distance * passengers / 1000).toFixed(3)),
      conv: convScore(modeId, distance),
    };
  }

  const A = calcMode(modeA);
  const B = calcMode(modeB);
  const sameMode = modeA === modeB;

  const categories = [
    {
      key: "cost", label: "Estimated Cost", icon: "💷",
      valA: `£${A.cost.toFixed(2)}`, valB: `£${B.cost.toFixed(2)}`,
      numA: A.cost, numB: B.cost, lowerIsBetter: true,
      sub: passengers > 1 ? `for ${passengers} passengers` : "per person",
    },
    {
      key: "time", label: "Travel Time", icon: "⏱",
      valA: `${A.time} min`, valB: `${B.time} min`,
      numA: A.time, numB: B.time, lowerIsBetter: true,
      sub: `for ${distance} km`,
    },
    {
      key: "co2", label: "CO₂ Emissions", icon: "🌱",
      valA: A.co2 === 0 ? "0 g" : `${A.co2} kg`,
      valB: B.co2 === 0 ? "0 g" : `${B.co2} kg`,
      numA: A.co2, numB: B.co2, lowerIsBetter: true,
      sub: "lower is better",
    },
    {
      key: "conv", label: "Convenience", icon: "⭐",
      valA: `${A.conv}/10`, valB: `${B.conv}/10`,
      numA: A.conv, numB: B.conv, lowerIsBetter: false,
      sub: `for a ${distance} km journey`,
    },
  ];

  function winner(cat) {
    const better = cat.lowerIsBetter
      ? (cat.numA < cat.numB ? "A" : cat.numB < cat.numA ? "B" : "tie")
      : (cat.numA > cat.numB ? "A" : cat.numB > cat.numA ? "B" : "tie");
    return better;
  }

  const results = categories.map(cat => ({ ...cat, winner: winner(cat) }));
  const winsA = results.filter(r => r.winner === "A").length;
  const winsB = results.filter(r => r.winner === "B").length;

  function ModeGrid({ selected, onSelect }) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {TRAVEL_MODES.map(m => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            style={{
              background: selected === m.id ? m.bg : "#f9f9f9",
              border: `1.5px solid ${selected === m.id ? m.color : COLORS.border}`,
              borderRadius: 10,
              padding: "9px 10px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              fontWeight: selected === m.id ? 700 : 400,
              fontSize: 13,
              color: selected === m.id ? m.color : COLORS.slate,
              transition: "all 0.12s",
            }}
          >
            <span style={{ fontSize: 16 }}>{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>
    );
  }

  function ValueCell({ val, catWinner, side, mode, isTie, isAlt }) {
    const isWinner = catWinner === side;
    return (
      <div style={{
        padding: "1rem 1.25rem",
        background: isWinner ? mode.bg : isAlt ? COLORS.slateLight : "#fff",
        borderRight: side === "A" ? `1px solid ${COLORS.border}` : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      }}>
        <span style={{ fontSize: 19, fontWeight: 700, color: isWinner ? mode.color : COLORS.text }}>
          {val}
        </span>
        {isWinner && (
          <span style={{ background: mode.color, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap" }}>
            ✓ Better
          </span>
        )}
        {isTie && side === "A" && (
          <span style={{ background: COLORS.border, color: COLORS.slate, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap" }}>
            = Equal
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2.5rem 1.25rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.text, margin: "0 0 0.5rem", fontFamily: "Georgia, serif" }}>
          Journey Comparison
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 16, margin: 0, lineHeight: 1.7 }}>
          Select two travel modes and set your journey details to compare cost, time,
          emissions, and convenience side by side.
        </p>
      </div>

      {/* Setup card */}
      <div style={{ ...STYLES.card, marginBottom: "1.5rem" }}>
        <h2 style={{ margin: "0 0 1.25rem", fontSize: 17, fontWeight: 700, color: COLORS.text }}>
          Journey Setup
        </h2>

        {/* Mode selectors */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 48px 1fr", gap: 8, alignItems: "start", marginBottom: "1.5rem" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Mode A
            </div>
            <ModeGrid selected={modeA} onSelect={setModeA} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 26 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: COLORS.navy, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 12, letterSpacing: "0.04em", flexShrink: 0,
            }}>
              VS
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Mode B
            </div>
            <ModeGrid selected={modeB} onSelect={setModeB} />
          </div>
        </div>

        {/* Distance + passengers */}
        <div className="two-col-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.slate, display: "block", marginBottom: 4 }}>
              Distance: <span style={{ color: COLORS.teal, fontWeight: 700 }}>{distance} km</span>
            </label>
            <input
              type="range" min={0.5} max={50} step={0.5} value={distance}
              onChange={e => setDistance(Number(e.target.value))}
              style={{ width: "100%", accentColor: COLORS.teal, marginBottom: 2 }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.muted }}>
              <span>0.5 km</span><span>50 km</span>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.slate, display: "block", marginBottom: 8 }}>
              Passengers
            </label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[1, 2, 3, 4, 5, 6].map(n => (
                <button
                  key={n}
                  onClick={() => setPassengers(n)}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    border: `1.5px solid ${passengers === n ? COLORS.teal : COLORS.border}`,
                    background: passengers === n ? COLORS.teal : "#fff",
                    color: passengers === n ? "#fff" : COLORS.slate,
                    fontWeight: 600, fontSize: 14, cursor: "pointer",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Same-mode warning */}
      {sameMode && (
        <div style={{
          background: COLORS.amberLight,
          border: `1px solid ${COLORS.amber}40`,
          borderLeft: `4px solid ${COLORS.amber}`,
          borderRadius: 12,
          padding: "1rem 1.25rem",
          fontSize: 14,
          color: "#854F0B",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          Both modes are the same. Select different modes above to compare them.
        </div>
      )}

      {/* Comparison table */}
      {!sameMode && (
        <>
          <div style={{ ...STYLES.card, padding: 0, overflow: "hidden" }}>
            {/* Column headers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: `2px solid ${COLORS.border}` }}>
              <div style={{
                padding: "1rem 1.25rem",
                background: COLORS.slateLight,
                borderRight: `1px solid ${COLORS.border}`,
                fontSize: 12, fontWeight: 700, color: COLORS.muted,
                textTransform: "uppercase", letterSpacing: "0.06em",
                display: "flex", alignItems: "center",
              }}>
                Category
              </div>
              <div style={{
                padding: "1rem 1.25rem",
                background: A.mode.bg,
                borderRight: `1px solid ${COLORS.border}`,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontSize: 22 }}>{A.mode.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: A.mode.color }}>{A.mode.label}</div>
                  <div style={{ fontSize: 11, color: COLORS.muted }}>Mode A</div>
                </div>
              </div>
              <div style={{
                padding: "1rem 1.25rem",
                background: B.mode.bg,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontSize: 22 }}>{B.mode.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: B.mode.color }}>{B.mode.label}</div>
                  <div style={{ fontSize: 11, color: COLORS.muted }}>Mode B</div>
                </div>
              </div>
            </div>

            {/* Rows */}
            {results.map((cat, i) => (
              <div
                key={cat.key}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  borderBottom: i < results.length - 1 ? `1px solid ${COLORS.border}` : "none",
                }}
              >
                <div style={{
                  padding: "1rem 1.25rem",
                  background: i % 2 === 0 ? "#fff" : COLORS.slateLight,
                  borderRight: `1px solid ${COLORS.border}`,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ fontSize: 20 }}>{cat.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{cat.label}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted }}>{cat.sub}</div>
                  </div>
                </div>
                <ValueCell
                  val={cat.valA} catWinner={cat.winner} side="A"
                  mode={A.mode} isTie={cat.winner === "tie"} isAlt={i % 2 !== 0}
                />
                <ValueCell
                  val={cat.valB} catWinner={cat.winner} side="B"
                  mode={B.mode} isTie={cat.winner === "tie"} isAlt={i % 2 !== 0}
                />
              </div>
            ))}

            {/* Verdict bar */}
            <div style={{
              background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.navyMid} 100%)`,
              padding: "1.25rem 1.5rem",
              display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
            }}>
              <div style={{ fontSize: 32 }}>
                {winsA > winsB ? A.mode.icon : winsB > winsA ? B.mode.icon : "🤝"}
              </div>
              <div style={{ flex: 1 }}>
                {winsA !== winsB ? (
                  <>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>Overall recommendation</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
                      <span style={{ color: "#4ECDC4" }}>
                        {winsA > winsB ? A.mode.label : B.mode.label}
                      </span> is the better choice for this journey
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
                      Wins {Math.max(winsA, winsB)} of {results.length} categories · {distance} km · {passengers} {passengers === 1 ? "person" : "people"}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>It's a tie!</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
                      Both modes score equally — choose based on your own priority for this journey.
                    </div>
                  </>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[{ label: A.mode.label, wins: winsA }, { label: B.mode.label, wins: winsB }].map(s => (
                  <div key={s.label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#4ECDC4" }}>{s.wins}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 1, whiteSpace: "nowrap" }}>{s.label} wins</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.6, padding: "0.75rem 4px 0" }}>
            ⚠ Estimates are indicative only. Convenience scores reflect typical conditions and may vary by individual circumstances. Always check live service information before travelling.
          </div>
        </>
      )}
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({ onNav }) {
  return (
    <footer style={{
      background: COLORS.navy,
      marginTop: "4rem",
      padding: "2.5rem 1.25rem",
      borderTop: `3px solid ${COLORS.teal}`,
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 32,
          marginBottom: "2rem",
        }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 8, fontFamily: "Georgia, serif" }}>
              St Mary's Urban Mobility Hub
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
              Helping residents and visitors navigate the city with confidence.
            </div>
          </div>
          <div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Navigate</div>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                style={{
                  display: "block",
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 14,
                  cursor: "pointer",
                  padding: "4px 0",
                  textAlign: "left",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>External Links</div>
            {["National Rail", "Transport for West Midlands", "Sustrans (Cycling)", "City Council Travel"].map(link => (
              <div key={link} style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", padding: "4px 0" }}>
                {link}
              </div>
            ))}
          </div>
          <div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Emergency Contacts</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 2 }}>
              <div>Lost property: 0121 254 7272</div>
              <div>Accessibility: 0800 032 0204</div>
              <div>Journey SMS: TEXT to 60835</div>
            </div>
          </div>
        </div>
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: "1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
            © 2026 St Mary's Urban Mobility Hub. All fare estimates are indicative only.
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
            Responsive · Accessible · Version 1.0
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── RESPONSIVE CSS injection ─────────────────────────────────────────────────
function GlobalStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      * { box-sizing: border-box; }
      body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F7F8FA; }
      @media (max-width: 680px) {
        .desktop-nav { display: none !important; }
        .hamburger { display: flex !important; }
      }
      @media (max-width: 700px) {
        .two-col-grid { grid-template-columns: 1fr !important; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const topRef = useRef(null);

  function navigate(target) {
    setPage(target);
    setMenuOpen(false);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  return (
    <div ref={topRef} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <GlobalStyles />
      <Navbar current={page} onNav={navigate} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main style={{ flex: 1 }}>
        {page === "home"      && <HomePage onNav={navigate} />}
        {page === "planner"   && <JourneyPlannerPage />}
        {page === "modes"     && <ModesPage />}
        {page === "estimator" && <EstimatorPage />}
        {page === "compare"   && <ComparisonPage />}
        {page === "updates"   && <UpdatesPage />}
      </main>
      <Footer onNav={navigate} />
    </div>
  );
}