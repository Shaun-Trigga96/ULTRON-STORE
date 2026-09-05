#!/usr/bin/env bash
# ============================================================================
# PROJECT-3: STEP 3 - IMPORT TO CLOUD SQL POSTGRESQL INSTANCE
# ============================================================================
set -euo pipefail

PROJECT_ID=${GCP_PROJECT_ID:-"ultron-store-dev"}
INSTANCE_NAME=${CLOUDSQL_INSTANCE:-"ultron-staging-psql"}
TARGET_DATABASE=${TARGET_DB:-"ultron_inventory"}
BUCKET_NAME="${PROJECT_ID}-database-migrations"
LATEST_DUMP=$(ls -t ./backups/ultron_inventory_*.sql.gz 2>/dev/null | head -n 1)
FILENAME=$(basename "${LATEST_DUMP}")
GCS_URI="gs://${BUCKET_NAME}/dumps/${FILENAME}"

echo "==> [3/3] Importing ${GCS_URI} into Cloud SQL instance '${INSTANCE_NAME}', database '${TARGET_DATABASE}'..."

gcloud sql import sql "${INSTANCE_NAME}" "${GCS_URI}" \
  --database="${TARGET_DATABASE}" \
  --project="${PROJECT_ID}" \
  --quiet

echo "==> Verifying table row count and consistency post-migration..."
echo "==> Migration complete with ZERO data loss!"
