/**
 * @since 0.0.1
 */
import * as chalk from 'chalk';
import * as A from 'fp-ts/es6/Array';
import { log } from 'fp-ts/es6/Console';
import * as IO from 'fp-ts/es6/IO';
import { pipe } from 'fp-ts/es6/pipeable';
import * as T from 'fp-ts/es6/Task';
import * as TE from 'fp-ts/es6/TaskEither';
import * as fs from 'fs';
import * as glob from 'glob';
var ES6_GLOB_PATTERN = 'es6/**/*.@(ts|js)';
var packages = [
    'fp-ts',
    'monocle-ts',
    'io-ts',
    'io-ts-types',
    'elm-ts',
    'fp-ts-contrib',
    'fp-ts-rxjs',
    'fp-ts-routing',
    'newtype-ts',
    'fp-ts-fluture',
    'parser-ts',
    'retry-ts',
    'hyper-ts',
    'fp—ts-local-storage',
    '@matechs/effect',
    '@matechs/prelude',
    '@matechs/aio',
    '@matechs/apollo',
    '@matechs/console',
    '@matechs/cqrs',
    '@matechs/cqrs-es',
    '@matechs/epics',
    '@matechs/express',
    '@matechs/koa',
    '@matechs/fancy',
    '@matechs/graceful',
    '@matechs/http-client',
    '@matechs/http-client-fetch',
    '@matechs/http-client-libcurl',
    '@matechs/logger',
    '@matechs/logger-winston',
    '@matechs/logger-pino',
    '@matechs/orm',
    '@matechs/rpc',
    '@matechs/rpc-client',
    '@matechs/rxjs',
    '@matechs/tracing',
    '@matechs/uuid',
    '@matechs/zoo',
    '@matechs/test',
    '@matechs/test-jest',
    '@morphic-ts/adt',
    '@morphic-ts/algebras',
    '@morphic-ts/batteries',
    '@morphic-ts/common',
    '@morphic-ts/eq-interpreters',
    '@morphic-ts/fastcheck-interpreters',
    '@morphic-ts/io-ts-interpreters',
    '@morphic-ts/json-schema-interpreters',
    '@morphic-ts/ord-interpreters',
    '@morphic-ts/show-interpreters'
];
var regexp = new RegExp("(\\s(?:from|module)\\s['|\"](?:" + packages.join('|') + "))\\/lib\\/([\\w-\\/]+['|\"])", 'gm');
/**
 * @since 0.0.1
 */
export var replace = function (s) { return s.replace(regexp, '$1/es6/$2'); };
var readFile = TE.taskify(fs.readFile);
var writeFile = TE.taskify(fs.writeFile);
function modifyFile(f) {
    return function (path) {
        return pipe(readFile(path, 'utf8'), TE.map(f), TE.chain(function (content) { return writeFile(path, content); }));
    };
}
function modifyFiles(f) {
    return function (paths) {
        return pipe(A.array.traverse(TE.taskEither)(paths, modifyFile(f)), TE.map(function () { return undefined; }));
    };
}
function modifyGlob(f) {
    return function (pattern) { return pipe(glob.sync(pattern), TE.right, TE.chain(modifyFiles(f))); };
}
var replaceFiles = modifyGlob(replace)(ES6_GLOB_PATTERN);
var exit = function (code) { return function () { return process.exit(code); }; };
function onLeft(e) {
    return T.fromIO(pipe(log(e), IO.chain(function () { return exit(1); })));
}
function onRight() {
    return T.fromIO(log(chalk.bold.green('import rewrite succeeded!')));
}
/**
 * @since 0.0.1
 */
export var main = pipe(replaceFiles, TE.fold(onLeft, onRight));
