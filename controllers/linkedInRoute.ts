/*
 * GET home page.
 */
import * as express from 'express';
import * as model from '../models/linkedin'


//import
export const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
    res.render('index', { title: 'LinkedIn', networkName: 'linkedin' })//JSON.stringify(stats)});
});

router.get('/data', async (req: express.Request, res: express.Response) => {
    res.send(await model.getStats().catch(e=>{return {error:1, data:e}}))
})