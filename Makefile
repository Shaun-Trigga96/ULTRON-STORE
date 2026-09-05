# ==============================================================================
# ULTRON Store - Developer & DevOps Automation Makefile
# ==============================================================================

.PHONY: help init dev-up dev-down lint test tf-init tf-plan-dev tf-apply-dev tf-plan-prod gitops-sync docker-build

SHELL := /bin/bash
PROJECT_ID ?= $(shell gcloud config get-value project 2>/dev/null || echo "ultron-store-dev")
REGION ?= us-central1

help: ## Show this help message
	@echo "ULTRON Store - Available Automation Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

init: ## Initialize repository folders and verify developer dependencies
	@chmod +x init_repo.sh
	@./init_repo.sh

dev-up: ## Start local emulation stack with Docker Compose
	@echo "Starting local ULTRON store microservices..."
	docker compose -f docker-compose.local.yml up -d

dev-down: ## Stop local emulation stack
	docker compose -f docker-compose.local.yml down -v

lint: ## Run linters across services and Terraform
	@echo "Checking Terraform formatting..."
	terraform fmt -check -recursive infrastructure/terraform || true
	@echo "Linting Kubernetes manifests with kubeconform..."
	@which kubeconform >/dev/null 2>&1 && kubeconform -summary k8s/ || echo "kubeconform not installed, skipping"

test: ## Execute unit and integration tests across services
	@echo "Running unit tests for services..."
	@for service in inventory-service catalog-service order-service payment-service; do \
		echo "Testing $$service..."; \
		if [ -f services/$$service/package.json ]; then \
			(cd services/$$service && npm test --if-present); \
		fi; \
	done

tf-init: ## Initialize Terraform with remote backend
	cd infrastructure/terraform && terraform init

tf-plan-dev: ## Plan Terraform deployment for staging/dev
	cd infrastructure/terraform && terraform plan -var-file="environments/dev.tfvars"

tf-apply-dev: ## Apply Terraform infrastructure to staging/dev
	cd infrastructure/terraform && terraform apply -var-file="environments/dev.tfvars" -auto-approve

tf-plan-prod: ## Plan Terraform deployment for production
	cd infrastructure/terraform && terraform plan -var-file="environments/prod.tfvars"

gitops-sync: ## Force ArgoCD sync for staging applications
	@which argocd >/dev/null 2>&1 && argocd app sync ultron-store-staging || echo "argocd CLI not installed"

docker-build: ## Build container images locally
	docker build -t ultron-inventory:latest services/inventory-service
	docker build -t ultron-catalog:latest services/catalog-service
	docker build -t ultron-order:latest services/order-service
	docker build -t ultron-payment:latest services/payment-service
