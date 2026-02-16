// unique host element
const host = document.createElement('div')
host.id = `flow-reader-host-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
document.body.appendChild(host)

// Shadow DOM app container (for theme class application)
let appContainer: HTMLDivElement | null = null

export const setAppContainer = (container: HTMLDivElement) => {
  appContainer = container
}

export const getAppContainer = () => appContainer

export { host }
