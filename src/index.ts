import {loadModel, showModel, showPage} from './controller';

let dbcnf = {
    host: "192.168.16.173",
    port: 3306,
    database: "emucoo-cfb",
    user: "emotwo",
    password: "emu2018two",
    multipleStatements: true,
    timeout: 30000 
};

let page = showPage();

loadModel('a.json', (err, model) => {
    if (err) {
        console.log(err);
    } else {
        if (model) {
            showModel(page.paper, model);
        }
    }
});
