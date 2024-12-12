![alt text](<docker -notes-1.png>)
Build Image :- `docker build -t auth-service:dev-v1 -f docker/dev/Dockerfile .`

Run a Container :- `docker run --rm -it -v $(pwd):/usr/src/app -v /usr/src/app/node_modules --env-file $(pwd)/.env.dev -p 8085:8085 -e NODE_ENV=development auth-service:dev-v1`

### Postgres

Pull the PostgreSQL Docker image :- `docker pull postgres`
Create a Persistent Volume :- `docker volume create authpgdata`

It creates a folder authpgdata in our system and now if docker container deletes for postgres we still have data and when it starts again we can use this data using persistent Volume

Run the PostgreSQL container with the volume attached :- `docker run --rm --name authpg-container -e POSTGRES_USER=root -e POSTGRES_PASSWORD=root -v authpgdata:/var/lib/postgresql/data -p 5432:5432 -d postgres`
