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
    ### Pro
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


