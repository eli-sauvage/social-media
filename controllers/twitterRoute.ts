/*
 * GET home page.
 */
import * as express from 'express';
import * as model from '../models/twitter'
//import
export const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
    res.render('index', { title: 'Twitter', networkName : 'twitter'})
});

router.get('/data', async (req: express.Request, res: express.Response) => {
    res.send(await model.getStats().catch(e=>{
        // console.log(e)
        return {error:1, data:e.toString()||e}
    }))
})