// ---------- Hilfsfunktionen ----------
function getTime(dep) {
  const t = dep.when || dep.plannedWhen;
  if (!t) return "";
  return t.split("T")[1].split("+")[0].substring(0, 5);
}

function line(text) {
  return text + "\n";
}

// ---------- 1) Bus – 623074 ----------
fetch("https://v6.db.transport.rest/stops/623074/departures?duration=120")
  .then(r => r.json())
  .then(data => {
    let out = "";
    data.departures.forEach(d => {
      const time = getTime(d);
      if (!time) return;

      const name = d.line.name.replace(/^Bus /, "");
      out += `${time}  ${name} → ${d.direction}\n`;
    });
    document.getElementById("bus").textContent = out || "Keine Abfahrten";
  });

// ---------- 2) S4 / S20 – 8004158 ----------
fetch("https://v6.db.transport.rest/stops/8004158/departures?duration=120")
  .then(r => r.json())
  .then(data => {
    let out = "";
    data.departures.forEach(d => {
      if (d.line.name !== "S4" && d.line.name !== "S20") return;

      const time = getTime(d);
      if (!time) return;

      out += `${time}  ${d.line.name} → ${d.direction}\n`;
    });
    document.getElementById("sbahn1").textContent = out || "Keine Abfahrten";
  });

// ---------- 3) S20 ODER Bus 62 → Ostbahnhof – 8005419 ----------
fetch("https://v6.db.transport.rest/stops/8005419/departures?duration=120")
  .then(r => r.json())
  .then(data => {
    let out = "";
    data.departures.forEach(d => {
      const time = getTime(d);
      if (!time) return;

      const isS20 = d.line.name === "S20";
      const isBus62Ost =
        d.line.name === "Bus 62" &&
        d.direction &&
        d.direction.includes("Ostbahnhof");

      if (!isS20 && !isBus62Ost) return;

      out += `${time}  ${d.line.name} → ${d.direction}\n`;
    });
    document.getElementById("mix").textContent = out || "Keine Abfahrten";
  });
