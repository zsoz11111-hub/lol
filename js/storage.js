/* Shared visitor records and leaderboard. Firebase failures never block the invitation. */
(function () {
  'use strict';
  const settings = window.WEDDING_CONFIG;
  let ready = null, db = null, user = null, visitSerial = 0, activeName = '', latestScores = [], subscriptions = false;
  const el = id => document.getElementById(id);
  function message(text) { const node = el('wedding-cloud-status'); if (node) node.textContent = text; }
  function limited(promise, ms = 10000) {
    let timer;
    return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), ms); })]).finally(() => clearTimeout(timer));
  }
  function scoreMessage(text) { const node = el('wedding-ranking-label'); if (node) node.textContent = text; }
  function renderScores() {
    const list = el('wedding-score-list'); if (!list) return;
    list.replaceChildren();
    const rows = latestScores.slice(0, 5);
    if (!rows.length) { const empty = document.createElement('li'); empty.textContent = '첫 기록의 주인공이 되어주세요.'; list.append(empty); }
    rows.forEach((row, i) => {
      const li = document.createElement('li'), name = document.createElement('span'), score = document.createElement('span');
      name.textContent = (i + 1) + '. ' + row.name; score.textContent = row.score.toLocaleString() + '점';
      li.append(name, score); list.append(li);
    });
  }
  function renderVisits(snapshot) {
    const box = el('wedding-visitor-list'); if (!box) return;
    const visits = [];
    snapshot.forEach(child => { const value = child.val(); if (value && typeof value.name === 'string') visits.push(value); });
    visits.sort((a, b) => (a.time || 0) - (b.time || 0)); box.replaceChildren();
    visits.slice(-6).forEach(visit => {
      const row = document.createElement('div'), name = document.createElement('span');
      name.textContent = visit.name; row.append(name, document.createTextNode('님이 로비에 참가했습니다.')); box.append(row);
    });
  }
  function subscribe() {
    if (subscriptions) return;
    subscriptions = true;
    db.ref(settings.databasePath + '/visits').orderByChild('time').limitToLast(30).on('value', renderVisits, () => message('접속 기록을 불러오지 못했습니다. 청첩장은 이용할 수 있습니다.'));
    db.ref(settings.databasePath + '/scores').orderByChild('score').limitToLast(20).on('value', snapshot => {
      const scores = []; snapshot.forEach(child => { const row = child.val(); if (row && typeof row.name === 'string' && Number.isFinite(row.score)) scores.push(row); });
      latestScores = scores.sort((a, b) => b.score - a.score || a.updatedAt - b.updatedAt);
      scoreMessage('전체 하객 최고 기록 · 같은 기기에서는 최고 점수 유지');
      renderScores();
    }, () => scoreMessage('전체 순위 연결 실패 · 이번 방문에서 플레이한 기록만 표시됩니다.'));
  }
  async function connect() {
    if (!settings.cloudEnabled) throw new Error('disabled');
    if (!ready) {
      ready = (async () => {
        if (!window.firebase) throw new Error('sdk-unavailable');
        const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(settings.firebase);
        const auth = app.auth();
        const credential = await limited(auth.signInAnonymously());
        user = credential.user; db = app.database(); subscribe(); return user;
      })().catch(error => { ready = null; throw error; });
    }
    return ready;
  }
  async function recordVisit(name) {
    const serial = ++visitSerial; activeName = name;
    message('접속 기록을 연결하고 있습니다…');
    try {
      await connect(); if (serial !== visitSerial) return;
      await limited(db.ref(settings.databasePath + '/visits/' + user.uid).set({name, time:firebase.database.ServerValue.TIMESTAMP}));
      if (serial === visitSerial) message('접속 기록이 저장되었습니다.');
    } catch (_) {
      if (serial === visitSerial) message('접속 기록을 저장하지 못했습니다. 청첩장과 게임은 이용할 수 있습니다.');
    }
  }
  window.addEventListener('wedding:login', event => {recordVisit(event.detail.name);});
  window.addEventListener('wedding:result', async event => {
    const result = event.detail;
    scoreMessage('전체 순위를 연결하고 있습니다…');
    try {
      await connect();
      if (result.name !== activeName) return;
      const reference = db.ref(settings.databasePath + '/scores/' + user.uid);
      await limited(reference.transaction(current => {
        if (current && Number(current.score) >= result.score) return;
        return {name:result.name, score:result.score, cs:result.cs, cannon:result.cannon, maxCombo:result.maxCombo, updatedAt:firebase.database.ServerValue.TIMESTAMP};
      }));
      scoreMessage('전체 하객 최고 기록 · 같은 기기에서는 최고 점수 유지');
      renderScores();
    } catch (_) {
      scoreMessage('전체 순위 저장 실패 · 이번 방문의 기록만 표시됩니다.');
    }
  });
})();
