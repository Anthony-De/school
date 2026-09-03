import {
  DEFAULT_QUESTION_BANK,
  DEFAULT_STUDENTS
} from './data/defaultQuestions';
import { CHANGELOG, CURRENT_RELEASE } from './data/changelog';
import { VISUAL_LIBRARY } from './data/visualLibrary';
import { uid } from './utils/id';

(() => {
  'use strict';
  const KEY = 'qotd_data_v2',
    LEGACY_DATA_KEYS = [
      'firstGradeQuestionBoard_v2',
      'firstGradeQuestionBoard_v1'
    ],
    APP_VERSION = CURRENT_RELEASE.version,
    VERSION_KEY = 'qotd_seenVersion',
    LEGACY_VERSION_KEY = 'firstGradeQuestionBoard_seenVersion',
    DB_NAME = 'questionBoardImages',
    DB_STORE = 'images';
  const $ = (s: string): any => document.querySelector(s),
    $$ = (s: string): any[] => [...document.querySelectorAll(s)];
  const BUILT_INS = Object.entries(DEFAULT_QUESTION_BANK).flatMap(
    ([category, items], ci) =>
      items.map(
        ([question, options]: readonly [string, readonly string[]], i) => ({
          builtinId: `builtin-${ci + 1}-${i + 1}`,
          question,
          title: '',
          category,
          answers: options.map((text) => ({ text, imageId: null }))
        })
      )
  );
  const CATEGORIES = Object.freeze(Object.keys(DEFAULT_QUESTION_BANK));
  const clone = <T>(x: T): T => structuredClone(x);
  const esc = (s = '') =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        })[c]
    );
  let data: any,
    historyMap: Record<string, { undo: string[]; redo: string[] }> = {},
    selected: string | null = null,
    dragId: string | null = null,
    draft: any = null,
    questionCategory = '',
    savedWorkCategory = '',
    savedWorkExpanded = true,
    questionsExpanded = true,
    imageLibraryOptionIndex: number | null = null,
    imageCache = new Map<string, string>(),
    dbPromise: Promise<IDBDatabase> | null = null,
    toastTimer: ReturnType<typeof setTimeout> | undefined;

  function defaultData() {
    const students = [
      ...DEFAULT_STUDENTS.girls.map((name) => ({
        id: uid(),
        name,
        group: 'girls',
        absent: false
      })),
      ...DEFAULT_STUDENTS.boys.map((name) => ({
        id: uid(),
        name,
        group: 'boys',
        absent: false
      }))
    ];
    const templates = BUILT_INS.map((b) => ({ id: uid(), ...clone(b) })),
      template = templates[0];
    const question = instanceFrom(template, students);
    return {
      classStudents: students,
      groupSettings: {
        girls: { label: 'Girls', color: '#f45f9d' },
        boys: { label: 'Boys', color: '#438de0' }
      },
      templates,
      deletedBuiltInIds: [],
      questions: [question],
      openQuestionIds: [question.id],
      activeId: question.id
    };
  }
  function instanceFrom(t, students = data?.classStudents || []) {
    return {
      id: uid(),
      templateId: t.id,
      question: t.question,
      title: t.title || '',
      category: CATEGORIES.includes(t.category) ? t.category : CATEGORIES[0],
      answers: clone(t.answers),
      students: students.map((s) => ({ ...s })),
      placements: {},
      placementOrder: [],
      absentStudentIds: []
    };
  }
  function load() {
    try {
      return (
        JSON.parse(
          localStorage.getItem(KEY) ||
            LEGACY_DATA_KEYS.map((key) => localStorage.getItem(key)).find(
              Boolean
            )
        ) || defaultData()
      );
    } catch {
      return defaultData();
    }
  }
  function migrate() {
    if (!data.classStudents) {
      const src =
        data.questions?.find((q) => q.id === data.activeId)?.students ||
        data.questions?.[0]?.students ||
        [];
      data.classStudents = [
        ...(data.girls || []).map((name, i) => ({
          id: src.filter((s) => s.group === 'girls')[i]?.id || uid(),
          name,
          group: 'girls',
          absent: false
        })),
        ...(data.boys || []).map((name, i) => ({
          id: src.filter((s) => s.group === 'boys')[i]?.id || uid(),
          name,
          group: 'boys',
          absent: false
        }))
      ];
    }
    data.classStudents.forEach((s) => (s.absent = !!s.absent));
    data.groupSettings ||= {
      girls: { label: 'Girls', color: '#f45f9d' },
      boys: { label: 'Boys', color: '#438de0' }
    };
    data.questions ||= [];
    data.questions.forEach((q) => {
      q.category = CATEGORIES.includes(q.category) ? q.category : CATEGORIES[0];
      delete q.date;
      q.answers ||= [];
      q.students = data.classStudents.map((s) => ({ ...s }));
      q.placements ||= {};
      const validStudentIds = new Set(q.students.map((s) => s.id));
      for (const id of Object.keys(q.placements))
        if (!validStudentIds.has(id)) delete q.placements[id];
      q.placementOrder = Array.isArray(q.placementOrder)
        ? q.placementOrder.filter(
            (id, index, ids) =>
              validStudentIds.has(id) &&
              Object.hasOwn(q.placements, id) &&
              ids.indexOf(id) === index
          )
        : [];
      for (const id of Object.keys(q.placements))
        if (!q.placementOrder.includes(id)) q.placementOrder.push(id);
      q.absentStudentIds = Array.isArray(q.absentStudentIds)
        ? q.absentStudentIds.filter((id) =>
            data.classStudents.some((s) => s.id === id)
          )
        : [];
    });
    if (!data.templates) {
      data.templates = data.questions.map((q) => {
        const t = {
          id: uid(),
          question: q.question,
          title: q.title || '',
          category: q.category || '',
          answers: clone(q.answers)
        };
        q.templateId = t.id;
        return t;
      });
    }
    data.templates.forEach((t) => {
      t.category = CATEGORIES.includes(t.category) ? t.category : CATEGORIES[0];
      t.title ||= '';
      t.answers ||= [];
      t.used = !!t.used;
    });
    data.deletedBuiltInIds ||= [];
    const existingBuiltIns = new Set(
      data.templates.map((t) => t.builtinId).filter(Boolean)
    );
    for (const b of BUILT_INS)
      if (
        !existingBuiltIns.has(b.builtinId) &&
        !data.deletedBuiltInIds.includes(b.builtinId)
      ) {
        const same = data.templates.find(
          (t) =>
            t.question.trim().toLowerCase() === b.question.trim().toLowerCase()
        );
        if (same) same.builtinId = b.builtinId;
        else data.templates.push({ id: uid(), ...clone(b) });
      }
    data.openQuestionIds ||= data.questions.map((q) => q.id);
    data.openQuestionIds = data.openQuestionIds.filter((id) =>
      data.questions.some((q) => q.id === id)
    );
    if (!data.openQuestionIds.length && data.questions[0])
      data.openQuestionIds = [data.questions[0].id];
    if (!data.openQuestionIds.includes(data.activeId))
      data.activeId = data.openQuestionIds[0] || null;
  }
  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      toast('Storage is full. Export a backup before adding more.');
      console.error(e);
    }
  }
  function current() {
    return data.questions.find((q) => q.id === data.activeId);
  }
  function openQuestions() {
    return data.openQuestionIds
      .map((id) => data.questions.find((q) => q.id === id))
      .filter(Boolean);
  }
  function presentStudents(q = current()) {
    const absent = new Set(q?.absentStudentIds || []);
    return data.classStudents.filter((s) => !absent.has(s.id));
  }
  function isComplete(q) {
    const present = presentStudents(q);
    return (
      !!present.length &&
      present.every((s) => Number.isInteger(q.placements[s.id]))
    );
  }
  function isPartial(q) {
    if (isComplete(q)) return false;
    const presentIds = new Set(presentStudents(q).map((student) => student.id));
    return Object.keys(q?.placements || {}).some((id) => presentIds.has(id));
  }
  function history() {
    return (
      historyMap[data.activeId] ||
      (historyMap[data.activeId] = { undo: [], redo: [] })
    );
  }
  function snap() {
    const q = current();
    return JSON.stringify({
      placements: q?.placements || {},
      placementOrder: q?.placementOrder || []
    });
  }
  function restoreSnapshot(q, snapshot) {
    const saved = JSON.parse(snapshot);
    if (saved && Object.hasOwn(saved, 'placements')) {
      q.placements = saved.placements || {};
      q.placementOrder = saved.placementOrder || Object.keys(q.placements);
    } else {
      q.placements = saved || {};
      q.placementOrder = Object.keys(q.placements);
    }
  }
  function move(studentId, index) {
    const q = current();
    if (!q) return;
    q.placementOrder ||= [];
    const previousIndex = q.placements[studentId];
    const alreadyOrdered = q.placementOrder.includes(studentId);
    if (previousIndex === index && (index == null || alreadyOrdered)) {
      selected = null;
      render();
      return;
    }
    const before = snap();
    q.placementOrder = q.placementOrder.filter((id) => id !== studentId);
    if (index == null) delete q.placements[studentId];
    else {
      q.placements[studentId] = index;
      q.placementOrder.push(studentId);
    }
    selected = null;
    const h = history();
    h.undo.push(before);
    if (h.undo.length > 100) h.undo.shift();
    h.redo = [];
    persist();
    render();
  }

  function openDB() {
    return (
      dbPromise ||
      (dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
        const r = indexedDB.open(DB_NAME, 1);
        r.onupgradeneeded = () => r.result.createObjectStore(DB_STORE);
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
      }))
    );
  }
  async function dbPut(id: string, blob: Blob) {
    const db = await openDB();
    return new Promise<void>((res, rej) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).put(blob, id);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  }
  async function dbDelete(id: string) {
    const db = await openDB();
    return new Promise<void>((res, rej) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).delete(id);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  }
  async function dbEntries(): Promise<Array<[string, Blob]>> {
    const db = await openDB();
    return new Promise<Array<[string, Blob]>>((res, rej) => {
      const tx = db.transaction(DB_STORE);
      const store = tx.objectStore(DB_STORE),
        kr = store.getAllKeys(),
        vr = store.getAll();
      tx.oncomplete = () =>
        res(kr.result.map((id, i) => [String(id), vr.result[i] as Blob]));
      tx.onerror = () => rej(tx.error);
    });
  }
  async function dbClear() {
    const db = await openDB();
    return new Promise<void>((res, rej) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).clear();
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  }
  async function compress(file: File): Promise<Blob | null> {
    if (file.size > 20e6) {
      toast('Please choose an image smaller than 20 MB');
      return null;
    }
    try {
      const bitmap = await createImageBitmap(file),
        max = 1000,
        scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height)),
        canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      if (!context) {
        bitmap.close();
        return file;
      }
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      return (
        (await new Promise((res) => canvas.toBlob(res, 'image/webp', 0.82))) ||
        file
      );
    } catch {
      return file;
    }
  }
  async function addImage(file: File) {
    const blob = await compress(file);
    if (!blob) return null;
    return storeImage(blob);
  }
  async function storeImage(blob: Blob) {
    const id = uid();
    await dbPut(id, blob);
    if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
    const old = imageCache.get(id);
    if (old) URL.revokeObjectURL(old);
    const url = URL.createObjectURL(blob);
    imageCache.set(id, url);
    return { id, url };
  }
  function visualBlob(visual: string, label: string, color?: string) {
    const safeLabel = esc(label);
    const contents = color
      ? `<rect x="8" y="8" width="240" height="240" rx="28" fill="${color}" stroke="#687386" stroke-width="8"/>`
      : `<text x="128" y="132" text-anchor="middle" dominant-baseline="central" font-size="176" font-family="Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif">${visual}</text>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="${safeLabel}">${contents}</svg>`;
    return new Blob([svg], { type: 'image/svg+xml' });
  }
  function imageSrc(a) {
    return a?.imageId ? imageCache.get(a.imageId) || '' : a?.image || '';
  }
  async function hydrateImages() {
    for (const url of imageCache.values()) URL.revokeObjectURL(url);
    imageCache.clear();
    for (const [id, blob] of await dbEntries())
      imageCache.set(id, URL.createObjectURL(blob));
  }
  async function migrateImages() {
    const map = new Map(),
      collections = [...data.templates, ...data.questions];
    for (const item of collections)
      for (const a of item.answers || []) {
        if (a.image && a.image.startsWith('data:')) {
          let id = map.get(a.image);
          if (!id) {
            id = uid();
            map.set(a.image, id);
            await dbPut(id, await (await fetch(a.image)).blob());
          }
          a.imageId = id;
          delete a.image;
        }
      }
  }
  async function cleanupImages() {
    const refs = new Set(
      [...data.templates, ...data.questions].flatMap((x) =>
        (x.answers || []).map((a) => a.imageId).filter(Boolean)
      )
    );
    for (const [id] of await dbEntries())
      if (!refs.has(id)) {
        await dbDelete(id);
        const u = imageCache.get(id);
        if (u) URL.revokeObjectURL(u);
        imageCache.delete(id);
      }
  }

  function groupSide(group) {
    const q = current(),
      cfg = data.groupSettings[group],
      all = presentStudents().filter((s) => s.group === group),
      available = all.filter((s) => !Number.isInteger(q.placements[s.id])),
      spacers = all.length - available.length;
    return `<aside class="side ${group}" style="--group-color:${esc(cfg.color)}"><h2>${esc(cfg.label)}</h2><div class="name-list">${available.map(studentHTML).join('')}${Array.from({ length: spacers }, () => '<div class="student-spacer" aria-hidden="true"></div>').join('')}</div></aside>`;
  }
  function studentColor(student) {
    return data.groupSettings[student.group]?.color || '#7357d8';
  }
  function studentHTML(s) {
    return `<div class="student ${selected === s.id ? 'selected' : ''}" style="--student-group-color:${esc(studentColor(s))}" data-student="${esc(s.id)}" title="Drag or tap to move">${esc(s.name)}</div>`;
  }
  function render() {
    renderTabs();
    const q = current(),
      main = $('#main');
    updateControls();
    if (!q) {
      main.innerHTML =
        '<div></div><div class="empty-state"><h2>No open question</h2><button class="primary" id="browseLibraryBtn">Open library</button></div><div></div>';
      $('#browseLibraryBtn').onclick = openLibrary;
      return;
    }
    const presentIds = new Set(presentStudents().map((s) => s.id)),
      absentCount = q.absentStudentIds?.length || 0;
    const cols = q.answers
      .map((a, i) => {
        const order = new Map<string, number>(
            (q.placementOrder || []).map((id, position) => [id, position])
          ),
          placed = q.students
            .filter((s) => presentIds.has(s.id) && q.placements[s.id] === i)
            .sort(
              (a, b) =>
                (order.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
                (order.get(b.id) ?? Number.MAX_SAFE_INTEGER)
            ),
          src = imageSrc(a),
          label = a.text
            ? `<span>${esc(a.text)}</span>`
            : src
              ? ''
              : `<span>Option ${i + 1}</span>`;
        return `<section class="answer-column" data-answer="${i}"><div class="answer-head">${src ? `<img src="${src}" alt="">` : ''}${label}<span class="count-badge" aria-label="${placed.length} student${placed.length === 1 ? '' : 's'}">${placed.length}<span class="count-label"> student${placed.length === 1 ? '' : 's'}</span></span></div><div class="slots">${placed.map((s) => `<div class="slot occupied ${selected === s.id ? 'selected' : ''}" style="--student-group-color:${esc(studentColor(s))}">${studentHTML(s)}</div>`).join('')}<div class="slot" aria-label="Add student"><svg class="ico slot-add-icon"><use href="#i-plus"/></svg></div></div></section>`;
      })
      .join('');
    main.style.setProperty(
      '--board-width',
      Math.max(innerWidth <= 600 ? 420 : 480, q.answers.length * 125) + 'px'
    );
    main.style.setProperty(
      '--option-min',
      q.answers.length <= 3
        ? '180px'
        : q.answers.length <= 4
          ? '130px'
          : q.answers.length <= 6
            ? '90px'
            : '130px'
    );
    main.innerHTML =
      groupSide('girls') +
      `<section class="board"><h1 class="question">${esc(q.question)}</h1>${absentCount ? `<p class="attendance-summary">Attendance · ${absentCount} absent</p>` : ''}<div class="answer-grid" style="--option-count:${Math.max(1, q.answers.length)}">${cols}</div></section>` +
      groupSide('boys');
    bindBoard();
  }
  function renderTabs() {
    const tabs = $('#tabs'),
      open = openQuestions();
    tabs.innerHTML =
      open
        .map(
          (q) =>
            `<div class="tab ${q.id === data.activeId ? 'active' : ''} ${isComplete(q) ? 'complete' : isPartial(q) ? 'partial' : ''}" data-tab="${esc(q.id)}" title="${esc(q.question)}" role="tab" tabindex="0" aria-selected="${q.id === data.activeId}"><span class="tab-label">${esc(q.title || q.question)}</span><button class="tab-close" type="button" data-close-tab="${esc(q.id)}" title="Close tab" aria-label="Close ${esc(q.title || q.question)}">×</button></div>`
        )
        .join('') +
      '<button class="tab tab-add" id="addTab" title="New question"><svg class="ico"><use href="#i-plus"/></svg></button>';
    $$('[data-tab]').forEach((tab) => {
      tab.onclick = (event) => {
        if (event.target.closest('[data-close-tab]')) {
          closeTab(event.target.closest('[data-close-tab]').dataset.closeTab);
          return;
        }
        data.activeId = tab.dataset.tab;
        selected = null;
        persist();
        render();
      };
      tab.onkeydown = (event) => {
        if (
          event.target !== tab ||
          (event.key !== 'Enter' && event.key !== ' ')
        )
          return;
        event.preventDefault();
        tab.click();
      };
    });
    $('#addTab').onclick = openNew;
  }
  function closeTab(id) {
    data.openQuestionIds = data.openQuestionIds.filter((x) => x !== id);
    if (data.activeId === id) data.activeId = data.openQuestionIds[0] || null;
    persist();
    render();
  }
  function navigate(delta) {
    const open = openQuestions();
    if (!open.length) return;
    let i = open.findIndex((q) => q.id === data.activeId);
    data.activeId = open[(i + delta + open.length) % open.length].id;
    persist();
    render();
  }
  function bindBoard() {
    $$('.student').forEach((el) => {
      let sx = 0,
        sy = 0,
        active = false,
        ghost = null;
      const clear = () =>
          $$('.drag-target').forEach((x) => x.classList.remove('drag-target')),
        at = (x: number, y: number): HTMLElement | null =>
          document
            .elementFromPoint(x, y)
            ?.closest<HTMLElement>('.answer-column,.side') || null,
        finish = () => {
          ghost?.remove();
          el.classList.remove('dragging-source');
          clear();
          document.body.style.removeProperty('--drag-color');
          active = false;
        };
      el.onpointerdown = (e) => {
        if (e.button !== 0) return;
        sx = e.clientX;
        sy = e.clientY;
        dragId = el.dataset.student;
        el.setPointerCapture(e.pointerId);
      };
      el.onpointermove = (e) => {
        if (!el.hasPointerCapture(e.pointerId)) return;
        if (!active && Math.hypot(e.clientX - sx, e.clientY - sy) > 7) {
          active = true;
          selected = null;
          document.body.style.setProperty(
            '--drag-color',
            el.style.getPropertyValue('--student-group-color')
          );
          ghost = el.cloneNode(true);
          ghost.classList.add('drag-ghost');
          document.body.appendChild(ghost);
          el.classList.add('dragging-source');
        }
        if (active) {
          e.preventDefault();
          ghost.style.left = e.clientX + 'px';
          ghost.style.top = e.clientY + 'px';
          clear();
          at(e.clientX, e.clientY)?.classList.add('drag-target');
        }
      };
      el.onpointerup = (e) => {
        if (!el.hasPointerCapture(e.pointerId)) return;
        el.releasePointerCapture(e.pointerId);
        if (active) {
          const t = at(e.clientX, e.clientY);
          finish();
          if (t?.classList.contains('side')) move(dragId, null);
          else if (t) {
            const n = Number(t.dataset.answer);
            if (Number.isFinite(n)) move(dragId, n);
          }
        } else {
          selected =
            selected === el.dataset.student ? null : el.dataset.student;
          render();
        }
        active = false;
      };
      el.onpointercancel = finish;
    });
    $$('.answer-column').forEach(
      (el) =>
        (el.onclick = () => {
          if (selected) {
            const n = Number(el.dataset.answer);
            move(selected, n);
          }
        })
    );
    $$('.side').forEach(
      (el) =>
        (el.onclick = (e) => {
          if (selected && !e.target.closest('.student')) move(selected, null);
        })
    );
  }
  function updateControls() {
    const q = current(),
      h = q ? history() : { undo: [], redo: [] };
    $('#undoBtn').disabled = !h.undo.length;
    $('#redoBtn').disabled = !h.redo.length;
    const disabled = openQuestions().length < 2;
    $('#prevBtn').disabled = disabled;
    $('#nextBtn').disabled = disabled;
    const hasQuestion = !!q,
      hasResponses = !!q && Object.keys(q.placements).length > 0,
      absentCount = q?.absentStudentIds?.length || 0;
    $('#resetBtn').disabled = !hasResponses;
    $('#resetBtn').title = hasResponses
      ? 'Clear responses'
      : 'No responses to clear';
    $('#questionSettingsBtn').disabled = !hasQuestion;
    $('#questionSettingsBtn').title = hasQuestion
      ? 'Question settings'
      : 'Open a question to change its settings';
    $('#attendanceBtn').disabled = !hasQuestion;
    $('#attendanceBadge').textContent = absentCount || '';
    $('#attendanceBadge').hidden = !absentCount;
    $('#attendanceBtn').title = !hasQuestion
      ? 'Open a question to take attendance'
      : absentCount
        ? `Attendance · ${absentCount} absent`
        : 'Attendance for this question';
  }
  function undo() {
    const q = current(),
      h = history();
    if (!q || !h.undo.length) return;
    h.redo.push(snap());
    restoreSnapshot(q, h.undo.pop());
    persist();
    render();
  }
  function redo() {
    const q = current(),
      h = history();
    if (!q || !h.redo.length) return;
    h.undo.push(snap());
    restoreSnapshot(q, h.redo.pop());
    persist();
    render();
  }
  function clearResponses() {
    const q = current();
    if (!q || !Object.keys(q.placements).length) return;
    const before = snap(),
      h = history();
    h.undo.push(before);
    if (h.undo.length > 100) h.undo.shift();
    h.redo = [];
    q.placements = {};
    q.placementOrder = [];
    persist();
    render();
    toast('Responses cleared · Undo available');
  }

  function addStudentRow(group, s = { id: uid(), name: '' }) {
    const row = document.createElement('div');
    row.className = 'student-edit-row';
    row.dataset.id = s.id;
    row.innerHTML = `<input class="student-name-input" value="${esc(s.name)}" placeholder="Student name"><button class="mini row-up" title="Move up"><svg class="ico"><use href="#i-up"/></svg></button><button class="mini row-down" title="Move down"><svg class="ico"><use href="#i-down"/></svg></button><button class="row-remove" title="Remove student"><svg class="ico"><use href="#i-trash"/></svg></button>`;
    row.querySelector<HTMLButtonElement>('.row-remove')!.onclick = () =>
      row.remove();
    row.querySelector<HTMLButtonElement>('.row-up')!.onclick = () =>
      row.previousElementSibling &&
      row.parentNode.insertBefore(row, row.previousElementSibling);
    row.querySelector<HTMLButtonElement>('.row-down')!.onclick = () =>
      row.nextElementSibling &&
      row.parentNode.insertBefore(row.nextElementSibling, row);
    $('#' + group + 'Rows').appendChild(row);
  }
  function openSettings() {
    $('#settingsVersion').textContent = `v${APP_VERSION}`;
    for (const g of ['girls', 'boys']) {
      $('#' + g + 'Rows').innerHTML = '';
      $('#' + g + 'Label').value = data.groupSettings[g].label;
      $('#' + g + 'Color').value = data.groupSettings[g].color;
      data.classStudents
        .filter((s) => s.group === g)
        .forEach((s) => addStudentRow(g, s));
    }
    $('#settingsModal').classList.add('open');
  }
  function saveSettings() {
    let n = 0;
    const collect = (g) =>
      $$(`#${g}Rows .student-edit-row`).map((row) => {
        n++;
        return {
          id: row.dataset.id || uid(),
          name:
            row.querySelector('.student-name-input').value.trim() ||
            `Student ${n}`,
          group: g
        };
      });
    data.classStudents = [...collect('girls'), ...collect('boys')];
    for (const g of ['girls', 'boys'])
      data.groupSettings[g] = {
        label: $('#' + g + 'Label').value.trim() || g,
        color: $('#' + g + 'Color').value
      };
    data.questions.forEach((q) => {
      q.students = data.classStudents.map((s) => ({ ...s }));
      q.absentStudentIds = (q.absentStudentIds || []).filter((id) =>
        q.students.some((s) => s.id === id)
      );
      for (const id of Object.keys(q.placements))
        if (!q.students.some((s) => s.id === id)) delete q.placements[id];
      q.placementOrder = (q.placementOrder || []).filter((id) =>
        Object.hasOwn(q.placements, id)
      );
    });
    persist();
    closeModal('settingsModal');
    render();
    toast('Classroom saved');
  }
  function sortRows(group) {
    const box = $('#' + group + 'Rows'),
      rows = $$(`#${group}Rows .student-edit-row`).sort((a, b) =>
        a
          .querySelector('input')
          .value.localeCompare(b.querySelector('input').value)
      );
    rows.forEach((r) => box.appendChild(r));
  }

  function openAttendance() {
    const q = current();
    if (!q) return;
    const absent = new Set(q.absentStudentIds || []);
    $('#attendanceList').innerHTML =
      data.classStudents
        .map(
          (s) =>
            `<label class="attendance-row"><input type="checkbox" value="${esc(s.id)}" ${absent.has(s.id) ? 'checked' : ''}><span>${esc(s.name)}</span></label>`
        )
        .join('') ||
      '<div class="empty-note">Add students in Settings first.</div>';
    $('#attendanceModal').classList.add('open');
  }
  function saveAttendance() {
    const q = current();
    if (!q) return;
    q.absentStudentIds = $$('#attendanceList input:checked').map(
      (x) => x.value
    );
    for (const id of q.absentStudentIds) delete q.placements[id];
    q.placementOrder = (q.placementOrder || []).filter((id) =>
      Object.hasOwn(q.placements, id)
    );
    selected = null;
    persist();
    closeModal('attendanceModal');
    render();
    toast(
      q.absentStudentIds.length
        ? `${q.absentStudentIds.length} marked absent`
        : 'Everyone marked present'
    );
  }

  function categoryValues() {
    return [...CATEGORIES];
  }
  function pickerPreview(picker, src) {
    picker.querySelector('.picker-visual').innerHTML = src
      ? `<img src="${esc(src)}" alt="Selected option image">`
      : '<svg class="ico"><use href="#i-plus"/></svg>';
    picker.querySelector('.picker-text').textContent = src
      ? 'Replace'
      : 'Picture';
    picker.querySelector('.remove-img').style.display = src ? 'grid' : 'none';
  }
  function renderImageLibrary() {
    const query = $('#imageLibrarySearch').value.trim().toLowerCase();
    const matches = VISUAL_LIBRARY.filter(([, label, category]) =>
      `${label} ${category}`.toLowerCase().includes(query)
    );
    $('#imageLibraryGrid').innerHTML = matches.length
      ? matches
          .map(
            ([visual, label, category, color], index) =>
              `<button class="visual-library-item" data-visual-index="${VISUAL_LIBRARY.indexOf(matches[index])}" title="${esc(label)}"><span aria-hidden="true"${color ? ` class="visual-color-swatch" style="--swatch-color:${color}"` : ''}>${color ? '' : visual}</span><strong>${esc(label)}</strong><small>${esc(category)}</small></button>`
          )
          .join('')
      : '<p class="empty-note image-library-empty">No visuals match that search.</p>';
    $$('#imageLibraryGrid .visual-library-item').forEach(
      (button) =>
        (button.onclick = async () => {
          if (imageLibraryOptionIndex === null) return;
          const [visual, label, , color] =
            VISUAL_LIBRARY[+button.dataset.visualIndex];
          const img = await storeImage(visualBlob(visual, label, color));
          const answer = draft.answers[imageLibraryOptionIndex];
          answer.imageId = img.id;
          delete answer.image;
          closeModal('imageLibraryModal');
          renderOptionEditors();
          toast(`${label} picture added`);
        })
    );
  }
  function openImageLibrary(optionIndex: number) {
    imageLibraryOptionIndex = optionIndex;
    $('#imageLibrarySearch').value = '';
    renderImageLibrary();
    $('#imageLibraryModal').classList.add('open');
    $('#imageLibrarySearch').focus();
  }
  function renderOptionEditors() {
    const box = $('#answerEditors');
    box.innerHTML = draft.answers
      .map((a, i) => {
        const src = imageSrc(a);
        return `<div class="answer-editor"><span class="answer-number">${i + 1}</span><input class="answer-text" data-i="${i}" value="${esc(a.text)}" placeholder="Option ${i + 1}"><div class="image-picker"><input type="file" accept="image/*" id="img${i}" data-i="${i}"><label for="img${i}" title="Upload a picture"><span class="picker-visual">${src ? `<img src="${src}" alt="Option image">` : '<svg class="ico"><use href="#i-plus"/></svg>'}</span><span class="picker-text">${src ? 'Replace' : 'Upload'}</span></label><button class="choose-library" data-i="${i}" title="Choose from visual library" aria-label="Choose from visual library"><svg class="ico"><use href="#i-library"/></svg></button><button class="remove-img" data-i="${i}" title="Remove picture" aria-label="Remove picture" style="display:${src ? 'grid' : 'none'}">×</button></div><button class="remove-option" data-i="${i}" title="Remove option" ${draft.answers.length === 1 ? 'disabled' : ''}><svg class="ico"><use href="#i-trash"/></svg></button></div>`;
      })
      .join('');
    $$('#answerEditors .answer-text').forEach(
      (x) => (x.oninput = () => (draft.answers[+x.dataset.i].text = x.value))
    );
    $$('#answerEditors .image-picker input').forEach(
      (x) =>
        (x.onchange = async () => {
          if (!x.files[0]) return;
          const img = await addImage(x.files[0]);
          if (img) {
            draft.answers[+x.dataset.i].imageId = img.id;
            delete draft.answers[+x.dataset.i].image;
            pickerPreview(x.closest('.image-picker'), img.url);
          }
        })
    );
    $$('#answerEditors .remove-img').forEach(
      (x) =>
        (x.onclick = () => {
          draft.answers[+x.dataset.i].imageId = null;
          delete draft.answers[+x.dataset.i].image;
          pickerPreview(x.closest('.image-picker'), '');
        })
    );
    $$('#answerEditors .choose-library').forEach(
      (x) => (x.onclick = () => openImageLibrary(+x.dataset.i))
    );
    $$('#answerEditors .remove-option').forEach(
      (x) =>
        (x.onclick = () => {
          if (draft.answers.length > 1) {
            draft.answers.splice(+x.dataset.i, 1);
            renderOptionEditors();
          }
        })
    );
  }
  function fillCategories() {
    const selected = $('#categoryInput').value;
    $('#categoryInput').innerHTML = categoryValues()
      .map((c) => `<option value="${esc(c)}">${esc(c)}</option>`)
      .join('');
    if (CATEGORIES.includes(selected)) $('#categoryInput').value = selected;
  }
  function openQuestionSettings() {
    const q = current();
    if (!q) return;
    draft = {
      isNew: false,
      answers: q.answers.map((a, i) => ({ ...a, sourceIndex: i }))
    };
    $('#questionInput').value = q.question;
    $('#tabTitleInput').value = q.title || '';
    fillCategories();
    $('#categoryInput').value = CATEGORIES.includes(q.category)
      ? q.category
      : CATEGORIES[0];
    $('#questionModalTitle').textContent = 'Question Settings';
    $('#saveQuestionBtn').textContent = 'Save Question';
    $('#deleteQuestionSection').style.display = 'block';
    renderOptionEditors();
    $('#questionModal').classList.add('open');
  }
  function openNew() {
    draft = {
      isNew: true,
      answers: Array.from({ length: 4 }, () => ({
        text: '',
        imageId: null,
        sourceIndex: null
      }))
    };
    $('#questionInput').value = '';
    $('#tabTitleInput').value = '';
    fillCategories();
    $('#categoryInput').value = CATEGORIES[0];
    $('#questionModalTitle').textContent = 'New Question';
    $('#saveQuestionBtn').textContent = 'Create Question';
    $('#deleteQuestionSection').style.display = 'none';
    renderOptionEditors();
    closeModal('libraryModal');
    $('#questionModal').classList.add('open');
    setTimeout(() => $('#questionInput').focus(), 50);
  }
  function draftDefinition() {
    return {
      question: $('#questionInput').value.trim() || 'Question of the Day',
      title: $('#tabTitleInput').value.trim(),
      category: $('#categoryInput').value.trim(),
      answers: draft.answers.map(({ sourceIndex, ...a }) => clone(a))
    };
  }
  async function saveQuestion() {
    const def = draftDefinition();
    if (draft.isNew) {
      const t = { id: uid(), ...def };
      data.templates.push(t);
      const q = instanceFrom(t);
      data.questions.push(q);
      data.openQuestionIds.push(q.id);
      data.activeId = q.id;
      persist();
      closeModal('questionModal');
      render();
      toast('Question created');
      return;
    }
    const q = current();
    q.question = def.question;
    q.title = def.title;
    q.category = def.category;
    for (const id of Object.keys(q.placements)) {
      const next = draft.answers.findIndex(
        (a) => a.sourceIndex === q.placements[id]
      );
      if (next < 0) delete q.placements[id];
      else q.placements[id] = next;
    }
    q.placementOrder = (q.placementOrder || []).filter((id) =>
      Object.hasOwn(q.placements, id)
    );
    q.answers = def.answers;
    historyMap[q.id] = { undo: [], redo: [] };
    persist();
    closeModal('questionModal');
    await cleanupImages();
    render();
    toast('Question saved');
  }
  async function deleteQuestion() {
    const q = current();
    if (!q || !confirm('Delete this working question and all responses?'))
      return;
    data.questions = data.questions.filter((x) => x.id !== q.id);
    closeTab(q.id);
    closeModal('questionModal');
    await cleanupImages();
    render();
  }

  function libraryMatches() {
    const term = $('#librarySearch').value.trim().toLowerCase();
    return data.templates.filter(
      (t) =>
        (!term ||
          (t.question + ' ' + t.title + ' ' + t.category)
            .toLowerCase()
            .includes(term)) &&
        (!questionCategory || t.category === questionCategory)
    );
  }
  function renderLibrary() {
    const cats = categoryValues(),
      categoryOptions = (selected) =>
        `<option value=""${selected ? '' : ' selected'}>All categories</option>` +
        cats
          .map(
            (category) =>
              `<option value="${esc(category)}"${category === selected ? ' selected' : ''}>${esc(category)}</option>`
          )
          .join('');
    if (!cats.includes(questionCategory)) questionCategory = '';
    if (!cats.includes(savedWorkCategory)) savedWorkCategory = '';
    const templates = libraryMatches(),
      term = $('#librarySearch').value.trim().toLowerCase(),
      sessions = data.questions.filter(
        (q) =>
          (!term ||
            (q.question + ' ' + q.title + ' ' + q.category)
              .toLowerCase()
              .includes(term)) &&
          (!savedWorkCategory || q.category === savedWorkCategory)
      );
    const templateHTML =
      templates
        .map(
          (t) =>
            `<article class="library-item library-question ${t.used ? 'used' : ''}"><div><h3>${esc(t.title || t.question)}${t.used ? '<span class="used-badge">Used</span>' : ''}</h3><p>${esc(t.category || 'Uncategorized')} · ${t.answers.length} option${t.answers.length === 1 ? '' : 's'}</p><p class="option-preview">${t.answers.map((answer) => esc(answer.text || (imageSrc(answer) ? 'Picture' : 'Untitled option'))).join(' · ')}</p></div><div class="row-actions"><button class="quiet-action toggle-used" data-id="${esc(t.id)}" aria-pressed="${!!t.used}">${t.used ? '✓ Used' : 'Mark used'}</button><button class="primary use-template" data-id="${esc(t.id)}">Use Question</button><button class="${t.builtinId ? 'secondary' : 'danger'} delete-template" data-id="${esc(t.id)}" title="${t.builtinId ? 'Hide built-in question' : 'Delete library question'}">${t.builtinId ? 'Hide' : '<svg class="ico"><use href="#i-trash"/></svg><span>Delete</span>'}</button></div></article>`
        )
        .join('') || '<div class="empty-note">No matching questions</div>';
    const sessionHTML =
      sessions
        .map(
          (q) =>
            `<article class="library-item saved-work"><div><h3>${esc(q.title || q.question)} ${isComplete(q) ? '✓' : ''}</h3><p>${esc(q.category || 'Uncategorized')} · ${Object.keys(q.placements).length} response${Object.keys(q.placements).length === 1 ? '' : 's'}</p></div><div class="row-actions"><button class="secondary reopen-session" data-id="${esc(q.id)}">${data.openQuestionIds.includes(q.id) ? 'View' : 'Reopen'}</button><button class="danger delete-session" data-id="${esc(q.id)}" title="Delete saved copy"><svg class="ico"><use href="#i-trash"/></svg></button></div></article>`
        )
        .join('') || '<div class="empty-note">No saved work</div>';
    const libraryList = $('#libraryList');
    libraryList.classList.toggle(
      'saved-work-expanded',
      savedWorkExpanded && !questionsExpanded
    );
    libraryList.innerHTML =
      `<section class="library-section saved-work-section ${savedWorkExpanded ? '' : 'collapsed'}"><div class="library-section-head"><h3 class="library-section-title"><button class="library-section-toggle" data-library-section="saved-work" aria-expanded="${savedWorkExpanded}">Saved Work</button></h3><label class="category-filter" title="Filter Saved Work by category"><select id="savedWorkCategory" aria-label="Filter Saved Work by category">` +
      categoryOptions(savedWorkCategory) +
      '</select></label></div><div class="library-items">' +
      sessionHTML +
      `</div></section><section class="library-section questions-section ${questionsExpanded ? '' : 'collapsed'}"><div class="library-section-head"><div class="library-section-title-group"><h3 class="library-section-title"><button class="library-section-toggle" data-library-section="questions" aria-expanded="${questionsExpanded}">Questions</button></h3><button class="primary" id="libraryNewBtn"><svg class="ico"><use href="#i-plus"/></svg>New question</button></div><label class="category-filter" title="Filter Questions by category"><select id="questionCategory" aria-label="Filter Questions by category">` +
      categoryOptions(questionCategory) +
      '</select></label></div><div class="library-items">' +
      templateHTML +
      '</div></section>';
    $('#savedWorkCategory').onchange = (event) => {
      savedWorkCategory = event.target.value;
      renderLibrary();
    };
    $('#questionCategory').onchange = (event) => {
      questionCategory = event.target.value;
      renderLibrary();
    };
    $('#libraryNewBtn').onclick = openNew;
    $$('[data-library-section]').forEach(
      (button) =>
        (button.onclick = () => {
          if (button.dataset.librarySection === 'saved-work')
            savedWorkExpanded = !savedWorkExpanded;
          else questionsExpanded = !questionsExpanded;
          renderLibrary();
        })
    );
    $$('.toggle-used').forEach(
      (b) =>
        (b.onclick = () => {
          const template = data.templates.find((t) => t.id === b.dataset.id);
          if (!template) return;
          template.used = !template.used;
          persist();
          renderLibrary();
        })
    );
    $$('.use-template').forEach(
      (b) => (b.onclick = () => useTemplate(b.dataset.id))
    );
    $$('.reopen-session').forEach(
      (b) => (b.onclick = () => reopenSession(b.dataset.id))
    );
    $$('.delete-template').forEach(
      (b) =>
        (b.onclick = async () => {
          if (
            confirm(
              b.title.startsWith('Hide')
                ? 'Hide this built-in question from the library? Existing working copies will remain.'
                : 'Delete this library question? Existing working copies will remain.'
            )
          ) {
            const doomed = data.templates.find((t) => t.id === b.dataset.id);
            if (
              doomed?.builtinId &&
              !data.deletedBuiltInIds.includes(doomed.builtinId)
            )
              data.deletedBuiltInIds.push(doomed.builtinId);
            data.templates = data.templates.filter(
              (t) => t.id !== b.dataset.id
            );
            persist();
            await cleanupImages();
            renderLibrary();
          }
        })
    );
    $$('.delete-session').forEach(
      (b) =>
        (b.onclick = async () => {
          if (confirm('Delete this saved working copy and its responses?')) {
            data.questions = data.questions.filter(
              (q) => q.id !== b.dataset.id
            );
            data.openQuestionIds = data.openQuestionIds.filter(
              (id) => id !== b.dataset.id
            );
            if (data.activeId === b.dataset.id)
              data.activeId = data.openQuestionIds[0] || null;
            persist();
            await cleanupImages();
            renderLibrary();
            render();
          }
        })
    );
    const usedCount = data.templates.filter((t) => t.used).length;
    $('#clearUsedBtn').disabled = !usedCount;
    $('#clearUsedBtn').textContent = `Clear All Used (${usedCount})`;
    const hiddenCount = data.deletedBuiltInIds.length;
    $('#restoreHiddenBtn').disabled = !hiddenCount;
    $('#restoreHiddenBtn').textContent = hiddenCount
      ? `Restore Hidden (${hiddenCount})`
      : 'Restore Hidden';
  }
  function openLibrary() {
    renderLibrary();
    $('#libraryModal').classList.add('open');
  }
  function useTemplate(id) {
    const t = data.templates.find((t) => t.id === id);
    if (!t) return;
    t.used = true;
    const q = instanceFrom(t);
    data.questions.push(q);
    data.openQuestionIds.push(q.id);
    data.activeId = q.id;
    persist();
    closeModal('libraryModal');
    render();
    toast('Question added');
  }
  function reopenSession(id) {
    if (!data.openQuestionIds.includes(id)) data.openQuestionIds.push(id);
    data.activeId = id;
    persist();
    closeModal('libraryModal');
    render();
  }
  function randomQuestion() {
    const list = libraryMatches();
    if (!list.length) {
      toast('No questions match the filters');
      return;
    }
    useTemplate(list[Math.floor(Math.random() * list.length)].id);
  }
  function clearUsedQuestions() {
    const usedCount = data.templates.filter((template) => template.used).length;
    if (!usedCount) return;
    if (
      !confirm(
        `Clear the Used marker from all ${usedCount} marked question${usedCount === 1 ? '' : 's'}?`
      )
    )
      return;
    data.templates.forEach((template) => (template.used = false));
    persist();
    renderLibrary();
    toast(`${usedCount} question${usedCount === 1 ? '' : 's'} marked unused`);
  }
  function restoreHiddenQuestions() {
    const hiddenIds = new Set(data.deletedBuiltInIds),
      existingIds = new Set(
        data.templates.map((question) => question.builtinId).filter(Boolean)
      );
    if (!hiddenIds.size) return;
    const questionLabel = `hidden question${hiddenIds.size === 1 ? '' : 's'}`;
    if (!confirm(`Restore all ${hiddenIds.size} ${questionLabel}?`)) return;
    if (
      !confirm(
        `Are you sure you want to restore ${hiddenIds.size} ${questionLabel} to the library?`
      )
    )
      return;
    for (const builtIn of BUILT_INS)
      if (
        hiddenIds.has(builtIn.builtinId) &&
        !existingIds.has(builtIn.builtinId)
      )
        data.templates.push({ id: uid(), ...clone(builtIn) });
    data.deletedBuiltInIds = [];
    persist();
    renderLibrary();
    toast(
      `${hiddenIds.size} hidden question${hiddenIds.size === 1 ? '' : 's'} restored`
    );
  }

  function blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.onerror = rej;
      r.readAsDataURL(blob);
    });
  }
  async function exportBackup() {
    await cleanupImages();
    const images = [];
    for (const [id, blob] of await dbEntries())
      images.push({ id, data: await blobToDataURL(blob) });
    const payload = {
        version: 2,
        exportedAt: new Date().toISOString(),
        data,
        images
      },
      a = document.createElement('a');
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(payload)], { type: 'application/json' })
    );
    a.download = 'question-of-the-day-backup.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Backup exported');
  }
  async function importBackup(file) {
    try {
      const payload = JSON.parse(await file.text());
      if (!payload.data || !Array.isArray(payload.images))
        throw Error('Invalid backup');
      if (!confirm('Replace the current classroom with this backup?')) return;
      await dbClear();
      for (const img of payload.images)
        await dbPut(img.id, await (await fetch(img.data)).blob());
      data = payload.data;
      migrate();
      persist();
      await hydrateImages();
      closeModal('settingsModal');
      render();
      toast('Backup restored');
    } catch (e) {
      console.error(e);
      toast('That backup could not be imported');
    }
  }

  function togglePresentation() {
    document.body.classList.toggle('presenting');
    $('#presentBtn .label').textContent = document.body.classList.contains(
      'presenting'
    )
      ? 'Exit'
      : 'Present';
  }
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      toast('Fullscreen is not available in this browser');
    }
  }
  function closeModal(id) {
    $('#' + id)?.classList.remove('open');
    if (id === 'updateModal') {
      localStorage.setItem(VERSION_KEY, APP_VERSION);
      localStorage.removeItem(LEGACY_VERSION_KEY);
    }
    if (id === 'questionModal') cleanupImages().catch(() => {});
  }
  function compareVersions(a, b) {
    const left = String(a).split('.').map(Number),
      right = String(b).split('.').map(Number),
      length = Math.max(left.length, right.length);
    for (let i = 0; i < length; i++) {
      const difference = (left[i] || 0) - (right[i] || 0);
      if (difference) return difference;
    }
    return 0;
  }
  function showUpdateNotice() {
    const seenVersion =
      localStorage.getItem(VERSION_KEY) ||
      localStorage.getItem(LEGACY_VERSION_KEY);
    if (!seenVersion) {
      localStorage.setItem(VERSION_KEY, APP_VERSION);
      return;
    }
    if (compareVersions(seenVersion, APP_VERSION) >= 0) {
      localStorage.setItem(VERSION_KEY, seenVersion);
      localStorage.removeItem(LEGACY_VERSION_KEY);
      return;
    }
    const unseenChanges = CHANGELOG.filter(
      (release) => compareVersions(release.version, seenVersion) > 0
    )
      .sort((a, b) => compareVersions(a.version, b.version))
      .flatMap((release) => release.changes);
    if (!unseenChanges.length) {
      localStorage.setItem(VERSION_KEY, APP_VERSION);
      localStorage.removeItem(LEGACY_VERSION_KEY);
      return;
    }
    $('#updateVersion').textContent = `v${APP_VERSION}`;
    $('#updateList').innerHTML = unseenChanges
      .map((update) => `<li>${esc(update)}</li>`)
      .join('');
    $('#updateModal').classList.add('open');
  }
  function openChangelog() {
    $('#changelogHistory').innerHTML = [...CHANGELOG]
      .sort((a, b) => compareVersions(b.version, a.version))
      .map(
        (release) =>
          `<section class="changelog-release"><h3>Version ${esc(release.version)}</h3><ul class="update-list">${release.changes.map((change) => `<li>${esc(change)}</li>`).join('')}</ul></section>`
      )
      .join('');
    $('#changelogModal').classList.add('open');
  }
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  }

  function bindStatic() {
    $('#prevBtn').onclick = () => navigate(-1);
    $('#nextBtn').onclick = () => navigate(1);
    $('#undoBtn').onclick = undo;
    $('#redoBtn').onclick = redo;
    $('#resetBtn').onclick = clearResponses;
    $('#libraryBtn').onclick = openLibrary;
    $('#questionSettingsBtn').onclick = openQuestionSettings;
    $('#attendanceBtn').onclick = openAttendance;
    $('#settingsBtn').onclick = openSettings;
    $('#fullscreenBtn').onclick = fullscreen;
    $('#presentBtn').onclick = togglePresentation;
    $('#saveSettingsBtn').onclick = saveSettings;
    $('#saveAttendanceBtn').onclick = saveAttendance;
    $('#viewChangelogBtn').onclick = openChangelog;
    $('#saveQuestionBtn').onclick = saveQuestion;
    $('#addOptionBtn').onclick = () => {
      draft.answers.push({ text: '', imageId: null, sourceIndex: null });
      renderOptionEditors();
    };
    $$('.add-student').forEach(
      (b) => (b.onclick = () => addStudentRow(b.dataset.group))
    );
    $$('.sort-students').forEach(
      (b) => (b.onclick = () => sortRows(b.dataset.group))
    );
    $('#deleteQuestionBtn').onclick = deleteQuestion;
    $('#librarySearch').oninput = renderLibrary;
    $('#imageLibrarySearch').oninput = renderImageLibrary;
    $('#randomQuestionBtn').onclick = randomQuestion;
    $('#restoreHiddenBtn').onclick = restoreHiddenQuestions;
    $('#clearUsedBtn').onclick = clearUsedQuestions;
    $('#exportBtn').onclick = exportBackup;
    $('#importInput').onchange = (e) =>
      e.target.files[0] && importBackup(e.target.files[0]);
    $$('[data-close]').forEach(
      (x) => (x.onclick = () => closeModal(x.dataset.close))
    );
    $$('.modal-wrap').forEach(
      (x) =>
        (x.onclick = (e) => {
          if (e.target === x) closeModal(x.id);
        })
    );
    document.addEventListener('click', (event) => {
      if (
        !selected ||
        (event.target as HTMLElement).closest('.student, .answer-column, .side')
      )
        return;
      selected = null;
      render();
    });
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      if (e.key === 'Escape')
        $$('.modal-wrap.open').forEach((x) => closeModal(x.id));
    });
  }
  async function init() {
    data = load();
    migrate();
    await migrateImages();
    await hydrateImages();
    persist();
    LEGACY_DATA_KEYS.forEach((key) => localStorage.removeItem(key));
    bindStatic();
    render();
    showUpdateNotice();
  }
  init().catch((e) => {
    console.error(e);
    data = defaultData();
    bindStatic();
    render();
    toast('Some saved data could not be loaded');
  });
})();
