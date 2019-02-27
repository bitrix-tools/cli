import getConfigs from '../utils/get-configs';

class Directory {
	constructor(dir) {
		this.location = dir;
	}

	getConfigs(recursive = true) {
		if (!Directory.configs.has(this.location)) {
			const configs = getConfigs(this.location)
				.filter((config) => {
					if (config.protected)
					{
						return config.context === this.location;
					}

					return config;
				});
			Directory.configs.set(this.location, configs);
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