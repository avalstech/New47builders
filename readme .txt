Backend wiring points (where this connects to AWS)

Current project status
Endpoint: GET /artisan/me/project and POST /artisan/me/project/update
Storage: DynamoDB table Projects, updates stored as append-only ProjectUpdates (audit trail)

Job search
Endpoint: GET /jobs?skill=tiling&city=lagos&budget=mid
Storage: DynamoDB Jobs with GSI on city and skill

Job invites
Endpoint: GET /artisan/me/invites and POST /invites/{id}/accept|decline

Messages
Endpoint: GET /threads, GET /threads/{id}, POST /threads/{id}/messages
Storage: DynamoDB Threads and Messages (or single-table design)

Turn on location
Endpoint: POST /artisan/me/location with { enabled, lat, lng, accuracy }
Use Cognito identity and store last-known location with TTL if you want privacy

Account balance
Endpoint: GET /wallet and POST /wallet/withdraw
Storage: ledger model (recommended) instead of overwriting balance