import { onRequestPost as __api_chat_js_onRequestPost } from "/home/user/seoxpert-site/functions/api/chat.js"
import { onRequestGet as __api_checkout_js_onRequestGet } from "/home/user/seoxpert-site/functions/api/checkout.js"
import { onRequestPost as __api_checkout_js_onRequestPost } from "/home/user/seoxpert-site/functions/api/checkout.js"
import { onRequestPost as __api_contact_js_onRequestPost } from "/home/user/seoxpert-site/functions/api/contact.js"
import { onRequestPost as __api_stripe_webhook_js_onRequestPost } from "/home/user/seoxpert-site/functions/api/stripe-webhook.js"
import { onRequest as __api_chat_js_onRequest } from "/home/user/seoxpert-site/functions/api/chat.js"
import { onRequest as __api_contact_js_onRequest } from "/home/user/seoxpert-site/functions/api/contact.js"

export const routes = [
    {
      routePath: "/api/chat",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_chat_js_onRequestPost],
    },
  {
      routePath: "/api/checkout",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_checkout_js_onRequestGet],
    },
  {
      routePath: "/api/checkout",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_checkout_js_onRequestPost],
    },
  {
      routePath: "/api/contact",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_contact_js_onRequestPost],
    },
  {
      routePath: "/api/stripe-webhook",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_stripe_webhook_js_onRequestPost],
    },
  {
      routePath: "/api/chat",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_chat_js_onRequest],
    },
  {
      routePath: "/api/contact",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_contact_js_onRequest],
    },
  ]