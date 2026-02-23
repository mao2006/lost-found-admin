PNPM ?= pnpm

.PHONY: install dev lint lint-fix build ssg clean

install:
	$(PNPM) install

dev:
	$(PNPM) dev

lint:
	$(PNPM) lint

lint-fix:
	$(PNPM) lint:fix

build:
	$(PNPM) build

ssg:
	$(PNPM) ssg
	@echo "SSG artifacts are in ./out"

clean:
	rm -rf .next out
