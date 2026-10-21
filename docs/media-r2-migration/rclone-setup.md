# rclone and R2 setup

The R2 bucket and API token are not created yet. Do not upload until both exist and
the token is scoped to `portfolio-media`.

## Cloudflare resources

- Account: `xinyue@wordtoworld.io`
- Account ID: `885f84180d079ead1db018f64e14072b`
- Bucket: `portfolio-media` (new; do not reuse `w2w-cdn`)
- Custom domain: `media.xinyue.de`
- The bucket and the `xinyue.de` zone must be in the same Cloudflare account.

Create the bucket and custom domain with `wrangler` once the zone ID is known:

```bash
npx wrangler r2 bucket create portfolio-media
npx wrangler r2 bucket domain add portfolio-media \
  --domain media.xinyue.de \
  --zone-id <zone-id>
```

The custom domain record is proxied. GitHub Pages records stay DNS-only.

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
