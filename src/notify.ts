import notifier from "node-notifier"

const NOTIFICATION_TITLE = "OpenCode"

function debug(msg: string): void {
  console.error(`[opencode-notifier] ${msg}`)
}

export async function sendNotification(
  message: string,
  timeout: number
): Promise<void> {
  debug(`Sending notification: "${message}" (timeout: ${timeout}s)`)
  return new Promise((resolve) => {
    notifier.notify(
      {
        title: NOTIFICATION_TITLE,
        message: message,
        sound: false,
        timeout: timeout,
        icon: undefined,
      },
      (err, response, metadata) => {
        if (err) {
          debug(`Notification error: ${err}`)
        } else {
          debug(`Notification sent. Response: ${response}, Metadata: ${JSON.stringify(metadata)}`)
        }
        resolve()
      }
    )
  })
}
