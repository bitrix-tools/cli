import getConfigs from '../utils/get-configs';

class Directory {
	constructor(dir) {
		this.location = dir;
	}

	getConfigs(recursive = true) {
		if (!Directory.configs.has(this.location)) {
			Directory.configs.set(this.location, getConfigs(this.location));
		}

		const configs = Directory.configs.get(this.location);

		if (recursive) {
			return configs;
		}

		const parentConfig = configs
			.reduce((prevConfig, config) => {
				if (prevConfig) {
					const prevContext = prevConfig.context;
					const currContext = config.context;

					if (prevContext.length < currContext.length) {
						return prevConfig;
					}
				}

				return config;
			}, null);

		if (parentConfig) {
			return configs.filter(config => config.context === parentConfig.context);
		}

		return configs;
	}
}

Directory.configs = new Map();

export default Directory;