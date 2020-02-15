const crypto = require('crypto');
const util = require('util');
const fetch = require('node-fetch');

const stringify = obj => new URLSearchParams(obj).toString();

class Paxful {
	baseUrl = 'https://paxful.com/api';
	requestHeaders = {
		'Content-Type': 'text/plain',
		'Accept': 'application/json; version=1'
	};
	apiKey;
	apiSecret;

	constructor(params = {}) {
		this.apiKey = params.apiKey;
		this.apiSecret = params.apiSecret;
		this.baseUrl = params.baseUrl || this.baseUrl;
		const headers = params.headers || {};
		for (const k in headers) {
			if (headers.hasOwnProperty(k))
				this.requestHeaders[k] = headers[k];
		}

		return new Proxy(this, {
			get: (target, name) => {
				return name in target ? target[name] : new Proxy({}, {
					get: (internalTarget, internalName) => {
						return async (p = {}) => this.request(`/${name}/${internalName}`, p);
					}
				});
			}
		});
	}

	async request(endpoint, payload = {}) {
		const res = await fetch(this.baseUrl + endpoint, {
			method: 'post',
			body: stringify(this.seal(payload)),
			headers: this.requestHeaders
		});
		const json = await res.json();
		if (json.status !== 'success') {
			console.error(util.inspect(json, false, null, true));
			throw new Error('Request error');
		}
		return json.data;
	}

	seal(payload) {
		if (!this.apiKey || !this.apiSecret)
			return payload;
		const payloadWithKey = Object.assign({}, payload, {
			apikey: this.apiKey,
			nonce: new Date().getTime()
		});
		return Object.assign(payloadWithKey, {
			apiseal: crypto.createHmac('sha256', this.apiSecret).update(stringify(payloadWithKey)).digest('hex')
		});
	}
}

module.exports = Paxful;