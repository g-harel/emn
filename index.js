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

const replace = (path, string, pattern, replacement) => {
    if (string.match(pattern)) {
        console.log(f(path, 'bold'));
        string = string.replace(pattern, (match) => {
            const newValue = match.replace(pattern, replacement);
            console.log('  ', f(match, 'bold', 'red'), '→', f(newValue, 'bold', 'green'));
            return newValue;
        });
        console.log('');
    }
    return string;
};

const handler = (glob, pattern, replacement, isPreview) => {
    console.log('');
    globby.sync(glob).forEach((path) => {
        const contents = fs.readFileSync(path, 'utf-8');
        const newContents = replace(path, contents, pattern, replacement);
        if (!isPreview) {
            fs.writeFileSync(path, newContents);
        }
    });
};

const cli = (args) => {
    if (args.length < 3) {
        console.log(f('\n  usage: emn <glob> <pattern> <replacement> [--preview]\n', 'bold', 'red'));
        return;
    }
    const [glob, pattern, replacement, preview] = args;
    const [, body, flags] = pattern.match(/^\/([^]*)\/(\w+)?$/);
    const formattedReplacement = replacement.replace(/\\(\d+)/g, '$$1');
    const isPreview = (preview === '--preview') || (preview === '-p');
    handler(glob, new RegExp(body, flags), formattedReplacement, isPreview);
};

if (wasRequired) {
    const emn = (glob, pattern, replacement) => {
        handler(glob, pattern, replacement, false);
    };
    emn.preview = (glob, pattern, replacement) => {
        handler(glob, pattern, replacement, true);
    };
    module.exports = emn;
} else {
    cli(process.argv.slice(2));
};
