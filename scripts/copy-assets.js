const { copyFileSync, mkdirSync, readdirSync } = require('node:fs');
const { join } = require('node:path');

for (const dir of readdirSync('nodes', { withFileTypes: true })) {
	if (!dir.isDirectory()) continue;
	const from = join('nodes', dir.name);
	const to = join('dist', 'nodes', dir.name);
	for (const file of readdirSync(from)) {
		if (!file.endsWith('.svg') && !file.endsWith('.png')) continue;
		mkdirSync(to, { recursive: true });
		copyFileSync(join(from, file), join(to, file));
	}
}
