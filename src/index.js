// jshint esversion:6
import handleRequest from './handleRequest'


// EntryPoint for Cloudflare
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
