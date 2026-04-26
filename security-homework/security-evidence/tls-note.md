# TLS Design Note

## Where TLS terminates

TLS terminates at the **edge reverse proxy (nginx)** before traffic reaches the NestJS API.
The API container itself listens on plain HTTP port 3000 on the private Docker `internal` network
and is never exposed directly to the internet.

## Docker network topology

```
Internet
    │  HTTPS :443
    ▼
[ nginx  (public network) ]  ←── terminates TLS, holds certificate
    │  HTTP  :3000 (private)
    ▼
[ ecommerce-api  (internal network) ]
    │
    ├─ postgres  (internal only, no public port)
    ├─ rabbitmq  (internal only, no public port)
    └─ payments  (internal only, gRPC :50051)
```

The `public` network in `compose.yml` is the only network shared between nginx and the api service.
All backend data stores communicate only on the `internal` network (trusted by placement).

## nginx config sketch

```nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;   # force HTTPS
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers   ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    location /api/ {
        proxy_pass         http://ecommerce-api:3000/;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

## NestJS trust proxy setting

When deployed behind nginx, add to `main.ts` before `app.listen()`:

```ts
app.getHttpAdapter().getInstance().set('trust proxy', 1);
```

This ensures `X-Forwarded-For` is used for rate-limit key derivation instead of the internal
nginx IP, so throttler counts are per real client IP.

## Certificate management

Certificates are provisioned and renewed automatically by **Certbot / Let's Encrypt** using
a `certbot` sidecar container or a Certbot cron job mounted via a shared volume.
The nginx container uses read-only bind mounts to `/etc/letsencrypt/`.

## Internal traffic security

All service-to-service traffic (api ↔ postgres, api ↔ rabbitmq, api ↔ payments gRPC) runs
on the private Docker bridge network `internal`. This network is not reachable from the host
or the internet. Postgres and RabbitMQ do not expose public ports in production (`compose.yml`
binds those ports only in `compose.dev.yml`).
