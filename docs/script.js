const copyButton = document.querySelector('[data-copy]')

if (window.location.hostname.endsWith('.github.io')) {
  const owner = window.location.hostname.split('.')[0]
  const repository = window.location.pathname.split('/').filter(Boolean)[0]
  const repositoryUrl = `https://github.com/${owner}/${repository}`
  document.querySelectorAll('[data-repo-link]').forEach((link) => {
    link.href = repositoryUrl + (link.dataset.repoLink || '')
  })
}

copyButton?.addEventListener('click', async () => {
  await navigator.clipboard.writeText(copyButton.dataset.copy)
  const label = copyButton.querySelector('.copy-label')
  label.textContent = 'Copied'
  setTimeout(() => { label.textContent = 'Copy' }, 1400)
})
