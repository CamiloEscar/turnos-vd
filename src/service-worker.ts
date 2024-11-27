// Add necessary type declarations
interface ExtendableMessageEvent extends MessageEvent {
  waitUntil(promise: Promise<any>): void;
}

declare const self: ServiceWorkerGlobalScope & {
  skipWaiting(): void;
  __WB_MANIFEST: Array<{ url: string, revision: string | null }>;
  addEventListener(
    type: 'message', 
    listener: (event: ExtendableMessageEvent) => void
  ): void;
}

import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'

clientsClaim()
self.skipWaiting()

precacheAndRoute(self.__WB_MANIFEST)

const handler = createHandlerBoundToURL('/index.html')
const navigationRoute = new NavigationRoute(handler)
registerRoute(navigationRoute)

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})