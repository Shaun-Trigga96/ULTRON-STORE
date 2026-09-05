#!/usr/bin/env bash
# ============================================================================
# PROJECT-3: STEP 2 - ENCRYPT & STAGE BACKUP TO GOOGLE CLOUD STORAGE
# ============================================================================
set -euo pipefail

PROJECT_ID=${GCP_PROJECT_ID:-"ultron-store-dev"}
BUCKET_NAME="${PROJECT_ID}-database-migrations"
LATEST_DUMP=$(ls -t ./backups/ultron_inventory_*.sql.gz | head -n 1)

echo "==> [2/3] Staging ${LATEST_DUMP} to gs://${BUCKET_NAME}/..."

# Ensure bucket exists with customer-managed or Google-managed encryption
gsutil ls "gs://${BUCKET_NAME}" >/dev/null 2>&1 || gsutil mb -p "${PROJECT_ID}" -c STANDARD -l us-central1 "gs://${BUCKET_NAME}"

# Upload dump file
gsutil cp "${LATEST_DUMP}" "gs://${BUCKET_NAME}/dumps/"

# Grant Cloud SQL Service Agent read permissions to the bucket
SERVICE_ACCOUNT=$(gcloud sql instances describe ultron-staging-psql --format="value(serviceAccountEmailAddress)" 2>/dev/null || true)
if [ -n "${SERVICE_ACCOUNT}" ]; then
  echo "==> Granting storage.objectViewer to Cloud SQL Service Agent: ${SERVICE_ACCOUNT}"
  gsutil acl ch -u "${SERVICE_ACCOUNT}:R" "gs://${BUCKET_NAME}/dumps/$(basename "${LATEST_DUMP}")"
fi

echo "==> Staging complete: gs://${BUCKET_NAME}/dumps/$(basename "${LATEST_DUMP}")"
