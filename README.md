# <img width="30" height="30" alt="CMUService_Logo-removebg-preview" src="https://github.com/user-attachments/assets/7fd2ec85-d490-451f-948a-8e4d64946739" /> CMUService

[Updated 11.02.2025]

_by ScottyLabs_

CMU Service connects students to trade skills or services without money, making it easy to post, search, and swap help on campus.

Contributor: Eric, Ben, Emma, Lynn, Luna, Ruby

**Getting Start**

NOTE: Require Stripe and Supabase ANON Key and Project URL to run most updated version locally.

Go to https://cmu-service-6zz5.vercel.app/ for an earlier version

To run locally, clone project:

```bash
git clone https://github.com/scottylabs-labrador/CMUService.git

cd cmuservice
```

Install all required project dependencies:

```bash
npm install
```

Create a file named `.env.local` in the root of the project and add the following lines:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then run the development server:

```bash
npm run dev

```

Your app will be live at http://localhost:3000
