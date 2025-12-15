const API_URL =
  "https://v6.db.transport.rest/stops/623074/departures?duration=120";

async function loadDepartures() {
  const status = document.getElementById("status");
  const list = document.getElementById("list");

  status.textContent = "Lade…";
  list.innerHTML = "";

  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    // entspricht:
    // jq -r '.departures[] | "\(.when)  \(.line.name) → \(.direction)"'
    data.departures.forEach(dep => {
      const when = dep.when ?? "—";
      const line = dep.line?.name ?? "?";
      const direction = dep.direction ?? "?";

      const li = document.createElement("li");
      li.textContent = `${when}  ${line} → ${direction}`;
      list.appendChild(li);
    });

    status.textContent = `OK (${data.departures.length} Abfahrten)`;
  } catch (err) {
    status.textContent = "Fehler beim Laden";
    status.className = "error";
    status.textContent = err.message;
  }
}

// automatisch beim Laden der Seite
loadDepartures();

// optional: Auto-Refresh alle 60 Sekunden
// setInterval(loadDepartures, 60_000);
