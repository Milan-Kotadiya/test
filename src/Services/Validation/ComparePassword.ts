import crypto from "crypto";

export const comparePassword = (
  password: string,
  hash: string,
  salt: string
) => {
  const newHash: string = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return newHash === hash;
};
