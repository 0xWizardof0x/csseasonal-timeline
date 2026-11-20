// Airborne particles, impacts on the glass, and the bead along its lower edge.
const tau = Math.PI * 2;
const between = (low, high) => low + Math.random() * (high - low);

export function rainOnGlass(host, kind) {
  const snow = kind === 'snow' || kind === 'blizzard';
  const gale = kind === 'blizzard';
  const heavy = gale || kind === 'storm';
  const canvas = document.createElement('canvas');
  canvas.className = 'precipitation';
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  host.append(canvas);
  const particles = [],
    beads = [],
    pool = new Float32Array(65);
  let w,
    h,
    frame,
    last = 0,
    time = 0,
    nextHit = 0.3;

  function particle(initial) {
    const depth = Math.random();
    return {
      x: between(-18, w + 18),
      y: initial ? between(0, h) : -20,
      depth,
      phase: between(0, tau),
      radius: 0.6 + depth * 1.7,
      speed: (snow ? (gale ? 142 : 48) : heavy ? 590 : 435) * (0.55 + depth)
    };
  }
  function resize() {
    w = Math.max(1, host.clientWidth);
    h = Math.max(1, host.clientHeight);
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(w * ratio);
    canvas.height = Math.round(h * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(195, Math.round((heavy ? 1.7 : 1) * Math.max(42, (w * h) / 9400)));
    particles.length = 0;
    beads.length = 0;
    pool.fill(0);
    for (let i = 0; i < count; i++) particles.push(particle(true));
  }
  function crystal(x, y, r, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    for (let arm = 0; arm < 6; arm++) {
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -r);
      ctx.moveTo(-r * 0.25, -r * 0.63);
      ctx.lineTo(0, -r * 0.42);
      ctx.lineTo(r * 0.25, -r * 0.63);
      ctx.rotate(tau / 6);
    }
    ctx.stroke();
    ctx.restore();
  }
  function drawAir(dt) {
    nextHit -= dt;
    for (const p of particles) {
      const wind = snow
        ? gale
          ? -146 - 32 * Math.sin(time * 0.55)
          : 11 * Math.sin(p.phase + time * 0.7)
        : heavy
          ? -142
          : -65;
      const vx = wind * (0.45 + p.depth);
      p.y += p.speed * dt;
      p.x += vx * dt;
      if (p.y > h + 20) Object.assign(p, particle(false));
      if (p.x < -20) p.x = w + 19;
      if (p.x > w + 20) p.x = -19;
      if (
        nextHit <= 0 &&
        beads.length < 26 &&
        p.depth > 0.62 &&
        p.y > 16 &&
        p.y < h * 0.81 &&
        p.x > 8 &&
        p.x < w - 8
      ) {
        beads.push({
          x: p.x,
          y: p.y,
          start: p.y,
          r: between(2.1, 4.6),
          age: 0,
          wait: between(0.45, 1.6),
          v: 0,
          phase: p.phase
        });
        nextHit = between(0.34, 0.95) * (heavy ? 0.72 : 1);
        Object.assign(p, particle(false));
        continue;
      }
      ctx.lineWidth = 0.55 + p.depth * 0.8;
      ctx.strokeStyle = 'rgba(208,235,255,' + (0.17 + p.depth * 0.4) + ')';
      if (snow) {
        if (p.depth > 0.82) {
          crystal(p.x, p.y, p.radius * 1.8, p.phase + time * 0.23);
          continue;
        }
        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, tau);
        ctx.fill();
      } else {
        const exposure = 0.022 + p.depth * 0.013;
        ctx.beginPath();
        ctx.moveTo(p.x - vx * exposure, p.y - p.speed * exposure);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
    }
  }
  function drawGlass(dt) {
    for (let i = beads.length - 1; i >= 0; i--) {
      const b = beads[i];
      b.age += dt;
      const melt = snow ? Math.max(0, 1 - b.age / 1.35) : 0;
      if (b.age > b.wait && melt === 0) {
        b.v = Math.min(226, b.v + dt * (30 + b.r * 12));
        b.y += b.v * dt;
        b.x += Math.sin(b.phase + b.y * 0.03) * dt * 3;
      }
      if (b.y >= h - b.r) {
        const at = Math.min(64, Math.max(0, Math.round((64 * b.x) / w)));
        pool[at] = Math.min(9, pool[at] + b.r * 1.3);
        beads.splice(i, 1);
        continue;
      }
      ctx.lineWidth = 1;
      if (melt > 0) {
        ctx.strokeStyle = 'rgba(238,249,255,' + 0.74 * melt + ')';
        crystal(b.x, b.y, b.r * (1 + 1.15 * melt), b.phase);
      }
      const alpha = 1 - melt;
      const trail = Math.min(55, b.y - b.start);
      if (trail > 2) {
        const ink = ctx.createLinearGradient(0, b.y - trail, 0, b.y);
        ink.addColorStop(0, 'transparent');
        ink.addColorStop(1, 'rgba(195,226,252,.37)');
        ctx.strokeStyle = ink;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y - trail);
        ctx.quadraticCurveTo(b.x - 1, b.y - trail * 0.5, b.x, b.y);
        ctx.stroke();
      }
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(32,63,88,.22)';
      ctx.strokeStyle = 'rgba(207,236,255,.46)';
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, b.r, b.r * (1 + Math.min(0.42, b.v / 400)), 0, 0, tau);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(248,253,255,.84)';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * 0.65, 3.55, 4.85);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.beginPath();
    ctx.moveTo(0, h + 1);
    for (let i = 0; i < pool.length; i++) {
      const left = pool[Math.max(0, i - 1)],
        right = pool[Math.min(64, i + 1)];
      pool[i] = Math.max(0, pool[i] + dt * ((left + right - 2 * pool[i]) * 0.75 - 0.1));
      const x = (i * w) / 64,
        level = h + 0.7 - pool[i];
      ctx.quadraticCurveTo(x, level, x + w / 128, (level + h + 0.7 - right) / 2);
    }
    ctx.lineTo(w, h + 2);
    ctx.lineTo(0, h + 2);
    ctx.fillStyle = 'rgba(156,206,235,.32)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(227,246,255,.42)';
    ctx.stroke();
  }
  function render(now) {
    frame = requestAnimationFrame(render);
    if (last && now - last < 32) return;
    const dt = last ? Math.min(0.065, (now - last) / 1000) : 0;
    last = now;
    time += dt;
    ctx.clearRect(0, 0, w, h);
    drawAir(dt);
    drawGlass(dt);
  }
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  frame = requestAnimationFrame(render);
  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    canvas.remove();
  };
}

// The leader finds a crooked route; shorter channels fork from its actual vertices.
export function lightning(host) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 300 400');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.classList.add('lightning');
  svg.style.left = between(8, 65) + '%';
  const lean = between(-1, 1);
  const points = [[150, 0]];
  for (let i = 1; i <= 23; i++) {
    const [x, y] = points.at(-1);
    points.push([Math.max(60, Math.min(240, x + between(-17, 17) + lean * 1.8)), y + between(11, 20)]);
  }
  function channel(vertices, style) {
    const path = document.createElementNS(ns, 'path');
    path.setAttribute(
      'd',
      vertices.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)).join(' ')
    );
    path.setAttribute('class', style);
    path.setAttribute('pathLength', '1');
    svg.append(path);
  }
  channel(points, 'corona');
  for (let i = 4; i < 20; i += 3) {
    const branch = [points[i]];
    const direction = i % 2 ? 1 : -1;
    for (let j = 0; j < 5; j++) {
      const [x, y] = branch.at(-1);
      branch.push([x + direction * between(4, 16), y + between(2, 16)]);
    }
    channel(branch, 'fork');
  }
  channel(points, 'return-stroke');
  host.append(svg);
}
