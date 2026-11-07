// "Pull to read, push to watch" — prototype logic. Plain JS, no libraries.
// innerHTML below only renders the static sample data in data.js (no user input); user text (search) goes through textContent.
(function () {
  const D = window.DOC;
  const $ = (id) => document.getElementById(id);
  const app = $("app"), film = $("film");
  const S = { t: 0, playing: true, mode: "watch", resumeCue: 0, shownCue: 0, saved: new Set(), storyDone: new Set(), story: null, lastEra: null, lastCue: -1 };
  const params = new URLSearchParams(location.search);
  if (params.has("t")) S.t = Math.max(0, Math.min(D.duration, +params.get("t") || 0));
  if (params.get("autoplay") === "0") S.playing = false;

  const fmt = (s) => { s = Math.floor(s); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  const cueAt = (t) => { let i = 0; D.cues.forEach((c, k) => { if (c.t <= t) i = k; }); return i; };
  const eraOf = (id) => D.eras.find((e) => e.id === id);
  const eraAt = (t) => D.eras.find((e) => t >= e.start && t < e.end) || D.eras[D.eras.length - 1];
  const cueOfMoment = (m) => D.cues.findIndex((c) => c.moment === m);
  let toastTimer;
  function toast(msg) { const el = $("toast"); el.textContent = msg; el.classList.add("on"); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("on"), 2600); }

  // ---------- static UI ----------
  D.eras.forEach((e) => {
    const b = document.createElement("button"); b.textContent = e.name; b.dataset.era = e.id;
    // r4: while reading, an era tap must resume at that era (backToFilm otherwise returns to the old sentence)
    b.onclick = () => { if (S.mode === "read") S.resumeCue = D.cues.findIndex((c) => c.era === e.id); seek(e.start); backToFilm(true); };
    $("eraRail").appendChild(b);
    const i = document.createElement("i"); $("scrubEras").appendChild(i);
  });
  D.cities.forEach((c) => {
    const li = document.createElement("li"); li.textContent = c; li.setAttribute("role", "option");
    li.setAttribute("aria-selected", c === D.city ? "true" : "false");
    // r5: be honest in the UI: only Nashik has sample content in this prototype
    if (c !== D.city) { li.classList.add("nosample"); const sm = document.createElement("small"); sm.textContent = " · no sample yet"; li.appendChild(sm); }
    li.onclick = () => { $("cityList").hidden = true; if (c !== D.city) toast(c + ": sample content exists only for Nashik in this prototype."); };
    $("cityList").appendChild(li);
  });
  $("cityBtn").onclick = () => { $("cityList").hidden = !$("cityList").hidden; };

  // ---------- film ----------
  function setPlaying(p) { S.playing = p; $("playBtn").textContent = p ? "❚❚" : "▶"; $("playBtn").setAttribute("aria-label", p ? "Pause" : "Play"); app.classList.toggle("paused", !p); app.classList.toggle("watching", p); }
  function seek(t) { S.t = Math.max(0, Math.min(D.duration - 0.01, t)); S.lastCue = -1; renderFilm(); }
  $("playBtn").onclick = () => { if (S.mode === "read") { backToFilm(true); return; } setPlaying(!S.playing); };
  $("scrub").onclick = (ev) => { const r = $("scrub").getBoundingClientRect(); seek(((ev.clientX - r.left) / r.width) * D.duration); };

  function renderFilm() {
    const ci = cueAt(S.t), cue = D.cues[ci], era = eraOf(cue.era);
    $("time").textContent = fmt(S.t) + " / " + fmt(D.duration);
    $("scrubFill").style.width = (S.t / D.duration) * 100 + "%";
    $("scrub").setAttribute("aria-valuenow", Math.round(S.t));
    if (ci !== S.lastCue) {
      S.lastCue = ci;
      $("caption").textContent = cue.text;
      $("sceneEra").textContent = era.name;
      $("sceneArt").style.setProperty("--era", era.color);
      // r8: drawn still for the era (sample illustration) instead of a striped placeholder
      $("sceneArt").style.backgroundImage = "url(scene/" + era.id + ".svg)";
      renderTranscript(ci);
      document.querySelectorAll("#eraRail button").forEach((b) => b.classList.toggle("on", b.dataset.era === era.id));
      // r7: keep the active era chip in view on narrow phones (rail scrolls sideways only, the page never moves)
      followRail(true);
      const m = D.moments[cue.moment];
      $("peekTitle").textContent = m.kind + ": " + m.title;
      $("peekStar").classList.toggle("on", S.saved.has(cue.moment));
      $("peekStar").textContent = S.saved.has(cue.moment) ? "★" : "☆";
      if (S.mode === "watch") { $("peek").classList.remove("flash"); void $("peek").offsetWidth; $("peek").classList.add("flash"); }
    }
  }
  // r7: centre the active era chip in the rail (sideways scroll of the rail only); re-run once the web font has changed chip widths
  function followRail(smooth) {
    const rail = $("eraRail"), on = rail.querySelector("button.on"); if (!on) return;
    rail.scrollTo({ left: Math.max(0, on.offsetLeft - rail.offsetLeft - (rail.clientWidth - on.offsetWidth) / 2), behavior: smooth ? "smooth" : "auto" });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => followRail(false));
  window.addEventListener("resize", () => followRail(false));
  // r8: watch mode shows the chapter transcript under the film; the line on screen is highlighted
  function renderTranscript(ci) {
    const cue = D.cues[ci], era = eraOf(cue.era), ol = $("transcript"); if (!ol) return;
    $("trHead").textContent = "Chapter " + (D.eras.indexOf(era) + 1) + " of " + D.eras.length + " — " + era.name;
    ol.innerHTML = "";
    D.cues.forEach((c, k) => {
      if (c.era !== cue.era && k !== ci + 1) return;
      const li = document.createElement("li"); li.className = k < ci ? "past" : k === ci ? "now" : "next";
      const m = D.moments[c.moment];
      li.innerHTML = "<time>" + fmt(c.t) + "</time><span>" + c.text + "</span><em>" + m.kind + " · " + m.title + (S.saved.has(c.moment) ? " ★" : "") + "</em>";
      ol.appendChild(li);
    });
  }
  function renderStars() {
    $("scrubStars").innerHTML = "";
    S.saved.forEach((m) => { const c = D.cues[cueOfMoment(m)]; const b = document.createElement("b"); b.textContent = "★"; b.style.left = (c.t / D.duration) * 100 + "%"; $("scrubStars").appendChild(b); });
    $("savedCount").textContent = S.saved.size;
  }
  function toggleSave(m) {
    const era = eraOf(D.cues[cueOfMoment(m)].era);
    if (S.saved.has(m)) { S.saved.delete(m); toast("Removed from your Story break."); }
    else { S.saved.add(m); toast("★ Saved — read it in the Story break after " + era.name + ", without stopping the film."); }
    S.lastCue = -1; renderFilm(); renderStars(); if (S.mode === "read") renderCard(S.shownCue);
  }
  $("peekStar").onclick = (ev) => { ev.stopPropagation(); toggleSave(D.cues[cueAt(S.t)].moment); };
  $("peekStar").onkeydown = (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); $("peekStar").onclick(ev); } };
  $("peek").onclick = () => window.scrollTo({ top: 220, behavior: "smooth" });

  // ---------- reading mode (pull up) ----------
  function enterRead(ci) {
    if (S.mode === "read") return;
    S.mode = "read"; S.resumeCue = ci == null ? cueAt(S.t) : ci;
    setPlaying(false); app.classList.add("reading-on");
    renderCard(S.resumeCue);
    // r5: no toast here (it covered the card title); the mini strip itself says where the film paused
    clearTimeout(toastTimer); $("toast").classList.remove("on");
    $("miniLabel").textContent = "❚❚ Paused at " + fmt(S.t) + " · push down to keep watching ▼";
    alignCard();
  }
  // r2c: after pulling up, line the card's top up just under the mini film strip (title was hidden behind the sticky film).
  function alignCard() {
    if (window.scrollY < 200) window.scrollTo(0, 200);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const gap = $("card").getBoundingClientRect().top - film.getBoundingClientRect().bottom - 10;
      if (Math.abs(gap) > 4) window.scrollBy(0, gap);
    }));
  }
  function backToFilm(fromButton) {
    if (S.mode === "read") {
      S.mode = "watch"; app.classList.remove("reading-on");
      S.t = D.cues[S.resumeCue].t; S.lastCue = -1; renderFilm();
      toast("▶ Resumed from " + fmt(S.t) + " — the start of the sentence you left.");
    }
    setPlaying(true);
    // r4: while the page smooth-scrolls back up, the scroll handler must not re-open reading mode
    if (fromButton && window.scrollY > 0) {
      S.returning = true; clearTimeout(S.retTimer); S.retTimer = setTimeout(() => { S.returning = false; }, 1500);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  function renderCard(ci) {
    S.shownCue = ci;
    const cue = D.cues[ci], m = D.moments[cue.moment], era = eraOf(cue.era);
    const isResume = ci === S.resumeCue;
    const li = (arr) => arr.map((x) => "<li>" + x + "</li>").join("");
    $("card").innerHTML =
      '<span class="kind">' + m.kind + '</span><span class="at">at ' + fmt(cue.t) + ' in the film</span>' +
      "<h2>" + m.title + "</h2>" +
      '<p class="era-line">' + era.name + " · " + era.range + "</p>" +
      '<p class="quote">“' + cue.text + "”</p>" +
      "<p>" + m.summary + "</p>" +
      "<b>Key evidence</b><div class=chips>" + m.evidence.map((e) => "<span>" + e + "</span>").join("") + "</div>" +
      "<details open><summary>Places</summary><ul>" + li(m.places) + "</ul></details>" +
      "<details><summary>People</summary><ul>" + li(m.people) + "</ul></details>" +
      "<details><summary>Primary sources</summary><ul>" + li(m.sources) + "</ul></details>" +
      '<div class="actions">' +
      '<button class="primary" id="resumeBtn">▶ Resume film (' + fmt(D.cues[S.resumeCue].t) + ")</button>" +
      (isResume ? "" : '<button id="jumpBtn">Watch from ' + fmt(cue.t) + "</button>") +
      '<button id="saveBtn">' + (S.saved.has(cue.moment) ? "★ Saved" : "☆ Save") + "</button></div>";
    $("resumeBtn").onclick = () => backToFilm(true);
    $("saveBtn").onclick = () => toggleSave(cue.moment);
    if (!isResume) $("jumpBtn").onclick = () => { S.resumeCue = ci; backToFilm(true); };
    const eraCues = D.cues.map((c, k) => [c, k]).filter(([c]) => c.era === cue.era);
    $("earlier").innerHTML = ""; $("next").innerHTML = "";
    eraCues.filter(([, k]) => k !== ci && k <= S.resumeCue).forEach(([c, k]) => $("earlier").appendChild(item(c, k)));
    if (!$("earlier").children.length) $("earlier").innerHTML = '<li><small>Nothing earlier in this chapter.</small></li>';
    D.cues.map((c, k) => [c, k]).filter(([, k]) => k > S.resumeCue && k !== ci).slice(0, 2).forEach(([c, k]) => $("next").appendChild(item(c, k)));
  }
  function item(c, k) {
    const m = D.moments[c.moment]; const li = document.createElement("li"); const b = document.createElement("button");
    b.innerHTML = "<b>" + m.title + "</b><small>" + m.kind + " · at " + fmt(c.t) + "</small>";
    b.onclick = () => { renderCard(k); alignCard(); };
    li.appendChild(b); return li;
  }

  // Scroll position drives the film: 0 = full player, pulled up = mini strip + paused + card.
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = window.scrollY, p = Math.max(0, Math.min(1, y / 180));
      film.style.setProperty("--p", p.toFixed(3));
      if (S.story) return;
      if (S.returning) { if (y < 24) { S.returning = false; clearTimeout(S.retTimer); } return; }
      if (y > 110 && S.mode === "watch") enterRead();
      else if (y < 24 && S.mode === "read") backToFilm(false);
    });
  }, { passive: true });

  // ---------- Story break (end of each chapter, only if something was starred) ----------
  function openStory(era, list, label) {
    S.story = { era, list, i: 0 }; setPlaying(false);
    $("story").hidden = false; $("storyChapter").textContent = label;
    $("storyTip").textContent = era ? "Story break · only the moments you starred in this chapter. ✕ skips it."
      : /^Saved/.test(label) ? "All your saved moments, from every chapter. ✕ closes." : "Every moment of this chapter. ✕ closes.";
    renderStory();
  }
  function renderStory() {
    const st = S.story, m = D.moments[st.list[st.i]], c = D.cues[cueOfMoment(st.list[st.i])];
    $("storyBars").innerHTML = st.list.map((_, k) => '<i class="' + (k <= st.i ? "on" : "") + '"></i>').join("");
    $("storyBody").innerHTML = '<div class="still" style="background-image:url(scene/' + c.era + '.svg)"></div><span class="kind">' + m.kind + " · from " + fmt(c.t) + "</span><h2>" + m.title + "</h2><p>" + m.summary + "</p><div class=chips>" + m.evidence.map((e) => "<span>" + e + "</span>").join("") + "</div>";
    $("storyPrev").disabled = st.i === 0;
    $("storyNext").textContent = st.i === st.list.length - 1 ? "Continue film ▶" : "Next ›";
  }
  function closeStory() { const era = S.story.era; S.story = null; $("story").hidden = true; if (era) S.storyDone.add(era); if (S.mode === "watch") setPlaying(true); }
  $("storyNext").onclick = () => { if (S.story.i < S.story.list.length - 1) { S.story.i++; renderStory(); } else closeStory(); };
  $("storyPrev").onclick = () => { if (S.story.i > 0) { S.story.i--; renderStory(); } };
  $("storyClose").onclick = closeStory;

  // ---------- tabs & search ----------
  document.querySelectorAll(".tab").forEach((b) => b.onclick = () => {
    const tab = b.dataset.tab;
    if (tab === "saved") { if (!S.saved.size) toast("Nothing saved yet. Tap ☆ while watching."); else openStory(null, [...S.saved], "Saved moments · " + S.saved.size); }
    else if (tab === "stories") { const e = eraAt(S.t); openStory(null, D.cues.filter((c) => c.era === e.id).map((c) => c.moment), "Stories · " + e.name); }
    else if (tab === "map") toast("Map: this chapter's places on a city map (not built in this prototype).");
    else backToFilm(true);
  });
  // r5: search covers kind, title, summary, narration line, era, people, places, evidence and sources; results list with m:ss
  const hay = (c) => { const m = D.moments[c.moment], e = eraOf(c.era); return [m.kind, m.title, m.summary, c.text, e.name, e.range].concat(m.people, m.places, m.evidence, m.sources).join(" ").toLowerCase(); };
  const findCues = (q) => D.cues.map((c, k) => [c, k]).filter(([c]) => hay(c).includes(q)).map(([, k]) => k);
  function openFromSearch(k) { $("searchResults").hidden = true; enterRead(cueAt(S.t)); renderCard(k); alignCard(); $("search").blur(); }
  // r8c: each result says where the query matched (person, place, evidence...), with the matched words marked
  function marked(text, q) {
    const f = document.createDocumentFragment(), i = text.toLowerCase().indexOf(q);
    if (i < 0) { f.append(text); return f; }
    const mk = document.createElement("mark"); mk.textContent = text.slice(i, i + q.length);
    f.append(text.slice(0, i), mk, text.slice(i + q.length)); return f;
  }
  function whyMatch(c, m, q) {
    const e = eraOf(c.era);
    const fields = [["Person", m.people], ["Place", m.places], ["Evidence", m.evidence], ["Source", m.sources], ["Title", [m.title]],
      ["Narration", [c.text]], ["Summary", [m.summary]], ["Era", [e.name + " · " + e.range]]];
    for (const [label, arr] of fields) {
      const hit = (arr || []).find((x) => x.toLowerCase().includes(q)); if (!hit) continue;
      let t = hit; const i = t.toLowerCase().indexOf(q);
      if (t.length > 64) { const a = Math.max(0, i - 24), z = Math.min(t.length, i + q.length + 30); t = (a ? "…" : "") + t.slice(a, z) + (z < t.length ? "…" : ""); }
      const sp = document.createElement("span"); sp.className = "why"; sp.append(label + ": ", marked(t, q)); return sp;
    }
    return null;
  }
  function showResults(q) {
    const ul = $("searchResults"); ul.innerHTML = "";
    if (q.length < 2) { ul.hidden = true; return []; }
    const ks = findCues(q);
    if (!ks.length) { const li = document.createElement("li"); li.className = "none"; li.textContent = "No moment found for “" + q + "”."; ul.appendChild(li); }
    ks.forEach((k) => {
      const c = D.cues[k], m = D.moments[c.moment]; const li = document.createElement("li"); const b = document.createElement("button");
      const at = document.createElement("span"); at.className = "at"; at.textContent = fmt(c.t);
      const tt = document.createElement("b"); tt.textContent = m.title;
      const sm = document.createElement("small"); sm.textContent = m.kind + " · " + eraOf(c.era).name;
      b.append(at, tt, sm); const w = whyMatch(c, m, q); if (w) b.appendChild(w);
      b.onclick = () => openFromSearch(k); li.appendChild(b); ul.appendChild(li);
    });
    ul.hidden = false; return ks;
  }
  $("search").oninput = (ev) => showResults(ev.target.value.trim().toLowerCase());
  document.addEventListener("click", (ev) => { if (!ev.target.closest("#searchResults, .search")) $("searchResults").hidden = true; });
  $("search").onkeydown = (ev) => {
    if (ev.key === "Escape") { $("searchResults").hidden = true; ev.target.blur(); return; }
    if (ev.key !== "Enter") return;
    const q = ev.target.value.trim().toLowerCase(); if (!q) return;
    const k = findCues(q)[0] ?? -1; if (k < 0) showResults(q);
    if (k < 0) { toast("No moment found for “" + ev.target.value + "”."); return; }
    openFromSearch(k);
  };
  // r5: Space = play/pause unless focus is on something that uses Space itself
  document.addEventListener("keydown", (ev) => { if (ev.key === " " && !(ev.target.closest && ev.target.closest("input, textarea, button, summary, [role=button], [role=slider]"))) { ev.preventDefault(); $("playBtn").click(); } });

  // ---------- clock ----------
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.25, (now - last) / 1000); last = now;
    if (S.playing && !S.story && S.mode === "watch") {
      const before = eraAt(S.t);
      S.t = Math.min(D.duration, S.t + dt);
      const after = eraAt(S.t);
      if ((after !== before || S.t >= D.duration) && !S.storyDone.has(before.id)) {
        const starred = D.cues.filter((c) => c.era === before.id && S.saved.has(c.moment)).map((c) => c.moment);
        if (starred.length) openStory(before.id, starred, "Story break · end of " + before.name);
      }
      if (S.t >= D.duration) { setPlaying(false); toast("End of the film. Your saved moments are in ☆ Saved."); }
    }
    renderFilm();
    requestAnimationFrame(loop);
  }
  setPlaying(S.playing); renderFilm(); renderStars();
  requestAnimationFrame(loop);

  // Test/demo hooks (used by the screenshot script).
  window.proto = { S, seek, enterRead, backToFilm, toggleSave, openStory, setPlaying, findCues };
})();
