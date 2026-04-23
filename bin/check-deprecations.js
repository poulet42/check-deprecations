#!/usr/bin/env node
'use strict';

const ts = require('typescript');
const path = require('path');
const fs = require('fs');

const [, , filePath] = process.argv;

if (!filePath) {
  process.stderr.write('Usage: check-deprecations <file>\n');
  process.exit(2);
}

const absolutePath = path.resolve(filePath);

if (!fs.existsSync(absolutePath)) {
  process.stderr.write(`check-deprecations: ${filePath}: No such file\n`);
  process.exit(2);
}

const configPath =
  ts.findConfigFile(path.dirname(absolutePath), ts.sys.fileExists, 'tsconfig.json') ??
  ts.findConfigFile(path.dirname(absolutePath), ts.sys.fileExists, 'jsconfig.json');

let compilerOptions = { allowJs: true, checkJs: true, noEmit: true };

if (configPath) {
  const { config, error } = ts.readConfigFile(configPath, ts.sys.readFile);
  if (!error) {
    const { options } = ts.parseJsonConfigFileContent(config, ts.sys, path.dirname(configPath));
    compilerOptions = { ...options, noEmit: true };
  }
}

const serviceHost = {
  getScriptFileNames: () => [absolutePath],
  getScriptVersion: () => '0',
  getScriptSnapshot: (fileName) =>
    fs.existsSync(fileName)
      ? ts.ScriptSnapshot.fromString(fs.readFileSync(fileName, 'utf8'))
      : undefined,
  getCurrentDirectory: () => process.cwd(),
  getCompilationSettings: () => compilerOptions,
  getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
  readDirectory: ts.sys.readDirectory,
  directoryExists: ts.sys.directoryExists,
  getDirectories: ts.sys.getDirectories,
};

const service = ts.createLanguageService(serviceHost, ts.createDocumentRegistry());
const diagnostics = service.getSuggestionDiagnostics(absolutePath);
const deprecated = diagnostics.filter((d) => d.code === 6385 || d.code === 6387);

if (deprecated.length === 0) process.exit(0);

const sourceFile = service.getProgram().getSourceFile(absolutePath);
const lines = fs.readFileSync(absolutePath, 'utf8').split('\n');

for (const diag of deprecated) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(diag.start);
  const message =
    typeof diag.messageText === 'string' ? diag.messageText : diag.messageText.messageText;
  process.stdout.write(`${filePath}:${line + 1}:${character + 1} - ${message}\n`);
  process.stdout.write(`  ${lines[line]}\n\n`);
}

process.exit(1);
