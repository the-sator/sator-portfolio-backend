# TODO
- [x] Refactor and move all auth to seperate table
  - [x] User
  - [x] Admin
  - [x] Site User
- [x] Add a mock we can mock the db for testing 
    - Create a db-test in prod or open another db remote (like supabase)
    - In dev, create another db, 
- [x] Better Http Response
  - Struture should be 
    + {errorCode, status, message, data}
  
- [x] Site User 
- [ ] Site Metric
- [ ] Regenerate API key
- [ ] 

# Backlog
- [ ] Add IP + Device column in session table 
- [ ] Fix Authentication in Frontend
- [ ] Fix TOTP


## Bug
- [x] Admin type in wrong credential still return true