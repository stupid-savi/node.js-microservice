![alt text](<docker -notes-1.png>)
Build Image :- `docker build -t auth-service:dev-v1 -f docker/dev/Dockerfile .`

Run a Container :- `docker run --rm -it -v $(pwd):/usr/src/app -v /usr/src/app/node_modules --env-file $(pwd)/.env -p 8085:8085 -e NODE_ENV=development auth-service:dev-v1`
