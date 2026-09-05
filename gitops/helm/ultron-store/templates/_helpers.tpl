{{/*
Expand the name of the chart.
*/}}
{{- define "ultron-store.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "ultron-store.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "ultron-store.labels" -}}
helm.sh/chart: {{ include "ultron-store.name" . }}-{{ .Chart.Version | replace "+" "_" }}
{{ include "ultron-store.selectorLabels" . }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
environment: {{ .Values.environment | default "staging" }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "ultron-store.selectorLabels" -}}
app.kubernetes.io/name: {{ include "ultron-store.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app: {{ .Values.appName | default "inventory-service" }}
{{- end }}
