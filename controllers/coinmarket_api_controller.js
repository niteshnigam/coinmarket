const rp = require('request-promise');
function get() {
    return new Promise((resolve, reject) => {
        const requestOptions = {
            method: 'GET',
            uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
            qs: {
                'start': '1',
                'limit': '5000',
                'convert': 'USD'
            },
            headers: {
                'X-CMC_PRO_API_KEY': 'ae731da1-5909-4045-b40f-0fa213fdddd7'
            },
            json: true,
            gzip: true
        };

        rp(requestOptions).then(response => {
            // console.log('API call response:', response);
            resolve(response)
        }).catch((err) => {
            console.log('API call error:', err.message);
            reject(err);
        });
    })
}
module.exports = { get: get };
