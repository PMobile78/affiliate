Local Development
    > export development=staging
    > nodemon index.js
    > authentication (http://localhost:4000/get-token)
        Step1: PostMan (POST request)
                - Body:
                {
                    "email": "",
                    "password": ""
                }
        Step2: Graphql
                - HTTP HEADERS:
                {
                    "Authorization": "Bearer <PLACE TOKEN HERE>"
                }

    > http://localhost:4000/graphql
