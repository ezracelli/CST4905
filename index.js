const Db = require('./db');
const Koa = require('koa');
const Router = require('@koa/router');

require('dotenv').config();

const app = new Koa();
const router = new Router();

app.context.db = new Db();

router.get('get students', '/api/students', async (ctx) => {
    await ctx.db.populate();
    ctx.response.body = ctx.db.toObject();
});

router.post('create student', '/api/students', async (ctx) => {
    const student = ctx.request.body;
    const id = student?.['CUNY ID'];

    if (isNaN(student['CUNY ID'] = +student['CUNY ID']))
        return void (ctx.response.status = 422);
    if (isNaN(student['GPA'] = +student['GPA']))
        return void (ctx.response.status = 422);

    if (await ctx.db.get(student['CUNY ID']))
        return void (ctx.response.status = 400);

    await ctx.db.set(+id, student);

    ctx.response.set('Location', router.url('update student', { id }));
    ctx.response.status = 201;
});

router.get('get student', '/api/students/:id', async (ctx) => {
    const student = await ctx.db.get(ctx.params.id);

    if (student) ctx.response.body = student;
    else ctx.response.status = 404;
});

router.put('update student', '/api/students/:id', async (ctx) => {
    const { Q1, Q2, Q3 } = ctx.request.body;
    const student = await ctx.db.get(ctx.params.id);
    if (!student) return void (ctx.response.status = 404);

    await ctx.db.set(ctx.params.id, Object.assign(student, { Q1, Q2, Q3 }));
    ctx.response.status = 204;
});

app
    .use(require('koa-body')())
    .use((ctx, next) => console.log(ctx.request) || next())
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(8000);
