# File Storage

The abstract class `FileStoreManager` is used to store user-generated assets, such as uploaded user and org image avatars to Parabol.

The following storage providers are (so far) supported:

- [x] Local File Storage
- [x] Amazon S3

## General Configuration

In order to specify your storage provider of choice, whether local or cloud, set the env var `FILE_STORE_PROVIDER` in `.env` file.

| Provider      | Env Var Value |
| ------------- | ------------- |
| Local Storage | local         |
| Amazon S3     | s3            |

If you're using local storage for file storage, that's it! Make sure you have enough disk space on the machine to support the expected asset load.

On the local file system, the directory structure will be as follows:

```
   Parabol Project Root
   ====================
    |
    |--- self-hosted/
        |--- :model/
          |--- :id/
              |--- :field/
                |--- :asset.ext

```

## S3 Configuration

After setting the `FILE_STORE_PROVIDER` env var, there are a couple other env vars that must be set. These are:

- `AWS_ACCESS_KEY_ID="XXXXXXXXXXXXXXXXXXXX"`
- `AWS_REGION="some-region-1"`
- `AWS_SECRET_ACCESS_KEY="YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY"`
- `AWS_S3_BUCKET="some-bucket-name"`
- `CDN_BASE_URL="//some.url.com/instance"`

After these vars are set correctly, all should be good to go to begin uploading images to the configured S3 bucket.

Within the bucket, the directory structure will be as follows:

```
   S3 Bucket
   =========
   |
   |--- static/                     1) Manually managed assets
   |
   |--- :instance/
      |--- build/                   2) Builds bundled with webpack
      |  |--- :vX.Y.Z/
      |
      |--- store/                   3) User-generated assets
         |--- :model/
            |--- :id/
               |--- :field/
                  |--- :asset.ext

```
