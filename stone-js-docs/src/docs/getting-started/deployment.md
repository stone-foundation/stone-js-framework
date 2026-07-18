---
title: Deployment
next: ../architecture/
---

Stone.js apps are built for freedom, deployable anywhere JavaScript runs: Node.js, the browser, serverless, edge networks, and even that smart toaster with a JS engine (well, almost). Thanks to its Continuum Architecture, Stone.js doesn’t care about your runtime, because everything is context. And deployment? It's just the final form of your app's intention.

::: important **Requirements:**  
You'll need Node.js `>=18.17.0`. That’s where the magic starts.
:::

## Building for Production

Stone.js uses the latest JS features, some still too hot for regular engines. That’s why we bundle your app into a **single deployable artifact**, no `node_modules`, no clutter, just pure power.

Run:

```bash
npm run build
```

You’ll find your ready-to-deploy bundle in the `dist/` folder. This artifact can be thrown into any JS-capable environment like:

- Node.js servers
- Serverless (AWS Lambda, Azure Functions…)
- Edge platforms (Cloudflare Workers, Vercel Edge…)
- Static file servers/CDNs (for frontend apps)
- Docker containers
- or wherever JavaScript dares to run.

Wanna preview it?

```bash
npm run preview
```

It spins up a local server to simulate your production bundle.

## Deploying Static Frontend Apps (CDN-style)

Stone.js frontend apps can be deployed like any other SPA: bundle it, upload it, boom.

1. Build your app:

```bash
npm run build
```

2. Upload the contents of `dist/` to your favorite static host:
    - Vercel, Netlify, S3, GitHub Pages, Cloudflare Pages, pick your poison.

3. Set your CDN or static server to serve `index.html` as the entry point.

4. Make sure assets (JS, CSS, images) in the root folder are served correctly.

5. For SPA-style routing, configure your server to redirect **all paths** to `index.html`.

::: tip Tip
You can even deploy the frontend on a CDN and the backend on Lambda, continuum, baby!
:::

## Serverless Deployment

Stone.js was made for the cloud-native era. That means it plays nicely with serverless platforms like AWS Lambda. You just need to connect the right adapter, build your artifact, and let the platform handle the scaling and infrastructure.

### AWS Lambda

1. Install the AWS Lambda adapter:

```bash
npm install @stone-js/aws-lambda-http-adapter
```

2. Add an Adapter to your context:

```ts title="app/Application.ts"
import { StoneApp, IncomingEvent } from '@stone-js/core'
import { AwsLambdaHttpAdapter } from '@stone-js/aws-lambda-http-adapter'

@StoneApp()
@AwsLambdaHttpAdapter()
export class Application {
  handle(event: IncomingEvent): { message: string } {
    return { message: 'Hello world!' }
  }
}
```

3. Build your system:

```bash
npm run build
```

4. Deploy the `dist/` folder to AWS Lambda.

- Set your handler to `server.stone`.
- Define environment variables if needed.
- Use your usual deployment method (ZIP, AWS SAM, Serverless Framework, Terraform, etc.).

Check the [adapter’s documentation](../../packages/aws-lambda-http-adapter/) for advanced usage and configuration.

## Node.js Server Deployment

Deploying on a classic Node.js server? You’re covered.

1. Install the Node.js adapter:

```bash
npm install @stone-js/node-http-adapter
```

2. Configure your context:

```ts title="app/Application.ts"
import { StoneApp, IncomingEvent } from '@stone-js/core'
import { NodeHttpAdapter } from '@stone-js/node-http-adapter'

@StoneApp()
@NodeHttpAdapter()
export class Application {
  handle(event: IncomingEvent): { message: string } {
    return { message: 'Hello world!' }
  }
}
```

3. Build the system:

```bash
npm run build
```

4. Run it:

```bash
node dist/server.mjs
```

### Using Nginx as a Reverse Proxy

Stone.js apps often sit behind a reverse proxy like Nginx for handling TLS, load balancing, or just good old port 80.

Here’s a basic config example:

```nginx
server {
  listen 80;
  listen [::]:80;

  server_name <YOUR_DOMAIN>;

  location / {
    proxy_pass http://localhost:<STONE_PORT>;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Update `<YOUR_DOMAIN>` and `<STONE_PORT>` accordingly.

### Using PM2 for Process Management

You can start your app with `node dist/server.mjs`, but in production, that’s like driving without a seatbelt. Use PM2 instead.

1. Install PM2 (if you haven’t):

```bash
npm install -g pm2
```

2. Create an ecosystem file:

```js title="ecosystem.config.js"
module.exports = {
  apps: [{
    name: 'stone-app',
    script: './dist/server.mjs',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

3. Start your app:

```bash
pm2 start ecosystem.config.js
```

PM2 handles restarts, logs, and can scale your app across CPU cores.

## Docker Deployment with Docker Compose

Stone.js builds into a clean, self-contained artifact, perfect for containerization. With Docker Compose, you can declare your services, ports, environment, and even extend later (database, CDN proxy, frontend, etc.), all in one place.

1. Dockerfile

First, define a lightweight Dockerfile that builds and runs your app:

```Dockerfile title="Dockerfile"
FROM node:20

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

EXPOSE 8080
CMD ["node", "dist/server.mjs"]
```

2. Compose File

Then declare your app service in `docker-compose.yml`:

```yaml title="docker-compose.yml"
version: "3.9"

services:
  stone-app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      NODE_ENV: production
    restart: unless-stopped
```

3. Build and Run

From your project root, run:

```bash
docker compose up --build
```

This will:

* Build your app
* Expose it on `http://localhost:8080`
* Restart it automatically unless manually stopped

You now have a fully Dockerized Stone.js application, easily extendable with additional services like databases, caching, or frontend CDNs.

::: tip
Need multi-service setup? Just add more services to `docker-compose.yml`. Everything stays isolated but connected.
:::

## GitHub Actions (CI/CD)

To automate your build and deployment, you can use **GitHub Actions**. Here's a basic workflow that builds your Stone.js system and can be extended for deployment to any platform.

### Example: Build & Deploy Workflow

```yaml title=".github/workflows/deploy.yml"
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v6

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Build the app
        run: npm run build

      # Example: Deploy somewhere (you can replace this)
      # - name: Deploy to S3 / Server / Lambda / etc.
      #   run: your-deploy-command-here
```

### Tips

- Add a `test` step if you have unit tests.
- Add secrets (e.g., AWS credentials, SSH keys) via GitHub repository settings.
- You can use any deployment method after the build step: upload to Lambda, push to a Docker registry, sync to S3, etc.

## Adapter Compatibility Table

Stone.js uses adapters to abstract the runtime environment, so you can build once and deploy anywhere. Here’s a quick overview of available adapters and where they shine:

| Adapter                 | Use Case                | Package                                                                        | Target Platform Examples         |
| ----------------------- | ----------------------- | ------------------------------------------------------------------------------ | -------------------------------- |
| Browser Adapter         | Client-side SPA         | [`@stone-js/browser-adapter`](../../packages/browser-adapter/)                 | Browser                          |
| Node.js HTTP Adapter    | Traditional HTTP server | [`@stone-js/node-http-adapter`](../../packages/node-http-adapter/)             | Node.js, Express-style servers   |
| AWS Lambda Adapter      | Serverless all purpose  | [`@stone-js/aws-lambda-adapter`](../../packages/aws-lambda-adapter/)           | AWS Lambda, Serverless Framework |
| AWS Lambda HTTP Adapter | Serverless HTTP purpose | [`@stone-js/aws-lambda-http-adapter`](../../packages/aws-lambda-http-adapter/) | AWS Lambda, Serverless Framework |
| Node.js CLI Adapter     | CLI based App           | [`@stone-js/node-cli-adapter`](../../packages/node-cli-adapter/)               | Node.js runtime                  |

::: info
Don’t see your platform here? Don’t worry, Stone.js was designed to be adaptable. Write your own adapter or let us know what you need!
:::
