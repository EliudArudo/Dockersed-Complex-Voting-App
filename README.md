> My Complex Voting App

> Docker Swarm version
### Docker Compose Test
Working with ```docker-compose.yaml```\
Create an 'env' folder in the root of your project directory with the following files + content

##### manager.env
```bash
ADMIN_EMAIL=<YOUR_EMAIL>
ADMIN_PASSWORD=<YOUR_PASSWORD>
JWT_SECRET=<YOUR_JWT_SECRET>
JWT_EXPIRATION=<EXPIRY_TIME_IN_SECONDS>
VOTING_ACTIVE=<true || false>
```
##### worker.env
```bash
PGUSER=<POSTGRES_USERNAME>
PGPASSWORD=<POSTGRES_PASSWORD>
PGDATABASE=<PG_DATABASE_NAME>
# Should be same as your mongodb service 'MONGO_DB' variable
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

### Docker Stack 
Working with ```docker-stack.yaml```\
You can choose between two options
1. Load your environment variables through the env files mentioned above\
For manager, worker and postgres services, uncomment the respective ```env_file: ./env/<service>.env```, eg:
```
// Commented env_file import for manager
# env_file: ./env/manager.env

// Uncommented
env_file: ./env/manager.env
```

2. Load / Update your service environment variables manually using 
```
$ docker service update --env-add key=value <SERVICE-ID/>NAME>
```
Deploy your stack using 
```
$ docker stack  deploy -c docker-stack.yaml <YOUR-STACK_NAME>
```

To find the service ID or name, list all the services in your docker stack using the below command
```
$ docker stack ps
```
Now update the environment variables of the named services (or your choice of services) using the below code\
Disclaimer: To update any of env variable previously added, you have to remove it first using 
```
$ docker service update --env-rm key 
```
Now proceeding
```
# manager
$ docker service update --env-add ADMIN_EMAIL=<YOUR_EMAIL> --env-add ADMIN_PASSWORD=<YOUR_PASSWORD> --env-add JWT_SECRET=<YOUR_JWT_SECRET> --env-add JWT_EXPIRATION=<EXPIRY_TIME_IN_SECONDS> --env-add VOTING_ACTIVE=<true || false> <MANAGER-SERVICE-ID>

# worker
$ docker service update --env-add PGUSER=<POSTGRES_USERNAME> --env-add PGPASSWORD=<POSTGRES_PASSWORD> --env-add PGDATABASE=<PG_DATABASE_NAME> --env-add MONGO_DB=<MONGODB_DATABASE_NAME> <WORKER-SERVICE-ID>

# postgres
$ docker service update --env-add POSTGRES_USER=<POSTGRES_USERNAME>
--env-add POSTGRES_PASSWORD=<POSTGRES_PASSWORD>
--env-add POSTGRES_DB=<PG_DATABASE_NAME> <POSTGRES-SERVICE-ID>
```
Check if all the services are running correctly, expecially 'worker' service
through checking the logs
```
$ docker service logs <SERVICE-ID>
# If there's a postgress / mongodb connection error, enter the update command a second time, checking whether the databases have coonected correctly
```


### Multi-node cluster
``` bash
# In your local machine - make sure you have 8GB RAM and above
# For windows
# Create two or more machines, as the main docker vm cannot speak to these created docker-machines
$ docker-machine create --driver hyperv --hyperv-virtual-switch <your-virtual-switch> <node-name>

# ssh into your created vm
$ docker-machine ssh <node-name>

# Initialise your docker swarm, and use join tokens to add nodes
$ docker swam init
# Promote a worker from your leader node
$ docker node update --role manager <node-name>

# Create our overlay networks, eg 'frontend', 'backend'
$ docker network create --driver overlay <network-name>

// Docker networks for this project

$ docker network create --driver overlay frontend
$ docker network create --driver overlay backend

// Docker networks for this project

# Add services to the networks
# Note, assign right environment variables to each service as in docker.stack.yaml
# Node, aliases are important when using nginx, or env variables such as MONGODB=mongodb
# Important, open up port to front end services only
# Follow the docker.stack.yaml schematics for this - env variables and aliases are most important, + ports to frontend services

$ docker service create --name <service-name> -p 80:80 --alias <alias-name> --network <network-name> -e <env-variables>=<env-value> -e <env-variables>=<env-value> <image>

// Docker services for this project
--- Frontend clients ---
#voter
$ docker service create --name voter -p 3000 --network frontend eliudarudo/complex-voting-app-voter

#admin
$ docker service create -d --name admin --network frontend --publish 3001 eliudarudo/complex-voting-app-admin

#results
$ docker service create --name results -p 3002 --network frontend eliudarudo/complex-voting-app-results
 
 
-- Databases Init --- 
#redis -- Manager uses redis
$ docker service create --name redis -p 6379 --network backend redis:latest 

#mongodb -- used by worker
$ docker service create --name mongodb -p 27017 --network backend mongo:latest 


#postgres -- used by worker
$ docker service create --name postgres -p 5432 --network backend -e POSTGRES_USER=<POSTGRES_USERNAME> -e POSTGRES_PASSWORD=<POSTGRES_PASSWORD> -e POSTGRES_DB=<PG_DATABASE_NAME> postgres:latest postgres 

#worker
$ docker service create --name worker -e REDIS_HOST=redis -e REDIS_PORT=6379 -e MONGO_URI=mongodb -e MONGO_PORT=27017 -e MONGO_DB=voter_data -e PGHOST=postgres -e PGPORT=5432 -e PGUSER=<POSTGRES_USERNAME> -e PGPASSWORD=<POSTGRES_PASSWORD> -e PGDATABASE=<PG_DATABASE_NAME> --network backend eliudarudo/complex-voting-app-worker 

#manager
$ docker service create --name manager -p 3004 -e REDIS_HOST=redis -e REDIS_PORT=6379 -e WSSERVER=wsserver -e ADMIN_EMAIL=<YOUR_EMAIL> -e ADMIN_PASSWORD=<YOUR_PASSWORD> -e JWT_SECRET=<YOUR_JWT_SECRET> -e JWT_EXPIRATION=<EXPIRY_TIME_IN_SECONDS> -e VOTING_ACTIVE=<true || false> --network frontend --network backend eliudarudo/complex-voting-app-manager

#wsserver
$ docker service create --name wsserver -p 3003 -e MANAGER=manager --network frontend eliudarudo/complex-voting-app-ws-server


--- Should be the last, to find other services ---
# nginx
$ docker service create --name nginx -p 80:80 --network frontend eliudarudo/complex-voting-app-nginx 

// Docker services for this project

# Check processes running in a service
$ docker service ps <service-name>

# Update config of the services, eg, add replicas/ scale up/down a service
$ docker service update <service-name> --replicas=<number>

# Clear all our services
$ docker service rm <service-1> <service-2> ...

# Leaving is tricky for managers, as they have our credentials, so we have to demote them first
$ docker node demote <manager-node>

# Then they can leave - veryone has to leave to clear
$ docker swarm leave

# Then we as the Leader, can remove them
$ docker node rm <node-name>

# Get out of ssh'ed server 'Ctrl + D'

# Delete the nodes in case of local env
$ docker-machine rm <node-name>

```

> Kubernetes version
Please make sure your 'kubectl' is working correctly and connected to your local k8s cluster
```
# First, cd into k8s folder 
$ cd k8s

# Initialise the k8s configuration files from two folders 'Initial Setup', then 'Other Setups'
$ kubectl apply -f 'Initial Setup' && kubectl apply -f 'Other Setups'

# Check the status of your initialised pods using
$ kubectl get pods

# To check the logging for a specifi pod, get the id of the pod you're interested in using the immediate command shown above, then using the id,
$ kubect logs <POD-ID>

# To scale up a deployment
kubectl scale --replicas=<NUMBER> deployment/<DEPLOYMENT-NAME>
```


Access clients from these urls:
Voter: 'http://localhost:80/voter/'
Admin: 'http://localhost:80/admin/'
Results: 'http://localhost:80/results/'

