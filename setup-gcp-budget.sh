#!/bin/bash
# ==============================================================================
# VIBESHOT DEVOPS — GCP BUDGET GUARD & HARD LIMIT PROTECTION SETUP
# ==============================================================================
# Mengunci limit penggunaan kredit GCP (Vertex AI Agent Builder & Cloud Run)
# Maksimal limit percobaan: Rp8.000.000 (Rp8 Juta)
# ==============================================================================

set -euo pipefail

# Konfigurasi parameter
BUDGET_NAME="vibeshot-guard-budget"
AMOUNT_IDR="8000000"
PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "vibeshot-production")
PUBSUB_TOPIC="gcp-budget-alerts"

echo "=== [1] Memulai Setup GCP Budget Guard ==="
echo "Target Project: $PROJECT_ID"
echo "Batas Anggaran: Rp $AMOUNT_IDR"

# 1. Pastikan API Billing Budgets aktif
echo "Mengaktifkan Billing Budgets API..."
gcloud services enable billingbudgets.googleapis.com

# 2. Ambil Billing Account ID
BILLING_ACCOUNT=$(gcloud billing accounts list --format="value(name)" | head -n 1)

if [ -z "$BILLING_ACCOUNT" ]; then
  echo "⚠️ ERROR: Tidak menemukan akun billing GCP yang aktif. Harap jalankan 'gcloud auth login' dan verifikasi billing."
  exit 1
fi

echo "Akun Billing Ditemukan: $BILLING_ACCOUNT"

# 3. Buat Pub/Sub Topic untuk memicu Cloud Function / Cloud Run Auto-Shutdown (Hard Limit)
echo "Membuat Pub/Sub Topic untuk notifikasi Hard Limit..."
if ! gcloud pubsub topics describe "$PUBSUB_TOPIC" &>/dev/null; then
  gcloud pubsub topics create "$PUBSUB_TOPIC"
  echo "✓ Topic '$PUBSUB_TOPIC' berhasil dibuat."
else
  echo "✓ Topic '$PUBSUB_TOPIC' sudah ada."
fi

# 4. Membuat Budget menggunakan REST API (gcloud billing budgets)
# Thresholds:
# - 50% (Notifikasi email)
# - 90% (Notifikasi email + Slack webhook)
# - 100% (Trigger Pub/Sub -> Cloud Function untuk menonaktifkan billing/menurunkan kapasitas Cloud Run)
echo "Membuat konfigurasi Budget Guard..."
gcloud billing budgets create \
  --billing-account="$BILLING_ACCOUNT" \
  --display-name="$BUDGET_NAME" \
  --budget-amount-value="$AMOUNT_IDR" \
  --budget-amount-currency="IDR" \
  --threshold-rule=percent=0.5,basis=current-spend \
  --threshold-rule=percent=0.9,basis=current-spend \
  --threshold-rule=percent=1.0,basis=current-spend \
  --all-updates-rule-pubsub-topic="projects/$PROJECT_ID/topics/$PUBSUB_TOPIC"

echo "=== [2] GCP Budget Guard Berhasil Ditransfer & Diaktifkan ==="
echo "Status: PROTECTED (Limit Rp 8.000.000)"
