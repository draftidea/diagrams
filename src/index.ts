import {loadModel, showModel} from './controller';

let dbcnf = {
    host: "192.168.16.173",
    port: 3306,
    database: "emucoo-cfb",
    user: "emotwo",
    password: "emu2018two",
    multipleStatements: true,
    timeout: 30000 
};

loadModel(dbcnf, (err, model) => {
    if (err) {
        console.log(err);
    } else {
        if (model) {
            showModel(model);
        }
    }
});
