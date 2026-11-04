// ===========================
// Copy for Claude (course pages)
// ===========================
// Loaded on every /courses/ practice page (build/templates.js), and nowhere
// else. Above each folded answer it adds a "Your answer" box, and it adds
// buttons that put the page's text on the clipboard as Markdown, ready to
// paste into Claude:
//   - "Copy page" above the article: the whole page, folded answers included.
//   - "Copy question" on each answer box: that question and its answer.
// Both include whatever the reader wrote in the answer boxes. What to ask
// Claude is up to the reader: grade my answer, explain this, and so on.

// An answer is a <details> whose <summary> starts with Answer / Solution /
// 答案 / 解答. Any other <details> (a hint, starter code) is part of the
// question.
const ANSWER_SUMMARY = /^(answer|solution|答案|解答)/i;

function isAnswer(el) {
  if (el.tagName !== 'DETAILS') return false;
  const summary = el.querySelector(':scope > summary');
  return Boolean(summary) && ANSWER_SUMMARY.test(summary.textContent.trim());
}

// ---- HTML back to Markdown ----
// Covers what course pages are written with (Markdown, plus <details>), so a
// paste keeps code blocks, lists and folded answers. Reads textContent, never
// innerText, because closed <details> are not rendered.
const BLOCKS = 'p, div, pre, ul, ol, h1, h2, h3, h4, h5, h6, blockquote, details, table, hr';

function inline(node) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent.replace(/\s+/g, ' ');
  if (node.nodeType !== Node.ELEMENT_NODE) return '';
  const text = [...node.childNodes].map(inline).join('');
  switch (node.tagName) {
    case 'CODE': return `\`${node.textContent}\``;
    case 'STRONG':
    case 'B': return `**${text}**`;
    case 'EM':
    case 'I': return `_${text}_`;
    case 'A': return `[${text}](${node.href})`;
    case 'IMG': return `![${node.alt}](${node.src})`;
    case 'BR': return '\n';
    default: return text;
  }
}

function list(el, depth) {
  return [...el.children]
    .filter((li) => li.tagName === 'LI')
    .map((li, i) => {
      const marker = el.tagName === 'OL' ? `${i + 1}.` : '-';
      const nested = [...li.children].filter((child) => child.tagName === 'UL' || child.tagName === 'OL');
      const text = [...li.childNodes].filter((n) => !nested.includes(n)).map(inline).join('').trim();
      const sub = nested.map((child) => `\n${list(child, depth + 1)}`).join('');
      return `${'  '.repeat(depth)}${marker} ${text}${sub}`;
    })
    .join('\n');
}

function table(el) {
  const rows = [...el.querySelectorAll('tr')].map((tr) =>
    [...tr.children].map((cell) => inline(cell).trim().replace(/\|/g, '\\|'))
  );
  if (!rows.length) return '';
  return [rows[0], rows[0].map(() => '---'), ...rows.slice(1)].map((row) => `| ${row.join(' | ')} |`).join('\n');
}

function block(node) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent.trim();
  // The copy buttons, and a page's contents list, are no part of its text.
  if (node.nodeType !== Node.ELEMENT_NODE || node.matches('.copy-bar, .page-toc')) return '';
  if (node.classList.contains('answer-box')) return myAnswer(node);
  const tag = node.tagName;
  if (/^H[1-6]$/.test(tag)) return `${'#'.repeat(Number(tag[1]))} ${inline(node).trim()}`;
  switch (tag) {
    case 'PRE': {
      const lang = (node.querySelector('code')?.className.match(/language-(\S+)/) || [])[1] || '';
      return `\`\`\`${lang}\n${node.textContent.replace(/\n$/, '')}\n\`\`\``;
    }
    case 'UL':
    case 'OL': return list(node, 0);
    case 'BLOCKQUOTE': return blocks(node.childNodes).split('\n').map((line) => `> ${line}`).join('\n');
    case 'TABLE': return table(node);
    case 'HR': return '---';
    case 'DETAILS': {
      const summary = node.querySelector(':scope > summary');
      const body = blocks([...node.childNodes].filter((n) => n !== summary));
      return `<details>\n<summary>${summary ? inline(summary).trim() : 'Details'}</summary>\n\n${body}\n\n</details>`;
    }
    default:
      return node.querySelector(`:scope > :is(${BLOCKS})`) ? blocks(node.childNodes) : inline(node).trim();
  }
}

function blocks(nodes) {
  return [...nodes].map(block).filter(Boolean).join('\n\n');
}

// What the reader wrote in an answer box, labelled so Claude can tell it from
// the question and the reference answer. Nothing when the box is empty.
function myAnswer(box) {
  const text = box.querySelector('textarea').value.trim();
  return text ? `**My answer:**\n\n${text}` : '';
}

// ---- What each button copies ----
function pageInfo(article) {
  const title = document.querySelector('.page-title')?.textContent.trim() || document.title;
  return { title, course: article.dataset.course || '', url: location.origin + location.pathname };
}

function pageMarkdown(article) {
  const { title, course, url } = pageInfo(article);
  return `# ${title}\n\n${[course, url].filter(Boolean).join(' · ')}\n\n${blocks(article.childNodes)}\n`;
}

// A question is everything since the previous heading (included) or the
// previous answer, whichever is closer: its text, then (once added) its
// answer box.
function questionParts(answer) {
  const parts = [];
  for (let el = answer.previousElementSibling; el && !isAnswer(el); el = el.previousElementSibling) {
    parts.unshift(el);
    if (/^H[23]$/.test(el.tagName)) break;
  }
  return parts;
}

function questionMarkdown(article, answer) {
  const { title, course } = pageInfo(article);
  return `From "${title}"${course ? ` (${course})` : ''}:\n\n${blocks([...questionParts(answer), answer])}\n`;
}

// ---- Clipboard ----
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers, or a page without clipboard permission.
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

function copyButton(className, label, getText) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  let timer = null;
  button.addEventListener('click', async () => {
    const ok = await copyText(getText());
    button.textContent = ok ? 'Copied' : 'Copy failed';
    clearTimeout(timer);
    timer = setTimeout(() => {
      button.textContent = label;
    }, 1600);
  });
  return button;
}

// ---- Answer boxes ----
// What the reader writes survives a reload, per page and per question. A
// draft is filed under its question's text, not its position, so adding or
// removing a question never moves drafts onto other questions. Drafts whose
// question is gone are dropped on the next save. localStorage can be missing
// or throw (private windows, blocked site data); the boxes then just start
// empty each time.
const DRAFT_STORAGE = `course-answers:${location.pathname}`;
let drafts = {};

function loadDrafts(keys) {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(DRAFT_STORAGE)) || {};
  } catch {}
  drafts = Object.fromEntries(keys.filter((key) => typeof saved[key] === 'string').map((key) => [key, saved[key]]));
}

function saveDraft(key, text) {
  if (text) drafts[key] = text;
  else delete drafts[key];
  try {
    localStorage.setItem(DRAFT_STORAGE, JSON.stringify(drafts));
  } catch {}
}

// Two questions with the same text (say, both still placeholders) get
// separate drafts: the second is filed as "<text>\n#2".
function draftKeys(questions) {
  const seen = new Map();
  return questions.map((question) => {
    const count = (seen.get(question) || 0) + 1;
    seen.set(question, count);
    return count > 1 ? `${question}\n#${count}` : question;
  });
}

function answerBox(n) {
  const box = document.createElement('div');
  box.className = 'answer-box';
  box.innerHTML = `
    <div class="answer-box-head">
      <label class="form-label" for="answer-${n}">Your answer</label>
    </div>
    <textarea class="contact-input answer-input" id="answer-${n}" rows="4" placeholder="Write your answer here. Copy question or Copy page brings it along."></textarea>`;
  return box;
}

function initCopy() {
  const article = document.querySelector('.entry-body[data-course]');
  if (!article) return;

  const bar = document.createElement('div');
  bar.className = 'copy-bar copy-bar-page';
  bar.append(copyButton('btn btn-outline btn-sm', 'Copy page', () => pageMarkdown(article)));
  article.before(bar);

  // Read every question before adding any box, so no box ends up in a key.
  const answers = [...article.querySelectorAll(':scope > details')].filter(isAnswer);
  const keys = draftKeys(answers.map((answer) => blocks(questionParts(answer))));
  loadDrafts(keys);

  answers.forEach((answer, n) => {
    const box = answerBox(n);
    const input = box.querySelector('textarea');
    input.value = drafts[keys[n]] || '';
    input.addEventListener('input', () => saveDraft(keys[n], input.value));
    box.querySelector('.answer-box-head').append(
      copyButton('copy-link', 'Copy question', () => questionMarkdown(article, answer))
    );
    answer.before(box);
  });
}

initCopy();
