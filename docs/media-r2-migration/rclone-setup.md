# rclone and R2 setup

Status: `portfolio-media` and the `media.xinyue.de` custom domain were created on
2026-10-22. The rclone API token has not been created yet, so no media has been
uploaded.

## Cloudflare resources

- Account: `xinyue@wordtoworld.io`
- Account ID: `885f84180d079ead1db018f64e14072b`
- Zone: `xinyue.de`, zone ID `a30e33ef1be4c0a485ee587dc0eaa62f`
- Bucket: `portfolio-media` (do not reuse `w2w-cdn`)
- Custom domain: `media.xinyue.de`
- The bucket and the `xinyue.de` zone are in the same Cloudflare account.

Commands already run:

```bash
npx wrangler r2 bucket create portfolio-media
npx wrangler r2 bucket domain add portfolio-media \
  --domain media.xinyue.de \
  --zone-id a30e33ef1be4c0a485ee587dc0eaa62f
```

The custom domain record is proxied. GitHub Pages records stay DNS-only. The
domain ownership and SSL status were `pending` immediately after creation.

## API token

Create an R2 API token with Object Read and Write for `portfolio-media` only.
Store the token in the local rclone config, never in the repository.

## rclone config

Add this block to `~/.config/rclone/rclone.conf`:

```ini
[r2]
type = s3
provider = Cloudflare
access_key_id = <access-key-id>
secret_access_key = <secret-access-key>
endpoint = https://885f84180d079ead1db018f64e14072b.r2.cloudflarestorage.com
region = auto
acl = private
no_check_bucket = true
```

Verify the remote and the bucket:

```bash
rclone lsd r2:portfolio-media
```

## Upload

`npm run media:upload` performs an rclone copy dry run. Review the output, then:

```bash
npm run media:upload -- --apply
```

The upload uses `rclone copy`, never `rclone sync`. Cache-Control is
`public, max-age=604800` because object keys are stable; a shorter TTL keeps
updates visible without a purge step. Purge changed objects in the Cloudflare
dashboard if an update must be immediate.

## Post-upload verification

Run the manifest-driven HEAD/GET check after upload:

```bash
node scripts/media/check-remote.mjs
```

The check reads `media-manifest.json` and requests every key over HTTPS.
