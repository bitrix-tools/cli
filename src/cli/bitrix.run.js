import Logger from '@bitrix/logger';
import path from 'path';
import fs from 'fs';
import 'colors';
import params from '../process/params';
import argv from '../process/argv';
import ask from '../tools/ask';
import box from '../tools/box';
import resolveRootDirectoryByCwd from '../utils/resolve-root-directory-by-cwd';
import render from '../tools/render';
import resolveExtensionSource from '../utils/resolve-extension';
import resolveRootDirectory from '../utils/resolve-root-directory-by-cwd';
import build from '../tools/build';
import buildExtensionName from '../utils/build-extension-name';
import buildNamespaceName from '../utils/build-namespace-name';

const configName = 'run.config.js';
const resolveExtension = (name) => {
    return resolveExtensionSource({
        name,
        cwd: params.path,
    });
};
const api = {
    render,
    build,
    resolveExtension,
    buildExtensionName,
    buildNamespaceName,
    rootDirectory: resolveRootDirectory(params.path),
};

export default async function bitrixRun()
{
    const root = resolveRootDirectoryByCwd(params.path);
    const [, template] = argv._;

    if (root === null)
    {
        Logger.error('Run error: Root directory not resolved'.red);
        return;
    }

    const templatePath = path.join(root.rootPath, template);
    if (!fs.existsSync(templatePath))
    {
        Logger.error('Run error: Template not resolved'.red);
        return;
    }

    const configPath = path.join(templatePath, configName);
    if (!fs.existsSync(configPath))
    {
        Logger.error('Run error: run.config.js doesn\'t exists'.red);
        return;
    }

    const config = require(configPath);
    if (typeof config !== 'object' || config === null)
    {
        Logger.error('Run error: Invalid run.config.js'.red);
        return;
    }

    if (!Array.isArray(config?.steps))
    {
        Logger.error('Run error: steps isn\'t defined'.red);
        return;
    }

    const result = {};
    for (const step of config.steps)
    {
        const sourcePath = path.join(templatePath, step.source);
        if (!fs.existsSync(sourcePath))
        {
            console.error(`Run error: source file path of "${step.id}" not resolved`);
            return;
        }

        const stepFn = require(sourcePath);
        if (typeof stepFn !== 'function')
        {
            console.error(`Run error: source of "${step.id}" is not a function`);
            return;
        }

        if (step.type === 'master')
        {
            result[step.id] = await ask(
                await stepFn({...result, argv, api}),
            );
        }

        if (step.type === 'app')
        {
            result[step.id] = await stepFn({...result, argv, api});
        }

        if (step.type === 'box-message')
        {
            result[step.id] = box(
                await stepFn({...result, argv, api}),
            );

            Logger.log(result[step.id]);
        }

        if (step.type === 'message')
        {
            result[step.id] = await stepFn({...result, argv, api});
            Logger.log(result[step.id]);
        }
    }
}