import GitIndexManager from '../managers/GitIndexManager'

export default async function list ({ gitdir }) {
  let filenames
  await GitIndexManager.acquire(`${gitdir}/index`, async function (index) {
    filenames = index.entries.map(x => x.path)
  })
  return filenames
}
