# TODO
- [ ] Refactor the login process
  - Upon login, save user auth id and info in redis
  - When user query for credential check in cache
    - If exist: serve cache
    - Else: Query user -> save in cache
  - Upon logout, delete the cache + delete the session
  
- [ ] Add IP + Device column in session table