import fs from 'fs';
import path from 'path';
import slash from 'slash';

export default function adjustSourceMap(mapPath) {
	if (typeof mapPath === 'string') {
		if (fs.existsSync(mapPath)) {
			const file = fs.readFileSync(mapPath, 'utf-8');
			const map = JSON.parse(file);

			map.sources = map.sources.map((sourcePath) => {
				return slash(path.relative(slash(path.dirname(mapPath)), slash(sourcePath)));
			});

			if (map.file) {
				map.file = path.basename(mapPath);
			}

			fs.writeFileSync(mapPath, JSON.stringify(map));
		}
	}
}