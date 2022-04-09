/*
 * GET insta page.
 */
import * as express from 'express';
import { createSession } from '../models/sessions';
//import

export const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
    res.render('connection')
});

router.get('/activate/:code', async (req: express.Request, res: express.Response) => {
    if (req.params.code == process.env.USERPASSWORD) {
        let session = await createSession()
        res.cookie("session", session.id, { expires: session.expiration })
    }
    res.redirect("/")
});
