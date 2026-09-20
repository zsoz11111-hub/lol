(function () {
  const root = document.getElementById('wedding-pages');
  const q = selector => root.querySelector(selector);
  const qa = selector => Array.from(root.querySelectorAll(selector));
  const assets = window.WEDDING_ASSETS;
  const people = [
    {side:'신랑', role:'신랑', name:'서진성', bank:'국민은행', account:'98830004868', phone:'01088300048'},
    {side:'신랑', role:'아버지', name:'서경남', bank:'농협', account:'302-0815-1234-81', phone:'01042305534'},
    {side:'신랑', role:'어머니', name:'김미례', bank:'카카오뱅크', account:'3333-09-6334806', phone:'01054650148'},
    {side:'신부', role:'신부', name:'김성은', bank:'국민은행', account:'740502-00-174520', phone:'01094564527'},
    {side:'신부', role:'아버지', name:'김민기', bank:'광주은행', account:'153-121-203747', phone:'01064507799'},
    {side:'신부', role:'어머니', name:'이미현', bank:'광주은행', account:'001-121-973701', phone:'01026024561'}
  ];
  function element(tag, cls, text) { const el = document.createElement(tag); if (cls) el.className = cls; if (text) el.textContent = text; return el; }
  for (const side of ['신랑', '신부']) {
    const details = element('details', 'account-group'); details.open = side === '신랑';
    details.append(element('summary', '', side + ' 측'));
    const contacts = element('section', 'contact-group'); contacts.append(element('h3', '', side + ' 측'));
    for (const person of people.filter(p => p.side === side)) {
      const row = element('div', 'account-row');
      const copy = element('div'); copy.append(element('div', '', person.role + ' ' + person.name));
      copy.append(element('div', 'muted', person.bank + ' ' + person.account));
      const button = element('button', 'quiet-button', '복사');
      button.type = 'button'; button.dataset.copy = person.account; button.dataset.copyLabel = person.name + '님 계좌번호';
      row.append(copy, button); details.append(row);
      const contact = element('div', 'contact-row'); const identity = element('div');
      identity.append(element('div', '', person.name), element('div', 'muted', person.role));
      const actions = element('div', 'contact-actions');
      for (const [scheme, label] of [['tel:', '전화'], ['sms:', '문자']]) {
        const link = element('a', '', label); link.href = scheme + person.phone;
        link.setAttribute('aria-label', person.name + '님에게 ' + label); actions.append(link);
      }
      contact.append(identity, actions); contacts.append(contact);
    }
    q('#wedding-accounts').append(details); q('#wedding-contacts').append(contacts);
  }
  function announce(message, manualValue) {
    const toast = q('#wedding-toast'); toast.replaceChildren(element('div', '', message)); toast.hidden = false;
    if (manualValue) {
      const field = element('input', 'copy-fallback'); field.value = manualValue; field.readOnly = true;
      field.setAttribute('aria-label', '복사할 내용'); toast.append(field); field.focus(); field.select();
    }
  }
  qa('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    const value = button.dataset.share ? location.href.split('#')[0] : button.dataset.copy;
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(value); announce(button.dataset.copyLabel + '를 복사했습니다.');
    } catch (_) { announce('자동 복사가 지원되지 않습니다. 아래 내용을 길게 눌러 복사해주세요.', value); }
  }));
  const calendar = new URL('https://calendar.google.com/calendar/render');
  calendar.searchParams.set('action', 'TEMPLATE'); calendar.searchParams.set('text', '서진성 · 김성은 결혼식');
  calendar.searchParams.set('dates', '20261115T030000Z/20261115T040000Z');
  calendar.searchParams.set('location', '글로리아 웨딩홀 3층 비스타홀, 광주광역시 서구 상무대로 683');
  calendar.searchParams.set('details', '2026년 11월 15일 일요일 낮 12시. 캘린더 표시 시간은 1시간으로 설정되어 있습니다.');
  qa('[data-calendar]').forEach(link => link.href = calendar.href);
  function updateDday() {
    const seoul = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Seoul', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(new Date());
    const part = key => Number(seoul.find(p => p.type === key).value);
    const difference = Math.round((Date.UTC(2026, 10, 15) - Date.UTC(part('year'), part('month') - 1, part('day'))) / 86400000);
    const label = difference > 0 ? '평생 듀오 결성까지 D-' + difference : difference === 0 ? '오늘, 평생의 듀오가 됩니다' : '평생 듀오 D+' + Math.abs(difference);
    qa('[data-dday]').forEach(el => el.textContent = label);
  }
  updateDday();
  const photo = q('#wedding-gallery-photo'); let touchStart = null;
  photo.addEventListener('touchstart', e => {touchStart = e.touches.length === 1 ? {x:e.touches[0].clientX, y:e.touches[0].clientY} : null;}, {passive:true});
  photo.addEventListener('touchend', e => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x, dy = e.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) q(dx < 0 ? '#wedding-photo-next' : '#wedding-photo-prev').click();
    touchStart = null;
  }, {passive:true});
  const zoom = q('#wedding-photo-zoom');
  function toggleZoom() {
    const expanded = q('.gallery-box').classList.toggle('expanded');
    zoom.setAttribute('aria-pressed', String(expanded)); zoom.textContent = expanded ? '사진 줄이기' : '사진 크게 보기';
  }
  zoom.addEventListener('click', toggleZoom); photo.addEventListener('click', toggleZoom);
  const bgm = q('#wedding-bgm'), queue = q('#wedding-queue-sound');
  bgm.src = assets.bgm; queue.src = assets.queue; queue.volume = 0.65;
  let soundEnabled = true;try{soundEnabled=localStorage.getItem('wedding-sound')!=='off';}catch(_){} let previousScreen = '';
  const sound = q('#wedding-sound');sound.setAttribute('aria-pressed',String(soundEnabled));sound.textContent=soundEnabled?'♫ 소리 켜짐':'♫ 소리 꺼짐';
  function syncSound(force = false) {
    const screen = qa('[data-screen]').find(el => !el.hidden).dataset.screen;
    sound.setAttribute('aria-pressed', String(soundEnabled)); sound.textContent = soundEnabled ? '♫ 소리 켜짐' : '♫ 소리 꺼짐';
    if (!soundEnabled || document.hidden) {bgm.pause(); queue.pause(); previousScreen = screen; return;}
    if (screen === 'queue') {
      bgm.pause();
      if (previousScreen !== 'queue' || force) { queue.currentTime = 0; queue.play().catch(() => announce('효과음을 재생할 수 없습니다. 소리 버튼으로 다시 시도해주세요.')); }
    } else if (screen !== 'login') {
      queue.pause(); bgm.volume = screen === 'game' ? 0.2 : 0.55;
      bgm.play().catch(() => announce('음악 재생이 차단되었습니다. 소리 버튼을 껐다 켜면 다시 시도합니다.'));
    } else { bgm.pause(); queue.pause(); }
    previousScreen = screen;
  }
  sound.addEventListener('click', () => {soundEnabled = !soundEnabled;try{localStorage.setItem('wedding-sound',soundEnabled?'on':'off');}catch(_){} syncSound(true);});
  qa('[data-go], #wedding-login, #wedding-guest, #wedding-start, #wedding-game-start, #wedding-retry, #wedding-reroll').forEach(button => button.addEventListener('click', () => syncSound()));
  q('#wedding-nickname').addEventListener('keydown', e => {if(e.key === 'Enter') syncSound();});
  window.addEventListener('wedding:navigate',()=>syncSound());
  document.addEventListener('visibilitychange', () => {updateDday();syncSound();});
  // Follow screen changes triggered by game completion without adding a polling timer.
  const observer = new MutationObserver(() => {
    const gameVisible = !q('[data-screen="game"]').hidden;
    bgm.volume = gameVisible ? 0.2 : 0.55;
  });
  observer.observe(q('[data-screen="game"]'), {attributes:true, attributeFilter:['hidden']});
})();
