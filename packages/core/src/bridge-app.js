/**
 * AppBridge provides a standardized way for plugins to communicate
 * between the application runtime (window) and the DevTools iframe.
 */
export class AppBridge {
    constructor(name) {
        this.channel = new BroadcastChannel(`u-devtools-${name}`);
    }
    send(event, data) {
        this.channel.postMessage({ type: event, data });
    }
    on(event, cb) {
        const handler = (e) => {
            if (e.data.type === event) {
                cb(e.data.data);
            }
        };
        this.channel.addEventListener('message', handler);
        return () => {
            this.channel.removeEventListener('message', handler);
        };
    }
    close() {
        this.channel.close();
    }
}
