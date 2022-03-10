function N(d) {
	for (var result = 0.5, a = d * Math.exp(-d * d / 2) / (2 * Math.PI) ** .5, b = 1; a * a > 1e-40; a = a * d * d / (b += 2))
		result += a
	return result;
}

function invN(x) {
	if (x <= 0)
		return -9;
	else if (x >= 1)
		return 9;
	var a = -9, b = 9, m = 0, n = 1;
	for (var i = 0; i < 53; i++) {
		var c = (a + b) / 2, o = N(c);
		if (o < x)
			[a, m] = [c, o];
		else if (o > x)
			[b, n] = [c, o];
		else
			return c;
	}
	return (a + b) / 2;
}

function europeanCall(S, K, t, T, sigma, r, q) {
	var sigSqTt = sigma * (T - t) ** .5,
		d1 = (Math.log(S / K) + (r - q) * (T - t)) / sigSqTt + sigSqTt / 2,
		d2 = d1 - sigSqTt;

	return S * Math.exp(-q * (T - t)) * N(d1) - K * Math.exp(-r * (T - t)) * N(d2);
}

function europeanPut(S, K, t, T, sigma, r, q) {
	var sigSqTt = sigma * (T - t) ** .5,
		d1 = (Math.log(S / K) + (r - q) * (T - t)) / sigSqTt + sigSqTt / 2,
		d2 = d1 - sigSqTt;

	return K * Math.exp(-r * (T - t)) * N(-d2) - S * Math.exp(-q * (T - t)) * N(-d1);
}

function american(S, K, t, T, sigma, r, n, isCall) {
	var deltaT = (T - t) / n;
	var a = Math.exp(sigma * deltaT ** 0.5),
		p = (Math.exp(r * deltaT) - 1 / a) / (a - 1 / a);

	var memo = new Array(n + 1);
	for (var i = 0, j = S * a ** n; i <= n; i++, j /= a * a)
		memo[i] = Math.max(isCall ? j - K : K - j, 0);
	for (var i = n - 1; i >= 0; i--) {
		var temp = Array(i + 1);
		for (var j = 0; j <= i; j++)
			temp[j] = Math.exp(-r * deltaT) * (p * memo[j] + (1 - p) * memo[j + 1]);
		memo = temp;
	}

	return memo[0];
}

function gaCall(S, K, t, T, sigma, r, n) {
	var sigmaSqT = sigma * sigma * (n + 1) * (T - t) * (n + n + 1) / (6 * n * n),
		muT = ((r - sigma * sigma / 2) * (T - t) * (n + 1) / n + sigmaSqT) / 2,
		sigSqTt = sigmaSqT ** .5,
		d1 = (Math.log(S / K) + (muT + sigmaSqT / 2)) / sigSqTt,
		d2 = d1 - sigSqTt;

	return Math.exp(-r * (T - t)) * (S * Math.exp(muT) * N(d1) - K * N(d2));
}

function gaPut(S, K, t, T, sigma, r, n) {
	var sigmaSqT = sigma * sigma * (n + 1) * (T - t) * (n + n + 1) / (6 * n * n),
		muT = ((r - sigma * sigma / 2) * (T - t) * (n + 1) / n + sigmaSqT) / 2,
		sigSqTt = sigmaSqT ** .5,
		d1 = (Math.log(S / K) + (muT + sigmaSqT / 2)) / sigSqTt,
		d2 = d1 - sigSqTt;

	return Math.exp(-r * (T - t)) * (K * N(-d2) - S * Math.exp(muT) * N(-d1));
}

function D(S, K, t, T, sigma, r, q) {
	var sigSqTt = sigma * (T - t) ** .5,
		d1 = (Math.log(S / K) + (r - q) * (T - t)) / sigSqTt + sigSqTt / 2;

	return S * Math.exp(-q * (T - t)) * (T - t) ** .5 * Math.exp(-d1 * d1 / 2) / (2 * Math.PI) ** .5;
}

function implied(S, K, t, T, r, q, V, isCall) {
	var sigmaDiff = 1, 
		sigma = (2 * Math.abs((Math.log(S / K) + (r - q) * (T - t)) / (T - t))) ** .5,
		n = 0;

	while (sigmaDiff ** 2 > 1e-20) {
		if (++n > 1000) return NaN;
		sigma -= sigmaDiff = ([europeanPut, europeanCall][+isCall](S, K, t, T, sigma, r, q) - V) / D(S, K, t, T, sigma, r, q);
	}
	return sigma;
}

function normalRandom() {
	return invN(Math.random());
}