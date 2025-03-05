db:
	docker run --name sator-testing -p 6969:5432 -e POSTGRES_USER=root -e POSTGRES_PASSWORD=123456 -e POSTGRES_DB=test -d postgres

test: 
	bun run test

db-diff:
	$(eval DB_URL := $(shell cat .env | grep DATABASE_URL | cut -d '=' -f2))
	bun db-diff $(DB_URL)