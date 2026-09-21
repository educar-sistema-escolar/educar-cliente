# Stage 1 administrative accounts

The Superadmin accounts screen uses Supabase Auth invitations through the `admin-provision-user` Edge Function.

The browser sends only the new user's name, email, and role. It never receives or stores a temporary password and never contains the Supabase service-role key.

Stage 1 supports account and role administration for `superadmin`, `teacher`, `student`, and `parent`. Only the Superadmin panel is implemented now; teacher, student, and parent portals remain future work.
