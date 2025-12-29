import type { Plugin } from "@opencode-ai/plugin"
import { loadConfig, isEventSoundEnabled, isEventNotificationEnabled, getMessage, getSoundPath } from "./config"
import type { EventType, NotifierConfig } from "./config"
import { sendNotification } from "./notify"
import { playSound } from "./sound"

function debug(msg: string): void {
  console.error(`[opencode-notifier] ${msg}`)
}

async function handleEvent(
  config: NotifierConfig,
  eventType: EventType
): Promise<void> {
  debug(`Handling event: ${eventType}`)
  debug(`Config for ${eventType}: sound=${isEventSoundEnabled(config, eventType)}, notification=${isEventNotificationEnabled(config, eventType)}`)
  
  const promises: Promise<void>[] = []

  if (isEventNotificationEnabled(config, eventType)) {
    const message = getMessage(config, eventType)
    debug(`Queueing notification: "${message}"`)
    promises.push(sendNotification(message, config.timeout))
  }

  if (isEventSoundEnabled(config, eventType)) {
    const customSoundPath = getSoundPath(config, eventType)
    debug(`Queueing sound: ${customSoundPath || "default"}`)
    promises.push(playSound(eventType, customSoundPath))
  }

  await Promise.allSettled(promises)
  debug(`Event ${eventType} handled`)
}

export const NotifierPlugin: Plugin = async () => {
  const config = loadConfig()
  debug(`Plugin loaded. Config: ${JSON.stringify(config)}`)

  return {
    event: async ({ event }) => {
      debug(`Received event: ${event.type}`)
      
      if (event.type === "permission.updated") {
        await handleEvent(config, "permission")
      }

      if (event.type === "session.idle") {
        await handleEvent(config, "complete")
      }

      if (event.type === "session.error") {
        await handleEvent(config, "error")
      }
    },
  }
}

export default NotifierPlugin
