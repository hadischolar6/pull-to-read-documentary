// Sample content for a UX prototype — "Nashik Through Time".
// Written for this demo only; historical details are simplified and must be checked by an editor before real use.
// Film = a simulated 90-second documentary (illustrated scenes + captions). Every caption line (cue) is linked to one "moment".
window.DOC = {
  city: "Nashik",
  cities: ["Nashik", "Pune", "Aurangabad", "Nagpur"],
  title: "Nashik Through Time",
  duration: 90,
  eras: [
    { id: "ancient", name: "Ancient", range: "Legend & early settlement", start: 0, end: 15, color: "#8a7f72" },
    { id: "satavahana", name: "Satavahana", range: "c. 2nd century BCE – 3rd century CE", start: 15, end: 30, color: "#c8692b" },
    { id: "medieval", name: "Medieval", range: "c. 7th – 17th century", start: 30, end: 45, color: "#6f7f5a" },
    { id: "maratha", name: "Maratha", range: "18th century – 1818", start: 45, end: 60, color: "#9a5b3c" },
    { id: "british", name: "British", range: "1818 – 1947", start: 60, end: 75, color: "#4f6a86" },
    { id: "today", name: "Today", range: "1947 – now", start: 75, end: 90, color: "#3f7d74" }
  ],
  cues: [
    { t: 0, era: "ancient", moment: "panchavati", text: "Long before written records, legend placed Rama's forest exile at Panchavati, on the Godavari." },
    { t: 7.5, era: "ancient", moment: "name", text: "Local tradition even links the city's name to that story." },
    { t: 15, era: "satavahana", moment: "pandavleni", text: "Around 2,000 years ago, monks carved a row of caves into Trirashmi hill." },
    { t: 22.5, era: "satavahana", moment: "balashri", text: "In one of them, Queen Gautami Balashri recorded the victories of her son, King Gautamiputra Satakarni." },
    { t: 30, era: "medieval", moment: "dynasties", text: "For centuries the town passed between Deccan kingdoms, from the Rashtrakutas to the Yadavas." },
    { t: 37.5, era: "medieval", moment: "gulshanabad", text: "Under the Mughals, some records call it Gulshanabad — the city of gardens." },
    { t: 45, era: "maratha", moment: "peshwa", text: "In the 18th century, Peshwa patronage turned the riverbanks into a city of temples." },
    { t: 52.5, era: "maratha", moment: "kalaram", text: "The black-stone Kalaram Temple rose near Panchavati." },
    { t: 60, era: "british", moment: "company", text: "In 1818, after the last Anglo-Maratha war, Nashik came under Company rule." },
    { t: 67.5, era: "british", moment: "satyagraha", text: "In 1930 the same Kalaram Temple became the stage of a protest for temple entry, led by Dr. B. R. Ambedkar." },
    { t: 75, era: "today", moment: "kumbh", text: "Every twelve years, millions gather on these ghats for the Simhastha Kumbh Mela." },
    { t: 82.5, era: "today", moment: "vineyards", text: "Today the hills around the city are also known for vineyards." }
  ],
  moments: {
    panchavati: {
      kind: "Place", title: "Panchavati & the Godavari",
      summary: "The riverside quarter where, in the Ramayana tradition, Rama, Sita and Lakshmana lived during their exile. Ramkund on the Godavari is still the city's ritual heart.",
      evidence: ["Oral tradition", "Temple traditions"],
      places: ["Ramkund ghat", "Sita Gufa"], people: ["Rama", "Sita", "Lakshmana"],
      sources: ["Valmiki Ramayana, Aranya Kanda (legend)"]
    },
    name: {
      kind: "Story", title: "Where the name comes from",
      summary: "A popular story links 'Nashik' to nasika (nose), after Lakshmana cuts off Shurpanakha's nose. Historians treat this as legend, not evidence.",
      evidence: ["Folk etymology"], places: ["Panchavati"], people: ["Shurpanakha", "Lakshmana"],
      sources: ["Local tradition"]
    },
    pandavleni: {
      kind: "Place", title: "Pandavleni Caves",
      summary: "A group of Buddhist rock-cut caves on Trirashmi hill, carved over several centuries. Their inscriptions are among the best records of the Satavahana age.",
      evidence: ["Cave remains", "Inscriptions"], places: ["Trirashmi hill"], people: ["Buddhist monks", "Donors"],
      sources: ["Cave inscriptions (Prakrit, Brahmi script)"]
    },
    balashri: {
      kind: "Empire", title: "Gautamiputra Satakarni",
      summary: "The inscription of Queen Gautami Balashri praises her son as a king who restored Satavahana power in the Deccan, including victories over the Western Kshatrapas.",
      evidence: ["Inscriptions", "Coins"], places: ["Pandavleni, Cave 3"], people: ["Gautami Balashri", "Gautamiputra Satakarni"],
      sources: ["Nashik Cave 3 inscription"]
    },
    dynasties: {
      kind: "Empire", title: "Deccan kingdoms",
      summary: "Between roughly the 7th and 13th centuries the region sat inside larger Deccan states such as the Rashtrakutas and later the Yadavas of Devagiri.",
      evidence: ["Copper-plate grants", "Temple remains"], places: ["Devagiri (Daulatabad)"], people: ["Yadava rulers"],
      sources: ["Copper-plate grants (sample)"]
    },
    gulshanabad: {
      kind: "Story", title: "Gulshanabad, the city of gardens",
      summary: "Under Mughal rule the town is said to have been called Gulshanabad for its gardens. The old name faded after Maratha control returned.",
      evidence: ["Administrative records"], places: ["Old town"], people: ["Mughal administrators"],
      sources: ["Gazetteer of the Bombay Presidency: Nasik (1883)"]
    },
    peshwa: {
      kind: "Empire", title: "Peshwa-era Nashik",
      summary: "Maratha nobles and the Peshwas funded ghats and temples along the Godavari, giving the old city much of the look it still has.",
      evidence: ["Temple architecture", "Grant records"], places: ["Godavari ghats", "Sundarnarayan Temple"], people: ["Peshwas", "Maratha sardars"],
      sources: ["Peshwa records (sample)"]
    },
    kalaram: {
      kind: "Place", title: "Kalaram Temple",
      summary: "A temple of black stone dedicated to Rama, completed in the late 18th century with Peshwa-era patronage.",
      evidence: ["Temple architecture"], places: ["Panchavati"], people: ["Sardar Rangarao Odhekar"],
      sources: ["Temple inscription (sample)"]
    },
    company: {
      kind: "Event", title: "1818: Company rule",
      summary: "The Third Anglo-Maratha War ended Peshwa rule. Nashik became part of British-administered territory and later a district of the Bombay Presidency.",
      evidence: ["Treaties", "Administrative maps"], places: ["Nashik Road"], people: ["East India Company officials"],
      sources: ["Gazetteer of the Bombay Presidency: Nasik (1883)"]
    },
    satyagraha: {
      kind: "Event", title: "1930 Kalaram Temple Satyagraha",
      summary: "Dr. B. R. Ambedkar led a long, non-violent campaign demanding that Dalits be allowed to enter the Kalaram Temple.",
      evidence: ["Newspaper reports", "Speeches"], places: ["Kalaram Temple"], people: ["Dr. B. R. Ambedkar"],
      sources: ["Contemporary newspapers (sample)"]
    },
    kumbh: {
      kind: "Event", title: "Simhastha Kumbh Mela",
      summary: "One of the four Kumbh Mela sites. Pilgrims bathe at Ramkund and at Trimbakeshwar, near the source of the Godavari.",
      evidence: ["Festival records", "Photographs"], places: ["Ramkund", "Trimbakeshwar"], people: ["Pilgrims", "Sadhus"],
      sources: ["Festival authority records (sample)"]
    },
    vineyards: {
      kind: "Story", title: "The vineyard hills",
      summary: "Since the late 20th century, grape farms and wineries have given the district a new identity alongside its pilgrim past.",
      evidence: ["Farm data"], places: ["Gangapur road"], people: ["Grape farmers"],
      sources: ["Agriculture reports (sample)"]
    }
  }
};
