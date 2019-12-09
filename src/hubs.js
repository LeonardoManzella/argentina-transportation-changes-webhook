export default function prepareSignalR(jQuery){
    "use strict";

    if (typeof (jQuery.signalR) !== "function") {
        throw new Error("SignalR: SignalR is not loaded. Please ensure jquery.signalR-x.js is referenced before ~/signalr/js.");
    }

    var signalR = jQuery.signalR;

    function makeProxyCallback(hub, callback) {
        return function () {
            // Call the client hub method
            callback.apply(hub, jQuery.makeArray(arguments));
        };
    }

    function registerHubProxies(instance, shouldSubscribe) {
        var key, hub, memberKey, memberValue, subscriptionMethod;

        for (key in instance) {
            if (instance.hasOwnProperty(key)) {
                hub = instance[key];

                if (!(hub.hubName)) {
                    // Not a client hub
                    continue;
                }

                if (shouldSubscribe) {
                    // We want to subscribe to the hub events
                    subscriptionMethod = hub.on;
                } else {
                    // We want to unsubscribe from the hub events
                    subscriptionMethod = hub.off;
                }

                // Loop through all members on the hub and find client hub functions to subscribe/unsubscribe
                for (memberKey in hub.client) {
                    if (hub.client.hasOwnProperty(memberKey)) {
                        memberValue = hub.client[memberKey];

                        if (!jQuery.isFunction(memberValue)) {
                            // Not a client hub function
                            continue;
                        }

                        // Use the actual user-provided callback as the "identity" value for the registration.
                        subscriptionMethod.call(hub, memberKey, makeProxyCallback(hub, memberValue), memberValue);
                    }
                }
            }
        }
    }

    jQuery.hubConnection.prototype.createHubProxies = function () {
        var proxies = {};
        this.starting(function () {
            // Register the hub proxies as subscribed
            // (instance, shouldSubscribe)
            registerHubProxies(proxies, true);

            this._registerSubscribedHubs();
        }).disconnected(function () {
            console.log("-- Disconected");
            // Unsubscribe all hub proxies when we "disconnect".  This is to ensure that we do not re-add functional call backs.
            // (instance, shouldSubscribe)
            registerHubProxies(proxies, false);
        });

        proxies['Mobile'] = this.createHubProxy('Mobile'); 
        proxies['Mobile'].client = { };
        proxies['Mobile'].server = {
        };

        proxies['moveShape'] = this.createHubProxy('moveShape'); 
        proxies['moveShape'].client = { };
        proxies['moveShape'].server = {
        };

        return proxies;
    };

    signalR.hub = jQuery.hubConnection("https://www.metrovias.com.ar/estadolineas/signalr", { useDefaultPath: false });
    jQuery.extend(signalR, signalR.hub.createHubProxies());
    return jQuery;
}