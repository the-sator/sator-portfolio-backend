# TODO
- [x] Refactor and move all auth to seperate table
  - [x] User
  - [x] Admin
  - [x] Site User
- [ ] Add a mock we can mock the db for testing 
    - Create a db-test in prod or open another db remote (like supabase)
    - In dev, create another db, 
- [ ] Better Http Response
  - Struture should be 
    + {errorCode, status, message, data}
  
- [ ] Add IP + Device column in session table



## Bug
- [ ] Admin type in wrong credential still return true