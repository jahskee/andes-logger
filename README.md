
# @jahskee/andes-logger


## Installation:

  
**1. Add a new file .npmrc at the app root dir it should contain the line below:**
```
@jahskee:registry=https://npm.pkg.github.com
npm.pkg.github.com/:_authToken=[Your-Personal-Dev-Token]
```
**2. Install the module:**
```
npm install @jahskee/andes-logger@latest
```
## Usage:
**1. Please use one of the two options**

**Option 1: Setup in React's index.js**
```
        import { withRemoteLogger } from '@jahskee/andes-logger'
        
        function reactApp() {
        	/*------ original code ------*/
        	ReactDOM.render(
        	<React.StrictMode>
        	<App />
        	</React.StrictMode>,
        	document.getElementById('root')
        	);
        	serviceWorker.unregister();
        	/*------ original code ------*/
        }
        
        withRemoteLogger(reactApp, 'App-Name')
```

***Option 2: With Sentry, setup in React's index.js***

```
        import * as Sentry from '@sentry/browser'
        
        // Initialize Sentry.
        let entryDsn = process.env.REACT_APP_SENTRYKEY
        if (process.env.REACT_APP_ENV === 'development') {
          entryDsn = process.env.REACT_APP_SENTRYKEY_DEV
        } else if (process.env.REACT_APP_ENV === 'test') {
          entryDsn = process.env.REACT_APP_SENTRYKEY_STG
        }
        Sentry.init({ dsn: entryDsn })
        
        function reactApp() {
          /*------ original code ------*/
          ReactDOM.render(
            <Provider store={store}>
              <ErrorBoundary>
                <App />
              </ErrorBoundary>
            </Provider>,
            document.getElementById('root'),
          )
          unregister()
          /*------ original code ------*/
        }
        
        withRemoteLogger(reactApp, 'App-Name', Sentry)
```

**2. Populating the User MemberID and Email.**

```
        import andes_logger from '@jahskee/andes-logger'
        
        andes_logger.setMemberId(memberId)
        andes_logger.setEmail(email)
```

**3. How to view the Logger Dashboard?**
```
        Answer:  Example - https://tinyurl.com/y4u8e77z
```

**4. How to create logging message in my app?**
```
        Answer: 
         To send logs to remote dashboard is to simply use 
         console.log(..)
         console.warn(...)
         console.error(..)
```