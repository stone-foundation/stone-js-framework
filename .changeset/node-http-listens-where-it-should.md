---
"@stone-js/node-http-adapter": patch
---

fix(node-http): the server listens where the platform told it to

`process.env.PORT` was read nowhere in the framework, and the server bound the hostname of `stone.adapter.url`, whose default is `http://localhost:8080`. So a Stone.js application in a container listened on a port nothing forwarded to, **on an interface nothing outside the container can reach**, and answered no request at all while looking healthy in development. That is Cloud Run, Heroku, Render, Fly, App Runner and Railway, all of which assign a port through the environment and route traffic to it. The documented `Dockerfile` had the same problem.

Three rules now, in this order:

1. A `url` you declared wins, because an application that pinned one said what it meant.
2. Left at the default, `HOST` and `PORT` from the environment are honoured.
3. When the port comes from the environment without a `HOST`, the server binds **every interface** rather than loopback: a platform that assigns the port is going to reach the process from outside, where loopback answers nobody.

Locally nothing assigns a port, so the default stays loopback and `stone dev` does not put a development server on the network without being asked.

**The startup banner stopped lying, too.** Bound to loopback it advertised the machine's LAN address, which returns nothing: it sent whoever tried it looking for a firewall that was not there. The network line now appears only when the server is bound to every interface, and it is built from the interface rather than by substituting text into the configured URL, which produced the wildcard address as if it were reachable.

Measured on a real built application before and after. Before: banner announcing `http://192.168.40.18:8080/`, `curl` on it answering nothing, `lsof` showing `127.0.0.1:8080` only. After, with `PORT=8123` as a platform injects it: `lsof` shows `*:8123`, loopback and LAN both answer `200`, and both banner lines are true. Without `PORT`: `127.0.0.1:8080`, and the banner prints the local line alone.

Six tests pin the precedence, including the case where a declared URL must beat the environment. The documentation gains the rule, and its `Dockerfile` gains the `ENV PORT=8080` that makes the recipe work. The configuration table also stops advertising `host` and `port` keys, which never existed.
