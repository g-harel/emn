#!/usr/bin/env node

'use strict';

const fs = require('fs');
const globby = require('globby');

const wasRequired = require.main !== module;

const f = (content, ...changes) => {
    const format = {
        bold: '\x1b[1m',
        red: '\x1b[31m',
        green: '\x1b[32m',
    };
    return changes.reduce((string, change) => {
        if (format[change]) {
            return `${format[change]}${string}\x1b[0m`;
        }
        return string;
    }, content);
};

const find = (arr, str) => {
    return arr.indexOf(str) !== -1;
};

const replace = (path, string, pattern, replacement, callback) => {
    const logs = [];
    if (string.match(pattern)) {
        logs.push(f(path, 'bold'));
        string = string.replace(pattern, (match) => {
            const newValue = match.replace(pattern, replacement);
            logs.push(['  ', f(match, 'bold', 'red'), '→', f(newValue, 'bold', 'green')]);
            return newValue;
        });
        logs.push('');
    }
    callback(logs);
    return string;
};

const handler = (glob, pattern, replacement, isPreview, isSilent) => {
    console.log('');
    globby.sync(glob).forEach((path) => {
        const contents = fs.readFileSync(path, 'utf-8');
        const newContents = replace(path, contents, pattern, replacement, (logs) => {
            if (!isSilent) {
                logs.forEach((line) => {
                    console.log([].concat(line).join(' '));
                });
            }
        });
        if (!isPreview) {
            fs.writeFileSync(path, newContents);
        }
    });
};

const cli = (args) => {
    if (args.length < 3) {
        console.log(f('\n  usage: emn <glob> <pattern> <replacement> [--preview] [--silent]\n', 'bold', 'red'));
        return;
    }
    const [glob, pattern, replacement, ...options] = args;
    const [, body, flags] = pattern.match(/^\/([^]*)\/(\w+)?$/);
    const formattedReplacement = replacement.replace(/\\(\d+)/g, '$$1');
    const isPreview = find(options, '--preview') || find(options, '-p');
    const isSilent = find(options, '--silent') || find(options, '-s');
    handler(glob, new RegExp(body, flags), formattedReplacement, isPreview, isSilent);
};

if (wasRequired) {
    module.exports = (glob, pattern, replacement, options = {}) => {
        const {isPreview, isSilent} = options;
        handler(glob, pattern, replacement, isPreview, isSilent);
    };
} else {
    cli(process.argv.slice(2));
};
