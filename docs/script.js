const toast = document.querySelector('.toast')
let toastTimer

if (window.location.hostname.endsWith('.github.io')) {
  const owner = window.location.hostname.split('.')[0]
  const repository = window.location.pathname.split('/').filter(Boolean)[0]
  const repositoryUrl = `https://github.com/${owner}/${repository}`
  document.querySelectorAll('[data-repo-link]').forEach((link) => {
    link.href = repositoryUrl + (link.dataset.repoLink || '')
  })
}

document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy)
      toast.classList.add('show')
      clearTimeout(toastTimer)
      toastTimer = setTimeout(() => toast.classList.remove('show'), 1600)
    } catch {
      window.prompt('Copy this command:', button.dataset.copy)
    }
  })
})
