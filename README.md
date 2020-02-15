# Paxful API wrapper

This is a Proxy based [Paxful API](https://paxful.readthedocs.io/) wrapper.
It doesn't describe any methods, it just magically turns methods calls like `px.user.me()` into http request to `/api/user/me`.

### Installation
```
npm i @msdjl/pxapi
```

### Usage
```javascript
const px = new (require('@msdjl/pxapi'))({apiKey: 'apiKey', apiSecret: 'apiSecret'});

// Some endpoints do not require authentication. You can omit the "apiKey" and "apiSecret" params
const pxNoAuth = new (require('@msdjl/pxapi'))();

// You can change the API's base URL and append/override request headers if you want
const pxSpecialDomainWithAuth = new (require('@msdjl/pxapi'))({
    apiKey: 'apiKey',
    apiSecret: 'apiSecret',
    baseUrl: 'https://special.domain.com/api',
    headers: {
        'Authorization': 'Basic auth',
        'Accept': 'application/json; version=2'
    }
});

(async () => {
    console.log(await px.trade.completed({ page: 2 }));
    console.log(await pxNoAuth.currency.rates());
})();
```