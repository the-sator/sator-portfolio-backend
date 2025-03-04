## 12.02.2025
1. Currently the result of authentication is a bit too redundant, on `getAuth`, the session is in another envelope entirely. 
    ```
    {
        data: {
            auth, 
            session,
        }
    }
    ```
    Could it be simplified?
    #### Pro
    - Make authentication easier
    #### Con
    - Need to refactor alot of place if simplified
    #### Solution
    - Unified auth and session
     ```
    {
        data: {
            auth, 
        }
    }
    ``` 
2. Since `getAuth` also return `session`, there is no way to refactor it since in cache we only store the user info (as intended)  
   #### Solution
   _**Solve with problem 1**_


3. Site user have the ability to CRUD blog, portfolio and view statistic
    - User should see their own website in the main website dashboard. In there, they should see an API key, They can grab that API key (acts like a master key) and create new account when they first login or register on their site dashboard.
    - Upon new site creation, we create a site user account with default username, email & password, then attach the ID or client ID onto the site with config, thus bounding the website to that particular user only. 