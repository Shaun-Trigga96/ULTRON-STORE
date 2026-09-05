#!/usr/bin/env bash
# ============================================================================
# PROJECT-3: STEP 1 - CONSISTENT DATABASE EXPORT (SOURCE POSTGRES)
# ============================================================================
set -euo pipefail

SOURCE_CONTAINER=${SOURCE_CONTAINER:-"ultron-postgres-local"}
SOURCE_DB=${SOURCE_DB:-"ultron_inventory"}
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DUMP_FILE="${BACKUP_DIR}/ultron_inventory_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "==> [1/3] Initiating single-transaction consistent PostgreSQL backup..."
docker exec "${SOURCE_CONTAINER}" pg_dump \
  -U postgres \
  --dbname="${SOURCE_DB}" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --single-transaction \
  | gzip -9 > "${DUMP_FILE}"

echo "==> Snapshot created: ${DUMP_FILE} ($(du -h "${DUMP_FILE}" | cut -f1))"
echo "==> SHA256 Checksum: $(sha256sum "${DUMP_FILE}" | cut -d ' ' -f 1)"
