# rclone and R2 setup

Status: the bucket, custom domain, and upload are complete on 2026-10-22. The
bucket holds 399 objects after four recovered images were added from the old
Mac. All 399 keys return HTTP 200 over HTTPS. The local rclone remote is
configured on each machine; tokens are not stored in the repository.

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
domain ownership and SSL status became `active` after creation.

## API token

The local rclone remote uses an R2 API token with Object Read and Write for
`portfolio-media` only.
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

The original upload completed on 2026-10-22: 395 files, 362.65 MiB, 100%. A
second `rclone copy` from the old Mac added four recovered images (1.85 MiB),
bringing the bucket to 399 objects and 364.49 MiB. The upload uses
`rclone copy`, never `rclone sync`. Cache-Control is
`public, max-age=604800` because object keys are stable; a shorter TTL keeps
updates visible without a purge step. Purge changed objects in the Cloudflare
dashboard if an update must be immediate.

## Post-upload verification

```bash
rclone check media-out r2:portfolio-media --size-only
npm run media:check
```

Results: all 399 keys returned HTTP 200 over `https://media.xinyue.de`. The four
recovered files matched their local sources with `rclone check --size-only`; the
original 395 objects were not present locally on the old Mac and were verified
over HTTPS. Sample objects return the expected `Content-Type`
(`image/gif`, `image/png`, `image/webp`, `image/jpeg`, `video/mp4`) and
`Cache-Control: public, max-age=604800`. The bucket root returns 404 because no
root object exists.
