# ============================================================================
# MONITORING & ALERTING MODULE — GCP TERRAFORM (PROJECT-1)
# Cloud Monitoring Dashboard & Alert Policies for GKE and Cloud SQL
# ============================================================================

resource "google_monitoring_alert_policy" "gke_high_cpu" {
  display_name = "ULTRON [${upper(var.environment)}] - GKE Pod High CPU (>85%)"
  project      = var.project_id
  combiner     = "OR"

  conditions {
    display_name = "GKE container CPU utilization exceeds 85%"
    condition_threshold {
      filter          = "metric.type=\"kubernetes.io/container/cpu/limit_utilization\" AND resource.type=\"k8s_container\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.85
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }

  documentation {
    content   = "GKE Pod CPU limits are operating near exhaustion. Verify HPA autoscaling thresholds or inspect rogue consumer processes."
    mime_type = "text/markdown"
  }
}

resource "google_monitoring_alert_policy" "cloudsql_disk_usage" {
  display_name = "ULTRON [${upper(var.environment)}] - Cloud SQL Disk Space (>80%)"
  project      = var.project_id
  combiner     = "OR"

  conditions {
    display_name = "Cloud SQL storage utilization exceeds 80%"
    condition_threshold {
      filter          = "metric.type=\"cloudsql.googleapis.com/database/disk/utilization\" AND resource.type=\"cloudsql_database\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.80
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }
}
