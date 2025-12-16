// Hilfsfunktion: formatiert Zeit + Zeile + Richtung
function formatDeparture(dep, removeBusPrefix = false) {
  // Zeit: "2025-12-16T21:07:00+01:00" → "21:07"
  const time = dep.when
    .split("T")[1]
    .split("+")[0]
    .substring(0, 5);

  // Linienname ggf. "Bus " entfernen
  let line = dep.line.name;
  if (removeBusPrefix) {
    line = line.replace(/^Bus /, "");
  }

  return `${time}  ${line} → ${dep.direction}`;
}

// Allgemeine Fetch-Funktion
async function loadDepartures(url, filterFn, targetId, removeBusPrefix = false) {
  const res = await fetch(url);
  const data = await res.json();

  const lines = data.departures
    .filter(filterFn)
    .map(dep => formatDeparture(dep, removeBusPrefix));

  document.getElementById(targetId).textContent =
    lines.length ? lines.join("\n") : "Keine Abfahrten";
}

/* ===== Aufrufe entsprechen exakt deinen curl/jq-Beispielen ===== */

// 1) Bus – Stop 623074
loadDepartures(
  "https://v6.db.transport.rest/stops/623074/departures?duration=120",
  () => true,          // keine Filter
  "bus",
  true                // "Bus " entfernen
);

// 2) S4 / S27 – Stop 8004158
loadDepartures(
  "https://v6.db.transport.rest/stops/8004158/departures?duration=120",
  dep => dep.line.name === "S4" || dep.line.name === "S27",
  "sbahn1"
);

// 3) S7 / S27 – Stop 8005419
loadDepartures(
  "https://v6.db.transport.rest/stops/8005419/departures?duration=120",
  dep => dep.line.name === "S7" || dep.line.name === "S27",
  "sbahn2"
);
