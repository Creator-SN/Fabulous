/* eslint-disable */
// More information: https://github.com/minskiter/openapijs
import axios from './config.js'
import {CancelTokenSource} from 'axios'
import * as UserModel from './model.js'

axios.interceptors.request.use(
  config => {
    if (
      config.headers["Content-Type"].includes("x-www-form-urlencoded") ||
      config.headers["Content-Type"].includes("multipart/form-data")
    ) {
      let formData = new FormData();
      for (let item in config.data) {
        if (config.data[item])
        if (
          typeof config.data[item] == "object" &&
          Array.isArray(config.data[item])
        ){  
          for (let index in config.data[item]){
              let i = config.data[item][index];
              formData.append(item,i);
          }
        }
        else formData.append(item, config.data[item]);
      }
      config.data = formData;
    }
    return config;
  },
  error=>{
    return Promise.reject(error)
  }
)
export class NoteBookController {
 
  /**
  * @summary 更新笔记本
  * @param {String} [pathid] 
  * @param {UserModel.NoteBookUpdateDTO} [notebookupdatedto] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateNoteBook(pathid,notebookupdatedto,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/notebooks/'+pathid+'/info',
        data:notebookupdatedto,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 更新笔记本分组的信息
  * @param {String} [pathid] 
  * @param {UserModel.GroupUpdateDTO} [groupupdatedto] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateGroup(pathid,groupupdatedto,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/notebook/groups/'+pathid+'/info',
        data:groupupdatedto,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 添加内容到笔记本中
  * @param {String} [pathid] 
  * @param {UserModel.NoteBookContentDTO} [notebookcontentdto] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async addNoteBookContent(pathid,notebookcontentdto,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/notebooks/'+pathid+'/content',
        data:notebookcontentdto,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 创建笔记本
  * @param {UserModel.NoteBookCreateDTO} [notebookcreatedto] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createNoteBook(notebookcreatedto,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/notebooks/',
        data:notebookcreatedto,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 创建笔记本分组文件夹
  * @param {UserModel.GroupCreateDTO} [groupcreatedto] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createGroup(groupcreatedto,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/notebook/groups',
        data:groupcreatedto,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取笔记本
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getNodeBook(pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/notebooks/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 删除笔记本
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async deleteNoteBook(pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/notebooks/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取笔记本内容的历史
  * @param {String} [pathid] 
  * @param {Number} [pagesize] 
  * @param {String} [lastversionid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getNoteBookContentHistory(pathid,pagesize,lastversionid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/notebooks/'+pathid+'/content/history',
        data:{},
        params:{pagesize,lastversionid},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 列出分组下的所有笔记本
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async listNotebooks(pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/notebook/groups/'+pathid+'/notebooks',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取指定分组的子分组
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async listGroupChildren(pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/notebook/groups/'+pathid+'/children',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 删除指定的笔记本分组
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async deleteGroup(pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/notebook/groups/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
}

// class NoteBookController static method properties bind
/**
* @description updateNoteBook url链接，包含baseURL
*/
NoteBookController.updateNoteBook.fullPath=`${axios.defaults.baseURL}/notebooks/{id}/info`
/**
* @description updateNoteBook url链接，不包含baseURL
*/
NoteBookController.updateNoteBook.path=`/notebooks/{id}/info`
/**
* @description updateGroup url链接，包含baseURL
*/
NoteBookController.updateGroup.fullPath=`${axios.defaults.baseURL}/notebook/groups/{id}/info`
/**
* @description updateGroup url链接，不包含baseURL
*/
NoteBookController.updateGroup.path=`/notebook/groups/{id}/info`
/**
* @description addNoteBookContent url链接，包含baseURL
*/
NoteBookController.addNoteBookContent.fullPath=`${axios.defaults.baseURL}/notebooks/{id}/content`
/**
* @description addNoteBookContent url链接，不包含baseURL
*/
NoteBookController.addNoteBookContent.path=`/notebooks/{id}/content`
/**
* @description createNoteBook url链接，包含baseURL
*/
NoteBookController.createNoteBook.fullPath=`${axios.defaults.baseURL}/notebooks/`
/**
* @description createNoteBook url链接，不包含baseURL
*/
NoteBookController.createNoteBook.path=`/notebooks/`
/**
* @description createGroup url链接，包含baseURL
*/
NoteBookController.createGroup.fullPath=`${axios.defaults.baseURL}/notebook/groups`
/**
* @description createGroup url链接，不包含baseURL
*/
NoteBookController.createGroup.path=`/notebook/groups`
/**
* @description getNodeBook url链接，包含baseURL
*/
NoteBookController.getNodeBook.fullPath=`${axios.defaults.baseURL}/notebooks/{id}`
/**
* @description getNodeBook url链接，不包含baseURL
*/
NoteBookController.getNodeBook.path=`/notebooks/{id}`
/**
* @description deleteNoteBook url链接，包含baseURL
*/
NoteBookController.deleteNoteBook.fullPath=`${axios.defaults.baseURL}/notebooks/{id}`
/**
* @description deleteNoteBook url链接，不包含baseURL
*/
NoteBookController.deleteNoteBook.path=`/notebooks/{id}`
/**
* @description getNoteBookContentHistory url链接，包含baseURL
*/
NoteBookController.getNoteBookContentHistory.fullPath=`${axios.defaults.baseURL}/notebooks/{id}/content/history`
/**
* @description getNoteBookContentHistory url链接，不包含baseURL
*/
NoteBookController.getNoteBookContentHistory.path=`/notebooks/{id}/content/history`
/**
* @description listNotebooks url链接，包含baseURL
*/
NoteBookController.listNotebooks.fullPath=`${axios.defaults.baseURL}/notebook/groups/{id}/notebooks`
/**
* @description listNotebooks url链接，不包含baseURL
*/
NoteBookController.listNotebooks.path=`/notebook/groups/{id}/notebooks`
/**
* @description listGroupChildren url链接，包含baseURL
*/
NoteBookController.listGroupChildren.fullPath=`${axios.defaults.baseURL}/notebook/groups/{id}/children`
/**
* @description listGroupChildren url链接，不包含baseURL
*/
NoteBookController.listGroupChildren.path=`/notebook/groups/{id}/children`
/**
* @description deleteGroup url链接，包含baseURL
*/
NoteBookController.deleteGroup.fullPath=`${axios.defaults.baseURL}/notebook/groups/{id}`
/**
* @description deleteGroup url链接，不包含baseURL
*/
NoteBookController.deleteGroup.path=`/notebook/groups/{id}`

export class UserController {
 
  /**
  * @summary 用户注册
  * @param {UserModel.UserRegister} [userregister] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async register(userregister,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/users',
        data:userregister,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 为用户添加角色
  * @param {String} [pathuserid] 
  * @param {String} [pathroleid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async addRoleToUser(pathuserid,pathroleid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/users/'+pathuserid+'/roles/'+pathroleid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 为用户删除角色
  * @param {String} [pathuserid] 
  * @param {String} [pathroleid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async removeRoleFromUser(pathuserid,pathroleid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/users/'+pathuserid+'/roles/'+pathroleid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 用户修改密码
  * @param {String} [pathid] 
  * @param {UserModel.UserUpdatePassword} [userupdatepassword] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updatePassword(pathid,userupdatepassword,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/users/'+pathid+'/password',
        data:userupdatepassword,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 发送忘记密码邮件
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async sendForgotVerifiedEmail(pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/users/'+pathid+'/forgot/code',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 发送验证邮件
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async sendVerifiedEmail(pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/users/'+pathid+'/email/code',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 用户登陆
  * @param {UserModel.UserLogin} [userlogin] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async login(userlogin,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/users/session',
        data:userlogin,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取所有的角色
  * @param {String} [query] 
  * @param {Number} [offset] 
  * @param {Number} [pagesize] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getAllRoles(query,offset,pagesize,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/users/roles',
        data:{},
        params:{query,offset,pagesize},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 创建角色
  * @param {UserModel.RoleRequest} [rolerequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createRole(rolerequest,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/users/roles',
        data:rolerequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 我的信息
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getMyUserInfo(cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/users/me/info',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 更新我的信息
  * @param {UserModel.UserUpdate} [userupdate] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateMyUserInfo(userupdate,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/users/me/info',
        data:userupdate,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取我的头像
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getMyAvatar(cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/users/me/avatar',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 更新我的头像
  * @param {UserModel.UpdateAvatarRequest} [updateavatarrequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateMyAvatar(updateavatarrequest,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/users/me/avatar',
        data:updateavatarrequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取指定用户的角色
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getUserRoles(pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/users/'+pathid+'/roles',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取指定用户的头像
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getAvatar(pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/users/'+pathid+'/avatar',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取我的角色
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getMyRoles(cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/users/me/roles',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 查询用户信息
  * @param {String} [query] 
  * @param {String} [gender] 
  * @param {String} [offset] 
  * @param {String} [pagesize] 
  * @param {String} [sortkey] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getUsers(query,gender,offset,pagesize,sortkey,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/users/info',
        data:{},
        params:{query,gender,offset,pagesize,sortkey},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 删除角色
  * @param {String} [pathroleid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async deleteRole(pathroleid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/users/roles/'+pathroleid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
}

// class UserController static method properties bind
/**
* @description register url链接，包含baseURL
*/
UserController.register.fullPath=`${axios.defaults.baseURL}/users`
/**
* @description register url链接，不包含baseURL
*/
UserController.register.path=`/users`
/**
* @description addRoleToUser url链接，包含baseURL
*/
UserController.addRoleToUser.fullPath=`${axios.defaults.baseURL}/users/{userId}/roles/{roleId}`
/**
* @description addRoleToUser url链接，不包含baseURL
*/
UserController.addRoleToUser.path=`/users/{userId}/roles/{roleId}`
/**
* @description removeRoleFromUser url链接，包含baseURL
*/
UserController.removeRoleFromUser.fullPath=`${axios.defaults.baseURL}/users/{userId}/roles/{roleId}`
/**
* @description removeRoleFromUser url链接，不包含baseURL
*/
UserController.removeRoleFromUser.path=`/users/{userId}/roles/{roleId}`
/**
* @description updatePassword url链接，包含baseURL
*/
UserController.updatePassword.fullPath=`${axios.defaults.baseURL}/users/{id}/password`
/**
* @description updatePassword url链接，不包含baseURL
*/
UserController.updatePassword.path=`/users/{id}/password`
/**
* @description sendForgotVerifiedEmail url链接，包含baseURL
*/
UserController.sendForgotVerifiedEmail.fullPath=`${axios.defaults.baseURL}/users/{id}/forgot/code`
/**
* @description sendForgotVerifiedEmail url链接，不包含baseURL
*/
UserController.sendForgotVerifiedEmail.path=`/users/{id}/forgot/code`
/**
* @description sendVerifiedEmail url链接，包含baseURL
*/
UserController.sendVerifiedEmail.fullPath=`${axios.defaults.baseURL}/users/{id}/email/code`
/**
* @description sendVerifiedEmail url链接，不包含baseURL
*/
UserController.sendVerifiedEmail.path=`/users/{id}/email/code`
/**
* @description login url链接，包含baseURL
*/
UserController.login.fullPath=`${axios.defaults.baseURL}/users/session`
/**
* @description login url链接，不包含baseURL
*/
UserController.login.path=`/users/session`
/**
* @description getAllRoles url链接，包含baseURL
*/
UserController.getAllRoles.fullPath=`${axios.defaults.baseURL}/users/roles`
/**
* @description getAllRoles url链接，不包含baseURL
*/
UserController.getAllRoles.path=`/users/roles`
/**
* @description createRole url链接，包含baseURL
*/
UserController.createRole.fullPath=`${axios.defaults.baseURL}/users/roles`
/**
* @description createRole url链接，不包含baseURL
*/
UserController.createRole.path=`/users/roles`
/**
* @description getMyUserInfo url链接，包含baseURL
*/
UserController.getMyUserInfo.fullPath=`${axios.defaults.baseURL}/users/me/info`
/**
* @description getMyUserInfo url链接，不包含baseURL
*/
UserController.getMyUserInfo.path=`/users/me/info`
/**
* @description updateMyUserInfo url链接，包含baseURL
*/
UserController.updateMyUserInfo.fullPath=`${axios.defaults.baseURL}/users/me/info`
/**
* @description updateMyUserInfo url链接，不包含baseURL
*/
UserController.updateMyUserInfo.path=`/users/me/info`
/**
* @description getMyAvatar url链接，包含baseURL
*/
UserController.getMyAvatar.fullPath=`${axios.defaults.baseURL}/users/me/avatar`
/**
* @description getMyAvatar url链接，不包含baseURL
*/
UserController.getMyAvatar.path=`/users/me/avatar`
/**
* @description updateMyAvatar url链接，包含baseURL
*/
UserController.updateMyAvatar.fullPath=`${axios.defaults.baseURL}/users/me/avatar`
/**
* @description updateMyAvatar url链接，不包含baseURL
*/
UserController.updateMyAvatar.path=`/users/me/avatar`
/**
* @description getUserRoles url链接，包含baseURL
*/
UserController.getUserRoles.fullPath=`${axios.defaults.baseURL}/users/{id}/roles`
/**
* @description getUserRoles url链接，不包含baseURL
*/
UserController.getUserRoles.path=`/users/{id}/roles`
/**
* @description getAvatar url链接，包含baseURL
*/
UserController.getAvatar.fullPath=`${axios.defaults.baseURL}/users/{id}/avatar`
/**
* @description getAvatar url链接，不包含baseURL
*/
UserController.getAvatar.path=`/users/{id}/avatar`
/**
* @description getMyRoles url链接，包含baseURL
*/
UserController.getMyRoles.fullPath=`${axios.defaults.baseURL}/users/me/roles`
/**
* @description getMyRoles url链接，不包含baseURL
*/
UserController.getMyRoles.path=`/users/me/roles`
/**
* @description getUsers url链接，包含baseURL
*/
UserController.getUsers.fullPath=`${axios.defaults.baseURL}/users/info`
/**
* @description getUsers url链接，不包含baseURL
*/
UserController.getUsers.path=`/users/info`
/**
* @description deleteRole url链接，包含baseURL
*/
UserController.deleteRole.fullPath=`${axios.defaults.baseURL}/users/roles/{roleId}`
/**
* @description deleteRole url链接，不包含baseURL
*/
UserController.deleteRole.path=`/users/roles/{roleId}`

export class SystemController {
 
  /**
  * @summary 获取系统邮件
  * @param {String} [query] 
  * @param {Number} [offset] 
  * @param {Number} [pagesize] 
  * @param {String} [lastkey] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getSystemEmails(query,offset,pagesize,lastkey,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/system/emails',
        data:{},
        params:{query,offset,pagesize,lastkey},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 添加系统邮件
  * @param {UserModel.EmailRequest} [emailrequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async addEmail(emailrequest,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/system/emails',
        data:emailrequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取系统邮件模板
  * @param {String} [before] 
  * @param {Number} [offset] 
  * @param {Number} [pagesize] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getEmailTemplate(before,offset,pagesize,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/system/emailTemplates',
        data:{},
        params:{before,offset,pagesize},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 添加系统邮件模板
  * @param {UserModel.AddEmailTemplateModel} [addemailtemplatemodel] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async addEmailTemplate(addemailtemplatemodel,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/system/emailTemplates',
        data:addemailtemplatemodel,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 更新系统邮件模板
  * @param {String} [pathid] 
  * @param {UserModel.UpdateEmailTemplateModel} [updateemailtemplatemodel] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateEmailTemplate(pathid,updateemailtemplatemodel,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/system/emailTemplates/'+pathid+'',
        data:updateemailtemplatemodel,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 添加系统配置
  * @param {UserModel.AddWebsiteConfigDTO} [addwebsiteconfigdto] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async setConfig(addwebsiteconfigdto,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/system/config',
        data:addwebsiteconfigdto,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取系统所有的状态码
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getAllStatusCode(cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/system/statusCode',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取登陆系统配置
  * @param {String} [pathname] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getUserConfig(pathname,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/system/config/user/'+pathname+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取系统配置
  * @param {String} [pathname] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getPublicConfig(pathname,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/system/config/public/'+pathname+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取管理员系统配置
  * @param {String} [pathname] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getAdminConfig(pathname,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/system/config/admin/'+pathname+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 删除系统邮件
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async delete(pathid,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/system/emails/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
}

// class SystemController static method properties bind
/**
* @description getSystemEmails url链接，包含baseURL
*/
SystemController.getSystemEmails.fullPath=`${axios.defaults.baseURL}/system/emails`
/**
* @description getSystemEmails url链接，不包含baseURL
*/
SystemController.getSystemEmails.path=`/system/emails`
/**
* @description addEmail url链接，包含baseURL
*/
SystemController.addEmail.fullPath=`${axios.defaults.baseURL}/system/emails`
/**
* @description addEmail url链接，不包含baseURL
*/
SystemController.addEmail.path=`/system/emails`
/**
* @description getEmailTemplate url链接，包含baseURL
*/
SystemController.getEmailTemplate.fullPath=`${axios.defaults.baseURL}/system/emailTemplates`
/**
* @description getEmailTemplate url链接，不包含baseURL
*/
SystemController.getEmailTemplate.path=`/system/emailTemplates`
/**
* @description addEmailTemplate url链接，包含baseURL
*/
SystemController.addEmailTemplate.fullPath=`${axios.defaults.baseURL}/system/emailTemplates`
/**
* @description addEmailTemplate url链接，不包含baseURL
*/
SystemController.addEmailTemplate.path=`/system/emailTemplates`
/**
* @description updateEmailTemplate url链接，包含baseURL
*/
SystemController.updateEmailTemplate.fullPath=`${axios.defaults.baseURL}/system/emailTemplates/{id}`
/**
* @description updateEmailTemplate url链接，不包含baseURL
*/
SystemController.updateEmailTemplate.path=`/system/emailTemplates/{id}`
/**
* @description setConfig url链接，包含baseURL
*/
SystemController.setConfig.fullPath=`${axios.defaults.baseURL}/system/config`
/**
* @description setConfig url链接，不包含baseURL
*/
SystemController.setConfig.path=`/system/config`
/**
* @description getAllStatusCode url链接，包含baseURL
*/
SystemController.getAllStatusCode.fullPath=`${axios.defaults.baseURL}/system/statusCode`
/**
* @description getAllStatusCode url链接，不包含baseURL
*/
SystemController.getAllStatusCode.path=`/system/statusCode`
/**
* @description getUserConfig url链接，包含baseURL
*/
SystemController.getUserConfig.fullPath=`${axios.defaults.baseURL}/system/config/user/{name}`
/**
* @description getUserConfig url链接，不包含baseURL
*/
SystemController.getUserConfig.path=`/system/config/user/{name}`
/**
* @description getPublicConfig url链接，包含baseURL
*/
SystemController.getPublicConfig.fullPath=`${axios.defaults.baseURL}/system/config/public/{name}`
/**
* @description getPublicConfig url链接，不包含baseURL
*/
SystemController.getPublicConfig.path=`/system/config/public/{name}`
/**
* @description getAdminConfig url链接，包含baseURL
*/
SystemController.getAdminConfig.fullPath=`${axios.defaults.baseURL}/system/config/admin/{name}`
/**
* @description getAdminConfig url链接，不包含baseURL
*/
SystemController.getAdminConfig.path=`/system/config/admin/{name}`
/**
* @description delete url链接，包含baseURL
*/
SystemController.delete.fullPath=`${axios.defaults.baseURL}/system/emails/{id}`
/**
* @description delete url链接，不包含baseURL
*/
SystemController.delete.path=`/system/emails/{id}`

export class ConfigController {
 
  /**
  * @summary 创建或者更新用户配置文件
  * @param {UserModel.ConfigCreateOrUpdateDTO} [configcreateorupdatedto] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createOrUpdateConfig(configcreateorupdatedto,cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/configs',
        data:configcreateorupdatedto,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
 
  /**
  * @summary 获取用户的配置文件
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getConfig(cancelSource,uploadProgress,downloadProgress){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/me/config',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      // support wechat mini program
      if (cancelSource!=undefined){
        options.cancelToken = cancelSource.token
      }
      if (responseType != "json"){
        options.responseType = responseType;
      }
      axios(options)
      .then(res=>{
        if (res.config.responseType=="blob"){
          resolve(new Blob([res.data],{
            type: res.headers["content-type"].split(";")[0]
          }))
        }else{
          resolve(res.data);
          return res.data
        }
      }).catch(err=>{
        if (err.response.data)
          reject(err.response.data)
        else
          reject(err.response);
      })
    })
  }
}

// class ConfigController static method properties bind
/**
* @description createOrUpdateConfig url链接，包含baseURL
*/
ConfigController.createOrUpdateConfig.fullPath=`${axios.defaults.baseURL}/configs`
/**
* @description createOrUpdateConfig url链接，不包含baseURL
*/
ConfigController.createOrUpdateConfig.path=`/configs`
/**
* @description getConfig url链接，包含baseURL
*/
ConfigController.getConfig.fullPath=`${axios.defaults.baseURL}/me/config`
/**
* @description getConfig url链接，不包含baseURL
*/
ConfigController.getConfig.path=`/me/config`
