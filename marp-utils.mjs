
import { Marp } from '@marp-team/marp-core';
import { promises as fs } from 'fs';
import path from 'path';
import markdownItFootnote from 'markdown-it-footnote';
import markdownItMark from 'markdown-it-mark';
import markdownItContainer from 'markdown-it-container';

let marp;

export async function initializeMarp(themeDir) {
  const options = { html: true, linkify: true, };
  marp = new Marp(options)
    .use(markdownItFootnote)
    .use(markdownItMark)
    .use(markdownItContainer, 'note');

  if (themeDir) {
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
  const { html, css } = marp.render(markdown);
  return { html, css };
}
