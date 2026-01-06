// unique host element
const host = document.createElement('div')
host.id = `fluent-read-host-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
document.body.appendChild(host)

export { host }
