// jshint esversion:6
import handleRequest from './src/handlers/handleRequest'


// EntryPoint for Cloudflare
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
