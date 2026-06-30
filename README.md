# FASA Awards 2026 â€” Voting Platform

A full-stack MERN voting platform for the Faculty of Arts Student Association, University of Benin.
All 26 official award categories are built-in. Payments via Paystack.

## Award Categories (26)
1. Most Social Male  2. Most Social Female  3. Course Rep of the Year
4. Most Popular FASAN Male  5. Most Popular FASAN Female
6. Sportsman of the Year  7. Sportswoman of the Year
8. Most Influential FASAN Male  9. Most Influential FASAN Female
10. Departmental President of the Year  11. Senator of the Year
12. Parliamentarian of the Year  13. Content Creator of the Year
14. Fashion Icon Male  15. Fashion Icon Female
16. Most Creative FASAN  17. Most Talented FASAN
18. Artist of the Year  19. Political Personality of the Year
20. Entrepreneur of the Year  21. Brand of the Year
22. Executive of the Year  23. Academic Excellence Award Male
24. Academic Excellence Award Female  25. Most Active Fresher
26. Department of the Year

## Tech Stack
- Frontend: React 18, Vite, Redux Toolkit + RTK Query, React Router v7
- Styling: Tailwind CSS, Google Fonts (Inter + Playfair Display)
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Auth: JWT (jsonwebtoken + bcryptjs)
- Payments: Paystack

## What's new in v3
- All 26 official FASA Awards 2026 categories built in, selectable when creating an event
- Auto-generated unique candidate numbers per event (FASA-0001, FASA-0002, ...)
- Organizers can create, edit, and delete candidates for their own events (not just admin)
- Brand new homepage: animated hero, full category showcase with group filters, live events, how-it-works section
- Category group filter tabs on the public events page

## Setup
1. cd backend && npm install && copy .env.example .env
2. cd ../frontend && npm install && copy .env.example .env
3. cd ../backend && npm run seed
4. Terminal 1: cd backend && npm run dev
5. Terminal 2: cd frontend && npm run dev
6. Open http://localhost:5173

## Credentials (after seed)
Admin:     admin@fasaawards.site    / Admin@1234
Organizer: organizer@fasaawards.site / Organizer@1234