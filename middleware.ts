import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const routeProtegee = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, requete) => {
  if (routeProtegee(requete)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
