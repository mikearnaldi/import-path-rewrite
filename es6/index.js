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
var packages = ['fp-ts', 'elm-ts'];
var regexp = new RegExp("(\\s(?:from|module)\\s['|\"](?:" + packages.join('|') + "))\\/lib\\/([\\w-\\/]+['|\"])", 'gm');
function getReplace(regexp) {
    return function (s) { return s.replace(regexp, '$1/es6/$2'); };
}
/**
 * @since 0.0.1
 */
export var replace = getReplace(regexp);
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