const jwt = require("jsonwebtoken");
require("dotenv").config();

// JWT Secret from Spring backend (HMAC-based: HS256/HS384/HS512)
// Spring often Base64-encodes the secret, so we need to decode it
const JWT_SECRET_RAW =
	process.env.JWT_SECRET ||
	"qoAEABDke07AVLepXB4aCMtsT0wMAqR5x2VFyldsnx6e75YQkJH2UcZKTjEyoNgG71SBCXfq5N6NVZxWOfsHQ123";

// Try to decode as Base64 if it looks like Base64 (Spring default behavior)
// If JWT_SECRET_IS_BASE64=true in .env, decode it; otherwise use as-is
let JWT_SECRET;
if (process.env.JWT_SECRET_IS_BASE64 === "true") {
	JWT_SECRET = Buffer.from(JWT_SECRET_RAW, "base64");
	console.log("✅ JWT_SECRET decoded from Base64");
} else {
	JWT_SECRET = JWT_SECRET_RAW;
	console.log("✅ JWT_SECRET used as plain string");
}

if (!JWT_SECRET) {
	console.warn(
		"⚠️  JWT_SECRET is not set in .env. Requests requiring auth will fail until you provide it.",
	);
}

module.exports = (req, res, next) => {
	try {
		const authHeader = req.headers.authorization || req.headers.Authorization;
		if (!authHeader) {
			return res
				.status(401)
				.json({ success: false, message: "Missing Authorization header" });
		}

		const parts = authHeader.split(" ");
		if (parts.length !== 2 || parts[0] !== "Bearer") {
			return res.status(401).json({
				success: false,
				message: "Invalid Authorization header format",
			});
		}

		const token = parts[1];

		// Verify token with Spring's secret (supports HS256/HS384/HS512)
		// If Spring uses RS256, uncomment and use JWT_PUBLIC_KEY instead
		const payload = jwt.verify(token, JWT_SECRET, {
			algorithms: ["HS256", "HS384", "HS512"], // Spring default algorithms
		});

		// Attach payload for downstream use
		// Spring JWT typically includes: sub (subject/username), exp, iat, authorities, etc.
		req.user = payload;
		next();
	} catch (err) {
		return res.status(401).json({
			success: false,
			message: "Invalid or expired token",
			error: err.message,
		});
	}
};
