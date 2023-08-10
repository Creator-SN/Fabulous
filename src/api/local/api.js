import Datastore from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'

// import fs from 'fs-extra'
import path from 'path'
import { app } from 'electron' // 引入remote模块
import * as remote from "@electron/remote"

import { config, data_path_item, data_structure, group as Group, partition as Partition, item as Item, metadata as Metadata, page as Page } from "@/js/data_sample";

const APP = process.type === 'renderer' ? remote.app : app // 根据process.type来分辨在哪种模式使用哪种模块
const STORE_PATH = APP.getPath('userData') // 获取electron应用的用户目录

console.log(STORE_PATH)

const { ipcRenderer: ipc } = require("electron");
const { dialog } = require("@electron/remote");

class DBManager {
    getDB(path) {
        let dbAdapter = new FileSync(path);
        let db = Datastore(dbAdapter);
        return db;
    }

    getConfigDB() {
        let configDB = this.getDB(path.join(STORE_PATH, '/config.json'));
        if (!configDB.has('init_status').value()) { // 先判断该值存不存在
            configDB.defaults(config)
                .write()
        }
        return configDB;
    }

    getDataDB(dir) {
        let dataDB = this.getDB(path.join(dir, '/data_structure.json'));
        return dataDB;
    }
}

class Tools {
    static $Guid() {
        let guidFunc = () => {
            function S4() {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }
            return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
        }
        let guid = guidFunc();
        guid = guid.split('-')[0];
        return guid;
    }

    static $DateFormat(fmt, Date) {
        let ret;
        const opt = {
            "Y+": Date.getFullYear().toString(),        // 年
            "m+": (Date.getMonth() + 1).toString(),     // 月
            "d+": Date.getDate().toString(),            // 日
            "H+": Date.getHours().toString(),           // 时
            "M+": Date.getMinutes().toString(),         // 分
            "S+": Date.getSeconds().toString()          // 秒
            // 有其他格式化字符需求可以继续添加，必须转化成字符串
        };
        for (let k in opt) {
            ret = new RegExp("(" + k + ")").exec(fmt);
            if (ret) {
                fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
            }
        }
        return fmt;
    }

    static inteliSort(target, key = 0, desc = false) {
        if (target.length === 0) return;
        let getProperty = (obj, key) => {
            if (obj[key]) return obj[key];
            const keys = key.split('.');
            let value = obj;

            for (let i = 0; i < keys.length; i++) {
                if (!Object.prototype.toString.call(value) === '[object Object]') return undefined;
                value = value[keys[i]];
                if (value == undefined || value == null) {
                    return undefined;
                }
            }

            return value;
        }
        let sortFunc = this.sortName;
        let timeReg = [/^\d{4}[-/]\d{1,2}[-/]\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}$/, /^\d{1,2}[-/]\d{1,2}[-/]\d{4} \d{1,2}:\d{1,2}:\d{1,2}$/, /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/, /^\d{1,2}[-/]\d{1,2}[-/]\d{4}/];
        let ex = getProperty(target[0], key);
        if (!ex) {
            for (let i = 0; i < target.length; i++) {
                if (getProperty(target[i], key)) {
                    ex = getProperty(target[i], key);
                    break;
                }
            }
        }
        if (!ex) return;
        if (!isNaN(ex))
            sortFunc = this.sortNum;
        else {
            for (let reg of timeReg) {
                if (!ex.toString().match(reg) == false)
                    sortFunc = this.sortTime;
            }
        }
        target.sort((a, b) => desc * sortFunc(getProperty(a, key), getProperty(b, key)));
    }
    static sortNum(item1, item2) {
        return parseFloat(item1) < parseFloat(item2) ? 1 : -1;
    }
    static sortName(item1, item2) {
        return String(item1).localeCompare(String(item2));
    }
    static sortTime(item1, item2) {
        return new Date(item1) - new Date(item2);
    }
}

const dbManager = new DBManager();
const configDB = dbManager.getConfigDB();
const dataDBList = {};

/**
 * @summary 本地配置接口 (Local configuration interface)
 * @description 本地配置接口 (Local configuration interface)
*/
export class ConfigController {

    /**
     * @summary 获取配置文件信息 (Get config information)
     * @returns {Promise} 配置文件信息 (Config information)
     */
    static async getConfig() {
        return await new Promise((resolve, reject) => {
            try {
                let _config = JSON.parse(JSON.stringify(config));
                for (let key in _config) {
                    if (Object.prototype.hasOwnProperty.call(_config, key))
                        _config[key] = configDB.get(key).value();
                }
                resolve({
                    status: 'success',
                    data: _config,
                    code: 200,
                    message: '获取配置文件信息成功 (Get config information successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '获取配置文件信息失败 (Failed to get config information)'
                });
            }
        });
    }

    /**
     * @summary 更新配置文件信息 (Update config information)
     * @param {object} target 配置文件信息 (Config information)
     * @returns {Promise} 更新结果 (Update result)
     * @description 更新配置文件信息时，只更新传入的配置文件信息，未传入的配置文件信息不做处理 (When updating the configuration file information, only the passed-in configuration file information is updated, and the unpassed configuration file information is not processed)
    */
    static async createOrUpdateConfig(target) {
        return await new Promise((resolve, reject) => {
            try {
                let _config = JSON.parse(JSON.stringify(config));
                for (let key in _config) {
                    if (Object.prototype.hasOwnProperty.call(target, key))
                        configDB.set(key, target[key]).write();
                }
                resolve({
                    status: 'success',
                    data: null,
                    code: 200,
                    message: '更新配置文件信息成功 (Update config information successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '更新配置文件信息失败 (Failed to update config information)'
                });
            }
        });
    }

    /**
     * @summary 选择本地数据源路径 (Select local data source path)
     * @returns {Promise} 本地数据源路径 (Local data source path)
    */
    static async selectLocalDataSourcePath() {
        let path = (
            await dialog.showOpenDialog({
                properties: ["openDirectory"],
            })
        ).filePaths[0];
        if (!path) {
            return {
                status: 'error',
                data: null,
                code: 500,
                message: '选择本地数据源路径失败 (Failed to select local data source path)'
            };
        }
        return {
            status: 'success',
            data: path,
            code: 200,
            message: '选择本地数据源路径成功 (Select local data source path successfully)'
        };
    }

    /**
     * @summary 添加数据源 (Add data source)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} name 数据源名称 (Data source name)
     * @returns {Promise} 添加结果 (Add result)
     * @description 添加数据源时，会在数据源路径下创建数据源文件夹，并在数据源文件夹下创建数据源配置文件 (When adding a data source, a data source folder will be created under the data source path, and a data source configuration file will be created under the data source folder)
    */
    static async createDataSource(uri, name = null) {
        return await new Promise((resolve, reject) => {
            try {
                let id = Tools.$Guid();
                let _path = name ? path.join(uri, name) : uri;
                let _config = JSON.parse(JSON.stringify(config));
                for (let key in _config) {
                    _config[key] = configDB.get(key).value();
                }
                if (!_config.data_path)
                    _config.data_path = [];
                if (_config.data_path.find(it => it.path === _path)) {
                    reject({
                        status: 'error',
                        data: null,
                        code: 500,
                        message: '已存在数据源 (Data source already exists)'
                    });
                    return;
                }
                let _data_path_item = JSON.parse(JSON.stringify(data_path_item));
                _data_path_item.path = _path;
                _config.data_path.push(_data_path_item);
                ipc.send("ensure-folder", { id: id, dir: _path });
                ipc.on(`ensure-folder-${id}`, (event, arg) => {
                    if (arg.status !== 200) {
                        reject({
                            status: 'error',
                            data: null,
                            code: 500,
                            message: arg.message
                        });
                        return;
                    }

                    let ds = JSON.parse(JSON.stringify(data_structure));
                    ds.id = id;
                    ds.name = name;
                    ds.createDate = Tools.$DateFormat('YYYY-mm-dd HH:MM:SS', new Date());

                    ipc.send("output-file", {
                        id: ds.id,
                        path: path.join(_path, "data_structure.json"),
                        data: JSON.stringify(ds),
                    });
                });

                ipc.on(`output-file-${id}`, (event, arg) => {
                    if (arg.status !== 200) {
                        reject({
                            status: 'error',
                            data: null,
                            code: 500,
                            message: '添加数据源失败 (Failed to add data source)'
                        });
                        return;
                    }
                    configDB.set('data_path', _config.data_path).write();
                    resolve({
                        status: 'success',
                        data: _data_path_item,
                        code: 200,
                        message: '添加数据源成功 (Add data source successfully)'
                    });
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '添加数据源失败 (Failed to add data source)'
                });
            }
        });
    }

    /**
     * @summary 已存在该数据源 (Data source already exists)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} name 数据源名称 (Data source name)
     * @returns {Promise} 检查结果 (Check result)
     * @description 检查数据源是否已存在 (Check if the data source already exists)
    */
    static async existsDataSource(uri, name = null) {
        return await new Promise((resolve, reject) => {
            try {
                let id = Tools.$Guid();
                let _path = name ? path.join(uri, name, "data_structure.json") : path.join(uri, "data_structure.json");
                ipc.send("exists-path", {
                    id: id,
                    path: _path,
                });
                let _exists = false;
                ipc.on(`exists-path-${id}`, (event, arg) => {
                    _exists = arg.exists;
                    if (_exists) {
                        resolve({
                            status: "success",
                            data: true,
                            code: 200,
                            message: "已存在该数据源 (Data source already exists)"
                        });
                    }
                    else {
                        resolve({
                            status: "success",
                            data: false,
                            code: 200,
                            message: "不存在该数据源 (Data source does not exist)"
                        });
                    }
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '检查数据源失败 (Failed to check data source)'
                });
            }
        });
    }

    /**
     * @summary 关联本地数据源 (Link to local data source)
     * @param {string} uri 数据源路径 (Data source path)
     * @returns {Promise} 关联结果 (Link result)
    */
    static async linkLocalDataSource(uri = null) {
        let path = uri ? uri : (
            await dialog.showOpenDialog({
                properties: ["openDirectory"],
            })
        ).filePaths[0];
        return await new Promise((resolve, reject) => {
            try {
                if (!path) {
                    reject({
                        status: 'error',
                        data: null,
                        code: 500,
                        message: '关联本地数据源失败 (Failed to link to local data source)'
                    });
                    return;
                }
                let _config = JSON.parse(JSON.stringify(config));
                for (let key in _config) {
                    _config[key] = configDB.get(key).value();
                }
                if (!_config.data_path)
                    _config.data_path = [];
                if (_config.data_path.find(it => it.path === path)) {
                    reject({
                        status: 'error',
                        data: null,
                        code: 500,
                        message: '已存在数据源 (Data source already exists)'
                    });
                    return;
                }
                let _data_path_item = JSON.parse(JSON.stringify(data_path_item));
                _data_path_item.path = path;
                _config.data_path.push(_data_path_item);
                configDB.set('data_path', _config.data_path).write();
                resolve({
                    status: 'success',
                    data: _data_path_item,
                    code: 200,
                    message: '关联本地数据源成功 (Link to local data source successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '关联本地数据源失败 (Failed to link to local data source)'
                });
            }
        });
    }

    /**
     * @summary 初始化数据源 (Initialize data source)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} name 数据源名称 (Data source name)
     * @returns {Promise} 初始化结果 (Initialization result)
     * @description 用于本地数据源配置文件缺失时重新初始化数据源 (Used to reinitialize the data source when the local data source configuration file is missing)
    */
    static async initDataSource(uri, name) {
        return await new Promise((resolve, reject) => {
            try {
                let id = Tools.$Guid();
                let _path = uri;
                let ds = JSON.parse(JSON.stringify(data_structure));
                ds.id = id;
                ds.name = name;
                ds.createDate = Tools.$DateFormat('YYYY-mm-dd HH:MM:SS', new Date());

                ipc.send("output-file", {
                    id: ds.id,
                    path: path.join(_path, "data_structure.json"),
                    data: JSON.stringify(ds),
                });

                ipc.on(`output-file-${id}`, (event, arg) => {
                    if (arg.status !== 200) {
                        reject({
                            status: 'error',
                            data: null,
                            code: 500,
                            message: '初始化数据源失败 (Failed to initialize data source)'
                        });
                        return;
                    }
                    resolve({
                        status: 'success',
                        data: null,
                        code: 200,
                        message: '初始化数据源成功 (Initialize data source successfully)'
                    });
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '初始化数据源失败 (Failed to initialize data source)'
                });
            }
        });
    }
}

/**
 * @summary 文献管理接口 (Literature management interface)
 * @description 文献管理接口 (Literature management interface)
*/
export class AcademicController {

    /**
     * @summary 确保数据源 DataAdapter存在 (Ensure that the data source DataAdapter exists)
     * @param {string} uri 数据源路径 (Data source path)
     * @returns {Promise} 数据源 DataAdapter (Data source DataAdapter)
    */
    static ensureDataDB(uri) {
        if (!dataDBList[uri])
            dataDBList[uri] = dbManager.getDataDB(uri);
        return dataDBList[uri];
    }

    /**
     * @summary 获取数据源信息 (Get data source information)
     * @param {string} uri 数据源路径 (Data source path)
     * @returns {Promise} 数据源信息 (Data source information)
    */
    static async getDataSourceInfo(uri) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let data = {
                    id: dataDB.get('id').value(),
                    name: dataDB.get('name').value(),
                    groupLength: dataDB.get('groups').value().length,
                    itemLength: dataDB.get('items').value().length,
                    templatesLength: dataDB.get('templates').value().length,
                    partitionsLength: dataDB.get('partitions').value().length,
                    createDate: dataDB.get('createDate').value()
                };
                resolve({
                    status: 'success',
                    data: data,
                    code: 200,
                    message: '获取数据源信息成功 (Get data source information successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '获取数据源信息失败 (Failed to get data source information)'
                });
            }
        });
    }

    /**
     * @summary 获取根目录下的所有区组信息 (Get all group information under the root directory)
     * @param {string} uri 数据源路径 (Data source path)
     * @returns {Promise} 所有区组信息 (All group information)
    */
    static async getRootGroups(uri) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let data = dataDB.get('groups').value();
                if (!Array.isArray(data))
                    data = [];
                data = data.filter((item) => {
                    return !item.parent;
                });
                resolve({
                    status: 'success',
                    data: data,
                    code: 200,
                    message: '获取根区组信息成功 (Get root group information successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '获取根区组信息失败 (Failed to get root group information)'
                });
            }
        });
    }

    /**
     * @summary 获取指定区组下的所有区组信息 (Get all group information under the specified group)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} id 区组id (Group id)
     * @returns {Promise} 所有区组信息 (All group information)
    */
    static async getGroups(uri, id) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let data = dataDB.get('groups').value();
                if (!Array.isArray(data))
                    data = [];
                data = data.filter((item) => {
                    return item.parent == id;
                });
                resolve({
                    status: 'success',
                    data: data,
                    code: 200,
                    message: '获取区组信息成功 (Get group information successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '获取区组信息失败 (Failed to get group information)'
                });
            }
        });
    }

    /**
     * @summary 创建区组 (Create group)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} id 区组id (Group id)
     * @param {object} group 区组信息 (Group information)
     * @returns {Promise} 区组信息 (Group information)
    */
    static async createGroup(uri, id, group) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let data = dataDB.get('groups').value();
                if (!Array.isArray(data))
                    data = [];
                let _group = JSON.parse(JSON.stringify(Group));
                _group.id = Tools.$Guid();
                _group.name = group.name;
                _group.emoji = group.emoji;
                _group.createDate = Tools.$DateFormat('YYYY-mm-dd HH:MM:SS', new Date());
                _group.updateDate = Tools.$DateFormat('YYYY-mm-dd HH:MM:SS', new Date());
                _group.parent = id;
                data.push(_group);
                dataDB.set('groups', data).write();
                resolve({
                    status: 'success',
                    data: _group,
                    code: 200,
                    message: '创建区组成功 (Create group successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '创建区组失败 (Failed to create group)'
                });
            }
        });
    }

    /**
     * @summary 更新区组信息 (Update group information)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {object} group 区组信息 (Group information)
     * @returns {Promise} 区组信息 (Group information)
    */
    static async updateGroup(uri, group) {  //更新区组
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let data = dataDB.get('groups').value();
                if (!Array.isArray(data))
                    data = [];
                let _group = data.find((item) => {
                    return item.id == group.id;
                });
                if (!_group) {
                    reject({
                        status: 'error',
                        data: null,
                        code: 404,
                        message: '区组不存在 (Group does not exist)'
                    });
                    return;
                }
                _group.name = group.name;
                _group.emoji = group.emoji;
                _group.createDate = group.createDate;
                _group.updateDate = Tools.$DateFormat('YYYY-mm-dd HH:MM:SS', new Date());
                dataDB.set('groups', data).write();
                resolve({
                    status: 'success',
                    data: _group,
                    code: 200,
                    message: '更新区组成功 (Update group successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '更新区组失败 (Failed to update group)'
                });
            }
        });
    }

    /**
     * @summary 删除区组 (Delete group)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} id 区组id (Group id)
     * @returns {Promise} 区组信息 (Group information)
     * @description 删除区组时，会将区组下的所有区组和分区一并删除
    */
    static async deleteGroup(uri, id) {  //删除区组
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let data = dataDB.get('groups').value();
                if (!Array.isArray(data))
                    data = [];
                let _group = data.find((item) => {
                    return item.id == id;
                });
                if (!_group) {
                    reject({
                        status: 'error',
                        data: null,
                        code: 404,
                        message: '区组不存在 (Group does not exist)'
                    });
                    return;
                }
                let children = data.filter((item) => {
                    return item.parent == id;
                });
                data = data.filter((item) => {
                    for (let i = 0; i < children.length; i++) {
                        if (item.id == children[i].id)
                            return false;
                    }
                    return item.id != id;
                });
                dataDB.set('groups', data).write();
                resolve({
                    status: 'success',
                    data: _group,
                    code: 200,
                    message: '删除区组成功 (Delete group successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '删除区组失败 (Failed to delete group)'
                });
            }
        });
    }

    /**
     * @summary 获取根目录下的所有分区信息 (Get all partition information under the root directory)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} id 区组id (Group id)
     * @returns {Promise} 所有分区信息 (All partition information)
    */
    static async getRootPartitions(uri) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let data = dataDB.get('partitions').value();
                if (!Array.isArray(data))
                    data = [];
                resolve({
                    status: 'success',
                    data: data,
                    code: 200,
                    message: '获取根分区信息成功 (Get root partition information successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '获取根分区信息失败 (Failed to get root partition information)'
                });
            }
        });
    }

    /**
     * @summary 获取指定区组下的所有分区信息 (Get all partition information under the specified group)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} id 区组id (Group id)
     * @returns {Promise} 所有分区信息 (All partition information)
    */
    static async getPartitions(uri, id) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let groups = dataDB.get('groups').value();
                let group = groups.find((item) => {
                    return item.id == id;
                });
                let data = group.partitions;
                if (!Array.isArray(data))
                    data = [];
                resolve({
                    status: 'success',
                    data: data,
                    code: 200,
                    message: '获取分区信息成功 (Get partition information successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '获取分区信息失败 (Failed to get partition information)'
                });
            }
        });
    }

    /**
     * @summary 获取指定分区信息 (Get specified partition information)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} id 分区id (Partition id)
     * @returns {Promise} 分区信息 (Partition information)
     * @description 优先在根分区中查找，若不存在，则在区组中查找 (Find in the root partition first, if not, find in the group)
    */
    static async getPartition(uri, id) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let partition = null;
                let partitions = dataDB.get('partitions').value();
                partition = partitions.find((item) => {
                    return item.id == id;
                });
                if (!partition) {
                    let groups = dataDB.get('groups').value();
                    for (let group of groups) {
                        partition = group.partitions.find((item) => {
                            return item.id == id;
                        });
                        if (partition)
                            break;
                    }
                }
                if (!partition) {
                    reject({
                        status: 'error',
                        data: null,
                        code: 404,
                        message: '分区不存在 (Partition does not exist)'
                    });
                    return;
                }
                resolve({
                    status: 'success',
                    data: partition,
                    code: 200,
                    message: '获取分区信息成功 (Get partition information successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '获取分区信息失败 (Failed to get partition information)'
                });
            }
        });
    }

    /**
     * @summary 创建分区 (Create partition)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} groupid 区组id (Group id)
     * @param {object} partition 分区信息 (Partition information)
     * @returns {Promise} 分区信息 (Partition information)
     * @description groupid为空时，创建根分区
    */
    static async createPartition(uri, groupid, partition) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let _partition = JSON.parse(JSON.stringify(Partition));
                for (let key in _partition) {
                    if (Object.prototype.hasOwnProperty.call(partition, key))
                        _partition[key] = partition[key];
                }
                _partition.id = Tools.$Guid();
                _partition.createDate = Tools.$DateFormat('YYYY-mm-dd HH:MM:SS', new Date());
                _partition.updateDate = Tools.$DateFormat('YYYY-mm-dd HH:MM:SS', new Date());
                if (!groupid)
                    dataDB.get('partitions').push(_partition).write();
                else {
                    let groups = dataDB.get('groups').value();
                    let group = groups.find((item) => {
                        return item.id == groupid;
                    });
                    group.partitions.push(_partition);
                    dataDB.set('groups', groups).write();
                }
                resolve({
                    status: 'success',
                    data: _partition,
                    code: 200,
                    message: '创建分区成功 (Create partition successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '创建分区失败 (Failed to create partition)'
                });
            }
        });
    }

    /**
     * @summary 更新分区信息 (Update partition information)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} groupid 区组id (Group id)
     * @param {string} partition 分区信息 (Partition information)
     * @returns {Promise} 分区信息 (Partition information)
     * @description groupid为空时，更新根分区信息
    */
    static async updatePartition(uri, groupid, partition) {  //更新分区
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let _partition = null;
                let partitions = null;
                if (!groupid) {
                    partitions = dataDB.get('partitions').value();
                }
                else {
                    let groups = dataDB.get('groups').value();
                    let group = groups.find((item) => {
                        return item.id == groupid;
                    });
                    partitions = group.partitions;
                }
                _partition = partitions.find((item) => {
                    return item.id == partition.id;
                });
                if (!_partition) {
                    reject({
                        status: 'error',
                        data: null,
                        code: 404,
                        message: '分区不存在 (Partition does not exist)'
                    });
                    return;
                }
                _partition.name = partition.name;
                _partition.description = partition.description;
                _partition.tags = partition.tags;
                _partition.updateDate = Tools.$DateFormat('YYYY-mm-dd HH:MM:SS', new Date());
                if (groupid)
                    dataDB.get('groups').find({ id: groupid }).assign({ partitions: partitions }).write();
                else
                    dataDB.set('partitions', partitions).write();
                resolve({
                    status: 'success',
                    data: _partition,
                    code: 200,
                    message: '更新分区成功 (Update partition successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '更新分区失败 (Failed to update partition)'
                });
            }
        });
    }

    /**
     * @summary 删除分区 (Delete partition)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} groupid 区组id (Group id)
     * @param {string} id 分区id (Partition id)
     * @returns {Promise} 删除结果 (Delete result)
     * @description groupid为空时，删除根分区
    */
    static async deletePartition(uri, groupid, id) {  //删除分区
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let _partition = null;
                let partitions = null;
                if (!groupid) {
                    partitions = dataDB.get('partitions').value();
                }
                else {
                    let groups = dataDB.get('groups').value();
                    let group = groups.find((item) => {
                        return item.id == groupid;
                    });
                    partitions = group.partitions;
                }
                _partition = partitions.find((item) => {
                    return item.id == id;
                });
                if (!_partition) {
                    reject({
                        status: 'error',
                        data: null,
                        code: 404,
                        message: '分区不存在 (Partition does not exist)'
                    });
                    return;
                }
                partitions = partitions.filter((item) => {
                    return item.id != id;
                });
                if (groupid)
                    dataDB.get('groups').find({ id: groupid }).assign({ partitions: partitions }).write();
                else
                    dataDB.set('partitions', partitions).write();
                resolve({
                    status: 'success',
                    data: _partition,
                    code: 200,
                    message: '删除分区成功 (Delete partition successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '删除分区失败 (Failed to delete partition)'
                });
            }
        });
    }

    /**
     * @summary 获取指定分区下的所有数据项信息 (Get all item information under the specified partition)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} partitionid 分区id (Partition id)
     * @param {number} length 分页长度 (Page length)
     * @param {number} offset 分页偏移量 (Page offset)
     * @param {string} sort 排序方式 (Sort method)
     * @param {boolean} desc 是否降序 (Whether to sort in descending order)
     * @returns {Promise} 所有数据项信息 (All item information)
     * @description 如果区组id为空，则获取根目录下的所有数据项信息 (If the group id is empty, get all item information under the root directory)
    */
    static async getItems(uri, partitionid, length = -1, offset = 0, sort = 'createDate', desc = false) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let partition = null;
                if (partitionid) {
                    let partitions = dataDB.get('partitions').value();
                    partition = partitions.find((item) => {
                        return item.id == partitionid;
                    });
                    if (!partition) {
                        let groups = dataDB.get('groups').value();
                        for (let group of groups) {
                            partition = group.partitions.find((item) => {
                                return item.id == partitionid;
                            });
                            if (partition)
                                break;
                        }
                    }
                }
                let allItems = dataDB.get('items').value();
                let data = [];
                if (partition) {
                    let itemIds = partition.items;
                    allItems.forEach((el, idx) => {
                        if (itemIds.indexOf(el.id) > -1)
                            data.push(allItems[idx]);
                    });
                }
                else if (!partitionid) {
                    data = allItems;
                }
                if (!Array.isArray(data))
                    data = [];
                Tools.inteliSort(data, sort, desc);
                if (length != -1)
                    data = data.slice(offset, offset + length);
                resolve({
                    status: 'success',
                    data: data,
                    code: 200,
                    message: '获取项目信息成功 (Get item information successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '获取项目信息失败 (Failed to get item information)'
                });
            }
        });
    }

    /**
     * @summary 获取指定分区下的所有数据项数量 (Get the number of all items under the specified partition)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} partitionid 分区id (Partition id)
     * @returns {Promise} 所有数据项数量 (All item quantity)
     * @description 如果区组id为空，则获取根目录下的所有数据项数量 (If the group id is empty, get the number of all items under the root directory)
    */
    static async getItemsCount(uri, partitionid) {
        let res = await this.getItems(uri, partitionid);
        if (res.status == 'success') {
            res.data = res.data.length;
        }
        return res;
    }

    /**
     * @summary 获取当前数据源下的所有数据项信息 (Get all item information under the current data source)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {number} length 分页长度 (Page length)
     * @param {number} offset 分页偏移量 (Page offset)
     * @param {string} sort 排序方式 (Sort method)
     * @param {boolean} desc 是否降序 (Whether to sort in descending order)
     * @returns {Promise} 所有数据项信息 (All item information)
    */
    static async getAllItems(uri, length = -1, offset = 0, sort = 'createDate', desc = false) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let data = dataDB.get('items').value();
                if (!Array.isArray(data))
                    data = [];
                Tools.inteliSort(data, sort, desc);
                if (length != -1)
                    data = data.slice(offset, offset + length);
                resolve({
                    status: 'success',
                    data: data,
                    code: 200,
                    message: '获取所有项目信息成功 (Get all item information successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '获取所有项目信息失败 (Failed to get all item information)'
                });
            }
        });
    }

    /**
     * @summary 获取当前数据源下的所有数据项数量 (Get the number of all items under the current data source)
     * @param {string} uri 数据源路径 (Data source path)
     * @returns {Promise} 所有数据项数量 (All item quantity)
    */
    static async getAllItemsCount(uri) {
        let res = await this.getAllItems(uri);
        if (res.status == 'success') {
            res.data = res.data.length;
        }
        return res;
    }

    /**
     * @summary 搜索获取数据项信息 (Search and get item information)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} partitionid 分区id (Partition id)
     * @param {string} keyword 搜索关键字 (Search keyword)
     * @param {number} length 分页长度 (Page length)
     * @param {number} offset 分页偏移量 (Page offset)
     * @param {string} sort 排序方式 (Sort method)
     * @param {boolean} desc 是否降序 (Whether to sort in descending order)
     * @returns {Promise} 数据项信息 (Item information)
     * @description 搜索关键字为空时，返回所有数据项信息 (When the search keyword is empty, return all item information)
    */
    static async getSearchItems(uri, partitionid, keyword, length = 50, offset = 0, sort = 'createDate', desc = false) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let partition = null;
                if (partitionid) {
                    let partitions = dataDB.get('partitions').value();
                    partition = partitions.find((item) => {
                        return item.id == partitionid;
                    });
                    if (!partition) {
                        let groups = dataDB.get('groups').value();
                        for (let group of groups) {
                            partition = group.partitions.find((item) => {
                                return item.id == partitionid;
                            });
                            if (partition)
                                break;
                        }
                    }
                }
                let allItems = dataDB.get('items').value();
                let data = [];
                if (partition) {
                    let itemIds = partition.items;
                    allItems.forEach((el, idx) => {
                        if (itemIds.indexOf(el.id) > -1)
                            data.push(allItems[idx]);
                    });
                }
                else if (!partitionid) {
                    data = allItems;
                }
                if (!Array.isArray(data))
                    data = [];
                if (keyword) {
                    data = data.filter((item) => {
                        for (let key in item) {
                            if (String(item[key]).toLocaleLowerCase().indexOf(keyword.toLowerCase()) > -1)
                                return true;
                        }
                        return false;
                    });
                }
                Tools.inteliSort(data, sort, desc);
                if (length != -1)
                    data = data.slice(offset, offset + length);
                resolve({
                    status: 'success',
                    data: data,
                    code: 200,
                    message: '搜索项目信息成功 (Search item information successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '搜索项目信息失败 (Failed to search item information)'
                });
            }
        });
    }

    /**
     * @summary 根据数据项id获取指定数据项信息 (Get the specified item information according to the item id)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} id 数据项id (Data item id)
     * @returns {Promise} 数据项信息 (Data item information)
    */
    static async getItem(uri, id) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let data = dataDB.get('items').find({ id: id }).value();
                resolve({
                    status: 'success',
                    data: data,
                    code: 200,
                    message: '获取项目信息成功 (Get item information successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '获取项目信息失败 (Failed to get item information)'
                });
            }
        });
    }

    /**
     * @summary 创建数据项 (Create item)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {object} item 数据项信息 (Item information)
     * @returns {Promise} 数据项信息 (Item information)
    */
    static async createItem(uri, item) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let _item = JSON.parse(JSON.stringify(Item));
                for (let key in _item) {
                    if (Object.prototype.hasOwnProperty.call(item, key))
                        _item[key] = item[key];
                }
                _item.id = Tools.$Guid();
                _item.metadata = JSON.parse(JSON.stringify(Metadata));
                _item.updateDate = Tools.$DateFormat('YYYY-mm-dd HH:MM:SS', new Date());
                let items = dataDB.get('items').value();
                items.push(_item);
                dataDB.set('items', items).write();
                let url = path.join(
                    uri,
                    `root/items/${_item.id}`
                );
                ipc.send("ensure-folder", { id: `addItem: ${_item.id}`, dir: url });
                ipc.on(`ensure-folder-addItem: ${_item.id}`, (event, arg) => {
                    if (arg.status == 200) {
                        resolve({
                            status: 'success',
                            data: _item,
                            code: 200,
                            message: '创建项目成功 (Create item successfully)'
                        });
                    }
                    else {
                        reject({
                            status: 'error',
                            data: null,
                            code: 500,
                            message: arg.message
                        });
                    }
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '创建项目失败 (Failed to create item)'
                });
            }
        });
    }

    /**
     * @summary 更新数据项 (Update item)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {object} item 数据项信息 (Item information)
     * @returns {Promise} 数据项信息 (Item information)
    */
    static async updateItem(uri, item) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let items = dataDB.get('items').value();
                let _item = items.find((el) => {
                    return el.id == item.id;
                });
                if (!_item) {
                    reject({
                        status: 'error',
                        data: null,
                        code: 404,
                        message: '未找到项目 (Item not found)'
                    });
                    return;
                }
                let ignoreKeys = ['id', 'createDate'];
                for (let key in _item) {
                    if (Object.prototype.hasOwnProperty.call(item, key) && ignoreKeys.indexOf(key) == -1)
                        _item[key] = item[key];
                }
                _item.updateDate = Tools.$DateFormat('YYYY-mm-dd HH:MM:SS', new Date());
                dataDB.set('items', items).write();
                resolve({
                    status: 'success',
                    data: _item,
                    code: 200,
                    message: '更新项目成功 (Update item successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '更新项目失败 (Failed to update item)'
                });
            }
        });
    }

    /**
     * @summary 删除数据项 (Delete item)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} id 数据项id (Data item id)
     * @returns {Promise} 数据项信息 (Item information)
     * @description 删除数据项时，会将数据项从所有分区中移除 (When deleting an item, the item will be removed from all partitions)
    */
    static async deleteItem(uri, id) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let items = dataDB.get('items').value();
                let _item = items.find((el) => {
                    return el.id == id;
                });
                if (!_item) {
                    reject({
                        status: 'error',
                        data: null,
                        code: 404,
                        message: '未找到项目 (Item not found)'
                    });
                    return;
                }
                let partitions = dataDB.get('partitions').value();
                partitions.forEach((el, idx) => {
                    if (el.items.indexOf(id) > -1)
                        partitions[idx].items.splice(el.items.indexOf(id), 1);
                });
                dataDB.set('partitions', partitions).write();
                let groups = dataDB.get('groups').value();
                for (let i = 0; i < groups.length; i++) {
                    let group = groups[i];
                    for (let j = 0; j < group.partitions.length; j++) {
                        let partition = group.partitions[j];
                        if (partition.items.indexOf(id) > -1)
                            groups[i].partitions[j].items.splice(partition.items.indexOf(id), 1);
                    }
                }
                dataDB.set('groups', groups).write();
                items.splice(items.indexOf(_item), 1);
                dataDB.set('items', items).write();
                ipc.send("remove-folder", {
                    id: _item.id,
                    path: path.join(
                        uri,
                        `root/items/${_item.id}`
                    ),
                });
                ipc.on(`remove-folder-${_item.id}`, (event, arg) => {
                    if (arg.status == 200) {
                        resolve({
                            status: 'success',
                            data: _item,
                            code: 200,
                            message: '删除项目成功 (Delete item successfully)'
                        });
                    }
                    else {
                        reject({
                            status: 'error',
                            data: null,
                            code: 500,
                            message: arg.message
                        });
                    }
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '删除项目失败 (Failed to delete item)'
                });
            }
        });
    }

    /**
     * @summary 批量删除数据项 (Batch delete items)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {array} items 数据项id数组 (Data item id array)
     * @returns {Promise} 删除结果 (Delete result)
     * @description 删除数据项时，会将数据项从所有分区中移除 (When deleting an item, the item will be removed from all partitions)
    */
    static async deleteItems(uri, items) {
        for (let itemid of items) {
            let res = await this.deleteItem(uri, itemid);
            if (res.code !== 200) {
                return res;
            }
        }
        return {
            status: 'success',
            data: null,
            code: 200,
            message: '删除项目成功 (Delete item successfully)'
        }
    }

    /**
     * @summary 将数据项添加到指定分区 (Add item to specified partition)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} partitionid 分区id (Partition id)
     * @param {string} items 数据项id数组 (Data item id array)
     * @returns {Promise} 更新后的分区信息 (Item information)
    */
    static async addItemsToPartition(uri, partitionid, items) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            let groups = null;
            let isRoot = false;
            try {
                let partitions = dataDB.get('partitions').value();
                let _partition = partitions.find((el) => {
                    return el.id == partitionid;
                });
                if (!_partition) {
                    groups = dataDB.get('groups').value();
                    for (let i = 0; i < groups.length; i++) {
                        let group = groups[i];
                        for (let j = 0; j < group.partitions.length; j++) {
                            let partition = group.partitions[j];
                            if (partition.id == partitionid) {
                                _partition = partition;
                                break;
                            }
                        }
                    }
                }
                else
                    isRoot = true;
                if (!_partition) {
                    reject({
                        status: 'error',
                        data: null,
                        code: 404,
                        message: '未找到分区 (Partition not found)'
                    });
                    return;
                }
                for (let id of items) {
                    if (_partition.items.indexOf(id) === -1)
                        _partition.items.push(id);
                }
                if (isRoot) {
                    dataDB.set('partitions', partitions).write();
                }
                else {
                    dataDB.set('groups', groups).write();
                }
                resolve({
                    status: 'success',
                    data: _partition,
                    code: 200,
                    message: '添加项目到分区成功 (Add item to partition successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '添加项目到分区失败 (Failed to add item to partition)'
                });
            }
        });
    }

    /**
     * @summary 从分区移除数据项 (Remove item from partition)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} partitionid 分区id (Partition id)
     * @param {string} items 数据项id数组 (Data item id array)
     * @returns {Promise} 更新后的分区信息 (Item information)
     * @description 从分区移除数据项时，不会删除数据项 (When removing an item from a partition, the item will not be deleted)
    */
    static async removeItemsFromPartition(uri, partitionid, items) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            let groups = null;
            let isRoot = false;
            try {
                let partitions = dataDB.get('partitions').value();
                let _partition = partitions.find((el) => {
                    return el.id == partitionid;
                });
                if (!_partition) {
                    groups = dataDB.get('groups').value();
                    for (let i = 0; i < groups.length; i++) {
                        let group = groups[i];
                        for (let j = 0; j < group.partitions.length; j++) {
                            let partition = group.partitions[j];
                            if (partition.id == partitionid) {
                                _partition = partition;
                                break;
                            }
                        }
                    }
                }
                else
                    isRoot = true;
                if (!_partition) {
                    reject({
                        status: 'error',
                        data: null,
                        code: 404,
                        message: '未找到分区 (Partition not found)'
                    });
                    return;
                }
                _partition.items = _partition.items.filter((item) => {
                    return items.findIndex((el) => {
                        return el == item;
                    }) == -1;
                });
                if (isRoot) {
                    dataDB.set('partitions', partitions).write();
                }
                else {
                    dataDB.set('groups', groups).write();
                }
                resolve({
                    status: 'success',
                    data: _partition,
                    code: 200,
                    message: '从分区移除项目成功 (Remove item from partition successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '从分区移除项目失败 (Failed to remove item from partition)'
                });
            }
        });
    }

    /**
     * @summary 打开数据项文件 (Open file)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} itemid 数据项id (Data item id)
     * @param {string} fileid 文件id (File id)
     * @param {string} type 文件类型 (File type)
     * @returns {Promise} 文件内容 (File content)
    */
    static async openItemFile(uri, itemid, fileid = null, type = 'pdf') {
        return await new Promise((resolve, reject) => {
            let uid = null;
            let url = null;
            if (fileid == null) {
                uid = itemid;
                url = path.join(
                    uri,
                    "root/items",
                    itemid
                );
            }
            else {
                uid = itemid + fileid;
                let fileName = fileid + '.' + type;
                url = path.join(
                    uri,
                    "root/items",
                    itemid,
                    fileName
                );
            }
            ipc.send("open-file", {
                id: uid,
                path: url,
            });
            ipc.on(`open-file-${uid}`, (event, arg) => {
                if (arg.status == 200) {
                    resolve({
                        status: 'success',
                        data: arg.data,
                        code: 200,
                        message: '打开文件成功 (Open file successfully)'
                    });
                }
                else {
                    reject({
                        status: 'error',
                        data: null,
                        code: 500,
                        message: arg.message
                    });
                }
            });

        });
    }

    /**
     * @summary 添加数据项笔记 (Add item note)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} itemid 数据项id (Data item id)
     * @param {object} page 笔记信息 (Note information)
     * @param {string} templateContent 笔记模板内容 (Note template content)
     * @returns {Promise} 笔记信息 (Note information)
    */
    static async createItemPage(uri, itemid, page, templateContent = '') {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let item = dataDB.get('items').find({ id: itemid }).value();
                if (!item) {
                    reject({
                        status: 'error',
                        data: null,
                        code: 404,
                        message: '未找到项目 (Item not found)'
                    });
                    return;
                }
                let _page = JSON.parse(JSON.stringify(Page));
                for (let key in _page) {
                    if (Object.prototype.hasOwnProperty.call(page, key))
                        _page[key] = page[key];
                }
                _page.id = Tools.$Guid();
                _page.createDate = Tools.$DateFormat('YYYY-mm-dd HH:MM:SS', new Date());
                _page.updateDate = Tools.$DateFormat('YYYY-mm-dd HH:MM:SS', new Date());
                item.pages.push(_page);
                dataDB.set('items', dataDB.get('items').value()).write();
                let url = path.join(
                    uri,
                    "root/items",
                    itemid,
                    `${_page.id}.json`
                );
                ipc.send("output-file", {
                    id: _page.id,
                    path: url,
                    data: templateContent,
                });
                ipc.on(`output-file-${_page.id}`, (event, arg) => {
                    if (arg.status == 200) {
                        resolve({
                            status: 'success',
                            data: _page,
                            code: 200,
                            message: '添加页面成功 (Add page successfully)'
                        });
                    }
                    else {
                        reject({
                            status: 'error',
                            data: null,
                            code: 500,
                            message: arg.message
                        });
                    }
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '添加页面失败 (Failed to add page)'
                });
            }
        });
    }

    /**
     * @summary 复制相同数据项笔记 (Duplicate item note)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} itemid 数据项id (Data item id)
     * @param {string} pageid 数据项笔记id (Data item note id)
     */
    static async duplicateItemPage(uri, itemid, pageid) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let item = dataDB.get('items').find({ id: itemid }).value();
                if (!item) {
                    reject({
                        status: 'error',
                        data: null,
                        code: 404,
                        message: '未找到项目 (Item not found)'
                    });
                    return;
                }
                let _page = item.pages.find((el) => {
                    return el.id == pageid;
                });
                if (!_page) {
                    reject({
                        status: 'error',
                        data: null,
                        code: 404,
                        message: '未找到页面 (Page not found)'
                    });
                    return;
                }
                let _newPage = JSON.parse(JSON.stringify(_page));
                _newPage.id = Tools.$Guid();
                _newPage.createDate = Tools.$DateFormat('YYYY-mm-dd HH:MM:SS', new Date());
                _newPage.updateDate = Tools.$DateFormat('YYYY-mm-dd HH:MM:SS', new Date());
                item.pages.push(_newPage);
                dataDB.set('items', dataDB.get('items').value()).write();
                let url = path.join(
                    uri,
                    "root/items",
                    itemid,
                    `${_newPage.id}.json`
                );
                let oriUrl = path.join(
                    uri,
                    "root/items",
                    itemid,
                    `${pageid}.json`
                );
                ipc.send("read-file", {
                    id: oriUrl,
                    path: oriUrl,
                });
                ipc.on(`read-file-${oriUrl}`, (event, { status, message, data }) => {
                    if (status == 200) {
                        let templateContent = data;
                        ipc.send("output-file", {
                            id: url,
                            path: url,
                            data: templateContent,
                        });
                    }
                    else {
                        reject({
                            status: 'error',
                            data: null,
                            code: 500,
                            message: message
                        });
                    }
                });
                ipc.on(`output-file-${url}`, (event, arg) => {
                    if (arg.status == 200) {
                        resolve({
                            status: 'success',
                            data: _newPage,
                            code: 200,
                            message: '复制页面成功 (Copy page successfully)'
                        });
                    }
                    else {
                        reject({
                            status: 'error',
                            data: null,
                            code: 500,
                            message: arg.message
                        });
                    }
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '复制页面失败 (Failed to copy page)'
                });
            }
        });
    }

    /**
     * @summary 更新数据项笔记信息 (Update item note)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} itemid 数据项id (Data item id)
     * @param {object} page 笔记信息 (Note information)
     * @returns {Promise} 笔记信息 (Note information)
     */
    static async updateItemPage(uri, itemid, page) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let item = dataDB.get('items').find({ id: itemid }).value();
                if (!item) {
                    reject({
                        status: 'error',
                        data: null,
                        code: 404,
                        message: '未找到项目 (Item not found)'
                    });
                    return;
                }
                let _page = item.pages.find((el) => {
                    return el.id == page.id;
                });
                if (!_page) {
                    reject({
                        status: 'error',
                        data: null,
                        code: 404,
                        message: '未找到页面 (Page not found)'
                    });
                    return;
                }
                let ignoreKeys = ['id', 'createDate'];
                for (let key in _page) {
                    if (Object.prototype.hasOwnProperty.call(page, key) && ignoreKeys.indexOf(key) == -1)
                        _page[key] = page[key];
                }
                _page.updateDate = Tools.$DateFormat('YYYY-mm-dd HH:MM:SS', new Date());
                dataDB.set('items', dataDB.get('items').value()).write();
                resolve({
                    status: 'success',
                    data: _page,
                    code: 200,
                    message: '更新页面成功 (Update page successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '更新页面失败 (Failed to update page)'
                });
            }
        });
    }

    /**
     * @summary 删除数据项笔记 (Delete item note)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} itemid 数据项id (Data item id)
     * @param {string} pageid 数据项笔记id (Data item note id)
     * @returns {Promise} 笔记信息 (Note information)
     */
    static async deleteItemPage(uri, itemid, pageid) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let item = dataDB.get('items').find({ id: itemid }).value();
                if (!item) {
                    reject({
                        status: 'error',
                        data: null,
                        code: 404,
                        message: '未找到项目 (Item not found)'
                    });
                    return;
                }
                let _page = item.pages.find((el) => {
                    return el.id == pageid;
                });
                if (!_page) {
                    reject({
                        status: 'error',
                        data: null,
                        code: 404,
                        message: '未找到页面 (Page not found)'
                    });
                    return;
                }
                item.pages.splice(item.pages.indexOf(_page), 1);
                dataDB.set('items', dataDB.get('items').value()).write();
                let url = path.join(
                    uri,
                    "root/items",
                    itemid,
                    `${_page.id}.json`
                );
                ipc.send("remove-file", {
                    id: url,
                    path: url,
                });
                ipc.on(`remove-file-${url}`, (event, arg) => {
                    if (arg.status == 200) {
                        resolve({
                            status: 'success',
                            data: _page,
                            code: 200,
                            message: '删除页面成功 (Delete page successfully)'
                        });
                    }
                    else {
                        resolve({
                            status: 'warning',
                            data: null,
                            code: 200,
                            message: arg.message + '删除页面成功, 但是文件删除失败 (Delete page successfully, but file deletion failed)'
                        });
                    }
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '删除页面失败 (Failed to delete page)'
                });
            }
        });
    }

    /**
     * @summary 更新元数据 (Update metadata)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} itemid 数据项id (Data item id)
     * @param {object} metadata 元数据 (Metadata)
     * @returns {Promise} 元数据 (Metadata)
     */
    static async updateItemMetadata(uri, itemid, metadata) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let item = dataDB.get('items').find({ id: itemid }).value();
                if (!item) {
                    reject({
                        status: 'error',
                        data: null,
                        code: 404,
                        message: '未找到项目 (Item not found)'
                    });
                    return;
                }
                let _metadata = item.metadata;
                for (let key in _metadata) {
                    if (Object.prototype.hasOwnProperty.call(metadata, key))
                        _metadata[key] = metadata[key];
                }
                dataDB.set('items', dataDB.get('items').value()).write();
                let url = path.join(
                    uri,
                    "root/items",
                    `${itemid}/${itemid}.metadata`
                );
                ipc.send("output-file", {
                    id: `metadata: ${itemid}`,
                    path: url,
                    data: JSON.stringify(_metadata),
                });
                ipc.on(`output-file-metadata: ${itemid}`, (event, arg) => {
                    if (arg.status == 200) {
                        resolve({
                            status: 'success',
                            data: _metadata,
                            code: 200,
                            message: '更新元数据成功 (Update metadata successfully)'
                        });
                    }
                    else {
                        reject({
                            status: 'error',
                            data: null,
                            code: 500,
                            message: arg.message
                        });
                    }
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '更新元数据失败 (Failed to update metadata)'
                });
            }
        });
    }


    /**
     * @summary 获取模板信息 (Update item note)
     * @param {string} uri 数据源路径 (Data source path)
    */
    static async getTemplatesInfo(uri) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let templates = dataDB.get('templates').value();
                if (!Array.isArray(templates))
                    templates = [];
                resolve({
                    status: 'success',
                    data: templates,
                    code: 200,
                    message: '获取模板成功 (Get template successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '获取模板失败 (Failed to get template)'
                });
            }
        });
    }

    /**
     * @summary 获取模板内容 (Get template content)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} id 模板id (Template id)
     * @returns {Promise} 模板内容 (Template content)
     * @description 模板内容为PowerEditor json格式
    */
    static async getTemplateContent(uri, id) {
        return await new Promise((resolve, reject) => {
            let url = path.join(
                uri,
                "root/templates",
                `${id}.json`
            );
            ipc.send("read-file", {
                id: url,
                path: url
            });
            ipc.on(`read-file-${url}`, (event, arg) => {
                if (arg.status == 200) {
                    resolve({
                        status: 'success',
                        data: arg.data,
                        code: 200,
                        message: '获取模板内容成功 (Get template content successfully)'
                    });
                }
                else {
                    reject({
                        status: 'error',
                        data: null,
                        code: 500,
                        message: arg.message
                    });
                }
            });
        });
    }

    /**
     * @summary 保存模板内容 (Save template content)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} id 模板id (Template id)
     * @param {string} content 模板内容 (Template content)
     * @returns {Promise} 模板内容 (Template content)
     * @description 模板内容为PowerEditor json格式
    */
    static async saveTemplateContent(uri, id, content) {
        return await new Promise((resolve, reject) => {
            let url = path.join(
                uri,
                "root/templates",
                `${id}.json`
            );
            ipc.send("output-file", {
                id: url,
                path: url,
                data: content,
            });
            ipc.on(`output-file-${url}`, (event, arg) => {
                if (arg.status == 200) {
                    resolve({
                        status: 'success',
                        data: arg.data,
                        code: 200,
                        message: '保存模板内容成功 (Save template content successfully)'
                    });
                }
                else {
                    reject({
                        status: 'error',
                        data: null,
                        code: 500,
                        message: arg.message
                    });
                }
            });
        });
    }

    /**
     * @summary 创建模板 (Create template)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {object} template 模板信息 (Template information)
     */
    static async createTemplate(uri, template) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let _template = JSON.parse(JSON.stringify(Page));
                for (let key in _template) {
                    if (Object.prototype.hasOwnProperty.call(template, key))
                        _template[key] = template[key];
                }
                _template.id = Tools.$Guid();
                _template.createDate = Tools.$DateFormat('YYYY-mm-dd HH:MM:SS', new Date());
                _template.updateDate = Tools.$DateFormat('YYYY-mm-dd HH:MM:SS', new Date());
                let templates = dataDB.get('templates').value();
                templates.push(_template);
                dataDB.set('templates', templates).write();
                let url = path.join(
                    uri,
                    "root/templates",
                    `${_template.id}.json`
                );
                ipc.send("output-file", {
                    id: _template.id,
                    path: url,
                    data: "",
                });
                ipc.on(`output-file-${_template.id}`, (event, arg) => {
                    if (arg.status == 200) {
                        resolve({
                            status: 'success',
                            data: _template,
                            code: 200,
                            message: '创建模板成功 (Create template successfully)'
                        });
                    }
                    else {
                        reject({
                            status: 'error',
                            data: null,
                            code: 500,
                            message: arg.message
                        });
                    }
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '创建模板失败 (Failed to create template)'
                });
            }
        });
    }

    /**
     * @summary 更新模板信息 (Update template information)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {object} template 模板信息 (Template information)
     * @returns {Promise} 模板信息 (Template information)
    */
    static async updateTemplate(uri, template) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let templates = dataDB.get('templates').value();
                let _template = templates.find((el) => {
                    return el.id == template.id;
                });
                if (!_template) {
                    reject({
                        status: 'error',
                        data: null,
                        code: 404,
                        message: '未找到模板 (Template not found)'
                    });
                    return;
                }
                let ignoreKeys = ['id', 'createDate'];
                for (let key in _template) {
                    if (Object.prototype.hasOwnProperty.call(template, key) && ignoreKeys.indexOf(key) == -1)
                        _template[key] = template[key];
                }
                _template.updateDate = Tools.$DateFormat('YYYY-mm-dd HH:MM:SS', new Date());
                dataDB.set('templates', templates).write();
                resolve({
                    status: 'success',
                    data: _template,
                    code: 200,
                    message: '更新模板成功 (Update template successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '更新模板失败 (Failed to update template)'
                });
            }
        });
    }

    /**
     * @summary 删除模板 (Delete template)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} id 模板id (Template id)
     * @returns {Promise} 删除结果 (Delete result)
    */
    static async deleteTemplate(uri, id) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            try {
                let templates = dataDB.get('templates').value();
                let _template = templates.find((el) => {
                    return el.id == id;
                });
                if (!_template) {
                    reject({
                        status: 'error',
                        data: null,
                        code: 404,
                        message: '未找到模板 (Template not found)'
                    });
                    return;
                }
                templates.splice(templates.indexOf(_template), 1);
                dataDB.set('templates', templates).write();
                ipc.send("remove-file", {
                    id,
                    path: path.join(
                        uri,
                        "root/templates",
                        `${id}.json`
                    ),
                });
                ipc.on(`remove-file-${id}`, (event, arg) => {
                    if (arg.status == 200) {
                        resolve({
                            status: 'success',
                            data: _template,
                            code: 200,
                            message: '删除模板成功 (Delete template successfully)'
                        });
                    }
                    else {
                        reject({
                            status: 'error',
                            data: null,
                            code: 500,
                            message: arg.message
                        });
                    }
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: e,
                    code: 500,
                    message: '删除模板失败 (Failed to delete template)'
                });
            }
        });
    }

    /**
     * @summary 获取笔记内容 (Get note content)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} itemid 数据项id (Data item id)
     * @param {string} pageid 数据项笔记id (Data item note id)
     * @returns {Promise} 笔记内容 (Note content)
     * @description 笔记内容为PowerEditor json格式
    */
    static async getItemPageContent(uri, itemid, pageid) {
        return await new Promise((resolve, reject) => {
            let url = path.join(
                uri,
                "root/items",
                itemid,
                `${pageid}.json`
            );
            ipc.send("read-file", {
                id: url,
                path: url
            });
            ipc.on(`read-file-${url}`, (event, arg) => {
                if (arg.status == 200) {
                    resolve({
                        status: 'success',
                        data: arg.data,
                        code: 200,
                        message: '获取模板内容成功 (Get template content successfully)'
                    });
                }
                else {
                    reject({
                        status: 'error',
                        data: null,
                        code: 500,
                        message: arg.message
                    });
                }
            });
        });
    }

    /**
     * @summary 保存笔记内容 (Save note content)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} itemid 数据项id (Data item id)
     * @param {string} pageid 数据项笔记id (Data item note id)
     * @param {string} content 笔记内容 (Note content)
     * @returns {Promise} 笔记内容 (Note content)
     * @description 笔记内容为PowerEditor json格式
    */
    static async saveItemPageContent(uri, itemid, pageid, content) {
        return await new Promise((resolve, reject) => {
            let url = path.join(
                uri,
                "root/items",
                itemid,
                `${pageid}.json`
            );
            ipc.send("output-file", {
                id: url,
                path: url,
                data: content,
            });
            ipc.on(`output-file-${url}`, (event, arg) => {
                if (arg.status == 200) {
                    resolve({
                        status: 'success',
                        data: arg.data,
                        code: 200,
                        message: '保存笔记内容成功 (Save note content successfully)'
                    });
                }
                else {
                    reject({
                        status: 'error',
                        data: null,
                        code: 500,
                        message: arg.message
                    });
                }
            });
        });
    }

    /**
     * @summary 获取数据项PDF (Get item pdf)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} itemid 数据项id (Data item id)
     * @param {string} pdfid 数据项pdfid (Data item pdf id)
     * @returns {Blob} pdf内容 (Pdf content)
    */
    static async getItemPDF(uri, itemid, pdfid) {
        return await new Promise((resolve, reject) => {
            let url = path.join(
                uri,
                "root/items",
                itemid,
                `${pdfid}.pdf`
            );
            let guid = Tools.$Guid();
            ipc.send("read-binary", {
                id: guid,
                path: url,
            });
            ipc.on(`read-binary-${guid}`, (event, arg) => {
                let blob = new Blob([arg.data], { type: "application/pdf" });
                if (arg.status == 200) {
                    resolve({
                        status: 'success',
                        data: blob,
                        code: 200,
                        message: '成功获取到PDF (Successfully obtained PDF)'
                    });
                }
                else {
                    reject({
                        status: 'error',
                        data: null,
                        code: 500,
                        message: arg.message
                    });
                }
            });
        });
    }

    /**
     * @summary 更新数据项PDF (Update item pdf)
     * @param {string} uri 数据源路径 (Data source path)
     * @param {string} itemid 数据项id (Data item id)
     * @param {string} pdfid 数据项pdfid (Data item pdf id)
     * @param {Blob} pdf pdf内容 (Pdf content)
     * @returns {Promise} pdf内容 (Pdf content)
     * @description pdf内容为Blob格式
     */
    static async updateItemPDF(uri, itemid, pdfid, pdf) {
        return await new Promise((resolve, reject) => {
            let dataDB = this.ensureDataDB(uri);
            let items = dataDB.get('items').value();
            let item = items.find((el) => {
                return el.id == itemid;
            });
            if (!item) {
                reject({
                    status: 'error',
                    data: null,
                    code: 500,
                    message: '数据项不存在 (Data item does not exist)'
                });
            }
            item.pdf = pdfid;
            item.updateDate = Tools.$DateFormat('YYYY-mm-dd HH:MM:SS', new Date());
            let url = path.join(
                uri,
                "root/items",
                itemid,
                `${pdfid}.pdf`
            );
            let guid = Tools.$Guid();
            let reader = new FileReader();
            reader.readAsArrayBuffer(pdf);
            reader.onload = e => {
                let buffer = Buffer.from(e.target.result);
                ipc.send("save-buffer", {
                    id: guid,
                    path: url,
                    data: buffer,
                });
            }
            ipc.on(`save-buffer-${guid}`, (event, arg) => {
                if (arg.status == 200) {
                    dataDB.set('items', items).write();
                    resolve({
                        status: 'success',
                        code: 200,
                        message: '成功更新PDF (Successfully updated PDF)'
                    });
                }
                else {
                    reject({
                        status: 'error',
                        code: 500,
                        message: 'no'
                    });
                }
            });
        });
    }

    /**
     * @summary 翻译文本 (Translate text)
     * @param {string} text 文本 (Text)
     * @param {string} from 源语言 (Source language)
     * @param {string} to 目标语言 (Target language)
     * @returns {Promise} 翻译结果 (Translation result)
    */
    static async getTranslation(text, from, to) {
        return await new Promise((resolve, reject) => {
            let guid = Tools.$Guid();
            ipc.send("translate", {
                id: guid,
                text: text,
                from,
                to,
            });

            ipc.on(`translate-callback-${guid}`, (event, arg) => {
                if (arg.status == 200) {
                    resolve({
                        status: 'success',
                        data: arg.data,
                        code: 200,
                        message: '翻译成功 (Translation successfully)'
                    });
                }
                else {
                    reject({
                        status: 'error',
                        data: arg.data,
                        code: 500,
                        message: arg.message
                    });
                }
            }
            );
        });
    }
}

export class NotebookController {

    /**
     * @summary 读取文件 (Read file)
     * @param {string} uri 数据源路径, 在本地访问只作为占位符 (Data source path, only as a placeholder for local access)
     * @param {string} filePath 文件路径 (File path)
     * @returns {Promise} 文件内容 (File content)
     * @description 文件内容为PowerEditor json格式
    */
    static async getDocumentAsync(uri, filePath) {
        return await new Promise((resolve, reject) => {
            ipc.send("read-file", {
                id: uri + filePath,
                path: filePath,
                target: filePath,
            });
            ipc.on(`read-file-${uri + filePath}`, (event, arg) => {
                if (arg.status == 200) {
                    resolve({
                        status: 'success',
                        data: arg.data,
                        code: 200,
                        message: '读取文件成功 (Read file successfully)'
                    });
                }
                else {
                    reject({
                        status: 'error',
                        data: null,
                        code: 500,
                        message: arg.message
                    });
                }
            }
            );
        });
    }

    /**
     * @summary 创建笔记文件 (Create note file)
     * @param {string} uri 数据源路径, 在本地访问只作为占位符 (Data source path, only as a placeholder for local access)
     * @param {string} filePath 文件路径 (File path)
     * @param {string} content 文件内容 (File content)
     * @returns {Promise} 创建结果 (Create result)
     * @description 文件内容为PowerEditor json格式
    */
    static async createDocumentAsync(uri, filePath, content) {
        return await new Promise((resolve, reject) => {
            ipc.send("output-file", {
                id: uri + filePath,
                path: filePath,
                data: content,
            });
            ipc.on(`output-file-${uri + filePath}`, (event, arg) => {
                if (arg.status == 200) {
                    resolve({
                        status: 'success',
                        data: arg.data,
                        code: 200,
                        message: '创建文件成功 (Create file successfully)'
                    });
                }
                else {
                    reject({
                        status: 'error',
                        data: null,
                        code: 500,
                        message: arg.message
                    });
                }
            }
            );
        });
    }

    /**
     * @summary 更新笔记文件 (Update note file)
     * @param {string} uri 数据源路径, 在本地访问只作为占位符 (Data source path, only as a placeholder for local access)
     * @param {string} filePath 文件路径 (File path)
     * @param {string} content 文件内容 (File content)
     * @returns {Promise} 保存结果 (Save result)
     * @description 文件内容为PowerEditor json格式
    */
    static async updateDocumentAsync(uri, filePath, content) {
        return await new Promise((resolve, reject) => {
            ipc.send("output-file", {
                id: uri + filePath,
                path: filePath,
                data: content,
            });
            ipc.on(`output-file-${uri + filePath}`, (event, arg) => {
                if (arg.status == 200) {
                    resolve({
                        status: 'success',
                        data: arg.data,
                        code: 200,
                        message: '保存文件成功 (Save file successfully)'
                    });
                }
                else {
                    reject({
                        status: 'error',
                        data: null,
                        code: 500,
                        message: arg.message
                    });
                }
            });
        });
    }

    /**
     * @summary 删除笔记文件 (Delete note file)
     * @param {string} uri 数据源路径, 在本地访问只作为占位符 (Data source path, only as a placeholder for local access)
     * @param {string} filePath 文件路径 (File path)
     * @returns {Promise} 删除结果 (Delete result)
     * @description 文件内容为PowerEditor json格式
    */
    static async removeDocumentAsync(uri, filePath) {
        return await new Promise((resolve, reject) => {
            ipc.send("remove-file", {
                id: uri + filePath,
                path: filePath,
            });
            ipc.on(`remove-file-${uri + filePath}`, (event, arg) => {
                if (arg.status == 200) {
                    resolve({
                        status: 'success',
                        data: arg.data,
                        code: 200,
                        message: '删除文件成功 (Delete file successfully)'
                    });
                }
                else {
                    reject({
                        status: 'error',
                        data: null,
                        code: 500,
                        message: arg.message
                    });
                }
            });
        });
    }

    /**
     * @summary 判断路径存在 (Determine if the path exists)
     * @param {string} uri 数据源路径, 在本地访问只作为占位符 (Data source path, only as a placeholder for local access)
     * @param {string} filePath 文件路径, 既能判断目录是否存在, 也能判断目录下的文件是否存在 (File path, can determine whether the directory exists, and can also determine whether the file under the directory exists)
     * @returns {Promise} 是否存在 (Whether it exists)
    */
    static async existsPathAsync(uri, filePath) {
        return await new Promise((resolve, reject) => {
            ipc.send("exists-path", {
                id: uri + filePath,
                path: filePath,
            });
            ipc.on(`exists-path-${uri + filePath}`, (event, arg) => {
                if (arg.status == 200) {
                    resolve({
                        status: 'success',
                        data: arg.exists,
                        code: 200,
                        message: '判断路径存在成功 (Determine if the path exists successfully)'
                    });
                }
                else {
                    reject({
                        status: 'error',
                        data: null,
                        code: 500,
                        message: arg.message
                    });
                }
            }
            );
        });
    }

    /**
     * @summary 创建目录 (Create directory)
     * @param {string} uri 数据源路径, 在本地访问只作为占位符 (Data source path, only as a placeholder for local access)
     * @param {string} filePath 目录路径 (Directory path)
     * @returns {Promise} 是否创建成功 (Whether it is created successfully)
    */
    static async createDirectoryAsync(uri, filePath) {
        return await new Promise((resolve, reject) => {
            ipc.send("ensure-folder", {
                id: uri + filePath,
                dir: filePath,
            });
            ipc.on(`ensure-folder-${uri + filePath}`, (event, arg) => {
                if (arg.status == 200) {
                    resolve({
                        status: 'success',
                        data: arg.data,
                        code: 200,
                        message: '创建目录成功 (Create directory successfully)'
                    });
                }
                else {
                    reject({
                        status: 'error',
                        data: null,
                        code: 500,
                        message: arg.message
                    });
                }
            }
            );
        });
    }

    /**
     * @summary 更新目录信息 (Update directory information)
     * @param {string} uri 数据源路径, 在本地访问只作为占位符 (Data source path, only as a placeholder for local access)
     * @param {string} filePath 目录路径 (Directory path)
     * @param {object} info 目录信息 (Directory information)
     * @returns {Promise} 是否更新成功 (Whether it is updated successfully)
    */
    static async updateDirectoryInfoAsync(uri, filePath, info) {
        return await new Promise((resolve, reject) => {
            ipc.send("rename", {
                id: uri + filePath,
                path: filePath,
                newPath: path.join(path.dirname(filePath), info.name),
            });
            ipc.on(`update-folder-info-${uri + filePath}`, (event, arg) => {
                if (arg.status == 200) {
                    resolve({
                        status: 'success',
                        data: arg.data,
                        code: 200,
                        message: '更新目录信息成功 (Update directory information successfully)'
                    });
                }
                else {
                    reject({
                        status: 'error',
                        data: null,
                        code: 500,
                        message: arg.message
                    });
                }
            }
            );
        });
    }

    /**
     * @summary 删除目录 (Delete directory)
     * @param {string} uri 数据源路径, 在本地访问只作为占位符 (Data source path, only as a placeholder for local access)
     * @param {string} filePath 目录路径 (Directory path)
     * @returns {Promise} 是否删除成功 (Whether it is deleted successfully)
     * @description 本地删除目录时, 会将目录下的所有文件一并删除 (When deleting a directory locally, all files under the directory will be deleted together)
    */
    static async removeDirectoryAsync(uri, filePath) {
        return await new Promise((resolve, reject) => {
            ipc.send("remove-folder", {
                id: uri + filePath,
                path: filePath,
            });
            ipc.on(`remove-folder-${uri + filePath}`, (event, arg) => {
                if (arg.status == 200) {
                    resolve({
                        status: 'success',
                        data: arg.data,
                        code: 200,
                        message: '删除目录成功 (Delete directory successfully)'
                    });
                }
                else {
                    reject({
                        status: 'error',
                        data: null,
                        code: 500,
                        message: '删除目录失败 (Failed to delete directory)'
                    });
                }
            }
            );
        });
    }

    /**
     * @summary 复制目录或文件 (Copy directory or file)
     * @param {string} uri 数据源路径, 在本地访问只作为占位符 (Data source path, only as a placeholder for local access)
     * @param {string} filePath 源路径 (Source path)
     * @param {string} newPath 新目录路径 (New directory path)
     * @returns {Promise} 是否复制成功 (Whether it is copied successfully)
     * @description 本地复制目录或文件时, 会将目录下的所有文件一并复制 (When copying a directory or file locally, all files under the directory will be copied together)
    */
    static async copyDirectoryAsync(uri, filePath, newPath) {
        return await new Promise((resolve, reject) => {
            ipc.send("copy-file", {
                id: uri + filePath + '@' + newPath,
                src: filePath,
                tgt: newPath,
            });
            ipc.on(`copy-file-${uri + filePath + '@' + newPath}`, (event, arg) => {
                if (arg.status == 200) {
                    resolve({
                        status: 'success',
                        code: 200,
                        message: '复制目录成功 (Copy directory successfully)'
                    });
                }
                else {
                    reject({
                        status: 'error',
                        code: 500,
                        message: '复制目录失败 (Failed to copy directory)'
                    });
                }
            });
        });
    }

    /**
     * @summary 移动目录或文件 (Move directory or file)
     * @param {string} uri 数据源路径, 在本地访问只作为占位符 (Data source path, only as a placeholder for local access)
     * @param {string} filePath 目录路径 (Directory path)
     * @param {string} newPath 新目录路径 (New directory path)
     * @returns {Promise} 是否移动成功 (Whether it is moved successfully)
     * @description 本地移动目录时, 会将目录下的所有文件一并移动 (When moving a directory locally, all files under the directory will be moved together)
    */
    static async moveDirectoryAsync(uri, filePath, newPath) {
        return await new Promise((resolve, reject) => {
            ipc.send("move-file", {
                id: uri + filePath + '@' + newPath,
                src: filePath,
                tgt: newPath,
            });
            ipc.on(`move-file-${uri + filePath + '@' + newPath}`, (event, arg) => {
                if (arg.status == 200) {
                    resolve({
                        status: 'success',
                        code: 200,
                        message: '移动目录成功 (Move directory successfully)'
                    });
                }
                else {
                    reject({
                        status: 'error',
                        code: 500,
                        message: '移动目录失败 (Failed to move directory)'
                    });
                }
            });
        });
    }

    /**
     * @summary 打开目录或文件 (Open directory or file)
     * @param {string} uri 数据源路径, 在本地访问只作为占位符 (Data source path, only as a placeholder for local access)
     * @param {string} filePath 目录或文件路径 (Directory or file path)
     * @returns {Promise} 是否打开成功 (Whether it is opened successfully)
     * @description 本地打开目录或文件时, 会调用系统默认的打开方式 (When opening a directory or file locally, the system's default opening method will be called)
    */
    static async openFile(uri, filePath) {
        return await new Promise((resolve, reject) => {
            ipc.send("open-file", {
                id: uri,
                path: filePath,
            });
            ipc.on(`open-file-${uri}`, (event, arg) => {
                if (arg.status == 200) {
                    resolve({
                        status: 'success',
                        data: arg.data,
                        code: 200,
                        message: '打开文件成功 (Open file successfully)'
                    });
                }
                else {
                    reject({
                        status: 'error',
                        data: null,
                        code: 500,
                        message: arg.message
                    });
                }
            });

        });
    }

    /**
     * @summary 获取本地程序下的Process (Get Process under local program)
     * @returns {Promise} Process
    */
    static async getLocalProcess() {
        return await new Promise((resolve, reject) => {
            try {
                const { process } = require('@electron/remote');
                resolve({
                    status: 'success',
                    data: process,
                    code: 200,
                    message: '获取Process成功 (Get Process successfully)'
                });
            }
            catch (e) {
                reject({
                    status: 'error',
                    data: null,
                    code: 500,
                    message: '获取Process失败 (Failed to get Process)'
                });
            }
        });
    }
}