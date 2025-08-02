import { verifyToken } from "../utils/jwtAuth.js";

export const jwtAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch {
    return res.status(403).json({ error: "Invalid token" });
  }
};
