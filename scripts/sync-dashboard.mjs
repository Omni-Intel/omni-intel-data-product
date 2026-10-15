import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
const directory = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(directory, '..');
const source = process.env.OMNI_DEMO_DIR || path.resolve(project, '../../kanban-demo');
const target = path.join(project, 'public/dashboard');
const assets = ['app.css', 'landing.css', 'variants.css', 'live.css'];
const helpers = ['metric', 'pairedMetric', 'passRing', 'overview', 'chartAnnotation', 'trendChart', 'showPoint', 'hidePoint', 'animateNumbers'];
const sourceText = fs.readFileSync(path.join(source, 'assets/app.js'), 'utf8');
const tree = ts.createSourceFile('app.js', sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const functions = new Map();
function visit(node) {
  if (ts.isFunctionDeclaration(node) && node.name && helpers.includes(node.name.text)) functions.set(node.name.text, node.getText(tree));
  ts.forEachChild(node, visit);
}
visit(tree);
for (const name of helpers) if (!functions.has(name)) throw new Error(`Public chart helper missing: ${name}`);
for (const name of assets) if (!fs.existsSync(path.join(source, 'assets', name))) throw new Error(`Public stylesheet missing: ${name}`);

// Archive the full demo once, then publish only the public landing assets.
if (fs.existsSync(path.join(target, 'workspace.html')) || fs.existsSync(path.join(target, 'assets/app.js'))) {
  const backup = path.join(project, '.local/dashboard-demo-backup-' + Date.now());
  for (const file of [target, backup]) if (!path.resolve(file).startsWith(project + path.sep)) throw new Error('Asset path outside project');
  fs.mkdirSync(path.dirname(backup), { recursive: true });
  function archiveFiles(from, to) {
    for (const file of [from, to]) if (!path.resolve(file).startsWith(project + path.sep)) throw new Error('Archive path outside project');
    fs.mkdirSync(to, {recursive:true});
    for (const entry of fs.readdirSync(from, {withFileTypes:true})) {
      if (entry.isSymbolicLink()) throw new Error('Unexpected link in dashboard assets');
      const origin=path.join(from,entry.name), destination=path.join(to,entry.name);
      if (entry.isDirectory()) archiveFiles(origin,destination);
      else fs.renameSync(origin,destination);
    }
  }
  archiveFiles(target, backup);
  console.log('Full demo preserved under .local; excluded from publication.');
}
fs.mkdirSync(path.join(target, 'assets'), { recursive: true });
for (const name of assets) fs.copyFileSync(path.join(source, 'assets', name), path.join(target, 'assets', name));
const runtime = fs.readFileSync(path.join(directory, 'templates/public-landing.js'), 'utf8');
fs.writeFileSync(path.join(target, 'assets/landing.js'), runtime.replace('/* PUBLIC_CHART_HELPERS */', helpers.map(name => functions.get(name)).join('\n')));
fs.copyFileSync(path.join(directory, 'templates/public-landing.html'), path.join(target, 'console.html'));
fs.copyFileSync(path.join(directory, 'templates/public-landing.css'), path.join(target, 'assets/public-landing.css'));
console.log('Public landing synchronized; no login or management pages.');
