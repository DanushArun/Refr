const W = 393;
const H = 852;
const GAP = 90;
const ROW = 980;

const c = {
  bg: '#05070D',
  bg2: '#081226',
  surface: '#0C1426',
  surface2: '#121D33',
  cream: '#F5F1E8',
  text: '#FAFAF7',
  muted: '#A8B0C2',
  faint: '#64748B',
  gold: '#D4A744',
  gold2: '#E8BD58',
  green: '#22C55E',
  red: '#FF3366',
  blue: '#38BDF8',
  line: '#253149',
  white: '#FFFFFF',
};

const page = penpot.createPage();
page.name = `Endorsly App Flow Prototype - ${new Date().toISOString().slice(0, 10)}`;
penpot.openPage(page);

const refs = {};

function fill(color, opacity = 1) {
  return [{ fillColor: color, fillOpacity: opacity }];
}

function stroke(color = c.line, opacity = 1, width = 1) {
  return [{
    strokeColor: color,
    strokeOpacity: opacity,
    strokeWidth: width,
    strokeStyle: 'solid',
    strokeAlignment: 'center',
  }];
}

function addRect(parent, name, x, y, w, h, color, opts = {}) {
  const r = penpot.createRectangle();
  r.name = name;
  r.resize(w, h);
  r.fills = fill(color, opts.opacity ?? 1);
  r.strokes = opts.stroke ? stroke(opts.stroke, opts.strokeOpacity ?? 1, opts.strokeWidth ?? 1) : [];
  r.borderRadius = opts.radius ?? 0;
  if (opts.shadow) {
    r.shadows = [{
      style: 'drop-shadow',
      offsetX: 0,
      offsetY: opts.shadow.y ?? 12,
      blur: opts.shadow.blur ?? 30,
      spread: 0,
      color: { color: opts.shadow.color ?? '#000000', opacity: opts.shadow.opacity ?? 0.35 },
    }];
  }
  parent.appendChild(r);
  penpotUtils.setParentXY(r, x, y);
  return r;
}

function addEllipse(parent, name, x, y, w, h, color, opacity = 1) {
  const e = penpot.createEllipse();
  e.name = name;
  e.resize(w, h);
  e.fills = fill(color, opacity);
  e.strokes = [];
  parent.appendChild(e);
  penpotUtils.setParentXY(e, x, y);
  return e;
}

function addText(parent, name, text, x, y, w, h, opts = {}) {
  const t = penpot.createText(text);
  if (!t) throw new Error(`Could not create text: ${name}`);
  t.name = name;
  t.growType = 'fixed';
  t.resize(w, h);
  t.fontFamily = opts.family ?? 'Outfit';
  t.fontSize = String(opts.size ?? 14);
  t.fontWeight = String(opts.weight ?? 400);
  t.fills = fill(opts.color ?? c.text, opts.opacity ?? 1);
  parent.appendChild(t);
  penpotUtils.setParentXY(t, x, y);
  return t;
}

function board(name, x, y, w = W, h = H) {
  const b = penpot.createBoard();
  b.name = name;
  b.resize(w, h);
  b.x = x;
  b.y = y;
  b.fills = fill(c.bg);
  refs[name] = b;
  return b;
}

function topBar(b, title, sub = '') {
  addText(b, 'brand', 'ENDORSLY', 24, 22, 130, 24, {
    color: c.gold,
    size: 12,
    weight: 700,
  });
  addText(b, 'screen title', title, 24, 50, 260, 32, { size: 24, weight: 700 });
  if (sub) addText(b, 'screen subtitle', sub, 24, 82, 310, 38, { color: c.muted, size: 13 });
  addEllipse(b, 'avatar', 330, 28, 38, 38, c.surface2);
  addText(b, 'avatar initial', 'D', 342, 38, 18, 18, { color: c.gold, size: 14, weight: 700 });
}

function button(parent, name, label, x, y, w, h, opts = {}) {
  const bg = opts.kind === 'ghost' ? c.surface2 : (opts.color ?? c.gold);
  const r = addRect(parent, name, x, y, w, h, bg, {
    radius: opts.radius ?? 14,
    opacity: opts.opacity ?? 1,
    stroke: opts.kind === 'ghost' ? c.line : undefined,
  });
  addText(parent, `${name} label`, label, x + 14, y + Math.max(10, (h - 18) / 2), w - 28, 20, {
    color: opts.textColor ?? (opts.kind === 'ghost' ? c.text : c.bg),
    size: opts.size ?? 14,
    weight: 700,
  });
  return r;
}

function chip(parent, label, x, y, active = false, w = 86) {
  addRect(parent, `chip ${label}`, x, y, w, 34, active ? c.gold : c.surface, {
    radius: 17,
    stroke: active ? c.gold : c.line,
    opacity: active ? 1 : 0.9,
  });
  addText(parent, `chip ${label} text`, label, x + 12, y + 8, w - 24, 16, {
    color: active ? c.bg : c.muted,
    size: 12,
    weight: 600,
  });
}

function tabs(b, active, items) {
  addRect(b, 'tab bar', 0, 766, W, 86, '#070B14', { opacity: 0.98 });
  const col = W / items.length;
  items.forEach((item, index) => {
    const x = index * col;
    addEllipse(b, `${item} tab dot`, x + col / 2 - 4, 786, 8, 8, item === active ? c.gold : c.faint);
    addText(b, `${item} tab`, item, x + 5, 805, col - 10, 18, {
      color: item === active ? c.gold : c.muted,
      size: 11,
      weight: item === active ? 700 : 500,
    });
  });
}

function addLink(shape, destination, animation = 'dissolve') {
  shape.addInteraction('click', {
    type: 'navigate-to',
    destination,
    animation: { type: animation, duration: 220, easing: 'ease-in-out' },
  });
}

function addOverlay(shape, destination, position = 'bottom-center') {
  shape.addInteraction('click', {
    type: 'open-overlay',
    destination,
    position,
    closeWhenClickOutside: true,
    addBackgroundOverlay: true,
    animation: { type: 'slide', way: 'in', direction: 'up', duration: 240, easing: 'ease-out' },
  });
}

function addClose(shape, destination) {
  shape.addInteraction('click', {
    type: 'close-overlay',
    destination,
    animation: { type: 'slide', way: 'out', direction: 'down', duration: 180, easing: 'ease-in' },
  });
}

function card(parent, name, x, y, w, h, opts = {}) {
  return addRect(parent, name, x, y, w, h, opts.color ?? c.surface, {
    radius: opts.radius ?? 18,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? c.line,
    strokeOpacity: opts.strokeOpacity ?? 0.9,
    shadow: opts.shadow,
  });
}

function miniMetric(parent, value, label, x, y, w = 104) {
  card(parent, `metric ${label}`, x, y, w, 74, { color: c.surface2, radius: 14 });
  addText(parent, `metric ${label} value`, value, x + 12, y + 12, w - 24, 28, {
    color: c.gold,
    size: 22,
    weight: 700,
    family: 'JetBrains Mono',
  });
  addText(parent, `metric ${label} label`, label, x + 12, y + 45, w - 24, 14, {
    color: c.muted,
    size: 10,
    weight: 600,
  });
}

function profileRow(parent, name, role, company, x, y, actionLabel) {
  card(parent, `row ${name}`, x, y, 345, 82, { color: c.surface, radius: 16 });
  addEllipse(parent, `avatar ${name}`, x + 14, y + 16, 48, 48, c.surface2);
  addText(parent, `initial ${name}`, name[0], x + 31, y + 29, 18, 18, {
    color: c.gold,
    size: 16,
    weight: 700,
  });
  addText(parent, `name ${name}`, name, x + 76, y + 14, 160, 20, { size: 15, weight: 700 });
  addText(parent, `role ${name}`, role, x + 76, y + 36, 180, 18, { color: c.muted, size: 12 });
  addText(parent, `company ${name}`, company, x + 76, y + 56, 160, 16, { color: c.gold, size: 11 });
  button(parent, `action ${name}`, actionLabel, x + 256, y + 23, 74, 34, { size: 11 });
  return parent.children[parent.children.length - 8];
}

function input(parent, label, value, x, y, w = 345) {
  card(parent, `input ${label}`, x, y, w, 58, { color: '#0A1222', radius: 14 });
  addText(parent, `input label ${label}`, label, x + 16, y + 8, w - 32, 16, {
    color: c.faint,
    size: 10,
    weight: 700,
  });
  addText(parent, `input value ${label}`, value, x + 16, y + 28, w - 32, 20, {
    color: c.text,
    size: 14,
  });
}

const map = board('00 Flow Map', 0, 0, 620, 852);
addText(map, 'map title', 'Endorsly current app flow prototype', 34, 34, 520, 44, {
  size: 30,
  weight: 700,
});
addText(map, 'map detail',
  'Built from current Expo screens, not the older March handoff. Local Penpot MCP bridge uses the official plugin path: server on 4401/4402, plugin loaded from localhost:4400 and kept connected.',
  34, 92, 540, 72,
  { color: c.muted, size: 14 },
);
[
  ['Entry', 'Welcome -> Onboarding -> Role Selection'],
  ['Seeker', 'Profile setup -> Discover -> Endorser modal -> Request confirmation -> Matches -> Chat'],
  ['Endorser', 'Profile setup -> Discover -> Inbox -> Chat -> Active -> Earnings'],
  ['Shared', 'Profile is reachable from both tab stacks'],
].forEach((row, i) => {
  const y = 210 + i * 112;
  card(map, `map ${row[0]}`, 34, y, 540, 78, { color: c.surface, radius: 16 });
  addText(map, `map head ${row[0]}`, row[0], 58, y + 18, 120, 20, {
    color: c.gold,
    size: 15,
    weight: 700,
  });
  addText(map, `map copy ${row[0]}`, row[1], 176, y + 19, 360, 36, {
    color: c.text,
    size: 14,
  });
});

const welcome = board('01 Welcome', 720, 0);
addText(welcome, 'logo', 'ENDORSLY', 36, 64, 180, 28, { color: c.gold, size: 17, weight: 800 });
addText(welcome, 'headline', 'Professional intelligence for India', 36, 146, 310, 120, {
  color: c.cream,
  size: 36,
  weight: 700,
});
addText(welcome, 'copy',
  'Inside company knowledge, public endorsement reputation, and live referral momentum in one mobile flow.',
  36, 286, 300, 74,
  { color: c.muted, size: 15 },
);
addEllipse(welcome, 'orbit 1', 52, 410, 290, 290, c.gold, 0.10);
addEllipse(welcome, 'orbit 2', 101, 459, 192, 192, c.blue, 0.10);
addEllipse(welcome, 'core', 171, 529, 52, 52, c.gold, 0.75);
const start = button(welcome, 'get started', 'Get started', 36, 714, 321, 56);
addText(welcome, 'login', 'Sign in with email', 124, 784, 150, 20, { color: c.muted, size: 13 });

const onboard = board('02 Onboarding', 1203, 0);
addText(onboard, 'brand', 'ENDORSLY', 34, 52, 160, 24, { color: c.gold, size: 15, weight: 800 });
addEllipse(onboard, 'node a', 54, 174, 58, 58, c.gold, 0.75);
addEllipse(onboard, 'node b', 251, 216, 76, 76, c.blue, 0.32);
addEllipse(onboard, 'node c', 151, 376, 108, 108, c.gold, 0.18);
addEllipse(onboard, 'node d', 272, 506, 46, 46, c.green, 0.42);
addText(onboard, 'headline', 'Turn insider trust into real career motion', 34, 610, 320, 90, {
  color: c.cream,
  size: 30,
  weight: 700,
});
addText(onboard, 'copy', 'Tap anywhere to choose your role.', 34, 716, 280, 24, {
  color: c.muted,
  size: 15,
});
const onboardTap = addRect(onboard, 'tap area', 0, 0, W, H, c.white, { opacity: 0 });

const roles = board('03 Role Selection', 1686, 0);
topBar(roles, 'Choose your path', 'The app starts by separating seeker and endorser workflows.');
const seekerCard = card(roles, 'seeker role card', 24, 154, 345, 196, {
  color: c.surface,
  radius: 22,
  stroke: c.gold,
  strokeOpacity: 0.65,
});
addText(roles, 'seeker title', 'I want endorsements', 48, 184, 250, 32, { size: 23, weight: 700 });
addText(roles, 'seeker copy',
  'Find verified employees, request endorsement help, and track each referral stage.',
  48, 232, 260, 58,
  { color: c.muted, size: 14 },
);
button(roles, 'seeker continue', 'Continue as seeker', 48, 298, 190, 42);
const endorserCard = card(roles, 'endorser role card', 24, 382, 345, 196, { color: c.surface, radius: 22 });
addText(roles, 'endorser title', 'I can endorse people', 48, 412, 260, 32, { size: 23, weight: 700 });
addText(roles, 'endorser copy',
  'Review candidate requests, manage active endorsements, and build your public score.',
  48, 460, 260, 58,
  { color: c.muted, size: 14 },
);
button(roles, 'endorser continue', 'Continue as endorser', 48, 526, 208, 42, { color: c.gold2 });

const seekerSetup = board('04 Seeker Profile Setup', 2169, 0);
topBar(seekerSetup, 'Create seeker profile', 'This form maps to the current profile-setup screen.');
input(seekerSetup, 'Full name', 'Arjun Mehta', 24, 148);
input(seekerSetup, 'Target role', 'Product Designer', 24, 222);
input(seekerSetup, 'Target companies', 'Razorpay, CRED, Swiggy', 24, 296);
input(seekerSetup, 'Skills', 'Research, Figma, React Native', 24, 370);
input(seekerSetup, 'Years of experience', '4', 24, 444);
const createSeeker = button(seekerSetup, 'create seeker account', 'Create profile', 24, 698, 345, 54);

const endorserSetup = board('05 Endorser Profile Setup', 2652, 0);
topBar(endorserSetup, 'Create endorser profile', 'Company verification anchors the endorser side.');
input(endorserSetup, 'Full name', 'Ravi Iyer', 24, 148);
input(endorserSetup, 'Company', 'Razorpay', 24, 222);
input(endorserSetup, 'Title', 'Senior Engineering Manager', 24, 296);
input(endorserSetup, 'Company email', 'ravi@razorpay.com', 24, 370);
input(endorserSetup, 'Can endorse for', 'Backend, Platform, Data', 24, 444);
const createEndorser = button(endorserSetup, 'create endorser account', 'Create profile', 24, 698, 345, 54);

const seekerDiscover = board('06 Seeker Discover', 0, ROW);
topBar(seekerDiscover, 'Discover endorsers', 'Swipe through verified employees.');
chip(seekerDiscover, 'All', 24, 126, true, 58);
chip(seekerDiscover, 'Razorpay', 92, 126, false, 92);
chip(seekerDiscover, 'CRED', 194, 126, false, 70);
chip(seekerDiscover, 'Design', 274, 126, false, 84);
const endorserProfileHit = card(seekerDiscover, 'endorser profile card', 24, 190, 345, 446, {
  color: c.surface,
  radius: 26,
  stroke: c.gold,
  strokeOpacity: 0.45,
  shadow: { opacity: 0.38, blur: 34, y: 18 },
});
addEllipse(seekerDiscover, 'profile image', 125, 232, 142, 142, c.surface2);
addText(seekerDiscover, 'profile initials', 'RI', 166, 284, 62, 34, {
  color: c.gold,
  size: 30,
  weight: 800,
});
addText(seekerDiscover, 'profile name', 'Ravi Iyer', 54, 400, 260, 30, { size: 26, weight: 700 });
addText(seekerDiscover, 'profile meta', 'Senior EM at Razorpay', 54, 438, 230, 22, {
  color: c.muted,
  size: 14,
});
miniMetric(seekerDiscover, '91', 'MATCH', 54, 482, 88);
miniMetric(seekerDiscover, '318', 'SCORE', 153, 482, 88);
miniMetric(seekerDiscover, '12', 'HIRES', 252, 482, 88);
addText(seekerDiscover, 'profile proof',
  'Endorses backend and product roles. Fast response this week.',
  54, 574, 255, 44,
  { color: c.muted, size: 13 },
);
const passBtn = button(seekerDiscover, 'pass endorser', 'Pass', 44, 662, 126, 50, { kind: 'ghost' });
const reqBtn = button(seekerDiscover, 'request endorsement', 'Request', 222, 662, 126, 50);
tabs(seekerDiscover, 'Discover', ['Discover', 'Matches', 'Activity', 'Profile']);

const endorserDiscover = board('07 Endorser Discover', 483, ROW);
topBar(endorserDiscover, 'Discover seekers', 'Incoming candidates in a swipe deck.');
chip(endorserDiscover, 'All', 24, 126, true, 58);
chip(endorserDiscover, '0-2 yrs', 92, 126, false, 78);
chip(endorserDiscover, '3-5 yrs', 180, 126, false, 78);
chip(endorserDiscover, 'Senior', 268, 126, false, 82);
card(endorserDiscover, 'candidate card', 24, 190, 345, 448, {
  color: c.surface,
  radius: 26,
  stroke: c.gold,
  strokeOpacity: 0.45,
  shadow: { opacity: 0.38, blur: 34, y: 18 },
});
addEllipse(endorserDiscover, 'candidate image', 125, 232, 142, 142, c.surface2);
addText(endorserDiscover, 'candidate initials', 'AM', 162, 284, 70, 34, {
  color: c.gold,
  size: 30,
  weight: 800,
});
addText(endorserDiscover, 'candidate name', 'Arjun Mehta', 54, 400, 270, 30, { size: 26, weight: 700 });
addText(endorserDiscover, 'candidate meta', 'Product Designer, 4 yrs', 54, 438, 250, 22, {
  color: c.muted,
  size: 14,
});
miniMetric(endorserDiscover, '88', 'FIT', 54, 482, 88);
miniMetric(endorserDiscover, 'CRED', 'TARGET', 153, 482, 88);
miniMetric(endorserDiscover, '4', 'YRS', 252, 482, 88);
addText(endorserDiscover, 'candidate proof',
  'Portfolio: fintech onboarding, mobile research, interaction systems.',
  54, 574, 265, 44,
  { color: c.muted, size: 13 },
);
button(endorserDiscover, 'reject candidate', 'Pass', 44, 662, 126, 50, { kind: 'ghost' });
const acceptCandidate = button(endorserDiscover, 'accept candidate', 'Accept', 222, 662, 126, 50);
tabs(endorserDiscover, 'Discover', ['Discover', 'Inbox', 'Active', 'Earn', 'Profile']);

const matches = board('08 Seeker Matches', 966, ROW);
topBar(matches, 'Matches', 'Track live endorsement conversations.');
chip(matches, 'All', 24, 126, true, 58);
chip(matches, 'Fresh', 92, 126, false, 74);
chip(matches, 'Active', 176, 126, false, 76);
chip(matches, 'Resting', 262, 126, false, 86);
const match1 = profileRow(matches, 'Ravi Iyer', 'Senior EM', 'Razorpay', 24, 184, 'Chat');
profileRow(matches, 'Sneha Rao', 'Design Lead', 'CRED', 24, 282, 'Chat');
profileRow(matches, 'Kabir S', 'Staff PM', 'Swiggy', 24, 380, 'Chat');
card(matches, 'empty prompt', 24, 520, 345, 118, { color: c.surface2, radius: 18 });
addText(matches, 'prompt title', '3 active endorsement threads', 48, 548, 260, 24, {
  size: 18,
  weight: 700,
});
addText(matches, 'prompt body',
  'The next action is inside chat, not another onboarding step.',
  48, 580, 270, 38,
  { color: c.muted, size: 13 },
);
tabs(matches, 'Matches', ['Discover', 'Matches', 'Activity', 'Profile']);

const inbox = board('09 Endorser Inbox', 1449, ROW);
topBar(inbox, 'Inbox', 'Candidate conversations and pending requests.');
chip(inbox, 'All', 24, 126, true, 58);
chip(inbox, 'New', 92, 126, false, 66);
chip(inbox, 'Unread', 168, 126, false, 78);
chip(inbox, 'Submitted', 256, 126, false, 104);
const inbox1 = profileRow(inbox, 'Arjun Mehta', 'Product Designer', 'Razorpay request', 24, 184, 'Open');
profileRow(inbox, 'Meera Jain', 'Backend Engineer', 'Platform request', 24, 282, 'Open');
profileRow(inbox, 'Ishan K', 'Data Analyst', 'Analytics request', 24, 380, 'Open');
card(inbox, 'inbox note', 24, 520, 345, 118, { color: c.surface2, radius: 18 });
addText(inbox, 'inbox note title', 'Requests stay human-reviewed', 48, 548, 270, 24, {
  size: 18,
  weight: 700,
});
addText(inbox, 'inbox note body',
  'Accepting creates the chat and advances the endorsement pipeline.',
  48, 580, 270, 38,
  { color: c.muted, size: 13 },
);
tabs(inbox, 'Inbox', ['Discover', 'Inbox', 'Active', 'Earn', 'Profile']);

const chat = board('10 Chat', 1932, ROW);
addRect(chat, 'chat header', 0, 0, W, 106, '#070B14', { opacity: 0.98 });
const backChat = button(chat, 'chat back', '<', 18, 34, 38, 38, { kind: 'ghost', radius: 19 });
addEllipse(chat, 'chat avatar', 72, 31, 44, 44, c.surface2);
addText(chat, 'chat initials', 'RI', 85, 44, 24, 18, { color: c.gold, size: 12, weight: 800 });
addText(chat, 'chat title', 'Ravi Iyer', 128, 30, 170, 22, { size: 16, weight: 700 });
addText(chat, 'chat status', 'Razorpay endorsement thread', 128, 54, 190, 18, {
  color: c.muted,
  size: 12,
});
card(chat, 'msg left 1', 24, 146, 270, 64, { color: c.surface, radius: 18 });
addText(chat, 'msg left text 1',
  'Share the strongest proof for your onboarding project.',
  42, 164, 230, 30,
  { color: c.text, size: 13 },
);
card(chat, 'msg right 1', 86, 238, 283, 78, { color: c.gold, radius: 18, stroke: c.gold });
addText(chat, 'msg right text 1',
  'I shipped research and flows for a fintech KYC revamp. Sending case-study bullets now.',
  106, 254, 238, 42,
  { color: c.bg, size: 13, weight: 600 },
);
card(chat, 'quick replies', 24, 592, 345, 82, { color: c.surface2, radius: 18 });
button(chat, 'quick resume', 'Send resume', 42, 612, 126, 34, { kind: 'ghost', size: 11 });
button(chat, 'quick availability', 'Share availability', 180, 612, 150, 34, { kind: 'ghost', size: 11 });
card(chat, 'composer', 16, 700, 361, 56, { color: '#0A1222', radius: 20 });
addText(chat, 'composer text', 'Type a message...', 38, 719, 180, 18, { color: c.faint, size: 13 });

const active = board('11 Referrer Active', 2415, ROW);
topBar(active, 'Active endorsements', 'In-flight referrals after acceptance.');
chip(active, 'All', 24, 126, true, 58);
chip(active, 'Matched', 92, 126, false, 88);
chip(active, 'Submitted', 190, 126, false, 102);
chip(active, 'Interview', 302, 126, false, 78);
['Accepted', 'Submitted', 'Interviewing'].forEach((stage, i) => {
  const y = 184 + i * 126;
  card(active, `active ${stage}`, 24, y, 345, 102, { color: c.surface, radius: 18 });
  addText(active, `active name ${stage}`, ['Arjun Mehta', 'Meera Jain', 'Ishan K'][i], 48, y + 18, 160, 20, {
    size: 16,
    weight: 700,
  });
  addText(active, `active role ${stage}`, ['Product Designer', 'Backend Engineer', 'Data Analyst'][i], 48, y + 44, 160, 18, {
    color: c.muted,
    size: 12,
  });
  chip(active, stage, 226, y + 20, i === 1, 108);
  button(active, `active chat ${stage}`, 'Chat', 48, y + 68, 74, 28, { kind: 'ghost', size: 10 });
});
tabs(active, 'Active', ['Discover', 'Inbox', 'Active', 'Earn', 'Profile']);

const earnings = board('12 Earnings', 2898, ROW);
topBar(earnings, 'Earnings', 'Endorsement Score and payout proof.');
addText(earnings, 'score label', 'ENDORSEMENT SCORE', 28, 144, 180, 16, {
  color: c.gold,
  size: 11,
  weight: 800,
});
addText(earnings, 'score value', '318', 24, 164, 190, 86, {
  color: c.gold2,
  size: 72,
  weight: 700,
  family: 'JetBrains Mono',
});
addText(earnings, 'score copy', '+22 this month from two submitted endorsements', 28, 246, 260, 24, {
  color: c.muted,
  size: 13,
});
miniMetric(earnings, 'INR 44K', 'PENDING', 24, 306, 104);
miniMetric(earnings, '12', 'HIRES', 144, 306, 92);
miniMetric(earnings, '7', 'ACTIVE', 252, 306, 92);
addText(earnings, 'leaderboard', 'Company leaderboard', 24, 426, 220, 24, {
  size: 20,
  weight: 700,
});
['1  Ravi Iyer   318', '2  Nisha P      286', '3  Armaan V     244'].forEach((line, i) => {
  card(earnings, `rank ${i}`, 24, 468 + i * 58, 345, 46, { color: c.surface, radius: 14 });
  addText(earnings, `rank text ${i}`, line, 44, 482 + i * 58, 260, 18, {
    color: i === 0 ? c.gold : c.text,
    size: 14,
    weight: 700,
    family: 'JetBrains Mono',
  });
});
tabs(earnings, 'Earn', ['Discover', 'Inbox', 'Active', 'Earn', 'Profile']);

const profile = board('13 Profile', 3381, ROW);
topBar(profile, 'Profile', 'Settings, verification, and role details.');
addEllipse(profile, 'profile avatar', 132, 138, 128, 128, c.surface2);
addText(profile, 'profile initials', 'DA', 171, 184, 58, 34, { color: c.gold, size: 28, weight: 800 });
addText(profile, 'profile name', 'Danush Arun', 82, 294, 230, 30, { size: 25, weight: 700 });
addText(profile, 'profile role', 'Professional intelligence profile', 70, 330, 260, 22, {
  color: c.muted,
  size: 14,
});
['Account', 'Verification', 'Notifications', 'Privacy', 'Sign out'].forEach((item, i) => {
  card(profile, `setting ${item}`, 24, 400 + i * 62, 345, 48, { color: c.surface, radius: 14 });
  addText(profile, `setting label ${item}`, item, 48, 414 + i * 62, 220, 18, {
    size: 14,
    weight: 600,
  });
  addText(profile, `setting arrow ${item}`, '>', 336, 414 + i * 62, 16, 18, {
    color: c.gold,
    size: 14,
    weight: 700,
  });
});
tabs(profile, 'Profile', ['Discover', 'Matches', 'Activity', 'Profile']);

const overlayProfile = board('Overlay Endorser Profile', 3864, ROW, 393, 612);
overlayProfile.fills = fill(c.bg);
addRect(overlayProfile, 'handle', 162, 16, 68, 5, c.faint, { radius: 3, opacity: 0.6 });
const closeProfile = button(overlayProfile, 'close profile', 'Close', 278, 28, 84, 34, { kind: 'ghost', size: 11 });
addEllipse(overlayProfile, 'modal avatar', 126, 72, 140, 140, c.surface2);
addText(overlayProfile, 'modal initials', 'RI', 168, 124, 62, 32, { color: c.gold, size: 30, weight: 800 });
addText(overlayProfile, 'modal name', 'Ravi Iyer', 42, 244, 270, 32, { size: 27, weight: 700 });
addText(overlayProfile, 'modal role', 'Senior Engineering Manager at Razorpay', 42, 282, 300, 22, {
  color: c.muted,
  size: 14,
});
miniMetric(overlayProfile, '318', 'SCORE', 42, 326, 92);
miniMetric(overlayProfile, '12', 'HIRES', 150, 326, 92);
miniMetric(overlayProfile, '24h', 'REPLY', 258, 326, 92);
addText(overlayProfile, 'modal bio',
  'Endorses candidates only where he can make a high-confidence internal case.',
  42, 426, 295, 42,
  { color: c.muted, size: 14 },
);
const modalRequest = button(overlayProfile, 'modal request endorsement', 'Request endorsement', 42, 520, 309, 52);

const confirm = board('Overlay Request Confirmation', 4347, ROW, 393, 438);
confirm.fills = fill(c.bg);
addRect(confirm, 'confirm handle', 162, 16, 68, 5, c.faint, { radius: 3, opacity: 0.6 });
addText(confirm, 'confirm title', 'Request sent', 42, 70, 260, 36, { size: 28, weight: 700 });
addText(confirm, 'confirm copy',
  'Ravi gets the endorsement request and the thread appears in Matches.',
  42, 120, 288, 54,
  { color: c.muted, size: 14 },
);
miniMetric(confirm, '1', 'REQUEST', 42, 200, 90);
miniMetric(confirm, '24h', 'EXPECTED', 151, 200, 102);
const viewMatches = button(confirm, 'view matches', 'View matches', 42, 330, 145, 48);
const closeConfirm = button(confirm, 'close confirm', 'Done', 206, 330, 145, 48, { kind: 'ghost' });

addLink(start, onboard);
addLink(onboardTap, roles);
addLink(seekerCard, seekerSetup);
addLink(endorserCard, endorserSetup);
addLink(createSeeker, seekerDiscover);
addLink(createEndorser, endorserDiscover);
addOverlay(endorserProfileHit, overlayProfile, 'bottom-center');
addOverlay(reqBtn, confirm, 'bottom-center');
addClose(closeProfile, overlayProfile);
addOverlay(modalRequest, confirm, 'bottom-center');
addClose(closeConfirm, confirm);
addLink(viewMatches, matches);
addLink(passBtn, seekerDiscover);
addLink(acceptCandidate, active);
addLink(match1, chat);
addLink(inbox1, chat);
addLink(backChat, matches);

page.createFlow('Seeker prototype', welcome);
page.createFlow('Endorser prototype', roles);

return {
  page: page.name,
  boards: Object.keys(refs).length,
  flows: page.flows.map((flow) => flow.name),
  interactionCount: page.findShapes().reduce(
    (sum, shape) => sum + (shape.interactions ? shape.interactions.length : 0),
    0,
  ),
};
