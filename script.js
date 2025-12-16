const API_URL =
  "https://v6.db.transport.rest/stops/623074/departures?duration=15";

function formatWhenHHMM(whenStr) {
  // jq: .when | split("T")[1] | split("+")[0][0:5]
  // Beispiel: 2025-12-16T21:07:00+01:00 -> 21:07
  if (!whenStr || typeof whenStr !== "string") return "—";
  const tPart = whenStr.split("T")[1];          // "21:07:00+01:00"
  if (!tPart) return "—";
  const noTz = tPart.split("+")[0].split("Z")[0]; // "21:07:00" (oder "21:07:00" bei Z)
  return noTz.slice(0, 5);                      // "21:07"
}

function stripBusPrefix(lineName) {
  // jq: sub("^Bus "; "")
  if (!lineName || typeof lineName !== "string") return "?";
  return lineName.replace(/^Bus\s+/, "");
}

async function loadDepartures() {
  const status = document.getElementById("status");
  const list = document.getElementById("list");

  status.className = "";
  status.textContent = "Lade…";
  list.innerHTML = "";

  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    data.departures.forEach((dep) => {
      const when = formatWhenHHMM(dep.when);
      const line = stripBusPrefix(dep.line?.name);
      const direction = dep.direction ?? "?";

      const li = document.createElement("li");
      li.textContent = `${when}  ${line} → ${direction}`;
      list.appendChild(li);
    });

    status.textContent = `OK (${data.departures.length} Abfahrten)`;
  } catch (err) {
    status.className = "error";
    status.textContent = err?.message ?? "Fehler beim Laden";
  }
}

// automatisch beim Laden der Seite
loadDepartures();

// optional: Auto-Refresh alle 60 Sekunden
// setInterval(loadDepartures, 60_000);
