.PHONY: test
test: check-ts check-es jest

.PHONY: check-ts
check-ts:
	@set -eu; status=0; \
	echo 'Verifying TypeScript'; \
	NODE_OPTIONS="--max-old-space-size=5000" npx tsc --noEmit --skipLibCheck -p ./tsconfig.json || status=1; \
	echo 'Verification finished'; \
	exit $$status;

.PHONY: check-es
check-es:
	@set -eu; \
	echo 'Linting via ESLint'; \
	NODE_OPTIONS="--max-old-space-size=5000" npx eslint ./src --ext .ts,.tsx,.js

.PHONY: jest
jest:
	npx jest --no-cache --env node

.PHONY: build-server
build-server:
	@echo 'Building'
	@rm -rf build/server
	@npx tsc -p ./tsconfig.server.json
	@npx copyfiles -e '**/*.ts' -e '**/.gitkeep' -e '**/tsconfig.json' -u 2 -a 'src/server/**/*.*' build/server

.PHONY: docker-server
docker-server:
	@TARGET=server sh ./tools/docker-build-version.sh

.PHONY: build-static
build-static:
	@echo 'Building web app'
	@rm -rf build/web
	@ENTRY=web PRODUCTION=true npm run build-static
	@echo 'Building admin app'
	@rm -rf build/admin
	@ENTRY=admin PRODUCTION=true npm run build-static

.PHONY: docker-static
docker-static:
	@TARGET=static sh ./tools/docker-build-version.sh

.PHONY: docker
docker: build-static docker-static build-server docker-server

.PHONY: deploy
deploy:
	@if [ -z "$(ENV)" ]; then \
		echo "provide ENV"; \
		exit 1; \
	fi
	helm upgrade app tools/helm/assist -n $(ENV) \
		-f tools/helm/values.$(ENV).yaml \
		--set envConfig="${ENV_CONFIG}" \
		--set baseVersion="${VERSION}" \
		#  --dry-run --debug

.PHONY: run-script
run-script:
	npx cross-env TS_NODE_PROJECT=src/server/tsconfig.json ts-node -r tsconfig-paths/register tools/scripts/${SCRIPT}/index.ts
