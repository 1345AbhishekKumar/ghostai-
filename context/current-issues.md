Specs List Error: TypeError: Cannot read properties of undefined (reading 'findMany')
    at GET (app\api\projects\[projectId]\specs\route.ts:22:44)
  20 |
  21 |     // 2. Fetch specs for the project
> 22 |     const specs = await prisma.projectSpec.findMany({
     |                                            ^
  23 |       where: {
  24 |         projectId: projectId,
  25 |       },
 GET /api/projects/landing-page-9f5a3a/specs 500 in 1312ms (next.js: 129ms, proxy.ts: 47ms, application-code: 1136ms)
Specs List Error: TypeError: Cannot read properties of undefined (reading 'findMany')
    at GET (app\api\projects\[projectId]\specs\route.ts:22:44)
  20 |
  21 |     // 2. Fetch specs for the project
> 22 |     const specs = await prisma.projectSpec.findMany({
     |                                            ^
  23 |       where: {
  24 |         projectId: projectId,
  25 |       },
 GET /api/projects/landing-page-9f5a3a/specs 500 in 904ms 