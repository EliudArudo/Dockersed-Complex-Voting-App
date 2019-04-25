> My Complex Voting App

> Docker Swarm version
### Docker Compose Test

Create an 'env' folder in the root of your project directory with the following files + content

##### manager.env
```bash
ADMIN_EMAIL=<YOUR_EMAIL>
ADMIN_PASSWORD=<YOUR_PASSWORD>
JWT_SECRET=<YOUR_JWT_SECRET>
JWT_EXPIRATION=<EXPIRY_TIME_IN_SECONDS>
VOTING_ACTIVE=<TRUE || FALSE>
```
##### worker.env
```bash
PGUSER=<POSTGRES_USERNAME>
PGPASSWORD=<POSTGRES_PASSWORD>
PGDATABASE=<PG_DATABASE_NAME>
MONGO_DB=<MONGODB_DATABASE_NAME>
```
##### postgres.env
```bash
# These should match with corresponding fields above
POSTGRES_PASSWORD=<POSTGRES_USERNAME>
POSTGRES_PASSWORD=<POSTGRES_PASSWORD>
POSTGRES_DB=<PG_DATABASE_NAME>
```


``` bash
#  Make sure you have Docker installed
# Clone the repo, and in the home dir of the cloned repo, run

$ docker-compose up
```

To check if all configurations were loaded correctly, use the below command to list the full docker-compose.yaml file
```bash
$ docker-compose config
```

From here, you can access the apps from 'http://localhost:80'