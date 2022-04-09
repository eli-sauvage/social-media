/*
 * GET home page.
 */
import * as express from 'express';
import * as model from '../models/linkedin'


//import
export const router = express.Router();

// router.get('/', async (req: express.Request, res: express.Response) => {
//     res.render('index', { title: 'LinkedIn', networkName:  'linkedin', host:process.env.HOST })//JSON.stringify(stats)});
// });

router.get('/table', async (req: express.Request, res: express.Response) => {
    res.render('table', { title: 'LinkedIn', networkName:  'linkedin', host:process.env.HOST })//JSON.stringify(stats)});
});
router.get('/data', async (req: express.Request, res: express.Response) => {
    res.send(await model.getCache().catch(e=>{return {error:1, data:e}}))
    // res.send(await model.getStats().catch(e=>{return {error:1, data:e}}))
})