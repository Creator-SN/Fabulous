/* eslint-disable */
// More information: https://github.com/minskiter/openapijs
import axios from './config.js'
import * as Axios from 'axios'
import * as UserModel from './model.js'

// fix vite error.
const CancelTokenSource = Axios.CancelTokenSource;


export class AcademicController {
 
  /**
  * @summary 获取数据源的信息
  * @param {String} [pathuri] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getDataSourceInfo(pathuri,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/info',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取根目录下的所有区组信息
  * @param {String} [pathuri] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getRootGroups(pathuri,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/groups',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 更新区组
  * @param {String} [pathuri] 
  * @param {UserModel.GroupUpdateRequest} [groupupdaterequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateGroup(pathuri,groupupdaterequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/sources/'+pathuri+'/groups',
        data:groupupdaterequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取指定区组下的所有区组信息
  * @param {String} [pathuri] 
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getGroups(pathuri,pathid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/groups/'+pathid+'/subgroups',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 创建区组
  * @param {String} [pathuri] 
  * @param {String} [pathid] 
  * @param {UserModel.GroupCreateRequest} [groupcreaterequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createGroup(pathuri,pathid,groupcreaterequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/groups/'+pathid+'/subgroups',
        data:groupcreaterequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 删除区组
  * @param {String} [pathuri] 
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async deleteGroup(pathuri,pathid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/sources/'+pathuri+'/groups/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取根目录下的所有分区信息
  * @param {String} [pathuri] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getRootPartitions(pathuri,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/partitions',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取指定区组下的所有分区信息
  * @param {String} [pathuri] 
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getPartitions(pathuri,pathid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/groups/'+pathid+'/subpartitions',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取指定分区信息
  * @param {String} [pathuri] 
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getPartition(pathuri,pathid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/partitions/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 搜索 partitions
  * @param {String} [pathuri] 
  * @param {String} [keyword] 
  * @param {Number} [top] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async searchPartitions(pathuri,keyword,top,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/partition-matches',
        data:{},
        params:{keyword,top},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 创建分区
  * @param {String} [pathuri] 
  * @param {String} [pathgroupid] 
  * @param {UserModel.PartitionCreateRequest} [partitioncreaterequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createPartition(pathuri,pathgroupid,partitioncreaterequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/groups/'+pathgroupid+'/partitions',
        data:partitioncreaterequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 更新分区
  * @param {String} [pathuri] 
  * @param {String} [pathgroupid] 
  * @param {UserModel.PartitionUpdateRequest} [partitionupdaterequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updatePartition(pathuri,pathgroupid,partitionupdaterequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/sources/'+pathuri+'/groups/'+pathgroupid+'/partitions',
        data:partitionupdaterequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 删除分区
  * @param {String} [pathuri] 
  * @param {String} [pathgroupid] 
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async deletePartition(pathuri,pathgroupid,pathid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/sources/'+pathuri+'/groups/'+pathgroupid+'/partitions/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取指定分区下的所有数据项信息
  * @param {String} [pathuri] 
  * @param {String} [pathpartitionid] 
  * @param {Number} [length] 
  * @param {Number} [offset] 
  * @param {String} [sort] 
  * @param {undefined} [desc] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getItems(pathuri,pathpartitionid,length,offset,sort,desc,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/partitions/'+pathpartitionid+'/items',
        data:{},
        params:{length,offset,sort,desc},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取指定分区下的所有数据项数量
  * @param {String} [pathuri] 
  * @param {String} [pathpartitionid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getItemsCount(pathuri,pathpartitionid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/partitions/'+pathpartitionid+'/items/count',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取当前数据源下的所有数据项信息
  * @param {String} [pathuri] 
  * @param {Number} [length] 
  * @param {Number} [offset] 
  * @param {String} [sort] 
  * @param {undefined} [desc] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getAllItems(pathuri,length,offset,sort,desc,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/items',
        data:{},
        params:{length,offset,sort,desc},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 创建数据项
  * @param {String} [pathuri] 
  * @param {UserModel.DataItemCreateRequest} [dataitemcreaterequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createItem(pathuri,dataitemcreaterequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/items',
        data:dataitemcreaterequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 更新数据项
  * @param {String} [pathuri] 
  * @param {UserModel.DataItemUpdateRequest} [dataitemupdaterequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateItem(pathuri,dataitemupdaterequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/sources/'+pathuri+'/items',
        data:dataitemupdaterequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取当前数据源下的所有数据项数量
  * @param {String} [pathuri] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getAllItemsCount(pathuri,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/items/count',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 搜索获取数据项信息
  * @param {String} [pathuri] 
  * @param {undefined} [partitionid] 
  * @param {String} [keyword] 
  * @param {Number} [length] 
  * @param {Number} [offset] 
  * @param {String} [sort] 
  * @param {undefined} [desc] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getSearchItems(pathuri,partitionid,keyword,length,offset,sort,desc,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/partitions/items/matches',
        data:{},
        params:{partitionid,keyword,length,offset,sort,desc},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 根据数据项id获取指定数据项信息
  * @param {String} [pathuri] 
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getItem(pathuri,pathid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/items/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 删除数据项
  * @param {String} [pathuri] 
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async deleteItem(pathuri,pathid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/sources/'+pathuri+'/items/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 删除多个数据项
  * @param {String} [pathuri] 
  * @param {array} [array] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async deleteItems(pathuri,array,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/items/batched/deleted',
        data:array,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 将数据项添加到指定分区
  * @param {String} [pathuri] 
  * @param {String} [pathpartitionid] 
  * @param {array} [array] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async addItemsToPartition(pathuri,pathpartitionid,array,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/partitions/'+pathpartitionid+'/items/batched',
        data:array,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 更新数据项的元信息
  * @param {String} [pathuri] 
  * @param {String} [pathitemid] 
  * @param {UserModel.MetadataUpdateRequest} [metadataupdaterequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateItemMetadata(pathuri,pathitemid,metadataupdaterequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/sources/'+pathuri+'/items/'+pathitemid+'/metadata',
        data:metadataupdaterequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 从分区移除数据项
  * @param {String} [pathuri] 
  * @param {String} [pathpartitionid] 
  * @param {array} [array] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async removeItemsFromPartition(pathuri,pathpartitionid,array,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/partitions/'+pathpartitionid+'/items/batched/deleted',
        data:array,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 创建数据项的笔记
  * @param {String} [pathuri] 
  * @param {String} [pathitemid] 
  * @param {UserModel.DataPageCreateRequest} [datapagecreaterequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createItemPage(pathuri,pathitemid,datapagecreaterequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/items/'+pathitemid+'/pages',
        data:datapagecreaterequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 更新数据项笔记信息
  * @param {String} [pathuri] 
  * @param {String} [pathitemid] 
  * @param {UserModel.DataPageUpdateRequest} [datapageupdaterequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateItemPage(pathuri,pathitemid,datapageupdaterequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/sources/'+pathuri+'/items/'+pathitemid+'/pages',
        data:datapageupdaterequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 删除数据项笔记
  * @param {String} [pathuri] 
  * @param {String} [pathitemid] 
  * @param {String} [pathpageid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async deleteItemPage(pathuri,pathitemid,pathpageid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/sources/'+pathuri+'/items/'+pathitemid+'/pages/'+pathpageid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 复制数据项笔记
  * @param {String} [pathuri] 
  * @param {String} [pathitemid] 
  * @param {String} [pathpageid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async duplicateItemPage(pathuri,pathitemid,pathpageid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/items/'+pathitemid+'/pages/'+pathpageid+'/duplicate',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取笔记内容
  * @param {String} [pathuri] 
  * @param {String} [pathitemid] 
  * @param {String} [pathpageid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getItemPageContent(pathuri,pathitemid,pathpageid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/items/'+pathitemid+'/pages/'+pathpageid+'/content',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取笔记指定版本的内容
  * @param {String} [pathuri] 
  * @param {String} [pathitemid] 
  * @param {String} [pathpageid] 
  * @param {String} [pathversionid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getItemPageContentByVersionId(pathuri,pathitemid,pathpageid,pathversionid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/items/'+pathitemid+'/pages/'+pathpageid+'/versions/'+pathversionid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取文献笔记的历史
  * @param {String} [pathuri] 
  * @param {String} [pathitemid] 
  * @param {String} [pathpageid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async listItemPageVersions(pathuri,pathitemid,pathpageid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/items/'+pathitemid+'/pages/'+pathpageid+'/versions',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 保存笔记内容
  * @param {String} [pathuri] 
  * @param {String} [pathitemid] 
  * @param {String} [pathpageid] 
  * @param {String} [pathversionid] 
  * @param {object} [body] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async saveItemPageContent(pathuri,pathitemid,pathpageid,pathversionid,body,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/items/'+pathitemid+'/pages/'+pathpageid+'/content/versions/'+pathversionid+'',
        data:body,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 保存Pdf文件
  * @param {String} [pathuri] 
  * @param {String} [pathitemid] 
  * @param {UserModel.Body_updateItemPDF} [body_updateitempdf] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateItemPDF(pathuri,pathitemid,body_updateitempdf,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/items/'+pathitemid+'/pdfs',
        data:body_updateitempdf,
        params:{},
        headers:{
          "Content-Type":"multipart/form-data"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取数据项的Pdf文件
  * @param {String} [pathuri] 
  * @param {String} [pathitemid] 
  * @param {String} [pathpdfid] 
  * @param {undefined} [key] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getItemPDF(pathuri,pathitemid,pathpdfid,key,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "blob";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/items/'+pathitemid+'/pdfs/'+pathpdfid+'',
        data:{},
        params:{key},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取数据源的临时链接
  * @param {String} [pathuri] 
  * @param {String} [pathitemid] 
  * @param {String} [pathfileid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async openItemFile(pathuri,pathitemid,pathfileid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/items/'+pathitemid+'/pdfs/'+pathfileid+'/link',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取模板的信息
  * @param {String} [pathuri] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getTemplateInfo(pathuri,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/templates',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 创建模板
  * @param {String} [pathuri] 
  * @param {UserModel.DataTemplateCreateRequest} [datatemplatecreaterequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createTemplate(pathuri,datatemplatecreaterequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/templates',
        data:datatemplatecreaterequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 更新模板
  * @param {String} [pathuri] 
  * @param {UserModel.DataTemplateUpdateRequest} [datatemplateupdaterequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateTemplate(pathuri,datatemplateupdaterequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/sources/'+pathuri+'/templates',
        data:datatemplateupdaterequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取模板的内容
  * @param {String} [pathuri] 
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getTemplateContent(pathuri,pathid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/templates/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 删除模板
  * @param {String} [pathuri] 
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async deleteTemplate(pathuri,pathid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/sources/'+pathuri+'/templates/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 保存模板的内容
  * @param {String} [pathuri] 
  * @param {String} [pathid] 
  * @param {String} [pathversionid] 
  * @param {object} [body] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async saveTemplateContent(pathuri,pathid,pathversionid,body,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/templates/'+pathid+'/versions/'+pathversionid+'',
        data:body,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 翻译接口
  * @param {String} [text] 
  * @param {String} [from] 
  * @param {String} [to] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getTranslation(text,from,to,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/translation',
        data:{},
        params:{text,from,to},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
}

// class AcademicController static method properties bind
/**
* @description getDataSourceInfo url链接，包含baseURL
*/
AcademicController.getDataSourceInfo.fullPath=`${axios.defaults.baseURL}/sources/{uri}/info`
/**
* @description getDataSourceInfo url链接，不包含baseURL
*/
AcademicController.getDataSourceInfo.path=`/sources/{uri}/info`
/**
* @description getRootGroups url链接，包含baseURL
*/
AcademicController.getRootGroups.fullPath=`${axios.defaults.baseURL}/sources/{uri}/groups`
/**
* @description getRootGroups url链接，不包含baseURL
*/
AcademicController.getRootGroups.path=`/sources/{uri}/groups`
/**
* @description updateGroup url链接，包含baseURL
*/
AcademicController.updateGroup.fullPath=`${axios.defaults.baseURL}/sources/{uri}/groups`
/**
* @description updateGroup url链接，不包含baseURL
*/
AcademicController.updateGroup.path=`/sources/{uri}/groups`
/**
* @description getGroups url链接，包含baseURL
*/
AcademicController.getGroups.fullPath=`${axios.defaults.baseURL}/sources/{uri}/groups/{id}/subgroups`
/**
* @description getGroups url链接，不包含baseURL
*/
AcademicController.getGroups.path=`/sources/{uri}/groups/{id}/subgroups`
/**
* @description createGroup url链接，包含baseURL
*/
AcademicController.createGroup.fullPath=`${axios.defaults.baseURL}/sources/{uri}/groups/{id}/subgroups`
/**
* @description createGroup url链接，不包含baseURL
*/
AcademicController.createGroup.path=`/sources/{uri}/groups/{id}/subgroups`
/**
* @description deleteGroup url链接，包含baseURL
*/
AcademicController.deleteGroup.fullPath=`${axios.defaults.baseURL}/sources/{uri}/groups/{id}`
/**
* @description deleteGroup url链接，不包含baseURL
*/
AcademicController.deleteGroup.path=`/sources/{uri}/groups/{id}`
/**
* @description getRootPartitions url链接，包含baseURL
*/
AcademicController.getRootPartitions.fullPath=`${axios.defaults.baseURL}/sources/{uri}/partitions`
/**
* @description getRootPartitions url链接，不包含baseURL
*/
AcademicController.getRootPartitions.path=`/sources/{uri}/partitions`
/**
* @description getPartitions url链接，包含baseURL
*/
AcademicController.getPartitions.fullPath=`${axios.defaults.baseURL}/sources/{uri}/groups/{id}/subpartitions`
/**
* @description getPartitions url链接，不包含baseURL
*/
AcademicController.getPartitions.path=`/sources/{uri}/groups/{id}/subpartitions`
/**
* @description getPartition url链接，包含baseURL
*/
AcademicController.getPartition.fullPath=`${axios.defaults.baseURL}/sources/{uri}/partitions/{id}`
/**
* @description getPartition url链接，不包含baseURL
*/
AcademicController.getPartition.path=`/sources/{uri}/partitions/{id}`
/**
* @description searchPartitions url链接，包含baseURL
*/
AcademicController.searchPartitions.fullPath=`${axios.defaults.baseURL}/sources/{uri}/partition-matches`
/**
* @description searchPartitions url链接，不包含baseURL
*/
AcademicController.searchPartitions.path=`/sources/{uri}/partition-matches`
/**
* @description createPartition url链接，包含baseURL
*/
AcademicController.createPartition.fullPath=`${axios.defaults.baseURL}/sources/{uri}/groups/{groupId}/partitions`
/**
* @description createPartition url链接，不包含baseURL
*/
AcademicController.createPartition.path=`/sources/{uri}/groups/{groupId}/partitions`
/**
* @description updatePartition url链接，包含baseURL
*/
AcademicController.updatePartition.fullPath=`${axios.defaults.baseURL}/sources/{uri}/groups/{groupId}/partitions`
/**
* @description updatePartition url链接，不包含baseURL
*/
AcademicController.updatePartition.path=`/sources/{uri}/groups/{groupId}/partitions`
/**
* @description deletePartition url链接，包含baseURL
*/
AcademicController.deletePartition.fullPath=`${axios.defaults.baseURL}/sources/{uri}/groups/{groupId}/partitions/{id}`
/**
* @description deletePartition url链接，不包含baseURL
*/
AcademicController.deletePartition.path=`/sources/{uri}/groups/{groupId}/partitions/{id}`
/**
* @description getItems url链接，包含baseURL
*/
AcademicController.getItems.fullPath=`${axios.defaults.baseURL}/sources/{uri}/partitions/{partitionId}/items`
/**
* @description getItems url链接，不包含baseURL
*/
AcademicController.getItems.path=`/sources/{uri}/partitions/{partitionId}/items`
/**
* @description getItemsCount url链接，包含baseURL
*/
AcademicController.getItemsCount.fullPath=`${axios.defaults.baseURL}/sources/{uri}/partitions/{partitionId}/items/count`
/**
* @description getItemsCount url链接，不包含baseURL
*/
AcademicController.getItemsCount.path=`/sources/{uri}/partitions/{partitionId}/items/count`
/**
* @description getAllItems url链接，包含baseURL
*/
AcademicController.getAllItems.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items`
/**
* @description getAllItems url链接，不包含baseURL
*/
AcademicController.getAllItems.path=`/sources/{uri}/items`
/**
* @description createItem url链接，包含baseURL
*/
AcademicController.createItem.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items`
/**
* @description createItem url链接，不包含baseURL
*/
AcademicController.createItem.path=`/sources/{uri}/items`
/**
* @description updateItem url链接，包含baseURL
*/
AcademicController.updateItem.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items`
/**
* @description updateItem url链接，不包含baseURL
*/
AcademicController.updateItem.path=`/sources/{uri}/items`
/**
* @description getAllItemsCount url链接，包含baseURL
*/
AcademicController.getAllItemsCount.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/count`
/**
* @description getAllItemsCount url链接，不包含baseURL
*/
AcademicController.getAllItemsCount.path=`/sources/{uri}/items/count`
/**
* @description getSearchItems url链接，包含baseURL
*/
AcademicController.getSearchItems.fullPath=`${axios.defaults.baseURL}/sources/{uri}/partitions/items/matches`
/**
* @description getSearchItems url链接，不包含baseURL
*/
AcademicController.getSearchItems.path=`/sources/{uri}/partitions/items/matches`
/**
* @description getItem url链接，包含baseURL
*/
AcademicController.getItem.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{id}`
/**
* @description getItem url链接，不包含baseURL
*/
AcademicController.getItem.path=`/sources/{uri}/items/{id}`
/**
* @description deleteItem url链接，包含baseURL
*/
AcademicController.deleteItem.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{id}`
/**
* @description deleteItem url链接，不包含baseURL
*/
AcademicController.deleteItem.path=`/sources/{uri}/items/{id}`
/**
* @description deleteItems url链接，包含baseURL
*/
AcademicController.deleteItems.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/batched/deleted`
/**
* @description deleteItems url链接，不包含baseURL
*/
AcademicController.deleteItems.path=`/sources/{uri}/items/batched/deleted`
/**
* @description addItemsToPartition url链接，包含baseURL
*/
AcademicController.addItemsToPartition.fullPath=`${axios.defaults.baseURL}/sources/{uri}/partitions/{partitionId}/items/batched`
/**
* @description addItemsToPartition url链接，不包含baseURL
*/
AcademicController.addItemsToPartition.path=`/sources/{uri}/partitions/{partitionId}/items/batched`
/**
* @description updateItemMetadata url链接，包含baseURL
*/
AcademicController.updateItemMetadata.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{itemId}/metadata`
/**
* @description updateItemMetadata url链接，不包含baseURL
*/
AcademicController.updateItemMetadata.path=`/sources/{uri}/items/{itemId}/metadata`
/**
* @description removeItemsFromPartition url链接，包含baseURL
*/
AcademicController.removeItemsFromPartition.fullPath=`${axios.defaults.baseURL}/sources/{uri}/partitions/{partitionId}/items/batched/deleted`
/**
* @description removeItemsFromPartition url链接，不包含baseURL
*/
AcademicController.removeItemsFromPartition.path=`/sources/{uri}/partitions/{partitionId}/items/batched/deleted`
/**
* @description createItemPage url链接，包含baseURL
*/
AcademicController.createItemPage.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{itemId}/pages`
/**
* @description createItemPage url链接，不包含baseURL
*/
AcademicController.createItemPage.path=`/sources/{uri}/items/{itemId}/pages`
/**
* @description updateItemPage url链接，包含baseURL
*/
AcademicController.updateItemPage.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{itemId}/pages`
/**
* @description updateItemPage url链接，不包含baseURL
*/
AcademicController.updateItemPage.path=`/sources/{uri}/items/{itemId}/pages`
/**
* @description deleteItemPage url链接，包含baseURL
*/
AcademicController.deleteItemPage.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{itemId}/pages/{pageId}`
/**
* @description deleteItemPage url链接，不包含baseURL
*/
AcademicController.deleteItemPage.path=`/sources/{uri}/items/{itemId}/pages/{pageId}`
/**
* @description duplicateItemPage url链接，包含baseURL
*/
AcademicController.duplicateItemPage.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{itemId}/pages/{pageId}/duplicate`
/**
* @description duplicateItemPage url链接，不包含baseURL
*/
AcademicController.duplicateItemPage.path=`/sources/{uri}/items/{itemId}/pages/{pageId}/duplicate`
/**
* @description getItemPageContent url链接，包含baseURL
*/
AcademicController.getItemPageContent.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{itemId}/pages/{pageId}/content`
/**
* @description getItemPageContent url链接，不包含baseURL
*/
AcademicController.getItemPageContent.path=`/sources/{uri}/items/{itemId}/pages/{pageId}/content`
/**
* @description getItemPageContentByVersionId url链接，包含baseURL
*/
AcademicController.getItemPageContentByVersionId.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{itemId}/pages/{pageId}/versions/{versionId}`
/**
* @description getItemPageContentByVersionId url链接，不包含baseURL
*/
AcademicController.getItemPageContentByVersionId.path=`/sources/{uri}/items/{itemId}/pages/{pageId}/versions/{versionId}`
/**
* @description listItemPageVersions url链接，包含baseURL
*/
AcademicController.listItemPageVersions.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{itemId}/pages/{pageId}/versions`
/**
* @description listItemPageVersions url链接，不包含baseURL
*/
AcademicController.listItemPageVersions.path=`/sources/{uri}/items/{itemId}/pages/{pageId}/versions`
/**
* @description saveItemPageContent url链接，包含baseURL
*/
AcademicController.saveItemPageContent.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{itemId}/pages/{pageId}/content/versions/{versionId}`
/**
* @description saveItemPageContent url链接，不包含baseURL
*/
AcademicController.saveItemPageContent.path=`/sources/{uri}/items/{itemId}/pages/{pageId}/content/versions/{versionId}`
/**
* @description updateItemPDF url链接，包含baseURL
*/
AcademicController.updateItemPDF.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{itemId}/pdfs`
/**
* @description updateItemPDF url链接，不包含baseURL
*/
AcademicController.updateItemPDF.path=`/sources/{uri}/items/{itemId}/pdfs`
/**
* @description getItemPDF url链接，包含baseURL
*/
AcademicController.getItemPDF.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{itemId}/pdfs/{pdfId}`
/**
* @description getItemPDF url链接，不包含baseURL
*/
AcademicController.getItemPDF.path=`/sources/{uri}/items/{itemId}/pdfs/{pdfId}`
/**
* @description openItemFile url链接，包含baseURL
*/
AcademicController.openItemFile.fullPath=`${axios.defaults.baseURL}/sources/{uri}/items/{itemId}/pdfs/{fileId}/link`
/**
* @description openItemFile url链接，不包含baseURL
*/
AcademicController.openItemFile.path=`/sources/{uri}/items/{itemId}/pdfs/{fileId}/link`
/**
* @description getTemplateInfo url链接，包含baseURL
*/
AcademicController.getTemplateInfo.fullPath=`${axios.defaults.baseURL}/sources/{uri}/templates`
/**
* @description getTemplateInfo url链接，不包含baseURL
*/
AcademicController.getTemplateInfo.path=`/sources/{uri}/templates`
/**
* @description createTemplate url链接，包含baseURL
*/
AcademicController.createTemplate.fullPath=`${axios.defaults.baseURL}/sources/{uri}/templates`
/**
* @description createTemplate url链接，不包含baseURL
*/
AcademicController.createTemplate.path=`/sources/{uri}/templates`
/**
* @description updateTemplate url链接，包含baseURL
*/
AcademicController.updateTemplate.fullPath=`${axios.defaults.baseURL}/sources/{uri}/templates`
/**
* @description updateTemplate url链接，不包含baseURL
*/
AcademicController.updateTemplate.path=`/sources/{uri}/templates`
/**
* @description getTemplateContent url链接，包含baseURL
*/
AcademicController.getTemplateContent.fullPath=`${axios.defaults.baseURL}/sources/{uri}/templates/{id}`
/**
* @description getTemplateContent url链接，不包含baseURL
*/
AcademicController.getTemplateContent.path=`/sources/{uri}/templates/{id}`
/**
* @description deleteTemplate url链接，包含baseURL
*/
AcademicController.deleteTemplate.fullPath=`${axios.defaults.baseURL}/sources/{uri}/templates/{id}`
/**
* @description deleteTemplate url链接，不包含baseURL
*/
AcademicController.deleteTemplate.path=`/sources/{uri}/templates/{id}`
/**
* @description saveTemplateContent url链接，包含baseURL
*/
AcademicController.saveTemplateContent.fullPath=`${axios.defaults.baseURL}/sources/{uri}/templates/{id}/versions/{versionId}`
/**
* @description saveTemplateContent url链接，不包含baseURL
*/
AcademicController.saveTemplateContent.path=`/sources/{uri}/templates/{id}/versions/{versionId}`
/**
* @description getTranslation url链接，包含baseURL
*/
AcademicController.getTranslation.fullPath=`${axios.defaults.baseURL}/translation`
/**
* @description getTranslation url链接，不包含baseURL
*/
AcademicController.getTranslation.path=`/translation`

export class ConfigController {
 
  /**
  * @summary 创建或者更新用户配置文件
  * @param {UserModel.ConfigCreateOrUpdateRequest} [configcreateorupdaterequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createOrUpdateConfig(configcreateorupdaterequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/configs',
        data:configcreateorupdaterequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取用户的配置文件
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getConfig(cancelSource,uploadProgress,downloadProgress,baseURL){
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
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 创建 AI 服务配置
  * @param {UserModel.AIAPICreateRequest} [aiapicreaterequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createAIAPI(aiapicreaterequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/configs/ai-apis',
        data:aiapicreaterequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 分页查询 AI 服务配置
  * @param {undefined} [query] 
  * @param {Number} [offset] 
  * @param {Number} [pagesize] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async listAIAPIs(query,offset,pagesize,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/configs/ai-apis',
        data:{},
        params:{query,offset,pagesize},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取单个 AI 服务配置
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getAIAPI(pathid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/configs/ai-apis/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 修改 AI 服务配置
  * @param {String} [pathid] 
  * @param {UserModel.AIAPIUpdateRequest} [aiapiupdaterequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateAIAPI(pathid,aiapiupdaterequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/configs/ai-apis/'+pathid+'',
        data:aiapiupdaterequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 删除 AI 服务配置
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async removeAIAPI(pathid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/configs/ai-apis/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取当前用户的数据源列表
  * @param {undefined} [query] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async listDataSources(query,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/configs/sources',
        data:{},
        params:{query},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 创建数据源
  * @param {UserModel.DataSourceCreateRequest} [datasourcecreaterequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createDataSource(datasourcecreaterequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/configs/sources',
        data:datasourcecreaterequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取数据源的信息
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getSourceInfo(pathid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/config/sources/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 更新数据源的信息
  * @param {String} [pathid] 
  * @param {UserModel.DataSourceUpdateRequest} [datasourceupdaterequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateDataSource(pathid,datasourceupdaterequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/configs/sources/'+pathid+'',
        data:datasourceupdaterequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 删除数据源
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async removeDataSource(pathid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/configs/sources/'+pathid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 监听数据源的变化
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async watchDataSource(pathid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/configs/sources/'+pathid+'/chokidar',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取数据源下的权限组
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async listSourcePermissionGroups(pathid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/configs/sources/'+pathid+'/permission-groups',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 创建权限组
  * @param {String} [pathid] 
  * @param {UserModel.SourcePermissionGroupCreateRequest} [sourcepermissiongroupcreaterequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createSourcePermissionGroup(pathid,sourcepermissiongroupcreaterequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/configs/sources/'+pathid+'/permission-groups',
        data:sourcepermissiongroupcreaterequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取单个权限组
  * @param {String} [pathid] 
  * @param {String} [pathgroupid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getSourcePermissionGroup(pathid,pathgroupid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/configs/sources/'+pathid+'/permission-groups/'+pathgroupid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 更新权限组
  * @param {String} [pathid] 
  * @param {String} [pathgroupid] 
  * @param {UserModel.SourcePermissionGroupUpdateRequest} [sourcepermissiongroupupdaterequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateSourcePermissionGroup(pathid,pathgroupid,sourcepermissiongroupupdaterequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/configs/sources/'+pathid+'/permission-groups/'+pathgroupid+'',
        data:sourcepermissiongroupupdaterequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 删除权限组
  * @param {String} [pathid] 
  * @param {String} [pathgroupid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async removeSourcePermissionGroup(pathid,pathgroupid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/configs/sources/'+pathid+'/permission-groups/'+pathgroupid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取当前用户在该数据源下可见的权限组
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async listMySourcePermissionGroups(pathid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/configs/sources/'+pathid+'/my-permission-groups',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取权限组用户
  * @param {String} [pathid] 
  * @param {String} [pathgroupid] 
  * @param {Number} [offset] 
  * @param {Number} [pagesize] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async listSourcePermissionGroupUsers(pathid,pathgroupid,offset,pagesize,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/configs/sources/'+pathid+'/permission-groups/'+pathgroupid+'/users',
        data:{},
        params:{offset,pagesize},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 添加权限组用户
  * @param {String} [pathid] 
  * @param {String} [pathgroupid] 
  * @param {UserModel.SourcePermissionGroupUserCreateRequest} [sourcepermissiongroupusercreaterequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createSourcePermissionGroupUser(pathid,pathgroupid,sourcepermissiongroupusercreaterequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/configs/sources/'+pathid+'/permission-groups/'+pathgroupid+'/users',
        data:sourcepermissiongroupusercreaterequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 搜索数据源内用户
  * @param {String} [pathid] 
  * @param {String} [query] 
  * @param {Number} [top] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async searchSourceUsers(pathid,query,top,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/configs/sources/'+pathid+'/users/search',
        data:{},
        params:{query,top},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取权限组用户关系
  * @param {String} [pathid] 
  * @param {String} [pathgroupid] 
  * @param {String} [pathrelationid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getSourcePermissionGroupUser(pathid,pathgroupid,pathrelationid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/configs/sources/'+pathid+'/permission-groups/'+pathgroupid+'/users/'+pathrelationid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 更新权限组用户关系
  * @param {String} [pathid] 
  * @param {String} [pathgroupid] 
  * @param {String} [pathrelationid] 
  * @param {UserModel.SourcePermissionGroupUserUpdateRequest} [sourcepermissiongroupuserupdaterequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateSourcePermissionGroupUser(pathid,pathgroupid,pathrelationid,sourcepermissiongroupuserupdaterequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/configs/sources/'+pathid+'/permission-groups/'+pathgroupid+'/users/'+pathrelationid+'',
        data:sourcepermissiongroupuserupdaterequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 删除权限组用户关系
  * @param {String} [pathid] 
  * @param {String} [pathgroupid] 
  * @param {String} [pathrelationid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async removeSourcePermissionGroupUser(pathid,pathgroupid,pathrelationid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/configs/sources/'+pathid+'/permission-groups/'+pathgroupid+'/users/'+pathrelationid+'',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 生成权限组邀请码
  * @param {String} [pathid] 
  * @param {String} [pathgroupid] 
  * @param {UserModel.SourcePermissionGroupInviteCreateRequest} [sourcepermissiongroupinvitecreaterequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createSourcePermissionGroupInvite(pathid,pathgroupid,sourcepermissiongroupinvitecreaterequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/configs/sources/'+pathid+'/permission-groups/'+pathgroupid+'/invite',
        data:sourcepermissiongroupinvitecreaterequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 通过邀请码加入权限组
  * @param {UserModel.SourcePermissionGroupInviteAcceptRequest} [sourcepermissiongroupinviteacceptrequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async acceptSourcePermissionGroupInvite(sourcepermissiongroupinviteacceptrequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/configs/permission-groups/invite/accept',
        data:sourcepermissiongroupinviteacceptrequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
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
/**
* @description createAIAPI url链接，包含baseURL
*/
ConfigController.createAIAPI.fullPath=`${axios.defaults.baseURL}/configs/ai-apis`
/**
* @description createAIAPI url链接，不包含baseURL
*/
ConfigController.createAIAPI.path=`/configs/ai-apis`
/**
* @description listAIAPIs url链接，包含baseURL
*/
ConfigController.listAIAPIs.fullPath=`${axios.defaults.baseURL}/configs/ai-apis`
/**
* @description listAIAPIs url链接，不包含baseURL
*/
ConfigController.listAIAPIs.path=`/configs/ai-apis`
/**
* @description getAIAPI url链接，包含baseURL
*/
ConfigController.getAIAPI.fullPath=`${axios.defaults.baseURL}/configs/ai-apis/{id}`
/**
* @description getAIAPI url链接，不包含baseURL
*/
ConfigController.getAIAPI.path=`/configs/ai-apis/{id}`
/**
* @description updateAIAPI url链接，包含baseURL
*/
ConfigController.updateAIAPI.fullPath=`${axios.defaults.baseURL}/configs/ai-apis/{id}`
/**
* @description updateAIAPI url链接，不包含baseURL
*/
ConfigController.updateAIAPI.path=`/configs/ai-apis/{id}`
/**
* @description removeAIAPI url链接，包含baseURL
*/
ConfigController.removeAIAPI.fullPath=`${axios.defaults.baseURL}/configs/ai-apis/{id}`
/**
* @description removeAIAPI url链接，不包含baseURL
*/
ConfigController.removeAIAPI.path=`/configs/ai-apis/{id}`
/**
* @description listDataSources url链接，包含baseURL
*/
ConfigController.listDataSources.fullPath=`${axios.defaults.baseURL}/configs/sources`
/**
* @description listDataSources url链接，不包含baseURL
*/
ConfigController.listDataSources.path=`/configs/sources`
/**
* @description createDataSource url链接，包含baseURL
*/
ConfigController.createDataSource.fullPath=`${axios.defaults.baseURL}/configs/sources`
/**
* @description createDataSource url链接，不包含baseURL
*/
ConfigController.createDataSource.path=`/configs/sources`
/**
* @description getSourceInfo url链接，包含baseURL
*/
ConfigController.getSourceInfo.fullPath=`${axios.defaults.baseURL}/config/sources/{id}`
/**
* @description getSourceInfo url链接，不包含baseURL
*/
ConfigController.getSourceInfo.path=`/config/sources/{id}`
/**
* @description updateDataSource url链接，包含baseURL
*/
ConfigController.updateDataSource.fullPath=`${axios.defaults.baseURL}/configs/sources/{id}`
/**
* @description updateDataSource url链接，不包含baseURL
*/
ConfigController.updateDataSource.path=`/configs/sources/{id}`
/**
* @description removeDataSource url链接，包含baseURL
*/
ConfigController.removeDataSource.fullPath=`${axios.defaults.baseURL}/configs/sources/{id}`
/**
* @description removeDataSource url链接，不包含baseURL
*/
ConfigController.removeDataSource.path=`/configs/sources/{id}`
/**
* @description watchDataSource url链接，包含baseURL
*/
ConfigController.watchDataSource.fullPath=`${axios.defaults.baseURL}/configs/sources/{id}/chokidar`
/**
* @description watchDataSource url链接，不包含baseURL
*/
ConfigController.watchDataSource.path=`/configs/sources/{id}/chokidar`
/**
* @description listSourcePermissionGroups url链接，包含baseURL
*/
ConfigController.listSourcePermissionGroups.fullPath=`${axios.defaults.baseURL}/configs/sources/{id}/permission-groups`
/**
* @description listSourcePermissionGroups url链接，不包含baseURL
*/
ConfigController.listSourcePermissionGroups.path=`/configs/sources/{id}/permission-groups`
/**
* @description createSourcePermissionGroup url链接，包含baseURL
*/
ConfigController.createSourcePermissionGroup.fullPath=`${axios.defaults.baseURL}/configs/sources/{id}/permission-groups`
/**
* @description createSourcePermissionGroup url链接，不包含baseURL
*/
ConfigController.createSourcePermissionGroup.path=`/configs/sources/{id}/permission-groups`
/**
* @description getSourcePermissionGroup url链接，包含baseURL
*/
ConfigController.getSourcePermissionGroup.fullPath=`${axios.defaults.baseURL}/configs/sources/{id}/permission-groups/{groupId}`
/**
* @description getSourcePermissionGroup url链接，不包含baseURL
*/
ConfigController.getSourcePermissionGroup.path=`/configs/sources/{id}/permission-groups/{groupId}`
/**
* @description updateSourcePermissionGroup url链接，包含baseURL
*/
ConfigController.updateSourcePermissionGroup.fullPath=`${axios.defaults.baseURL}/configs/sources/{id}/permission-groups/{groupId}`
/**
* @description updateSourcePermissionGroup url链接，不包含baseURL
*/
ConfigController.updateSourcePermissionGroup.path=`/configs/sources/{id}/permission-groups/{groupId}`
/**
* @description removeSourcePermissionGroup url链接，包含baseURL
*/
ConfigController.removeSourcePermissionGroup.fullPath=`${axios.defaults.baseURL}/configs/sources/{id}/permission-groups/{groupId}`
/**
* @description removeSourcePermissionGroup url链接，不包含baseURL
*/
ConfigController.removeSourcePermissionGroup.path=`/configs/sources/{id}/permission-groups/{groupId}`
/**
* @description listMySourcePermissionGroups url链接，包含baseURL
*/
ConfigController.listMySourcePermissionGroups.fullPath=`${axios.defaults.baseURL}/configs/sources/{id}/my-permission-groups`
/**
* @description listMySourcePermissionGroups url链接，不包含baseURL
*/
ConfigController.listMySourcePermissionGroups.path=`/configs/sources/{id}/my-permission-groups`
/**
* @description listSourcePermissionGroupUsers url链接，包含baseURL
*/
ConfigController.listSourcePermissionGroupUsers.fullPath=`${axios.defaults.baseURL}/configs/sources/{id}/permission-groups/{groupId}/users`
/**
* @description listSourcePermissionGroupUsers url链接，不包含baseURL
*/
ConfigController.listSourcePermissionGroupUsers.path=`/configs/sources/{id}/permission-groups/{groupId}/users`
/**
* @description createSourcePermissionGroupUser url链接，包含baseURL
*/
ConfigController.createSourcePermissionGroupUser.fullPath=`${axios.defaults.baseURL}/configs/sources/{id}/permission-groups/{groupId}/users`
/**
* @description createSourcePermissionGroupUser url链接，不包含baseURL
*/
ConfigController.createSourcePermissionGroupUser.path=`/configs/sources/{id}/permission-groups/{groupId}/users`
/**
* @description searchSourceUsers url链接，包含baseURL
*/
ConfigController.searchSourceUsers.fullPath=`${axios.defaults.baseURL}/configs/sources/{id}/users/search`
/**
* @description searchSourceUsers url链接，不包含baseURL
*/
ConfigController.searchSourceUsers.path=`/configs/sources/{id}/users/search`
/**
* @description getSourcePermissionGroupUser url链接，包含baseURL
*/
ConfigController.getSourcePermissionGroupUser.fullPath=`${axios.defaults.baseURL}/configs/sources/{id}/permission-groups/{groupId}/users/{relationId}`
/**
* @description getSourcePermissionGroupUser url链接，不包含baseURL
*/
ConfigController.getSourcePermissionGroupUser.path=`/configs/sources/{id}/permission-groups/{groupId}/users/{relationId}`
/**
* @description updateSourcePermissionGroupUser url链接，包含baseURL
*/
ConfigController.updateSourcePermissionGroupUser.fullPath=`${axios.defaults.baseURL}/configs/sources/{id}/permission-groups/{groupId}/users/{relationId}`
/**
* @description updateSourcePermissionGroupUser url链接，不包含baseURL
*/
ConfigController.updateSourcePermissionGroupUser.path=`/configs/sources/{id}/permission-groups/{groupId}/users/{relationId}`
/**
* @description removeSourcePermissionGroupUser url链接，包含baseURL
*/
ConfigController.removeSourcePermissionGroupUser.fullPath=`${axios.defaults.baseURL}/configs/sources/{id}/permission-groups/{groupId}/users/{relationId}`
/**
* @description removeSourcePermissionGroupUser url链接，不包含baseURL
*/
ConfigController.removeSourcePermissionGroupUser.path=`/configs/sources/{id}/permission-groups/{groupId}/users/{relationId}`
/**
* @description createSourcePermissionGroupInvite url链接，包含baseURL
*/
ConfigController.createSourcePermissionGroupInvite.fullPath=`${axios.defaults.baseURL}/configs/sources/{id}/permission-groups/{groupId}/invite`
/**
* @description createSourcePermissionGroupInvite url链接，不包含baseURL
*/
ConfigController.createSourcePermissionGroupInvite.path=`/configs/sources/{id}/permission-groups/{groupId}/invite`
/**
* @description acceptSourcePermissionGroupInvite url链接，包含baseURL
*/
ConfigController.acceptSourcePermissionGroupInvite.fullPath=`${axios.defaults.baseURL}/configs/permission-groups/invite/accept`
/**
* @description acceptSourcePermissionGroupInvite url链接，不包含baseURL
*/
ConfigController.acceptSourcePermissionGroupInvite.path=`/configs/permission-groups/invite/accept`

export class NotebookController {
 
  /**
  * @summary 更新笔记本信息
  * @param {String} [pathuri] 
  * @param {String} [filepath] 
  * @param {UserModel.NotebookUpdateRequest} [notebookupdaterequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateDocumentInfo(pathuri,filepath,notebookupdaterequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/sources/'+pathuri+'/documents/info',
        data:notebookupdaterequest,
        params:{filepath},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 更新笔记本内容
  * @param {String} [pathuri] 
  * @param {String} [filepath] 
  * @param {String} [versionid] 
  * @param {object} [body] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateDocument(pathuri,filepath,versionid,body,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/sources/'+pathuri+'/documents/content',
        data:body,
        params:{filepath,versionid},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 更新目录信息
  * @param {String} [pathuri] 
  * @param {String} [filepath] 
  * @param {UserModel.GroupUpdateRequest} [groupupdaterequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateDirectoryInfo(pathuri,filepath,groupupdaterequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/sources/'+pathuri+'/directories/info',
        data:groupupdaterequest,
        params:{filepath},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取笔记本
  * @param {String} [pathuri] 
  * @param {String} [filepath] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getDocument(pathuri,filepath,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/documents',
        data:{},
        params:{filepath},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 创建笔记本
  * @param {String} [pathuri] 
  * @param {String} [filepath] 
  * @param {object} [body] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createDocument(pathuri,filepath,body,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/documents',
        data:body,
        params:{filepath},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 删除笔记本
  * @param {String} [pathuri] 
  * @param {String} [filepath] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async removeDocument(pathuri,filepath,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/sources/'+pathuri+'/documents',
        data:{},
        params:{filepath},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 创建目录
  * @param {String} [pathuri] 
  * @param {String} [filepath] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createDirectory(pathuri,filepath,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/directories',
        data:{},
        params:{filepath},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 删除目录
  * @param {String} [pathuri] 
  * @param {String} [filepath] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async removeDirectory(pathuri,filepath,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/sources/'+pathuri+'/directories',
        data:{},
        params:{filepath},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 移动目录或文档
  * @param {String} [pathuri] 
  * @param {String} [filepath] 
  * @param {String} [newpath] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async moveDirectory(pathuri,filepath,newpath,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/directories/move',
        data:{},
        params:{filepath,newpath},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 复制目录或文档
  * @param {String} [pathuri] 
  * @param {String} [filepath] 
  * @param {String} [newpath] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async copyDirectory(pathuri,filepath,newpath,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/directories/copy',
        data:{},
        params:{filepath,newpath},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 上传二进制图片
  * @param {undefined} [id] 
  * @param {UserModel.Body_uploadBinaryImage} [body_uploadbinaryimage] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async uploadBinaryImage(id,body_uploadbinaryimage,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/image',
        data:body_uploadbinaryimage,
        params:{id},
        headers:{
          "Content-Type":"multipart/form-data"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 上传 Base64 图片
  * @param {undefined} [id] 
  * @param {UserModel.Base64ImageRequest} [base64imagerequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async uploadImage(id,base64imagerequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/image/base64',
        data:base64imagerequest,
        params:{id},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 判断路径是否存在
  * @param {String} [pathuri] 
  * @param {String} [filepath] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async existsPath(pathuri,filepath,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/path',
        data:{},
        params:{filepath},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 转换路径名称
  * @param {String} [path] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async transferIdsToNames(path,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/notebooks/names',
        data:{},
        params:{path},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 模糊搜索 notebook
  * @param {String} [pathuri] 
  * @param {String} [query] 
  * @param {Number} [top] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async searchNotebooks(pathuri,query,top,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/notebooks/search',
        data:{},
        params:{query,top},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取 notebook 完整路径
  * @param {String} [pathnotebookid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getNotebookPath(pathnotebookid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/notebooks/'+pathnotebookid+'/path',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 下载图片
  * @param {String} [pathimageid] 
  * @param {undefined} [height] 
  * @param {undefined} [width] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async downloadImage(pathimageid,height,width,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/image/'+pathimageid+'',
        data:{},
        params:{height,width},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 按版本获取内容历史
  * @param {String} [pathnotebookid] 
  * @param {String} [pathids] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getDocumentContentHistoryByVersionIds(pathnotebookid,pathids,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/documents/'+pathnotebookid+'/content/'+pathids+'/history/',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取内容历史
  * @param {String} [pathid] 
  * @param {Number} [pagesize] 
  * @param {undefined} [lastversionid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getDocumentContentHistory(pathid,pagesize,lastversionid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/documents/'+pathid+'/content/history',
        data:{},
        params:{pagesize,lastversionid},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取内容历史版本号
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getDocumentContentHistoryVersionIds(pathid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/documents/'+pathid+'/content/history/ids',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取目录信息
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getDirectory(pathid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/directories/'+pathid+'/info',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取目录子项
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getDirectoryChildren(pathid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/directories/'+pathid+'/children',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取当前用户目录权限
  * @param {String} [pathuri] 
  * @param {String} [pathdirectoryid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getMyDirectoryPermission(pathuri,pathdirectoryid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/directories/'+pathdirectoryid+'/my-permission',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取目录权限
  * @param {String} [pathuri] 
  * @param {String} [pathgroupid] 
  * @param {String} [pathdirectoryid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getSourcePermissionGroupDirectoryPermission(pathuri,pathgroupid,pathdirectoryid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/permission-groups/'+pathgroupid+'/directories/'+pathdirectoryid+'/permission',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 创建目录权限
  * @param {String} [pathuri] 
  * @param {String} [pathgroupid] 
  * @param {String} [pathdirectoryid] 
  * @param {UserModel.SourcePathPermissionUpsertRequest} [sourcepathpermissionupsertrequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createSourcePermissionGroupDirectoryPermission(pathuri,pathgroupid,pathdirectoryid,sourcepathpermissionupsertrequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/permission-groups/'+pathgroupid+'/directories/'+pathdirectoryid+'/permission',
        data:sourcepathpermissionupsertrequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 更新目录权限
  * @param {String} [pathuri] 
  * @param {String} [pathgroupid] 
  * @param {String} [pathdirectoryid] 
  * @param {UserModel.SourcePathPermissionUpsertRequest} [sourcepathpermissionupsertrequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateSourcePermissionGroupDirectoryPermission(pathuri,pathgroupid,pathdirectoryid,sourcepathpermissionupsertrequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/sources/'+pathuri+'/permission-groups/'+pathgroupid+'/directories/'+pathdirectoryid+'/permission',
        data:sourcepathpermissionupsertrequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 删除目录权限
  * @param {String} [pathuri] 
  * @param {String} [pathgroupid] 
  * @param {String} [pathdirectoryid] 
  * @param {undefined} [cascade] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async removeSourcePermissionGroupDirectoryPermission(pathuri,pathgroupid,pathdirectoryid,cascade,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/sources/'+pathuri+'/permission-groups/'+pathgroupid+'/directories/'+pathdirectoryid+'/permission',
        data:{},
        params:{cascade},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取当前用户笔记权限
  * @param {String} [pathuri] 
  * @param {String} [pathnotebookid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getMyNotebookPermission(pathuri,pathnotebookid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/notebooks/'+pathnotebookid+'/my-permission',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取笔记权限
  * @param {String} [pathuri] 
  * @param {String} [pathgroupid] 
  * @param {String} [pathnotebookid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getSourcePermissionGroupNotebookPermission(pathuri,pathgroupid,pathnotebookid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/sources/'+pathuri+'/permission-groups/'+pathgroupid+'/notebooks/'+pathnotebookid+'/permission',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 创建笔记权限
  * @param {String} [pathuri] 
  * @param {String} [pathgroupid] 
  * @param {String} [pathnotebookid] 
  * @param {UserModel.SourcePathPermissionUpsertRequest} [sourcepathpermissionupsertrequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async createSourcePermissionGroupNotebookPermission(pathuri,pathgroupid,pathnotebookid,sourcepathpermissionupsertrequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/sources/'+pathuri+'/permission-groups/'+pathgroupid+'/notebooks/'+pathnotebookid+'/permission',
        data:sourcepathpermissionupsertrequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 更新笔记权限
  * @param {String} [pathuri] 
  * @param {String} [pathgroupid] 
  * @param {String} [pathnotebookid] 
  * @param {UserModel.SourcePathPermissionUpsertRequest} [sourcepathpermissionupsertrequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateSourcePermissionGroupNotebookPermission(pathuri,pathgroupid,pathnotebookid,sourcepathpermissionupsertrequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'put',
        url:'/sources/'+pathuri+'/permission-groups/'+pathgroupid+'/notebooks/'+pathnotebookid+'/permission',
        data:sourcepathpermissionupsertrequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 删除笔记权限
  * @param {String} [pathuri] 
  * @param {String} [pathgroupid] 
  * @param {String} [pathnotebookid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async removeSourcePermissionGroupNotebookPermission(pathuri,pathgroupid,pathnotebookid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'delete',
        url:'/sources/'+pathuri+'/permission-groups/'+pathgroupid+'/notebooks/'+pathnotebookid+'/permission',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
}

// class NotebookController static method properties bind
/**
* @description updateDocumentInfo url链接，包含baseURL
*/
NotebookController.updateDocumentInfo.fullPath=`${axios.defaults.baseURL}/sources/{uri}/documents/info`
/**
* @description updateDocumentInfo url链接，不包含baseURL
*/
NotebookController.updateDocumentInfo.path=`/sources/{uri}/documents/info`
/**
* @description updateDocument url链接，包含baseURL
*/
NotebookController.updateDocument.fullPath=`${axios.defaults.baseURL}/sources/{uri}/documents/content`
/**
* @description updateDocument url链接，不包含baseURL
*/
NotebookController.updateDocument.path=`/sources/{uri}/documents/content`
/**
* @description updateDirectoryInfo url链接，包含baseURL
*/
NotebookController.updateDirectoryInfo.fullPath=`${axios.defaults.baseURL}/sources/{uri}/directories/info`
/**
* @description updateDirectoryInfo url链接，不包含baseURL
*/
NotebookController.updateDirectoryInfo.path=`/sources/{uri}/directories/info`
/**
* @description getDocument url链接，包含baseURL
*/
NotebookController.getDocument.fullPath=`${axios.defaults.baseURL}/sources/{uri}/documents`
/**
* @description getDocument url链接，不包含baseURL
*/
NotebookController.getDocument.path=`/sources/{uri}/documents`
/**
* @description createDocument url链接，包含baseURL
*/
NotebookController.createDocument.fullPath=`${axios.defaults.baseURL}/sources/{uri}/documents`
/**
* @description createDocument url链接，不包含baseURL
*/
NotebookController.createDocument.path=`/sources/{uri}/documents`
/**
* @description removeDocument url链接，包含baseURL
*/
NotebookController.removeDocument.fullPath=`${axios.defaults.baseURL}/sources/{uri}/documents`
/**
* @description removeDocument url链接，不包含baseURL
*/
NotebookController.removeDocument.path=`/sources/{uri}/documents`
/**
* @description createDirectory url链接，包含baseURL
*/
NotebookController.createDirectory.fullPath=`${axios.defaults.baseURL}/sources/{uri}/directories`
/**
* @description createDirectory url链接，不包含baseURL
*/
NotebookController.createDirectory.path=`/sources/{uri}/directories`
/**
* @description removeDirectory url链接，包含baseURL
*/
NotebookController.removeDirectory.fullPath=`${axios.defaults.baseURL}/sources/{uri}/directories`
/**
* @description removeDirectory url链接，不包含baseURL
*/
NotebookController.removeDirectory.path=`/sources/{uri}/directories`
/**
* @description moveDirectory url链接，包含baseURL
*/
NotebookController.moveDirectory.fullPath=`${axios.defaults.baseURL}/sources/{uri}/directories/move`
/**
* @description moveDirectory url链接，不包含baseURL
*/
NotebookController.moveDirectory.path=`/sources/{uri}/directories/move`
/**
* @description copyDirectory url链接，包含baseURL
*/
NotebookController.copyDirectory.fullPath=`${axios.defaults.baseURL}/sources/{uri}/directories/copy`
/**
* @description copyDirectory url链接，不包含baseURL
*/
NotebookController.copyDirectory.path=`/sources/{uri}/directories/copy`
/**
* @description uploadBinaryImage url链接，包含baseURL
*/
NotebookController.uploadBinaryImage.fullPath=`${axios.defaults.baseURL}/sources/image`
/**
* @description uploadBinaryImage url链接，不包含baseURL
*/
NotebookController.uploadBinaryImage.path=`/sources/image`
/**
* @description uploadImage url链接，包含baseURL
*/
NotebookController.uploadImage.fullPath=`${axios.defaults.baseURL}/sources/image/base64`
/**
* @description uploadImage url链接，不包含baseURL
*/
NotebookController.uploadImage.path=`/sources/image/base64`
/**
* @description existsPath url链接，包含baseURL
*/
NotebookController.existsPath.fullPath=`${axios.defaults.baseURL}/sources/{uri}/path`
/**
* @description existsPath url链接，不包含baseURL
*/
NotebookController.existsPath.path=`/sources/{uri}/path`
/**
* @description transferIdsToNames url链接，包含baseURL
*/
NotebookController.transferIdsToNames.fullPath=`${axios.defaults.baseURL}/sources/notebooks/names`
/**
* @description transferIdsToNames url链接，不包含baseURL
*/
NotebookController.transferIdsToNames.path=`/sources/notebooks/names`
/**
* @description searchNotebooks url链接，包含baseURL
*/
NotebookController.searchNotebooks.fullPath=`${axios.defaults.baseURL}/sources/{uri}/notebooks/search`
/**
* @description searchNotebooks url链接，不包含baseURL
*/
NotebookController.searchNotebooks.path=`/sources/{uri}/notebooks/search`
/**
* @description getNotebookPath url链接，包含baseURL
*/
NotebookController.getNotebookPath.fullPath=`${axios.defaults.baseURL}/sources/notebooks/{notebookId}/path`
/**
* @description getNotebookPath url链接，不包含baseURL
*/
NotebookController.getNotebookPath.path=`/sources/notebooks/{notebookId}/path`
/**
* @description downloadImage url链接，包含baseURL
*/
NotebookController.downloadImage.fullPath=`${axios.defaults.baseURL}/sources/image/{imageId}`
/**
* @description downloadImage url链接，不包含baseURL
*/
NotebookController.downloadImage.path=`/sources/image/{imageId}`
/**
* @description getDocumentContentHistoryByVersionIds url链接，包含baseURL
*/
NotebookController.getDocumentContentHistoryByVersionIds.fullPath=`${axios.defaults.baseURL}/documents/{notebookId}/content/{ids}/history/`
/**
* @description getDocumentContentHistoryByVersionIds url链接，不包含baseURL
*/
NotebookController.getDocumentContentHistoryByVersionIds.path=`/documents/{notebookId}/content/{ids}/history/`
/**
* @description getDocumentContentHistory url链接，包含baseURL
*/
NotebookController.getDocumentContentHistory.fullPath=`${axios.defaults.baseURL}/documents/{id}/content/history`
/**
* @description getDocumentContentHistory url链接，不包含baseURL
*/
NotebookController.getDocumentContentHistory.path=`/documents/{id}/content/history`
/**
* @description getDocumentContentHistoryVersionIds url链接，包含baseURL
*/
NotebookController.getDocumentContentHistoryVersionIds.fullPath=`${axios.defaults.baseURL}/documents/{id}/content/history/ids`
/**
* @description getDocumentContentHistoryVersionIds url链接，不包含baseURL
*/
NotebookController.getDocumentContentHistoryVersionIds.path=`/documents/{id}/content/history/ids`
/**
* @description getDirectory url链接，包含baseURL
*/
NotebookController.getDirectory.fullPath=`${axios.defaults.baseURL}/directories/{id}/info`
/**
* @description getDirectory url链接，不包含baseURL
*/
NotebookController.getDirectory.path=`/directories/{id}/info`
/**
* @description getDirectoryChildren url链接，包含baseURL
*/
NotebookController.getDirectoryChildren.fullPath=`${axios.defaults.baseURL}/directories/{id}/children`
/**
* @description getDirectoryChildren url链接，不包含baseURL
*/
NotebookController.getDirectoryChildren.path=`/directories/{id}/children`
/**
* @description getMyDirectoryPermission url链接，包含baseURL
*/
NotebookController.getMyDirectoryPermission.fullPath=`${axios.defaults.baseURL}/sources/{uri}/directories/{directoryId}/my-permission`
/**
* @description getMyDirectoryPermission url链接，不包含baseURL
*/
NotebookController.getMyDirectoryPermission.path=`/sources/{uri}/directories/{directoryId}/my-permission`
/**
* @description getSourcePermissionGroupDirectoryPermission url链接，包含baseURL
*/
NotebookController.getSourcePermissionGroupDirectoryPermission.fullPath=`${axios.defaults.baseURL}/sources/{uri}/permission-groups/{groupId}/directories/{directoryId}/permission`
/**
* @description getSourcePermissionGroupDirectoryPermission url链接，不包含baseURL
*/
NotebookController.getSourcePermissionGroupDirectoryPermission.path=`/sources/{uri}/permission-groups/{groupId}/directories/{directoryId}/permission`
/**
* @description createSourcePermissionGroupDirectoryPermission url链接，包含baseURL
*/
NotebookController.createSourcePermissionGroupDirectoryPermission.fullPath=`${axios.defaults.baseURL}/sources/{uri}/permission-groups/{groupId}/directories/{directoryId}/permission`
/**
* @description createSourcePermissionGroupDirectoryPermission url链接，不包含baseURL
*/
NotebookController.createSourcePermissionGroupDirectoryPermission.path=`/sources/{uri}/permission-groups/{groupId}/directories/{directoryId}/permission`
/**
* @description updateSourcePermissionGroupDirectoryPermission url链接，包含baseURL
*/
NotebookController.updateSourcePermissionGroupDirectoryPermission.fullPath=`${axios.defaults.baseURL}/sources/{uri}/permission-groups/{groupId}/directories/{directoryId}/permission`
/**
* @description updateSourcePermissionGroupDirectoryPermission url链接，不包含baseURL
*/
NotebookController.updateSourcePermissionGroupDirectoryPermission.path=`/sources/{uri}/permission-groups/{groupId}/directories/{directoryId}/permission`
/**
* @description removeSourcePermissionGroupDirectoryPermission url链接，包含baseURL
*/
NotebookController.removeSourcePermissionGroupDirectoryPermission.fullPath=`${axios.defaults.baseURL}/sources/{uri}/permission-groups/{groupId}/directories/{directoryId}/permission`
/**
* @description removeSourcePermissionGroupDirectoryPermission url链接，不包含baseURL
*/
NotebookController.removeSourcePermissionGroupDirectoryPermission.path=`/sources/{uri}/permission-groups/{groupId}/directories/{directoryId}/permission`
/**
* @description getMyNotebookPermission url链接，包含baseURL
*/
NotebookController.getMyNotebookPermission.fullPath=`${axios.defaults.baseURL}/sources/{uri}/notebooks/{notebookId}/my-permission`
/**
* @description getMyNotebookPermission url链接，不包含baseURL
*/
NotebookController.getMyNotebookPermission.path=`/sources/{uri}/notebooks/{notebookId}/my-permission`
/**
* @description getSourcePermissionGroupNotebookPermission url链接，包含baseURL
*/
NotebookController.getSourcePermissionGroupNotebookPermission.fullPath=`${axios.defaults.baseURL}/sources/{uri}/permission-groups/{groupId}/notebooks/{notebookId}/permission`
/**
* @description getSourcePermissionGroupNotebookPermission url链接，不包含baseURL
*/
NotebookController.getSourcePermissionGroupNotebookPermission.path=`/sources/{uri}/permission-groups/{groupId}/notebooks/{notebookId}/permission`
/**
* @description createSourcePermissionGroupNotebookPermission url链接，包含baseURL
*/
NotebookController.createSourcePermissionGroupNotebookPermission.fullPath=`${axios.defaults.baseURL}/sources/{uri}/permission-groups/{groupId}/notebooks/{notebookId}/permission`
/**
* @description createSourcePermissionGroupNotebookPermission url链接，不包含baseURL
*/
NotebookController.createSourcePermissionGroupNotebookPermission.path=`/sources/{uri}/permission-groups/{groupId}/notebooks/{notebookId}/permission`
/**
* @description updateSourcePermissionGroupNotebookPermission url链接，包含baseURL
*/
NotebookController.updateSourcePermissionGroupNotebookPermission.fullPath=`${axios.defaults.baseURL}/sources/{uri}/permission-groups/{groupId}/notebooks/{notebookId}/permission`
/**
* @description updateSourcePermissionGroupNotebookPermission url链接，不包含baseURL
*/
NotebookController.updateSourcePermissionGroupNotebookPermission.path=`/sources/{uri}/permission-groups/{groupId}/notebooks/{notebookId}/permission`
/**
* @description removeSourcePermissionGroupNotebookPermission url链接，包含baseURL
*/
NotebookController.removeSourcePermissionGroupNotebookPermission.fullPath=`${axios.defaults.baseURL}/sources/{uri}/permission-groups/{groupId}/notebooks/{notebookId}/permission`
/**
* @description removeSourcePermissionGroupNotebookPermission url链接，不包含baseURL
*/
NotebookController.removeSourcePermissionGroupNotebookPermission.path=`/sources/{uri}/permission-groups/{groupId}/notebooks/{notebookId}/permission`

export class UserController {
 
  /**
  * @summary 用户登陆
  * @param {UserModel.UserLoginRequest} [userloginrequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async login(userloginrequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/users/session',
        data:userloginrequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 用户注册
  * @param {UserModel.UserRegisterRequest} [userregisterrequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async register(userregisterrequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/users',
        data:userregisterrequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
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
  static async sendVerifiedEmail(pathid,cancelSource,uploadProgress,downloadProgress,baseURL){
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
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 发送忘记密码验证码
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async sendForgotVerifiedEmail(pathid,cancelSource,uploadProgress,downloadProgress,baseURL){
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
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 修改密码
  * @param {String} [pathid] 
  * @param {UserModel.UpdatePasswordRequest} [updatepasswordrequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updatePassword(pathid,updatepasswordrequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/users/'+pathid+'/password',
        data:updatepasswordrequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 我的信息
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getMyUserInfo(cancelSource,uploadProgress,downloadProgress,baseURL){
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
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 更新我的信息
  * @param {UserModel.UserUpdateRequest} [userupdaterequest] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async updateMyUserInfo(userupdaterequest,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'post',
        url:'/users/me/info',
        data:userupdaterequest,
        params:{},
        headers:{
          "Content-Type":"application/json"
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取我的头像
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getMyAvatar(cancelSource,uploadProgress,downloadProgress,baseURL){
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
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
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
  static async updateMyAvatar(updateavatarrequest,cancelSource,uploadProgress,downloadProgress,baseURL){
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
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取我的角色
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getMyRoles(cancelSource,uploadProgress,downloadProgress,baseURL){
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
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取指定用户头像
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getAvatar(pathid,cancelSource,uploadProgress,downloadProgress,baseURL){
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
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取用户头像图片
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getAvatarContent(pathid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/users/'+pathid+'/avatar/content',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取用户信息
  * @param {String} [pathuserid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getUserById(pathuserid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/users/'+pathuserid+'/info',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 批量获取用户信息
  * @param {String} [pathuserids] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getUserByIds(pathuserids,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/users/batched/'+pathuserids+'/info',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 查询用户信息
  * @param {undefined} [query] 
  * @param {Number} [gender] 
  * @param {Number} [offset] 
  * @param {Number} [pagesize] 
  * @param {String} [sortkey] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getUsers(query,gender,offset,pagesize,sortkey,cancelSource,uploadProgress,downloadProgress,baseURL){
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
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 搜索用户
  * @param {String} [query] 
  * @param {Number} [limit] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async searchUsers(query,limit,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/users/search',
        data:{},
        params:{query,limit},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取指定用户可访问的数据源列表
  * @param {String} [pathuserid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async listUserAccessibleSources(pathuserid,cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/users/'+pathuserid+'/sources',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取指定用户角色
  * @param {String} [pathid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getUserRoles(pathid,cancelSource,uploadProgress,downloadProgress,baseURL){
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
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 获取全部角色
  * @param {undefined} [query] 
  * @param {Number} [offset] 
  * @param {Number} [pagesize] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async getAllRoles(query,offset,pagesize,cancelSource,uploadProgress,downloadProgress,baseURL){
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
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
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
  static async createRole(rolerequest,cancelSource,uploadProgress,downloadProgress,baseURL){
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
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
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
  static async deleteRole(pathroleid,cancelSource,uploadProgress,downloadProgress,baseURL){
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
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
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
  static async addRoleToUser(pathuserid,pathroleid,cancelSource,uploadProgress,downloadProgress,baseURL){
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
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
 
  /**
  * @summary 为用户移除角色
  * @param {String} [pathuserid] 
  * @param {String} [pathroleid] 
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async removeRoleFromUser(pathuserid,pathroleid,cancelSource,uploadProgress,downloadProgress,baseURL){
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
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
}

// class UserController static method properties bind
/**
* @description login url链接，包含baseURL
*/
UserController.login.fullPath=`${axios.defaults.baseURL}/users/session`
/**
* @description login url链接，不包含baseURL
*/
UserController.login.path=`/users/session`
/**
* @description register url链接，包含baseURL
*/
UserController.register.fullPath=`${axios.defaults.baseURL}/users`
/**
* @description register url链接，不包含baseURL
*/
UserController.register.path=`/users`
/**
* @description sendVerifiedEmail url链接，包含baseURL
*/
UserController.sendVerifiedEmail.fullPath=`${axios.defaults.baseURL}/users/{id}/email/code`
/**
* @description sendVerifiedEmail url链接，不包含baseURL
*/
UserController.sendVerifiedEmail.path=`/users/{id}/email/code`
/**
* @description sendForgotVerifiedEmail url链接，包含baseURL
*/
UserController.sendForgotVerifiedEmail.fullPath=`${axios.defaults.baseURL}/users/{id}/forgot/code`
/**
* @description sendForgotVerifiedEmail url链接，不包含baseURL
*/
UserController.sendForgotVerifiedEmail.path=`/users/{id}/forgot/code`
/**
* @description updatePassword url链接，包含baseURL
*/
UserController.updatePassword.fullPath=`${axios.defaults.baseURL}/users/{id}/password`
/**
* @description updatePassword url链接，不包含baseURL
*/
UserController.updatePassword.path=`/users/{id}/password`
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
* @description getMyRoles url链接，包含baseURL
*/
UserController.getMyRoles.fullPath=`${axios.defaults.baseURL}/users/me/roles`
/**
* @description getMyRoles url链接，不包含baseURL
*/
UserController.getMyRoles.path=`/users/me/roles`
/**
* @description getAvatar url链接，包含baseURL
*/
UserController.getAvatar.fullPath=`${axios.defaults.baseURL}/users/{id}/avatar`
/**
* @description getAvatar url链接，不包含baseURL
*/
UserController.getAvatar.path=`/users/{id}/avatar`
/**
* @description getAvatarContent url链接，包含baseURL
*/
UserController.getAvatarContent.fullPath=`${axios.defaults.baseURL}/users/{id}/avatar/content`
/**
* @description getAvatarContent url链接，不包含baseURL
*/
UserController.getAvatarContent.path=`/users/{id}/avatar/content`
/**
* @description getUserById url链接，包含baseURL
*/
UserController.getUserById.fullPath=`${axios.defaults.baseURL}/users/{userId}/info`
/**
* @description getUserById url链接，不包含baseURL
*/
UserController.getUserById.path=`/users/{userId}/info`
/**
* @description getUserByIds url链接，包含baseURL
*/
UserController.getUserByIds.fullPath=`${axios.defaults.baseURL}/users/batched/{userIds}/info`
/**
* @description getUserByIds url链接，不包含baseURL
*/
UserController.getUserByIds.path=`/users/batched/{userIds}/info`
/**
* @description getUsers url链接，包含baseURL
*/
UserController.getUsers.fullPath=`${axios.defaults.baseURL}/users/info`
/**
* @description getUsers url链接，不包含baseURL
*/
UserController.getUsers.path=`/users/info`
/**
* @description searchUsers url链接，包含baseURL
*/
UserController.searchUsers.fullPath=`${axios.defaults.baseURL}/users/search`
/**
* @description searchUsers url链接，不包含baseURL
*/
UserController.searchUsers.path=`/users/search`
/**
* @description listUserAccessibleSources url链接，包含baseURL
*/
UserController.listUserAccessibleSources.fullPath=`${axios.defaults.baseURL}/users/{userId}/sources`
/**
* @description listUserAccessibleSources url链接，不包含baseURL
*/
UserController.listUserAccessibleSources.path=`/users/{userId}/sources`
/**
* @description getUserRoles url链接，包含baseURL
*/
UserController.getUserRoles.fullPath=`${axios.defaults.baseURL}/users/{id}/roles`
/**
* @description getUserRoles url链接，不包含baseURL
*/
UserController.getUserRoles.path=`/users/{id}/roles`
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
* @description deleteRole url链接，包含baseURL
*/
UserController.deleteRole.fullPath=`${axios.defaults.baseURL}/users/roles/{roleId}`
/**
* @description deleteRole url链接，不包含baseURL
*/
UserController.deleteRole.path=`/users/roles/{roleId}`
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

export class common {
 
  /**
  * @summary Health
  * @param {CancelTokenSource} [cancelSource] Axios Cancel Source 对象，可以取消该请求
  * @param {Function} [uploadProgress] 上传回调函数
  * @param {Function} [downloadProgress] 下载回调函数
  */
  static async health_health_get(cancelSource,uploadProgress,downloadProgress,baseURL){
    return await new Promise((resolve,reject)=>{
      let responseType = "json";
      let options = {
        method:'get',
        url:'/health',
        data:{},
        params:{},
        headers:{
          "Content-Type":""
        },
        onUploadProgress:uploadProgress,
        onDownloadProgress:downloadProgress
      }
      if (baseURL!==undefined){
        options.baseURL = baseURL
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
        if (err.response){
          if (err.response.data)
            reject(err.response.data)
          else
            reject(err.response);
        }else{
          reject(err)
        }
      })
    })
  }
}

// class common static method properties bind
/**
* @description health_health_get url链接，包含baseURL
*/
common.health_health_get.fullPath=`${axios.defaults.baseURL}/health`
/**
* @description health_health_get url链接，不包含baseURL
*/
common.health_health_get.path=`/health`
