// @flow
import write from '../utils/write'
import { mkdirs } from '../utils/mkdirs'

export default async function init (gitdir /*: string */) {
  let folders = [
    'hooks',
    'info',
    'objects/info',
    'objects/pack',
    'refs/heads',
    'refs/tags'
  ]
  folders = folders.map(dir => gitdir + '/' + dir)
  await mkdirs(folders)
  await write(
    gitdir + '/config',
    '[core]\n' +
      '\trepositoryformatversion = 0\n' +
      '\tfilemode = false\n' +
      '\tbare = false\n' +
      '\tlogallrefupdates = true\n' +
      '\tsymlinks = false\n' +
      '\tignorecase = true\n'
  )
  await write(gitdir + '/HEAD', 'ref: refs/heads/master\n')
}
