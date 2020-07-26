# my-idea-pool
Arc Small Project - Back End

My Idea Pool is a service that records your ideas! After signing up for an account, users can log their ideas and assign them scores. Every idea contains 3 scores: Impact, Ease and Confidence. Each idea can be added, edited and deleted. All the ideas will be sorted by the average of all three scores in descending order (i.e., 8, 5, 4). Every API call will return 10 ideas. When not using the service, users can log out of the system.

# API Documentation 
The API documentation is available at endpoint /api-docs

With Domain-Driven Development architecture in mind:
 - **Presentation layer** - The API endpoints located in the ***src/routes*** folder 
 - **Services layer** - The Services that is called by the  presentation these are drivers that manage the data with the models these services are located ***src/services*** 
 - **Persistence layer** - This is the layer that talks to the database or storage located under ***src/persistence***
 - **Models** - The data description data structure of each domain. This contains the validation logic ***src/models***


Authentication is manage via json web tokens and needs to be a Bearer token in the header 'X-Access-Token'

For additional stack trace logging to be enabled with the error responses add the header 'x-debug-show-stack-trace' and set to true

# Environment variables

| Env var | description |
|----------|-------------------------------|
| DB_USERNAME | The MongoDB Database username. |
| DB_PASSWORD |The MongoDB user's password.|
| DB_HOST|The MongoDB host name.|
|DB_NAME|The Mongo database that the data will be stored in.|
|SECRET_KEY| The secret to salt the jwt and password in the database.|
|ACCESS_TOKEN_EXPIRES_IN| A indicator for the time the access tokens should be valid, this can be 1m (one minute), 10m (10 minutes), 1d (1 day).|  
|REFRESH_TOKEN_EXPIRES_IN| A integer number to indicate the hours for the refresh token to be valid.|