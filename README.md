# Sator Portfolio Backend
Sator backend utilize Express in concord with Prisma. Please refer to [Prisma Docs](https://www.prisma.io/docs/orm/overview/introduction/what-is-prisma) for further detail on how it work.


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
Then, you will need to populate the table with Prisma migration via:
```bash
bun migrate
or
bunx prisma migrate dev
```
And then, seed the neccessary data into the db:
```bash
bunx prisma db seed
```
Then, it is done. You can now run the backend with:
```bash
bun dev
```


# Data Migration
Migration is a way for us to easily track our DB configuration (Read/Write). So each time we want to add new table or alter the table, we will need to make change to the `prisma.schema` file. Then run:
```bash
bun migrate --name {MIGRATION_NAME}
or
bunx prisma migrate dev e --name {MIGRATION_NAME}
```
(Optional) Once you run the migrate command, it should regenerate the prisma client and provide a type for us to use in the component and such, but if somehow the prisma client did not auto generate then you can run:
```bash
bunx prisma generate 
```

# Extra
Once you run the app, Prisma also provide a studio for you to easier view and edit the data. You can access that by running: 
```bash
bun studio
```


# Pledge
Please do not try to push any JavaScript code into the repo. We are a strictly Typesrcipt family. Any JS code pushed into the repo will be automatically rejected. Yes, I am talking about you [Vesondor](https://github.com/Vesondor)

