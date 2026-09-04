# עולם הסקווישים של ליהי וארי

חנות סקווישים לילדים ב-Next.js, Tailwind ו-Supabase. הממשק בעברית ובכיוון RTL.

## הפעלה מקומית

1. העתיקו את `env.example` לקובץ `.env.local` ומלאו מפתחות סופאבייס.
2. בסופאבייס, הריצו את `supabase/schema.sql` ב-SQL Editor. אם הטבלאות כבר קיימות, הריצו גם `supabase/add-category.sql` כדי להוסיף עמודת קטגוריה.
3. התקינו והריצו:

```bash
npm install
npm run dev
```

פתחו [http://localhost:3000](http://localhost:3000).

## משתני סביבה

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — לכתיבה והעלאות מאזור הניהול בלבד

## ניהול

העמוד `/admin` נפתח עם אחת מהסיסמאות `020918` או `240421`. הקישור החיצוני של מוצר נשמר במסד הנתונים ומוצג רק בניהול — לא בחנות.
