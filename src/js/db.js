import Datastore from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'

import fs from 'fs-extra'
import path from 'path'
import { app, remote } from 'electron' // 引入remote模块

import { config } from './data_sample'

const APP = process.type === 'renderer' ? remote.app : app // 根据process.type来分辨在哪种模式使用哪种模块
const STORE_PATH = APP.getPath('userData') // 获取electron应用的用户目录

console.log(STORE_PATH)

export class DBManager {
    constructor() {

    }

    getConfigDB() {
        let configDB = this.getDB(path.join(STORE_PATH, '/config.json'));
        if (!configDB.has('init_status').value()) { // 先判断该值存不存在
            configDB.defaults(config)
                .write()
        }
        return configDB;
    }

    getDB(path) {
        let dbAdapter = new FileSync(path);
        let db = Datastore(dbAdapter);
        return db;
    }

    existsDB(path) {
        if (!fs.pathExistsSync(path)) { // 如果不存在路径
            fs.mkdirpSync(path) // 就创建
        }
    }
}