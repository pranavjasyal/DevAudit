import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'

// In-memory user store (replace with DB in production)
const users: Array<{ id: string; name: string; email: string; password: string; image?: string }> = []

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        action: { label: 'Action', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        if (credentials.action === 'signup') {
          const exists = users.find(u => u.email === credentials.email)
          if (exists) throw new Error('Email already in use')
          const hashed = await bcrypt.hash(credentials.password, 12)
          const user = {
            id: Math.random().toString(36).slice(2),
            name: credentials.name || credentials.email.split('@')[0],
            email: credentials.email,
            password: hashed,
          }
          users.push(user)
          return { id: user.id, name: user.name, email: user.email }
        }

        const user = users.find(u => u.email === credentials.email)
        if (!user) throw new Error('No account found with this email')
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) throw new Error('Incorrect password')
        return { id: user.id, name: user.name, email: user.email }
      },
    }),
    ...(process.env.GITHUB_CLIENT_ID ? [GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    })] : []),
    ...(process.env.GOOGLE_CLIENT_ID ? [GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })] : []),
  ],
  pages: {
    signIn: '/sign-in',
    newUser: '/dashboard',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'devaudit-secret-change-in-production',
}

const handler = NextAuth(authOptions as NextAuthOptions)
export { handler as GET, handler as POST }
