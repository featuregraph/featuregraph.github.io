(() => {
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'enhancements.css';
  document.head.appendChild(style);

  const stageCopy = {
    signals: ['Raw signals', 'Measured observations are retained as the evidence from which every later representation is constructed.'],
    states: ['Primitive states', 'Explicit conditions such as rising, falling, active, or inactive convert local measurements into interpretable states.'],
    events: ['Transition events', 'Enter and exit events identify precisely when states begin and end while preserving sequence alignment.'],
    objects: ['Behavioral objects', 'Events establish object boundaries so complete oscillations, accumulations, and transitions can be measured as entities.'],
    queries: ['Object-level queries', 'Downstream software can filter and compare constructed objects without rediscovering their boundaries or properties.']
  };

  const stepButtons = [...document.querySelectorAll('.pipeline-step')];
  const layers = [...document.querySelectorAll('.pipeline-layer')];
  const stageTitle = document.getElementById('pipeline-stage-title');
  const stageText = document.getElementById('pipeline-stage-copy');

  stepButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const stage = button.dataset.stage;
      stepButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
      });
      layers.forEach((layer) => layer.classList.toggle('is-visible', layer.classList.contains(`layer-${stage}`)));
      if (stageTitle && stageText) {
        stageTitle.textContent = stageCopy[stage][0];
        stageText.textContent = stageCopy[stage][1];
      }
    });
  });

  const sample = Array.from({ length: 180 }, (_, i) =>
    Math.sin(i * 0.17) + 0.22 * Math.sin(i * 0.51) + 0.08 * Math.cos(i * 0.08)
  );
  let values = [...sample];

  const chart = document.getElementById('demo-chart');
  const line = document.getElementById('signal-line');
  const overlays = document.getElementById('object-overlays');
  const table = document.getElementById('demo-table');
  const message = document.getElementById('demo-message');
  const count = document.getElementById('object-count');
  const duration = document.getElementById('mean-duration');
  const amplitude = document.getElementById('mean-amplitude');
  const fileInput = document.getElementById('signal-file');
  const sampleButton = document.getElementById('sample-signal');
  const constructButton = document.getElementById('construct-objects');

  if (!chart || !line) return;

  const dims = { left: 40, right: 875, top: 30, bottom: 255 };
  const svgNS = 'http://www.w3.org/2000/svg';

  function scales(data) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = max - min || 1;
    return {
      x: (i) => dims.left + (i / Math.max(1, data.length - 1)) * (dims.right - dims.left),
      y: (v) => dims.bottom - ((v - min) / span) * (dims.bottom - dims.top),
      min,
      max
    };
  }

  function drawSignal() {
    const s = scales(values);
    line.setAttribute('class', 'signal-line');
    line.setAttribute('points', values.map((v, i) => `${s.x(i).toFixed(1)},${s.y(v).toFixed(1)}`).join(' '));
    overlays.replaceChildren();
    table.innerHTML = '<tr><td colspan="6">Construct objects to populate the table.</td></tr>';
    count.textContent = '—'; duration.textContent = '—'; amplitude.textContent = '—';
  }

  function turningPoints(data) {
    const points = [];
    for (let i = 1; i < data.length - 1; i += 1) {
      const before = data[i] - data[i - 1];
      const after = data[i + 1] - data[i];
      if (before > 0 && after <= 0) points.push({ index: i, type: 'peak' });
      if (before < 0 && after >= 0) points.push({ index: i, type: 'trough' });
    }
    return points.filter((point, i, all) => i === 0 || point.index - all[i - 1].index >= 3);
  }

  function constructObjects() {
    const points = turningPoints(values);
    const troughs = points.filter((point) => point.type === 'trough');
    const objects = [];
    for (let i = 0; i < troughs.length - 1; i += 1) {
      const start = troughs[i].index;
      const end = troughs[i + 1].index;
      const peakCandidates = points.filter((point) => point.type === 'peak' && point.index > start && point.index < end);
      if (!peakCandidates.length) continue;
      const peak = peakCandidates.reduce((best, current) => values[current.index] > values[best.index] ? current : best).index;
      objects.push({ id: objects.length + 1, start, peak, end, duration: end - start, amplitude: values[peak] - Math.min(values[start], values[end]) });
    }

    const s = scales(values);
    overlays.replaceChildren();
    objects.forEach((object) => {
      const band = document.createElementNS(svgNS, 'rect');
      band.setAttribute('class', 'object-band');
      band.setAttribute('x', s.x(object.start));
      band.setAttribute('y', dims.top);
      band.setAttribute('width', Math.max(2, s.x(object.end) - s.x(object.start)));
      band.setAttribute('height', dims.bottom - dims.top);
      overlays.appendChild(band);

      [['peak-point', object.peak], ['trough-point', object.start], ['trough-point', object.end]].forEach(([className, index]) => {
        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('class', className);
        circle.setAttribute('cx', s.x(index));
        circle.setAttribute('cy', s.y(values[index]));
        circle.setAttribute('r', 5);
        overlays.appendChild(circle);
      });

      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('class', 'object-label');
      label.setAttribute('x', (s.x(object.start) + s.x(object.end)) / 2);
      label.setAttribute('y', 48);
      label.textContent = `O${object.id}`;
      overlays.appendChild(label);
    });

    table.innerHTML = objects.length ? objects.slice(0, 12).map((object) =>
      `<tr><td>${object.id}</td><td>${object.start}</td><td>${object.peak}</td><td>${object.end}</td><td>${object.duration}</td><td>${object.amplitude.toFixed(3)}</td></tr>`
    ).join('') : '<tr><td colspan="6">No complete trough-to-trough objects were found.</td></tr>';

    count.textContent = String(objects.length);
    duration.textContent = objects.length ? (objects.reduce((sum, object) => sum + object.duration, 0) / objects.length).toFixed(1) : '—';
    amplitude.textContent = objects.length ? (objects.reduce((sum, object) => sum + object.amplitude, 0) / objects.length).toFixed(3) : '—';
    message.textContent = `${objects.length} complete trough-to-trough objects constructed with explicit start, peak, and end boundaries.`;
  }

  fileInput?.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = text.split(/\r?\n/).flatMap((lineText) => {
      const cells = lineText.split(',').map((cell) => Number(cell.trim())).filter(Number.isFinite);
      return cells.length ? [cells[cells.length - 1]] : [];
    });
    if (parsed.length < 8) {
      message.textContent = 'The CSV needs at least eight numeric rows. The final numeric column is used as the signal.';
      return;
    }
    values = parsed.slice(0, 1000);
    drawSignal();
    message.textContent = `${values.length} observations loaded locally. Select “Construct oscillations” to continue.`;
  });

  sampleButton?.addEventListener('click', () => {
    values = [...sample];
    if (fileInput) fileInput.value = '';
    drawSignal();
    message.textContent = 'Sample signal restored. Select “Construct oscillations” to expose object boundaries.';
  });
  constructButton?.addEventListener('click', constructObjects);
  drawSignal();
})();
