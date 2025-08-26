import type { TransformOptions } from '@babel/core';
import type { MinifyOptions } from 'terser';

/**
 * Configuration for building a JS/CSS bundle.
 */
export interface SourceBundleConfig
{
	/**
	 * Relative path to the entry JavaScript file.
	 */
	input: string;

	/**
	 * Output path for the bundle.
	 *
	 * Can be a single file path or an object with separate JS and CSS outputs.
	 *
	 * @example
	 * "dist/app.bundle.js"
	 * { js: "dist/app.bundle.js", css: "dist/app.bundle.css" }
	 */
	output: string | { js: string; css: string };

	/**
	 * Global namespace for the extension's exports (e.g., `window.MyApp`).
	 *
	 * @default 'window' — but actually refers to the global object
	 */
	namespace?: string;

	/**
	 * Custom file concatenation settings.
	 */
	concat?: {
		/**
		 * List of JS files to concatenate manually.
		 */
		js?: string[];

		/**
		 * List of CSS files to concatenate manually.
		 */
		css?: string[];
	};

	/**
	 * Automatically update config.php after build.
	 *
	 * @default false
	 */
	adjustConfigPhp?: boolean;

	/**
	 * Enable tree-shaking to remove unused code.
	 *
	 * @default true
	 */
	treeshake?: boolean;

	/**
	 * Prevent rebuild in multi-build environments.
	 *
	 * Note: `'protected'` is used as a property name (not the keyword).
	 */
	'protected'?: boolean;

	/**
	 * Custom plugins and Babel configuration.
	 */
	plugins?: {
		/**
		 * Babel transformation settings.
		 *
		 * - `true`: enable with default options
		 * - `false`: disable
		 * - Object: custom Babel options (presets, plugins, etc.)
		 *
		 * @see https://babeljs.io/docs/options
		 */
		babel?: boolean | TransformOptions;

		/**
		 * List of custom plugin names or handler functions.
		 *
		 * @example
		 * () => { console.log('Custom build step'); }
		 */
		custom?: Array<string | ((...args: any[]) => any)>;
	};

	/**
	 * Image handling in CSS (e.g., inlining or copying assets).
	 */
	cssImages?: {
		/**
		 * Strategy for handling images in CSS:
		 *
		 * - `'inline'`: embed as base64 data URL
		 * - `'copy'`: copy to output directory
		 */
		type?: 'inline' | 'copy';

		/**
		 * Output directory for copied images (used when `type: 'copy'`).
		 */
		output?: string;

		/**
		 * Maximum image size (in **bytes**) to inline as base64.
		 *
		 * @default 14336 (14 KB)
		 */
		maxSize?: number;

		/**
		 * Enable SVG optimization using SVGO.
		 *
		 * @default true
		 */
		svgo?: boolean;
	};

	/**
	 * Settings for resolving imported assets (e.g., SVG, PNG).
	 */
	resolveFilesImport?: {
		/**
		 * Output directory for copied imported files.
		 */
		output?: string;

		/**
		 * Minimatch patterns to include for asset resolution.
		 *
		 * @see https://github.com/isaacs/minimatch
		 */
		include?: string[];
	};

	/**
	 * Browserslist target configuration.
	 *
	 * - `true`: read from `.browserslistrc` or `package.json`
	 * - `false`: no target restrictions
	 * - string or string[]: explicit browser targets
	 *
	 * @default false
	 * @see https://github.com/browserslist/browserslist
	 */
	browserslist?: boolean | string | string[];

	/**
	 * Enable JavaScript minification with Terser.
	 *
	 * - `true`: enable with default options
	 * - `false`: disable
	 * - MinifyOptions: custom Terser options
	 *
	 * @default false
	 * @see https://terser.org/docs/options
	 */
	minification?: boolean | MinifyOptions;

	/**
	 * Transform ES6+ classes to ES5 (e.g., via Babel).
	 *
	 * @default false
	 */
	transformClasses?: boolean;

	/**
	 * Generate source maps for debugging.
	 *
	 * @default true
	 */
	sourceMaps?: boolean;

	/**
	 * Test environment settings.
	 */
	tests?: {
		localization?: {
			/**
			 * Language code for tests (e.g., 'en', 'ru', 'fr').
			 *
			 * @default 'en'
			 */
			languageId?: string;

			/**
			 * Automatically load language messages in tests.
			 *
			 * @default true
			 */
			autoLoad?: boolean;
		};
	};
}
