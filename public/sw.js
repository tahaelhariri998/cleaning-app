if(!self.define){let e,s={};const c=(c,n)=>(c=new URL(c+".js",n).href,s[c]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=c,e.onload=s,document.head.appendChild(e)}else e=c,importScripts(c),s()})).then((()=>{let e=s[c];if(!e)throw new Error(`Module ${c} didn’t register its module`);return e})));self.define=(n,i)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let a={};const o=e=>c(e,t),r={module:{uri:t},exports:a,require:o};s[t]=Promise.all(n.map((e=>r[e]||o(e)))).then((e=>(i(...e),a)))}}define(["./workbox-07672ec7"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"34e8c77e0e016375fcccb682b27cc3c4"},{url:"/_next/dynamic-css-manifest.json",revision:"d751713988987e9331980363e24189ce"},{url:"/_next/static/Tl7cdZoXyBpBvA1hCEoGG/_buildManifest.js",revision:"bfe8fe85926b88102a54dd79f55079d5"},{url:"/_next/static/Tl7cdZoXyBpBvA1hCEoGG/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/120-a2ce819f49f29d6a.js",revision:"Tl7cdZoXyBpBvA1hCEoGG"},{url:"/_next/static/chunks/203.215f7ebb412294c3.js",revision:"215f7ebb412294c3"},{url:"/_next/static/chunks/218.ee5bb437b51df9be.js",revision:"ee5bb437b51df9be"},{url:"/_next/static/chunks/26770aaf-596bc11a4207b8f3.js",revision:"Tl7cdZoXyBpBvA1hCEoGG"},{url:"/_next/static/chunks/4bd1b696-b58e8e3f58296fa4.js",revision:"Tl7cdZoXyBpBvA1hCEoGG"},{url:"/_next/static/chunks/517-dbb027130d842c85.js",revision:"Tl7cdZoXyBpBvA1hCEoGG"},{url:"/_next/static/chunks/863-173f79f77641c1c8.js",revision:"Tl7cdZoXyBpBvA1hCEoGG"},{url:"/_next/static/chunks/970-99d3a3e2e507dd19.js",revision:"Tl7cdZoXyBpBvA1hCEoGG"},{url:"/_next/static/chunks/992-5cf7e6b7226e08cc.js",revision:"Tl7cdZoXyBpBvA1hCEoGG"},{url:"/_next/static/chunks/app/_not-found/page-9a9bd9676786e3ff.js",revision:"Tl7cdZoXyBpBvA1hCEoGG"},{url:"/_next/static/chunks/app/layout-8bc99c6c3e7a1078.js",revision:"Tl7cdZoXyBpBvA1hCEoGG"},{url:"/_next/static/chunks/app/page-7fceff0efc85598a.js",revision:"Tl7cdZoXyBpBvA1hCEoGG"},{url:"/_next/static/chunks/framework-1789f0885013f26e.js",revision:"Tl7cdZoXyBpBvA1hCEoGG"},{url:"/_next/static/chunks/main-app-ec1dce68149ab5c4.js",revision:"Tl7cdZoXyBpBvA1hCEoGG"},{url:"/_next/static/chunks/main-f635dd5b079cb73e.js",revision:"Tl7cdZoXyBpBvA1hCEoGG"},{url:"/_next/static/chunks/pages/ProfileRating-8c28f44e8c130efe.js",revision:"Tl7cdZoXyBpBvA1hCEoGG"},{url:"/_next/static/chunks/pages/_app-3b72408686befe21.js",revision:"Tl7cdZoXyBpBvA1hCEoGG"},{url:"/_next/static/chunks/pages/_error-be09eb0819c09b75.js",revision:"Tl7cdZoXyBpBvA1hCEoGG"},{url:"/_next/static/chunks/pages/admin-e8d4857b59540cc3.js",revision:"Tl7cdZoXyBpBvA1hCEoGG"},{url:"/_next/static/chunks/pages/login-5c6688e88ea889e9.js",revision:"Tl7cdZoXyBpBvA1hCEoGG"},{url:"/_next/static/chunks/pages/profile-72e5acd4b1a185da.js",revision:"Tl7cdZoXyBpBvA1hCEoGG"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-c4ad510844f87d82.js",revision:"Tl7cdZoXyBpBvA1hCEoGG"},{url:"/_next/static/css/0acef4df005bbe6c.css",revision:"0acef4df005bbe6c"},{url:"/_next/static/css/40cce95be0c9918f.css",revision:"40cce95be0c9918f"},{url:"/_next/static/css/a7dccf00c225b3d0.css",revision:"a7dccf00c225b3d0"},{url:"/_next/static/media/569ce4b8f30dc480-s.p.woff2",revision:"ef6cefb32024deac234e82f932a95cbd"},{url:"/_next/static/media/747892c23ea88013-s.woff2",revision:"a0761690ccf4441ace5cec893b82d4ab"},{url:"/_next/static/media/93f479601ee12b01-s.p.woff2",revision:"da83d5f06d825c5ae65b7cca706cb312"},{url:"/_next/static/media/ba015fad6dcf6784-s.woff2",revision:"8ea4f719af3312a055caf09f34c89a77"},{url:"/file.svg",revision:"d09f95206c3fa0bb9bd9fefabfd0ea71"},{url:"/globe.svg",revision:"2aaafa6a49b6563925fe440891e32717"},{url:"/logo.png",revision:"1d77efe55fd0a5bac020c36cb6899e05"},{url:"/manifest.json",revision:"39f292e657bdd9725b9874a31b066e47"},{url:"/next.svg",revision:"8e061864f388b47f33a1c3780831193e"},{url:"/vercel.svg",revision:"c0af2f507b369b085b35ef4bbe3bcf1e"},{url:"/window.svg",revision:"a2760511c65806022ad20adf74370ff3"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:c,state:n})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
