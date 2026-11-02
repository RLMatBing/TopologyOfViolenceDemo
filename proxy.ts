import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request:NextRequest){
 const password=process.env.ADMIN_PASSWORD;
 if(!password){
  if(process.env.NODE_ENV==="development"&&!process.env.VERCEL)return NextResponse.next();
  return new NextResponse("Admin access is not configured.",{status:503,headers:{"Cache-Control":"no-store"}});
 }
 const authorization=request.headers.get("authorization");
 const expected=`admin:${password}`;
 let valid=false;
 try{valid=Boolean(authorization?.startsWith("Basic ")&&atob(authorization.slice(6))===expected);}catch{/* malformed credentials */}
 if(!valid)return new NextResponse("Authentication required",{status:401,headers:{"WWW-Authenticate":'Basic realm="The Ascent Admin", charset="UTF-8"',"Cache-Control":"no-store"}});
 const response=NextResponse.next();response.headers.set("Cache-Control","private, no-store");return response;
}

export const config={matcher:["/admin/:path*","/api/sessions"]};
