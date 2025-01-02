import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      // Attach the user's Google ID and other data to the session
      if (token?.id) {
        
        (session.user as { id: string }).id = token.id as string;
      }
      if (token?.id) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
});