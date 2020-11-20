const crypto = require('crypto');
const util = require('util');
const fetch = require('node-fetch');

const stringify = obj => new URLSearchParams(obj).toString();

const isString = value => typeof value === 'string' || value instanceof String;

const encodeString = str => {
	return encodeURIComponent(str).replace(/[!'()*]/g, c => {
		return '%' + c.charCodeAt(0).toString(16);
	});
};

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
						const modifiedName = internalName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
						return async (p = {}) => this.request(`/${name}/${modifiedName}`, p);
					}
				});
			}
		});
	}

	async request(endpoint, payload = {}) {
		const encodedString = JSON.parse(JSON.stringify(payload));
		for (const key of Object.keys(encodedString)) {
			if (isString(encodedString[key])) {
				encodedString[key] = encodeString(encodedString[key]);
			}
		}
		const res = await fetch(this.baseUrl + endpoint, {
			method: 'post',
			body: stringify(this.seal(payload)),
			headers: this.requestHeaders
		});
		let text, json;
		try {
			text = await res.text();
		} catch (e) {
			console.error('Unable to get the response text');
			throw e;
		}
		try {
			json = JSON.parse(text);
		} catch (e) {
			console.error('Unable to parse the response text to json. The text is:');
			console.error(text);
			throw e;
		}
		if (json.status !== 'success') {
			console.error(util.inspect(json, false, null, true));
			throw new Error(`Response status: ${json.status}`);
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