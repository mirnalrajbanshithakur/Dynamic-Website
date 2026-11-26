(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- network canvas: nodes, packets, one infected node that gets quarantined ---- */
  var cv = document.getElementById("net"), cx = cv.getContext("2d");
  var W, H, dpr, nodes = [], packets = [], mouse = { x: -999, y: -999 };
  var ICE = "124,200,255", AMB = "255,179,64", OK = "95,217,166";
  function size() {
    var r = cv.parentNode.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.max(26, Math.min(70, Math.round(W * H / 14000)));
    nodes = [];
    for (var i = 0; i < n; i++) nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, s: "ok", t: 0 });
  }
  function neighbors(a) { var out = []; for (var j = 0; j < nodes.length; j++) { var b = nodes[j]; if (b !== a && Math.hypot(a.x - b.x, a.y - b.y) < 150) out.push(b); } return out; }
  function spawnPacket() {
    var a = nodes[Math.random() * nodes.length | 0], nb = neighbors(a);
    if (!nb.length) return; packets.push({ a: a, b: nb[Math.random() * nb.length | 0], p: 0, hot: a.s === "bad" });
  }
  function infect() {
    var healthy = nodes.filter(function (n) { return n.s === "ok"; });
    if (!healthy.length) return; var n = healthy[Math.random() * healthy.length | 0]; n.s = "bad"; n.t = 0;
    setTimeout(function () { n.s = "quar"; n.t = 0; setTimeout(function () { n.s = "ok"; }, 3500); }, 3200);
  }
  function frame() {
    cx.clearRect(0, 0, W, H);
    var i, j, a, b, d;
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      if (!reduce) { a.x += a.vx; a.y += a.vy; if (a.x < 0 || a.x > W) a.vx *= -1; if (a.y < 0 || a.y > H) a.vy *= -1; }
      a.t++;
    }
    for (i = 0; i < nodes.length; i++) for (j = i + 1; j < nodes.length; j++) {
      a = nodes[i]; b = nodes[j]; d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 150) { var al = (1 - d / 150) * .35, c = (a.s === "bad" || b.s === "bad") ? AMB : ICE; cx.strokeStyle = "rgba(" + c + "," + al + ")"; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke(); }
    }
    for (i = packets.length - 1; i >= 0; i--) {
      var p = packets[i]; p.p += .02; if (p.p >= 1) { if (p.hot && p.b.s === "ok" && Math.random() < .15) { p.b.s = "bad"; setTimeout(function (n) { return function () { if (n.s === "bad") n.s = "quar"; setTimeout(function () { n.s = "ok"; }, 3000); }; }(p.b), 2500); } packets.splice(i, 1); continue; }
      var x = p.a.x + (p.b.x - p.a.x) * p.p, y = p.a.y + (p.b.y - p.a.y) * p.p;
      cx.fillStyle = "rgba(" + (p.hot ? AMB : OK) + ",.95)"; cx.beginPath(); cx.arc(x, y, 2.2, 0, 6.3); cx.fill();
    }
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i]; var near = Math.hypot(a.x - mouse.x, a.y - mouse.y) < 110, r = near ? 4.5 : 3, col = a.s === "bad" ? AMB : ICE;
      if (a.s === "bad") { var pr = (a.t % 60) / 60; cx.strokeStyle = "rgba(" + AMB + "," + (1 - pr) + ")"; cx.beginPath(); cx.arc(a.x, a.y, 5 + pr * 22, 0, 6.3); cx.stroke(); }
      if (a.s === "quar") { cx.strokeStyle = "rgba(" + OK + ",.9)"; cx.lineWidth = 1.5; cx.beginPath(); cx.arc(a.x, a.y, 11, 0, 6.3); cx.stroke(); cx.lineWidth = 1; col = OK; }
      cx.fillStyle = "rgba(" + col + ",.95)"; cx.beginPath(); cx.arc(a.x, a.y, r, 0, 6.3); cx.fill();
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  size(); frame();
  if (!reduce) { setInterval(spawnPacket, 160); setInterval(infect, 5200); setTimeout(infect, 900); }
  window.addEventListener("resize", function () { size(); if (reduce) frame(); });
  var hero = cv.parentNode;
  hero.addEventListener("pointermove", function (e) { var r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  hero.addEventListener("pointerleave", function () { mouse.x = mouse.y = -999; });

  /* ---- rotating role line ---- */
  var roles = ["IT Cyber Security", "CCNA Certified", "Network Defender", "Vulnerability Hunter", "Web & Graphics Designer", "Incident Responder", "Photographer & Videographer"];
  var roleEl = document.getElementById("role"), ri = 0, ci = 0, del = false;
  if (reduce) { roleEl.textContent = roles[0]; }
  else (function tick() {
    var w = roles[ri];
    roleEl.textContent = w.slice(0, ci);
    if (!del && ci < w.length) { ci++; setTimeout(tick, 70); }
    else if (!del) { del = true; setTimeout(tick, 1600); }
    else if (ci > 0) { ci--; setTimeout(tick, 35); }
    else { del = false; ri = (ri + 1) % roles.length; setTimeout(tick, 300); }
  })();

  /* ---- ticker ---- */
  var items = ["<b>[OK]</b> firewall rules synced", "<u>[WARN]</u> 14 failed logins from 203.0.113.9", "<b>[OK]</b> patch window complete", "<b>[OK]</b> backups verified", "<u>[WARN]</u> new CVE under review", "<b>[OK]</b> MFA enforced on all admin accounts", "<b>[OK]</b> TLS certificates valid"];
  var html = items.concat(items).join(" &nbsp;&nbsp;//&nbsp;&nbsp; ");
  document.getElementById("tick").innerHTML = html;

  /* ---- reveal on scroll (content stays readable at rest) ---- */
  var rv = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); if (e.target.classList.contains("eyebrow")) scramble(e.target); io.unobserve(e.target); } }); }, { threshold: .12 });
    rv.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + "ms"; io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add("in"); });

  /* ---- active nav ---- */
  var links = [].slice.call(document.querySelectorAll("nav a"));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  function setNav() { var y = window.scrollY + 140, cur = -1; secs.forEach(function (s, i) { if (s && s.offsetTop <= y) cur = i; }); links.forEach(function (a, i) { a.classList.toggle("on", i === cur); }); }
  window.addEventListener("scroll", setNav, { passive: true }); setNav();

  /* ---- incident response simulation ---- */
  var script = [
    [["t", "09:41:07"], "w", "ALERT  impossible-travel login for user j.rai (Kathmandu -> Lagos, 4 min)", 0],
    [["t", "09:41:30"], "i", "TRIAGE open case IR-2041, severity: HIGH", 0],
    [["t", "09:43:12"], "i", "LOGS   mailbox rule created to forward all mail externally", 1],
    [["t", "09:44:02"], "w", "FOUND  phishing link opened at 09:12 from fake 'IT-helpdesk' email", 1],
    [["t", "09:45:20"], "g", "ACTION account locked, all sessions revoked, host isolated", 2],
    [["t", "09:46:48"], "g", "ACTION malicious domain blocked at firewall and DNS", 2],
    [["t", "09:58:31"], "g", "CLEAN  forwarding rule removed, credentials reset, MFA re-enrolled", 3],
    [["t", "10:15:09"], "g", "PATCH  mail filter updated to quarantine look-alike domains", 3],
    [["t", "10:42:00"], "g", "RESTORE user back online, monitoring raised for 72 hours", 4],
    [["t", "11:30:00"], "i", "REVIEW lessons logged, awareness reminder sent to all staff", 4]
  ];
  var logEl = document.getElementById("log"), stepEls = [].slice.call(document.querySelectorAll("#steps li")), timer = null;
  function add(line) { var d = document.createElement("div"); d.innerHTML = '<span class="t">' + line[0][1] + '</span>  <span class="' + line[1] + '">' + line[2] + "</span>"; logEl.appendChild(d); while (logEl.children.length > 11) logEl.removeChild(logEl.firstChild); }
  function mark(n, final) { stepEls.forEach(function (s, i) { s.className = i < n ? "done" : i === n && !final ? "on" : ""; }); }
  function playIR() {
    clearTimeout(timer); logEl.innerHTML = ""; var i = 0;
    (function next() {
      if (i >= script.length) { mark(5, true); timer = setTimeout(playIR, 6000); return; }
      add(script[i]); mark(script[i][3]); i++; timer = setTimeout(next, 1500);
    })();
  }
  if (reduce) { script.forEach(add); mark(5, true); }
  else {
    var started = false, irio = new IntersectionObserver(function (es) { if (es[0].isIntersecting && !started) { started = true; playIR(); } }, { threshold: .3 });
    irio.observe(document.getElementById("steps"));
  }
  document.getElementById("replay").addEventListener("click", function () { if (reduce) return; started = true; playIR(); });

  /* ---- timeline bar ---- */
  var pb = document.getElementById("pathbar");
  if (pb && "IntersectionObserver" in window) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { pb.classList.add("in"); o.disconnect(); } }, { threshold: .4 }).observe(pb);
  else if (pb) pb.classList.add("in");

  /* ---- extras: progress, glow, spotlight + tilt, magnetic buttons, scramble, live status, click-to-breach ---- */
  var fine = window.matchMedia("(pointer:fine)").matches;
  var projectRecords = [
    { category: "detection", type: "Detection · Lab", title: "Home SOC Lab", description: "A virtual network with a SIEM collecting logs from Windows and Linux hosts, with alert rules written for brute-force logins and suspicious PowerShell.", tags: ["SIEM", "Sysmon", "Alert rules"] },
    { category: "testing", type: "Testing · Web", title: "Web App Vulnerability Assessment", description: "A structured test of a deliberately vulnerable web app against the OWASP Top 10, ending in a ranked report with fixes a developer can act on.", tags: ["OWASP", "Burp Suite", "Reporting"] },
    { category: "awareness", type: "Awareness · People", title: "Phishing Awareness Campaign", description: "A safe simulated phishing exercise with a short training session afterwards, so staff learn the warning signs from a harmless example.", tags: ["Social engineering", "Training"] },
    { category: "defence", type: "Defence · Network", title: "Network Hardening Audit", description: "A review of firewall rules, open ports and default settings on a small office network, with a checklist to keep it secure over time.", tags: ["Nmap", "Firewall", "CIS controls"] }
  ];
  var projectGrid = document.getElementById("project-grid");
  var projectSearch = document.getElementById("project-search");
  var projectCount = document.getElementById("project-count");
  var dbRecordTotal = document.getElementById("db-record-total");
  var activeProjectFilter = "all";
  dbRecordTotal.textContent = projectRecords.length < 10 ? "0" + projectRecords.length : String(projectRecords.length);

  function makeProjectCard(record, index) {
    var card = document.createElement("article");
    card.className = "card reveal in card-enter";
    card.setAttribute("data-category", record.category);
    card.style.animationDelay = (index % 4) * 70 + "ms";

    var meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = record.type;
    var title = document.createElement("h3");
    title.textContent = record.title;
    var description = document.createElement("p");
    description.textContent = record.description;
    var tags = document.createElement("div");
    tags.className = "chips";
    record.tags.forEach(function (tag) {
      var chip = document.createElement("span");
      chip.textContent = tag;
      tags.appendChild(chip);
    });

    card.appendChild(meta);
    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(tags);
    bindTilt(card);
    return card;
  }

  function updateProjectResults() {
    var term = projectSearch.value.trim().toLowerCase();
    var matches = projectRecords.filter(function (record) {
      var searchable = [record.title, record.type, record.description].concat(record.tags).join(" ").toLowerCase();
      return (activeProjectFilter === "all" || record.category === activeProjectFilter) && (!term || searchable.indexOf(term) !== -1);
    });
    projectGrid.textContent = "";
    matches.forEach(function (record, index) { projectGrid.appendChild(makeProjectCard(record, index)); });
    projectCount.textContent = "Showing " + matches.length + " of " + projectRecords.length + " project records";
    if (!matches.length) {
      var empty = document.createElement("p");
      empty.className = "empty-record";
      empty.textContent = "No matching records. Try another keyword or focus area.";
      projectGrid.appendChild(empty);
    }
  }

  var projectFilters = [].slice.call(document.querySelectorAll("[data-project-filter]"));
  projectFilters.forEach(function (button) {
    button.addEventListener("click", function () {
      activeProjectFilter = button.getAttribute("data-project-filter");
      projectFilters.forEach(function (filter) {
        var selected = filter === button;
        filter.classList.toggle("active", selected);
        filter.setAttribute("aria-pressed", selected ? "true" : "false");
      });
      updateProjectResults();
    });
  });
  projectSearch.addEventListener("input", updateProjectResults);
  updateProjectResults();
  bindTilt(document.querySelector(".project-database"));

  var prog = document.getElementById("prog"), totop = document.getElementById("totop");
  function onScroll() { var h = document.documentElement.scrollHeight - innerHeight; prog.style.transform = "scaleX(" + (h > 0 ? scrollY / h : 0) + ")"; totop.classList.toggle("show", scrollY > 600); }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  function setStatus() {
    var n = nodes.filter(function (x) { return x.s === "bad"; }).length, t = document.getElementById("stxt"), g = document.getElementById("stag");
    t.innerHTML = n ? "status: investigating &middot; " + n + " open alert" + (n > 1 ? "s" : "") : "status: monitoring &middot; 0 open alerts";
    g.style.borderColor = n ? "var(--amber)" : ""; g.firstElementChild.style.color = n ? "var(--amber)" : "";
  }
  if (!reduce) setInterval(setStatus, 400);
  var glow = document.getElementById("glow");
  if (fine && !reduce) {
    var gx = -999, gy = -999, tx = -999, ty = -999;
    addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; });
    (function g() { gx += (tx - gx) * .12; gy += (ty - gy) * .12; glow.style.transform = "translate3d(" + gx + "px," + gy + "px,0)"; requestAnimationFrame(g); })();
  }
  function bindTilt(el) {
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      el.style.setProperty("--mx", x + "px"); el.style.setProperty("--my", y + "px");
      if (fine && !reduce && !el.classList.contains("stage")) {
        el.style.transition = "transform .12s ease-out,border-color .25s";
        el.style.transform = "perspective(700px) translateY(-4px) rotateX(" + ((.5 - y / r.height) * 8) + "deg) rotateY(" + ((x / r.width - .5) * 10) + "deg)";
      }
    });
    el.addEventListener("pointerleave", function () { el.style.transition = "transform .5s ease,border-color .25s,opacity .7s"; el.style.transform = ""; });
  }
  [].forEach.call(document.querySelectorAll(".kit article,.stage"), bindTilt);
  if (fine && !reduce) [].forEach.call(document.querySelectorAll(".btn"), function (b) {
    b.addEventListener("pointermove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * .15) + "px," + ((e.clientY - r.top - r.height / 2) * .25 - 2) + "px)"; });
    b.addEventListener("pointerleave", function () { b.style.transform = ""; });
  });
  function scramble(el) {
    if (reduce) return;
    var txt = el.textContent, ch = "01<>/#$%&*", t0 = performance.now();
    (function s(now) { var p = Math.min(1, (now - t0) / 700), o = ""; for (var i = 0; i < txt.length; i++) o += (i < p * txt.length || txt[i] === " ") ? txt[i] : ch[Math.random() * ch.length | 0]; el.textContent = o; if (p < 1) requestAnimationFrame(s); })(t0);
  }
  hero.addEventListener("pointerdown", function (e) {
    if (e.target.closest("a,button")) return;
    var r = hero.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, best = null, bd = 130;
    nodes.forEach(function (n) { var d = Math.hypot(n.x - x, n.y - y); if (d < bd && n.s === "ok") { bd = d; best = n; } });
    if (best) { best.s = "bad"; best.t = 0; setTimeout(function () { best.s = "quar"; best.t = 0; setTimeout(function () { best.s = "ok"; }, 3000); }, 2200); }
  });

  /* ---- round 2: marquee duplicate + cursor ring ---- */
  [].forEach.call(document.querySelectorAll(".marq .row"), function (r) { r.innerHTML += r.innerHTML; });
  var cur = document.getElementById("cur");
  if (fine && !reduce) {
    var ux = -99, uy = -99, vx = -99, vy = -99;
    addEventListener("pointermove", function (e) { ux = e.clientX; uy = e.clientY; cur.style.opacity = 1; cur.classList.toggle("big", !!e.target.closest("a,button,.card,.kit article,.stage,.project-database")); });
    (function c() { vx += (ux - vx) * .2; vy += (uy - vy) * .2; cur.style.transform = "translate3d(" + vx + "px," + vy + "px,0)"; requestAnimationFrame(c); })();
  }

  /* ---- cookie notice and contact human check ---- */
  var cookieNotice = document.getElementById("cookie-notice");
  var cookieDismiss = document.getElementById("cookie-dismiss");
  function hasNoticeCookie() {
    return document.cookie.split(";").some(function (cookie) { return cookie.trim() === "site_cookie_notice=seen"; });
  }
  if (!hasNoticeCookie()) cookieNotice.hidden = false;
  cookieDismiss.addEventListener("click", function () {
    document.cookie = "site_cookie_notice=seen; Max-Age=15552000; Path=/; SameSite=Lax" + (location.protocol === "https:" ? "; Secure" : "");
    if (hasNoticeCookie()) cookieNotice.hidden = true;
    else cookieNotice.querySelector("p").textContent = "Your browser blocked the preference cookie, so this notice may appear again.";
  });

  var contactForm = document.getElementById("contact-form");
  var captchaQuestion = document.getElementById("captcha-question");
  var captchaAnswer = document.getElementById("captcha-answer");
  var contactStatus = document.getElementById("contact-status");
  var captchaTotal;
  function makeCaptcha() {
    var left = Math.floor(Math.random() * 8) + 2;
    var right = Math.floor(Math.random() * 8) + 2;
    captchaTotal = left + right;
    captchaQuestion.textContent = "Human verification: what is " + left + " + " + right + "?";
    captchaAnswer.value = "";
  }
  makeCaptcha();
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (Number(captchaAnswer.value) !== captchaTotal) {
      contactStatus.textContent = "That answer is not correct. Please try the new question.";
      makeCaptcha();
      captchaAnswer.focus();
      return;
    }

    var name = contactForm.elements.name.value.trim();
    var email = contactForm.elements.email.value.trim();
    var message = contactForm.elements.message.value.trim();
    var subject = "Portfolio enquiry from " + name;
    var body = "Name: " + name + "\nEmail: " + email + "\n\nMessage:\n" + message;
    contactStatus.textContent = "Opening your email app to send this message.";
    window.location.href = "mailto:" + encodeURIComponent(document.getElementById("email").textContent) +
      "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  });

  /* ---- copy email ---- */
  var cb = document.getElementById("copy"), em = document.getElementById("email");
  cb.addEventListener("click", function () {
    function sel() { var r = document.createRange(); r.selectNodeContents(em); var s = getSelection(); s.removeAllRanges(); s.addRange(r); cb.textContent = "Selected, press copy"; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(em.textContent).then(function () { cb.textContent = "Copied"; setTimeout(function () { cb.textContent = "Copy address"; }, 1800); }, sel);
    else sel();
  });
})();
