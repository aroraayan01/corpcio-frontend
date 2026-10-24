// Builds the static site: src/ -> dist/.
//   {{> name}}  inserts src/partials/name.html
//   {{key}}     inserts a value from site.config.json
// Empty config values render as a highlighted [placeholder] so they can't ship unnoticed.
// `node build.mjs --strict` fails instead, for the final build before going live.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const config = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));
const strict = process.argv.includes('--strict');
// Derived: a dialable form of the phone number for tel: links.
config.phoneTel = String(config.phone || '').replace(/[^\d+]/g, '');

const labels = {
  legalName: 'Registered company name',
  country: 'Country of registration',
  operatingCountry: 'Country you operate from',
  registeredAddress: 'Registered address',
  email: 'Contact email',
  phone: 'Contact phone',
  supportHours: 'Support hours and time zone',
  domain: 'Website domain',
  governingLaw: 'Governing law (country)',
  courts: 'Courts with jurisdiction',
};

const escape = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const missing = new Set();

function value(key, inAttr) {
  if (!(key in config)) throw new Error(`Unknown token {{${key}}}`);
  const v = String(config[key] ?? '').trim();
  if (v) return escape(v);
  if (key === 'phoneTel') key = 'phone';
  missing.add(key);
  const label = labels[key] || key;
  return inAttr ? `TODO-${key}` : `<mark class="fill">[${label}]</mark>`;
}

function render(html) {
  // Partials may include other partials (the header uses {{> mark}}), so expand until none are left.
  const partial = /\{\{>\s*([\w-]+)\s*\}\}/;
  while (partial.test(html)) {
    html = html.replace(new RegExp(partial, 'g'), (_, name) =>
      fs.readFileSync(path.join(src, 'partials', `${name}.html`), 'utf8'));
  }
  // Tokens inside a tag's attributes get a plain value; everywhere else may get a <mark>.
  html = html.replace(/<[^>]+>/g, tag => tag.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => value(k, true)));
  return html.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => value(k, false));
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, entry.name), b = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist);
// Every top-level file (pages, .htaccess, robots.txt, sitemap.xml) gets config values filled in.
for (const entry of fs.readdirSync(src, { withFileTypes: true }).filter(e => e.isFile())) {
  fs.writeFileSync(path.join(dist, entry.name), render(fs.readFileSync(path.join(src, entry.name), 'utf8')));
}
copyDir(path.join(src, 'assets'), path.join(dist, 'assets'));
copyDir(path.join(src, 'img'), path.join(dist, 'img'));

if (missing.size) {
  console.warn(`Still to fill in site.config.json: ${[...missing].join(', ')}`);
  if (strict) { console.error('--strict: refusing to build with placeholders.'); process.exit(1); }
} else {
  console.log('All company details filled in.');
}
console.log(`Built ${dist}`);
