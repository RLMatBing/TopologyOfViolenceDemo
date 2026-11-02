export function makeCode(){return Array.from(crypto.getRandomValues(new Uint8Array(6)),n=>"ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[n%32]).join("");}
