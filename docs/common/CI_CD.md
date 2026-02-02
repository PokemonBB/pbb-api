# CI/CD - Docker Build and Publish

Services use automatic Docker build and publish via GitHub Actions. When code is pushed to main, images are built and pushed to Docker Hub.

## Triggers

- **Push to main:** Automatic build on merge
- **workflow_dispatch:** Manual trigger from GitHub Actions tab

## Workflow (API example)

1. Checkout repository
2. Set up QEMU (multi-architecture support)
3. Set up Docker Buildx
4. Log in to Docker Hub (secrets: DOCKERHUB_USERNAME, DOCKERHUB_TOKEN)
5. Build and push image

## Configuration

- **Environment:** BORRAGEIROS-ENV (GitHub environment for secrets)
- **Platforms:** linux/amd64, linux/arm64
- **Cache:** GitHub Actions cache (type: gha) for faster builds
- **Tags:** `borrageiros/pbb-api:latest`, `borrageiros/pbb-api:arm64`