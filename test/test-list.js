import test from 'ava'
import git from '../lib'

test.serial('gitIndex.list', async t => {
  const files = await git().gitdir('fixtures/test-list.git').list()
  t.snapshot(files)
})
