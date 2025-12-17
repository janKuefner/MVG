// jq: ((.when // .plannedWhen) // "") as $t | select($t != "")
function getBestTime(dep) {
  return (dep.when ?? dep.plannedWhen ?? "") || "";
}

// jq: split("T")[1] | split("+")[0][0:5]
function toHHMM(isoTime) {
  // Erwartet z.B. "2025-12-16T21:07:00+01:00"
  return isoTime.split("T")[1].split("+")[0].substring(0, 5);
}

function formatLine(timeIso, lineName, direction) {
  return `${toHHMM(timeIso)}  ${lineName} → ${direction}`;
}

async function loadDepartures(url, filterFn, targetId, options = {}) {
  const res = await fetch(url);
  const data = await res.json();

  const lines = (data.departures || [])
    .filter(filterFn)
    .map(dep => {
      // Default: dep.when; optional: when/plannedWhen fallback (wie jq)
      const t = options.usePlannedFallback ? getBestTime(dep) : (dep.when || "");
      if (!t) return null;

      let lineName = dep.line?.name ?? "";
      if (options.removeBusPrefix) {
        // jq: sub("^Bus "; "")
        lineName = lineName.replace(/^Bus /, "");
      }

      return formatLine(t, lineName, dep.direction ?? "");
    })
    .filter(Boolean);

  document.getElementById(targetId).textContent =
    lines.length ? lines.join("\n") : "Keine Abfahrten";
}

/* ===== 1) Bus – Stop 623074 =====
curl ...623074... | jq -r '.departures[] | "HH:MM  (line w/o Bus ) → direction"'
*/
loadDepartures(
  "https://v6.db.transport.rest/stops/623074/departures?duration=120",
  () => true,                 // keine Filter
  "bus",
  { removeBusPrefix: true }   // "Bus " entfernen
);

/* ===== 2) Stop 8004158 – S4 / S20 + when/plannedWhen fallback =====
jq:
.departures[]
| select(.line.name == "S4" or .line.name == "S20")
| ((.when // .plannedWhen) // "") as $t
| select($t != "")
| "HH:MM  line → direction"
*/
loadDepartures(
  "https://v6.db.transport.rest/stops/8004158/departures?duration=120",
  dep => dep.line?.name === "S4" || dep.line?.name === "S20",
  "sbahn1",
  { usePlannedFallback: true }
);

/* ===== 3) Stop 8005419 – S20 OR (Bus 62 AND direction contains "Ostbahnhof") =====
jq:
.departures[]
| ((.when // .plannedWhen) // "") as $t
| select($t != "")
| select((.line.name == "
