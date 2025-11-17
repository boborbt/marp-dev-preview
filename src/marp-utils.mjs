
import { Marp } from '@marp-team/marp-core';
import { promises as fs } from 'fs';
import path from 'path';
import markdownItFootnote from 'markdown-it-footnote';
import markdownItMark from 'markdown-it-mark';
import markdownItContainer from 'markdown-it-container';

let marp;

export function getMarp() {
  return marp;
}


export async function initializeMarp(themeSet) {
  const options = { html: true, linkify: true, };
  marp = new Marp(options)
    .use(markdownItFootnote)
    .use(markdownItMark)
    .use(markdownItContainer, 'note');

  if (!themeSet) {
    return marp;
  }

  console.log("Initializing Marp with themes...");
  for( const index in themeSet ) {
    let themeDir = themeSet[index];
    let stats = await fs.stat(themeDir).catch(() => null);
    if (!stats) {
      console.warn(`Theme ${themeDir} directory does not exist.`);
      continue;
    }

    if(!stats.isDirectory()) {
      console.warn(`Path ${themeDir} is not a directory.`);
      continue;
    }

    console.log("Loading themes from ", themeDir);

    const themeFiles = await fs.readdir(themeDir);
    for (const file of themeFiles) {
      if (path.extname(file) === '.css') {
        const css = await fs.readFile(path.join(themeDir, file), 'utf8');
        marp.themeSet.add(css);
      }
    }
  }

  return marp;
}

export function renderMarp(markdown) {
  const { html, css } = getMarp().render(markdown);
  return { html, css };
}
