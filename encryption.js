import crypto from "crypto";
const algorithm = "aes-256-cbc";
const algorithmDES = "des-ecb";
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

export const AESencrypt = (text) => {
   let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
   let encrypted = cipher.update(text);
   encrypted = Buffer.concat([encrypted, cipher.final()]);
   return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
};

export const AESdecrypt = (text) => {
   let iv = Buffer.from(text.iv, "hex");
   let encryptedText = Buffer.from(text.encryptedData, "hex");
   let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
   let decrypted = decipher.update(encryptedText);
   decrypted = Buffer.concat([decrypted, decipher.final()]);
   return decrypted.toString();
};

export const DESencrypt = (txt) => {
   // use a hex key here
   const text = txt.toString();
   const k = Buffer.from("d0e276d0144890d3", "hex");
   const cipher = crypto.createCipheriv(algorithmDES, k, null);
   let encrypted = cipher.update(text, "utf8", "hex");
   encrypted += cipher.final("hex");
   return encrypted;
};

export const DESdecrypt = (encrypted) => {
   const k = Buffer.from("d0e276d0144890d3", "hex");
   const decipher = crypto.createDecipheriv(algorithmDES, k, null);
   let decrypted = decipher.update(encrypted, "hex", "utf8");
   decrypted += decipher.final("utf8");
   return decrypted;
};

// var hw = aesDes.AESencrypt("Some serious stuff")
// console.log(hw)
// console.log(aesDes.AESdecrypt(hw))

// var desty = aesDes.DESencrypt("going to school")
// console.log(desty)
// console.log(aesDes.DESdecrypt(desty))
