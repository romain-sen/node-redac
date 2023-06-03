import {beforeEach, afterEach, describe, it} from 'node:test'
import fs from 'node:fs/promises'
import os from 'node:os'
import 'should'
import mklayout from '../../lib/utils/mklayout.js'
import {normalize, source, enrich} from '../../lib/plugin-mdx/index.js'

describe('mdx.enrich.lang', async () => {
  let tmpdir
  let count = 0
  beforeEach(async () => {
    tmpdir = `${os.tmpdir()}/redac-test-mdx-enrich-lang-${count++}`
    try{ await fs.rm(tmpdir, { recursive: true }) } catch {}
    await fs.mkdir(`${tmpdir}`)
  })
  afterEach(async () => {
    await fs.rm(tmpdir, { recursive: true })
  })
  it('extract lang', async () => {
    await mklayout(tmpdir, [
      ['./blog/article_1.md'],
      ['./blog/path/to/article_2/index.fr.mdx'],
      ['./blog/path/to/01.article_3/index.fr.mdx'],
      ['./blog/path/to/article_4.fr.mdx'],
      ['./blog/path/to/02.article_5.fr.mdx'],
    ])
    .then(() =>
      normalize({
        config: { target: tmpdir },
      })
    )
    .then((plugin) => source(plugin))
    .then((plugin) => enrich(plugin))
    .then(({ documents }) =>
      documents.map(document => ({
        lang: document.lang,
        slug: document.slug,
      })).should.match([
        { lang: "en", slug: ['article_1'] },
        { lang: "fr", slug: ['path', 'to', 'article_3'] },
        { lang: "fr", slug: ['path', 'to', 'article_5'] },
        { lang: "fr", slug: ['path', 'to', 'article_2'] },
        { lang: "fr", slug: ['path', 'to', 'article_4'] },
      ])
    )
  })

})
