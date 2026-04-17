# Sator Portfolio Backend
Sator backend uses Express, TypeScript, Bun, Postgres, and Drizzle ORM.


# Postgres Setup
This project make use of Postgres, so you will need to start a postgres db. There are many ways to do this but the method that I prefer is through Docker (fast & easy).
To get started, pull the postgres image:
```bash
docker pull postgres
```
Then, start the instance:
```bash
docker run --name {{CONTAINER_NAME}} -p {{PORT}}:5432 -e POSTGRES_USER={{USERNAME}} -e POSTGRES_PASSWORD={{PASSWORD}} -d {{DB_NAME}}
```
Then it's done🎉🎉, just add the db info to the env and if you need a GUI to view your db, you can use [Table Plus](https://tableplus.com/) (Recommended) or pgAdmin 


# Project Setup
The backend go all in on *bun* as it is way faster than both npm and yarn and has more community support than pnpm. Since we use both Typescript and ESM module, Bun seem to be the fastest and easier to run.
To get started, run:
```bash
bun install
```
Then, apply the database schema with Drizzle:
```bash
bun run db:push
```
And then, seed the necessary data into the db:
```bash
bun run db:seed
```
Then, it is done. You can now run the backend with:
```bash
bun dev
```


# Data Migration
Migration is a way for us to track DB configuration changes. When you add or alter tables, update the Drizzle schema in `src/db/schema`, then generate and apply a migration:
```bash
bun run db:gen
bun run db:migrate
```

# Extra
You can inspect and edit the database with Drizzle Studio:
```bash
bun run studio
```


# Pledge
Please do not try to push any JavaScript code into the repo. We are a strictly Typesrcipt family. Any JS code pushed into the repo will be automatically rejected. Yes, I am talking about you [Vesondor](https://github.com/Vesondor)
