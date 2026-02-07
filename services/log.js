import config from '../config/index.js'

const requestLogs = []

const addLog = (logEntry) => {
  requestLogs.push(logEntry)
  if (requestLogs.length > config.maxLogs) requestLogs.shift()
}

const getLogs = () => {
  return requestLogs.slice().reverse()
}

const clearLogs = () => {
  requestLogs.length = 0
}

export { addLog, getLogs, clearLogs }
